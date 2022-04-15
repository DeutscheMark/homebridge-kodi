import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic, WithUUID } from 'homebridge';

import {
    PLATFORM_NAME,
    PLUGIN_NAME,
    KodiLogger,
    TelevisionAccessoryType,
    KodiSwitchAccessoryInterface,
    KodiTelevisionAccessoryInterface,
    KodiCommandSwitchAccessoryInterface,
    TelevisionAccessory,
    PowerSwitchAccessory,
    PlayerLightbulbAccessory,
    PlayerPlaySwitchAccessory,
    PlayerPauseSwitchAccessory,
    PlayerStopSwitchAccessory,
    ApplicationVolumeLightbulbAccessory,
    VideoLibraryScanSwitchAccessory,
    VideoLibraryCleanSwitchAccessory,
    AudioLibraryScanSwitchAccessory,
    AudioLibraryCleanSwitchAccessory,
    CommandSwitchAccessory,
} from './internal';

import kodi = require('./lib/kodi');
import utils = require('./util/utils');
import Characteristics from './lib/characteristics';

import WebSockets = require('rpc-websockets');
const WebSocket = WebSockets.Client;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import setIntervalPlus = require('setinterval-plus');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJSON = require('../package.json');

export class KodiPlatform implements DynamicPlatformPlugin {

    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

    public customCharacteristics: {
        [key: string]: WithUUID<new () => Characteristic>;
    };

    public readonly accessories: PlatformAccessory[] = [];
    public readonly shownAccessories: PlatformAccessory[] = [];

    public subscribed = false;
    public closedByPlugin = false;

    public intervalKodiSubscriptions: setIntervalPlus;
    public intervalKodiStatus: setIntervalPlus;
    public intervalKodiUpdate: setIntervalPlus;

    public powerSwitchService: Service | undefined;
    public televisionControlsService: Service | undefined;
    public televisionControlsSpeakerService: Service | undefined;
    public televisionChannelsService: Service | undefined;
    public televisionChannelsSpeakerService: Service | undefined;
    public playerLightbulbService: Service | undefined;
    public playerPlaySwitchService: Service | undefined;
    public playerPauseSwitchService: Service | undefined;
    public playerStopSwitchService: Service | undefined;
    public applicationVolumeLightbulbService: Service | undefined;
    public videoLibraryScanSwitchService: Service | undefined;
    public videoLibraryCleanSwitchService: Service | undefined;
    public audioLibraryScanSwitchService: Service | undefined;
    public audioLibraryCleanSwitchService: Service | undefined;

    public log: KodiLogger;

    constructor(
        log: Logger,
        public readonly config: PlatformConfig,
        public readonly api: API,
    ) {
        this.log = new KodiLogger(log, this.config.debug);

        this.log.debug('Finished initializing platform:', this.config.name);

        this.customCharacteristics = Characteristics(this.api.hap.Characteristic);

        this.api.on('didFinishLaunching', () => {
            this.log.debug('Executed didFinishLaunching callback');
            this.discoverDevices();
        });
    }

    configureAccessory(accessory: PlatformAccessory) {
        this.log.debug('Loading accessory from cache:', accessory.displayName);
        this.accessories.push(accessory);
    }

    discoverDevices() {
        this.log.info('Init Homebridge-Kodi');

        const platformname = utils.checkStringConfig(this.config.name, 'Kodi');
        const polling = utils.checkNumberConfig(this.config.polling, 10);
        const retrytime = utils.checkNumberConfig(this.config.retrytime, 30);
        const powerSwitchConfig = this.config.power && utils.checkBooleanConfig(this.config.power.switch, true);
        const tvControlConfig = this.config.television && utils.checkConfig(this.config.television.controls, false);
        const tvControlMenuItemsConfig = tvControlConfig && utils.checkStringArrayConfig(this.config.television.controls.menuitems, []);
        const tvChannelsConfig = this.config.television && utils.checkConfig(this.config.television.tv, false);
        const tvChannelsChannelsConfig = tvChannelsConfig && utils.checkStringArrayConfig(this.config.television.tv.channels, []);
        const playerMainConfig = this.config.player && utils.checkBooleanConfig(this.config.player.main, true);
        const playerPlayConfig = this.config.player && utils.checkBooleanConfig(this.config.player.play, false);
        const playerPauseConfig = this.config.player && utils.checkBooleanConfig(this.config.player.pause, false);
        const playerStopConfig = this.config.player && utils.checkBooleanConfig(this.config.player.stop, false);
        const applicationVolumeConfig = this.config.application && utils.checkBooleanConfig(this.config.application.volume, false);
        const videoLibraryScanConfig = this.config.videolibrary && utils.checkBooleanConfig(this.config.videolibrary.scan, false);
        const videoLibraryCleanConfig = this.config.videolibrary && utils.checkBooleanConfig(this.config.videolibrary.clean, false);
        const audioLibraryScanConfig = this.config.audiolibrary && utils.checkBooleanConfig(this.config.audiolibrary.scan, false);
        const audioLibraryCleanConfig = this.config.audiolibrary && utils.checkBooleanConfig(this.config.audiolibrary.clean, false);
        const commandsConfig = utils.checkArrayConfig(this.config.commands, []);

        this.powerSwitchService = this.addAccessory(platformname + ' Power', powerSwitchConfig, PowerSwitchAccessory)?.getService(this.Service.Switch);
        let name = platformname + ' Controls';
        if (tvControlConfig) {
            this.log.info('Adding ' + name);
            const inputNames: string[] = [];
            const inputIdentifiers: number[] = [];
            for (let index = 0; index < tvControlMenuItemsConfig.length; index++) {
                let inputName = tvControlMenuItemsConfig[index];
                let inputIdentifier;
                switch (inputName) {
                    case 'home':
                        inputName = 'Home';
                        inputIdentifier = 1;
                        break;
                    case 'settings':
                        inputName = 'Settings';
                        inputIdentifier = 2;
                        break;
                    case 'movies':
                        inputName = 'Movies';
                        inputIdentifier = 3;
                        break;
                    case 'tvshows':
                        inputName = 'TV shows';
                        inputIdentifier = 4;
                        break;
                    case 'tv':
                        inputName = 'TV';
                        inputIdentifier = 5;
                        break;
                    case 'music':
                        inputName = 'Music';
                        inputIdentifier = 6;
                        break;
                    case 'musicvideos':
                        inputName = 'Music videos';
                        inputIdentifier = 7;
                        break;
                    case 'radio':
                        inputName = 'Radio';
                        inputIdentifier = 8;
                        break;
                    case 'games':
                        inputName = 'Games';
                        inputIdentifier = 9;
                        break;
                    case 'addons':
                        inputName = 'Add-ons';
                        inputIdentifier = 10;
                        break;
                    case 'pictures':
                        inputName = 'Pictures';
                        inputIdentifier = 11;
                        break;
                    case 'videos':
                        inputName = 'Videos';
                        inputIdentifier = 12;
                        break;
                    case 'favorites':
                        inputName = 'Favorites';
                        inputIdentifier = 13;
                        break;
                    case 'weather':
                        inputName = 'Weather';
                        inputIdentifier = 14;
                        break;
                    default:
                        inputName = null;
                        inputIdentifier = null;
                        break;
                }
                if (inputName && inputIdentifier) {
                    this.log.info('Adding input for ' + name + ': ' + inputName);
                    inputNames.push(inputName);
                    inputIdentifiers.push(inputIdentifier);
                }
            }
            const accessory = this.addTelevisionAccessory(name, TelevisionAccessoryType.Controls, inputNames, inputIdentifiers, TelevisionAccessory);
            this.televisionControlsService = accessory?.getService(this.Service.Television);
            this.televisionControlsSpeakerService = accessory?.getService(this.Service.TelevisionSpeaker);
        }
        name = platformname + ' Channels';
        if (tvChannelsConfig) {
            this.log.info('Adding ' + name);
            const inputNames: string[] = [];
            const inputIdentifiers: number[] = [];
            for (let index = 0; index < tvChannelsChannelsConfig.length; index++) {
                const inputName = tvChannelsChannelsConfig[index];
                this.log.info('Adding Input for ' + name + ': ' + inputName);
                inputNames.push(inputName);
                inputIdentifiers.push(index + 1);
            }
            const accessory = this.addTelevisionAccessory(name, TelevisionAccessoryType.Channels, inputNames, inputIdentifiers, TelevisionAccessory);
            this.televisionChannelsService = accessory?.getService(this.Service.Television);
            this.televisionChannelsSpeakerService = accessory?.getService(this.Service.TelevisionSpeaker);
        }
        this.playerLightbulbService = this.addAccessory(
            platformname + ' Player',
            playerMainConfig || typeof playerMainConfig === 'undefined',
            PlayerLightbulbAccessory,
        )?.getService(this.Service.Lightbulb);
        this.playerPlaySwitchService = this.addAccessory(platformname + ' Play', playerPlayConfig, PlayerPlaySwitchAccessory)?.getService(this.Service.Switch);
        this.playerPauseSwitchService = this.addAccessory(platformname + ' Pause', playerPauseConfig, PlayerPauseSwitchAccessory)?.getService(this.Service.Switch);
        this.playerStopSwitchService = this.addAccessory(platformname + ' Stop', playerStopConfig, PlayerStopSwitchAccessory)?.getService(this.Service.Switch);
        this.applicationVolumeLightbulbService = this.addAccessory(
            platformname + ' Volume',
            applicationVolumeConfig,
            ApplicationVolumeLightbulbAccessory,
        )?.getService(this.Service.Lightbulb);
        this.videoLibraryScanSwitchService = this.addAccessory(
            platformname + ' Video Library Scan',
            videoLibraryScanConfig,
            VideoLibraryScanSwitchAccessory,
        )?.getService(this.Service.Switch);
        this.videoLibraryCleanSwitchService = this.addAccessory(
            platformname + ' Video Library Clean',
            videoLibraryCleanConfig,
            VideoLibraryCleanSwitchAccessory,
        )?.getService(this.Service.Switch);
        this.audioLibraryScanSwitchService = this.addAccessory(
            platformname + ' Audio Library Scan',
            audioLibraryScanConfig, AudioLibraryScanSwitchAccessory,
        )?.getService(this.Service.Switch);
        this.audioLibraryCleanSwitchService = this.addAccessory(
            platformname + ' Audio Library Clean',
            audioLibraryCleanConfig, AudioLibraryCleanSwitchAccessory,
        )?.getService(this.Service.Switch);
        for (let index = 0; index < commandsConfig.length; index++) {
            const commandConfig = commandsConfig[index];
            if (commandConfig && commandConfig.name && commandConfig.name !== '' && commandConfig.sequence && commandConfig.sequence.length !== 0) {
                this.addCommandAccessory(commandConfig.name, commandConfig.interval, commandConfig.sequence, CommandSwitchAccessory);
            } else {
                this.log.error('Error adding sequence: ' + commandConfig.name);
            }
        }

        // Remove all other not anymore shown accessories from cache

        this.removeAllAccessoriesNotNeededAnymore();

        // Kodi Version

        kodi.applicationGetProperties(this.config, ['version'])
            .then(result => {
                if (result && result.version && result.version.major && result.version.minor) {
                    this.log.info('Kodi Version: ' + result.version.major + '.' + result.version.minor);
                }
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch(_ => {
                this.log.info('Kodi Version: Kodi does not seem to be running');
            });

        // Reset all services on start

        this.resetAllCharacteristics(true);

        // Check volume on start

        this.updateApplicationVolumeService();

        // Kodi Status

        this.intervalKodiStatus = new setIntervalPlus(this.checkKodiStatus.bind(this), retrytime * 1000);

        // Kodi Notifications

        this.log.debug('Start subscribing to Kodi Notifications');
        this.subscribeToKodiNotifications(this.api);
        this.intervalKodiSubscriptions = new setIntervalPlus(this.subscribeToKodiNotifications.bind(this, this.api), retrytime * 1000);

        // Intervalled Updating Start

        this.log.debug('Start Updating Kodi with polling: ' + polling + ' seconds');
        this.updateKodiPlayer(false);
        this.intervalKodiUpdate = new setIntervalPlus(this.updateKodiPlayer.bind(this, false), (polling !== 0 ? polling : 10) * 1000);

        // Start Updates when currently playing

        kodi.isPlaying(this.config)
            .then(([playing, paused]) => {
                if (playing) {
                    kodi.tvIsPlaying(this.config)
                        .then(tvisplaying => {
                            this.televisionChannelsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(tvisplaying);
                        })
                        .catch(error => {
                            this.log.error('Error getting tv playing status: ' + error.message);
                        });
                    this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(true);
                    this.playerPlaySwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(true);
                    this.playerPauseSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                    this.updateKodiPlayer(false);
                    this.intervalKodiUpdate.start();
                } else if (paused) {
                    this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                    this.playerPlaySwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                    this.playerPauseSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(true);
                    this.intervalKodiUpdate.stop();
                } else {
                    this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                    this.playerPlaySwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                    this.playerPauseSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                    this.intervalKodiUpdate.stop();
                }
            })
            .catch(error => {
                this.log.error('Error getting playing status: ' + error.message);
            });
    }

    addAccessory(name: string, configCheck: boolean, KodiAccessory: KodiSwitchAccessoryInterface): PlatformAccessory | undefined {
        if (configCheck) {
            this.log.info('Adding ' + name);
            const uuid = this.api.hap.uuid.generate(name);
            const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
            if (existingAccessory) {
                this.log.debug('Restoring existing accessory from cache: ' + existingAccessory.displayName);
                new KodiAccessory(this, existingAccessory, this.log, this.config, name, packageJSON.version);
                this.shownAccessories.push(existingAccessory);
                return existingAccessory;
            } else {
                this.log.debug('Adding new accessory:' + name);
                const accessory = new this.api.platformAccessory(name, uuid);
                new KodiAccessory(this, accessory, this.log, this.config, name, packageJSON.version);
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
                this.shownAccessories.push(accessory);
                return accessory;
            }
        }
        return undefined;
    }

    addCommandAccessory(name: string, interval: number, sequence: string, KodiCommandAccessory: KodiCommandSwitchAccessoryInterface) {
        this.log.info('Adding ' + name);
        const uuid = this.api.hap.uuid.generate(name);
        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
        if (existingAccessory) {
            this.log.debug('Restoring existing accessory from cache: ' + existingAccessory.displayName);
            new KodiCommandAccessory(this, existingAccessory, this.log, this.config, name, packageJSON.version, interval, sequence);
            this.shownAccessories.push(existingAccessory);
        } else {
            this.log.debug('Adding new accessory: ' + name);
            const accessory = new this.api.platformAccessory(name, uuid);
            new KodiCommandAccessory(this, accessory, this.log, this.config, name, packageJSON.version, interval, sequence);
            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            this.shownAccessories.push(accessory);
        }
    }

    addTelevisionAccessory(
        name: string,
        type: TelevisionAccessoryType,
        inputNames: string[],
        inputIdentifiers: number[],
        KodiTelevisionAccessory: KodiTelevisionAccessoryInterface,
    ): PlatformAccessory | undefined {
        this.log.info('Adding ' + name);
        const uuid = this.api.hap.uuid.generate(name);
        this.log.debug('Adding new accessory: ' + name);
        const accessory = new this.api.platformAccessory(name, uuid, this.api.hap.Categories.TELEVISION);
        new KodiTelevisionAccessory(this, accessory, this.log, this.config, name, packageJSON.version, type, inputNames, inputIdentifiers);
        this.api.publishExternalAccessories(PLUGIN_NAME, [accessory]);
        this.shownAccessories.push(accessory);
        return accessory;
    }

    getAccessory(name: string): PlatformAccessory | undefined {
        const uuid = this.api.hap.uuid.generate(name);
        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
        if (existingAccessory) {
            return existingAccessory;
        }
        return undefined;
    }

    removeAllAccessoriesNotNeededAnymore() {
        this.log.debug('Remove all accessories not needed anymore.');
        for (let index = 0; index < this.accessories.length; index++) {
            const accessory = this.accessories[index];
            const shownAccessory = this.shownAccessories.find(i => i.displayName === accessory.displayName);
            if (!shownAccessory) {
                this.log.debug('Removing existing accessory from cache: ' + accessory.displayName);
                this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }
        }
    }

    checkKodiStatus = async function (this: KodiPlatform) {
        kodi.getStatus(this.config)
            .then(status => {
                if (status) {
                    if (!this.closedByPlugin) {
                        this.log.debug('Kodi is up and running - Check again in ' + (this.config.retrytime || 30) + ' seconds');
                        this.powerSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(true);
                        this.televisionControlsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(true);
                    } else {
                        this.log.warn('Kodi was closed by the plugin, but is still running. ' +
                            'If Kodi is still running please check your power off command. If not check if the Kodi process is unresponsive and/or still in the memory.');
                        this.intervalKodiSubscriptions.stop();
                        this.resetAllCharacteristics(true);
                    }
                } else {
                    this.log.debug('Kodi is not running! - Retry in ' + (this.config.retrytime || 30) + ' seconds');
                    this.powerSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                    this.televisionControlsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(false);
                    this.televisionChannelsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(false);
                    this.applicationVolumeLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                    this.applicationVolumeLightbulbService?.getCharacteristic(this.api.hap.Characteristic.Brightness).updateValue(0);
                    this.intervalKodiSubscriptions.start();
                    this.resetAllCharacteristics(true);
                    this.closedByPlugin = false;
                }
            })
            .catch(error => {
                this.log.error('Kodi Check Status: ' + error.message);
            });
    };

    subscribeToKodiNotifications = async function (this: KodiPlatform, api: API) {
        if (!this.subscribed) {
            kodi.getStatus(this.config)
                .then(status => {
                    if (status) {
                        const ws = new WebSocket('ws://' + (this.config.host || 'localhost') + ':9090/jsonrpc');
                        ws.on('open', () => {
                            const subscriptions = [
                                'System.OnSleep',
                                'System.OnWake',
                                'System.OnQuit',
                                'System.OnRestart',
                                'Application.OnVolumeChanged',
                                'Player.OnPlay',
                                'Player.OnResume',
                                'Player.OnPause',
                                'Player.OnStop',
                                'Player.OnSeek',
                                'Player.OnSpeedChanged',
                                'VideoLibrary.OnScanStarted',
                                'VideoLibrary.OnScanFinished',
                                'VideoLibrary.OnCleanStarted',
                                'VideoLibrary.OnCleanFinished',
                                'AudioLibrary.OnScanStarted',
                                'AudioLibrary.OnScanFinished',
                                'AudioLibrary.OnCleanStarted',
                                'AudioLibrary.OnCleanFinished',
                            ];
                            // Always throws 'Method not found' warning after successfully subscribing?!
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            ws.subscribe(subscriptions).catch(_ => {
                                this.onSubscribe();
                            });
                            // System.OnSleep
                            ws.on('System.OnSleep', () => {
                                this.log.debug('Notification Received: System.OnSleep');
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                ws.unsubscribe(subscriptions).catch(_ => {
                                    this.onUnsubscribe();
                                });
                                this.resetAllCharacteristics(true);
                            });
                            // System.OnWake
                            ws.on('System.OnWake', () => {
                                this.log.debug('Notification Received: System.OnWake');
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                ws.subscribe(subscriptions).catch(_ => {
                                    this.onSubscribe();
                                });
                            });
                            // System.OnQuit
                            ws.on('System.OnQuit', () => {
                                this.log.debug('Notification Received: System.OnQuit');
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                ws.unsubscribe(subscriptions).catch(_ => {
                                    this.onUnsubscribe();
                                });
                                this.resetAllCharacteristics(true);
                            });
                            // System.OnRestart
                            ws.on('System.OnRestart', () => {
                                this.log.debug('Notification Received: System.OnRestart');
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                ws.unsubscribe(subscriptions).catch(_ => {
                                    this.onUnsubscribe();
                                });
                                this.resetAllCharacteristics(true);
                            });
                            // Player.OnVolumeChanged
                            ws.on('Application.OnVolumeChanged', () => {
                                this.log.debug('Notification Received: Application.OnVolumeChanged');
                                this.updateApplicationVolumeService();
                            });
                            // Player.OnPlay
                            ws.on('Player.OnPlay', () => {
                                this.log.debug('Notification Received: Player.OnPlay');
                                this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                this.updateTelevisionChannelsService();
                                this.updateKodiPlayer(true);
                                this.intervalKodiUpdate.start();
                            });
                            // Player.OnResume
                            ws.on('Player.OnResume', () => {
                                this.log.debug('Notification Received: Player.OnResume');
                                this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                this.updateTelevisionChannelsService();
                                this.updateKodiPlayer(false);
                                this.intervalKodiUpdate.start();
                            });
                            // Player.OnPause
                            ws.on('Player.OnPause', () => {
                                this.log.debug('Notification Received: Player.OnPause');
                                this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                this.updateTelevisionChannelsService();
                                this.intervalKodiUpdate.stop();
                            });
                            // Player.OnStop
                            ws.on('Player.OnStop', () => {
                                this.log.debug('Notification Received: Player.OnStop');
                                this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
                                this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                this.intervalKodiUpdate.stop();
                                this.resetAllCharacteristics(false);
                            });
                            // Player.OnSeek
                            ws.on('Player.OnSeek', () => {
                                this.log.debug('Notification Received: Player.OnSeek');
                                kodi.playerGetActivePlayers(this.config)
                                    .then(playerid => {
                                        if (playerid !== null && playerid !== -1) {
                                            kodi.playerGetProperties(this.config, playerid, ['percentage'])
                                                .then(result => {
                                                    if (result && result.percentage) {
                                                        this.playerLightbulbService?.getCharacteristic(
                                                            api.hap.Characteristic.Brightness).updateValue(Math.round(result.percentage));
                                                    }
                                                })
                                                .catch(error => {
                                                    this.log.error('Error getting player properties: ' + error.message);
                                                });
                                        } else {
                                            this.log.error('Error getting active players');
                                        }
                                    })
                                    .catch(error => {
                                        this.log.error('Error getting active players: ' + error.message);
                                    });
                            });
                            // Player.OnSpeedChanged
                            ws.on('Player.OnSpeedChanged', () => {
                                this.log.debug('Notification Received: Application.OnSpeedChanged');
                                kodi.isPlaying(this.config)
                                    .then(([playing, paused]) => {
                                        if (playing) {
                                            this.intervalKodiUpdate.start();
                                            this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                            this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                            this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                        } else if (paused) {
                                            this.intervalKodiUpdate.stop();
                                            this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                            this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                            this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                        } else {
                                            this.intervalKodiUpdate.stop();
                                            this.resetAllCharacteristics(false);
                                        }
                                    })
                                    .catch(error => {
                                        this.log.error('Error getting playing status: ' + error.message);
                                    });
                            });
                            // VideoLibrary.OnScanStarted
                            ws.on('VideoLibrary.OnScanStarted', () => {
                                this.log.debug('Notification Received: VideoLibrary.OnScanStarted');
                                kodi.storageSetItem(api.user.persistPath(), this.videoLibraryScanSwitchService?.name, 'true')
                                    .then(() => {
                                        this.videoLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                    })
                                    .catch(error => {
                                        this.log.error('Error on storing Item: ' + error.message);
                                    });
                            });
                            // VideoLibrary.OnScanFinished
                            ws.on('VideoLibrary.OnScanFinished', () => {
                                this.log.debug('Notification Received: VideoLibrary.OnScanFinished');
                                kodi.storageSetItem(api.user.persistPath(), this.videoLibraryScanSwitchService?.name, 'false')
                                    .then(() => {
                                        this.videoLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                    })
                                    .catch(error => {
                                        this.log.error('Error on storing Item: ' + error.message);
                                    });
                            });
                            // VideoLibrary.OnCleanStarted
                            ws.on('VideoLibrary.OnCleanStarted', () => {
                                this.log.debug('Notification Received: VideoLibrary.OnCleanStarted');
                                kodi.storageSetItem(api.user.persistPath(), this.videoLibraryCleanSwitchService?.name, 'true')
                                    .then(() => {
                                        this.videoLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                    })
                                    .catch(error => {
                                        this.log.error('Error on storing Item: ' + error.message);
                                    });
                            });
                            // VideoLibrary.OnCleanFinished
                            ws.on('VideoLibrary.OnCleanFinished', () => {
                                this.log.debug('Notification Received: VideoLibrary.OnCleanFinished');
                                kodi.storageSetItem(api.user.persistPath(), this.videoLibraryCleanSwitchService?.name, 'false')
                                    .then(() => {
                                        this.videoLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                    })
                                    .catch(error => {
                                        this.log.error('Error on storing Item: ' + error.message);
                                    });
                            });
                            // AudioLibrary.OnScanStarted
                            ws.on('AudioLibrary.OnScanStarted', () => {
                                this.log.debug('Notification Received: AudioLibrary.OnScanStarted');
                                kodi.storageSetItem(api.user.persistPath(), this.audioLibraryScanSwitchService?.name, 'true')
                                    .then(() => {
                                        this.audioLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                    })
                                    .catch(error => {
                                        this.log.error('Error on storing Item: ' + error.message);
                                    });
                            });
                            // AudioLibrary.OnScanFinished
                            ws.on('AudioLibrary.OnScanFinished', () => {
                                this.log.debug('Notification Received: AudioLibrary.OnScanFinished');
                                kodi.storageSetItem(api.user.persistPath(), this.audioLibraryScanSwitchService?.name, 'false')
                                    .then(() => {
                                        this.audioLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                    })
                                    .catch(error => {
                                        this.log.error('Error on storing Item: ' + error.message);
                                    });
                            });
                            // AudioLibrary.OnCleanStarted
                            ws.on('AudioLibrary.OnCleanStarted', () => {
                                this.log.debug('Notification Received: AudioLibrary.OnCleanStarted');
                                kodi.storageSetItem(api.user.persistPath(), this.audioLibraryCleanSwitchService?.name, 'true')
                                    .then(() => {
                                        this.audioLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                    })
                                    .catch(error => {
                                        this.log.error('Error on storing Item: ' + error.message);
                                    });
                            });
                            // AudioLibrary.OnCleanFinished
                            ws.on('AudioLibrary.OnCleanFinished', () => {
                                this.log.debug('Notification Received: AudioLibrary.OnCleanFinished');
                                kodi.storageSetItem(api.user.persistPath(), this.audioLibraryCleanSwitchService?.name, 'false')
                                    .then(() => {
                                        this.audioLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                    })
                                    .catch(error => {
                                        this.log.error('Error on storing Item: ' + error.message);
                                    });
                            });
                        });
                    } else {
                        this.log.debug('Kodi Notifications: Kodi does not seem to be running - Retry in ' + (this.config.retrytime || 30) + ' seconds');
                    }
                })
                .catch(error => {
                    this.log.error('Kodi Notification: ' + error.message);
                });
        } else {
            this.log.debug('Kodi Notification: Already subscribed.');
        }
    };

    onSubscribe = function (this: KodiPlatform) {
        this.televisionControlsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(true);
        this.updateApplicationVolumeService();
        this.updateTelevisionChannelsService();
        this.intervalKodiSubscriptions.stop();
        this.log.info('Kodi Notifications: Subscribed successfully');
        this.subscribed = true;
    };

    onUnsubscribe = function (this: KodiPlatform) {
        this.televisionControlsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(false);
        this.televisionChannelsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(false);
        this.applicationVolumeLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
        this.applicationVolumeLightbulbService?.getCharacteristic(this.api.hap.Characteristic.Brightness).updateValue(0);
        this.intervalKodiSubscriptions.start();
        this.log.info('Kodi Notifications: Unsubscribed successfully');
        this.subscribed = false;
    };

    updateKodiPlayer = async function (this: KodiPlatform, onplay: boolean) {
        kodi.playerGetActivePlayers(this.config)
            .then(playerid => {
                if (playerid !== null) {
                    if (playerid !== -1) {
                        kodi.playerGetItem(this.config, playerid as number, ['artist', 'album', 'showtitle', 'season', 'episode', 'duration'])
                            .then(itemresult => {
                                if (itemresult && itemresult.item) {
                                    const artist = typeof itemresult.item.artist !== 'undefined' && itemresult.item.artist.length !== 0 ?
                                        itemresult.item.artist.join(', ').substring(0, 64) :
                                        '-';
                                    const album = typeof itemresult.item.album !== 'undefined' && itemresult.item.album !== '' ?
                                        itemresult.item.album.substring(0, 64) :
                                        '-';
                                    const itemtype = typeof itemresult.item.type !== 'undefined' && itemresult.item.type !== '' ?
                                        itemresult.item.type.substring(0, 64) :
                                        '-';
                                    const title = typeof itemresult.item.label !== 'undefined' && itemresult.item.label !== '' ?
                                        itemresult.item.label.substring(0, 64) :
                                        '-';
                                    const showtitle = typeof itemresult.item.showtitle !== 'undefined' && itemresult.item.showtitle !== '' ?
                                        itemresult.item.showtitle.substring(0, 64) :
                                        '-';
                                    let seasonEpisode = '-';
                                    if (itemtype === 'episode') {
                                        if ((itemresult.item.season !== -1 && itemresult.item.episode !== -1) ||
                                            (typeof itemresult.item.season !== 'undefined' && typeof itemresult.item.episode !== 'undefined')) {
                                            seasonEpisode = 'S' + itemresult.item.season.toString().padStart(2, '0') +
                                                'E' + itemresult.item.episode.toString().padStart(2, '0');
                                        } else if ((itemresult.item.season === -1 && itemresult.item.episode !== -1) ||
                                            (typeof itemresult.item.season === 'undefined' && typeof itemresult.item.episode !== 'undefined')) {
                                            seasonEpisode = 'E' + itemresult.item.episode.toString().padStart(2, '0');
                                        }
                                    }

                                    this.playerLightbulbService?.updateCharacteristic(this.customCharacteristics.Type, itemtype);
                                    this.playerLightbulbService?.updateCharacteristic(this.customCharacteristics.Title, title);
                                    this.playerLightbulbService?.updateCharacteristic(this.customCharacteristics.ShowTitle, showtitle);
                                    this.playerLightbulbService?.updateCharacteristic(this.customCharacteristics.SeasonEpisode, seasonEpisode);
                                    this.playerLightbulbService?.updateCharacteristic(this.customCharacteristics.Artist, artist);
                                    this.playerLightbulbService?.updateCharacteristic(this.customCharacteristics.Album, album);
                                    kodi.playerGetProperties(this.config, playerid as number, ['speed', 'percentage', 'time', 'totaltime'])
                                        .then(result => {
                                            if (result) {
                                                const speed = result.speed !== 0 ? result.speed !== 0 : 0;
                                                let percentage = Math.round(result.percentage ? result.percentage : 0);
                                                let timeAndTotaltime = result.time.hours + ':' +
                                                    result.time.minutes.toString().padStart(2, '0') + ':' +
                                                    result.time.seconds.toString().padStart(2, '0') + ' / ' +
                                                    result.totaltime.hours + ':' +
                                                    result.totaltime.minutes.toString().padStart(2, '0') + ':' +
                                                    result.totaltime.seconds.toString().padStart(2, '0');
                                                if (timeAndTotaltime === '0:00:00 / 0:00:00') {
                                                    timeAndTotaltime = '-';
                                                }
                                                if (percentage === 0 && timeAndTotaltime === '-') {
                                                    percentage = 100;
                                                }
                                                this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(speed);
                                                this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.Brightness).updateValue(Math.round(percentage));
                                                this.playerPlaySwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(speed);
                                                this.playerPauseSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(!speed);
                                                this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Position, timeAndTotaltime);
                                                let activeIdentifier = -1;
                                                const tvChannelsChannelsConfig =
                                                    this.config.television && this.config.television.tv && this.config.television.tv.channels || [];
                                                const logprefix = 'Setting Info (' + itemtype + '): ';
                                                let logmessage = '';
                                                switch (itemtype) {
                                                    case 'movie':
                                                        logmessage = '"' + title + '" - ' + timeAndTotaltime + ' (' + percentage + ' %)';
                                                        break;
                                                    case 'episode':
                                                        logmessage = showtitle + ' ' + seasonEpisode + ' "' + title + '" - ' + timeAndTotaltime + ' (' + percentage + ' %)';
                                                        break;
                                                    case 'song':
                                                        logmessage = artist + ' "' + title + '" (' + album + ') - ' + timeAndTotaltime + ' (' + percentage + ' %)';
                                                        break;
                                                    case 'unknown':
                                                        logmessage = '"' + title + '" - ' + timeAndTotaltime + ' (' + percentage + ' %)';
                                                        break;
                                                    case 'channel':
                                                        this.televisionChannelsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(true);
                                                        for (let index = 0; index < tvChannelsChannelsConfig.length; index++) {
                                                            if (title === tvChannelsChannelsConfig[index]) {
                                                                activeIdentifier = index + 1;
                                                            }
                                                        }
                                                        if (activeIdentifier && activeIdentifier !== -1) {
                                                            this.televisionChannelsService?.getCharacteristic(
                                                                this.api.hap.Characteristic.ActiveIdentifier).updateValue(activeIdentifier);
                                                        } else {
                                                            this.televisionChannelsService?.getCharacteristic(this.api.hap.Characteristic.ActiveIdentifier).updateValue(1);
                                                        }
                                                        logmessage = '"' + title + '" (' + activeIdentifier + ')';
                                                        break;
                                                    default:
                                                        logmessage = '"' + title + '"';
                                                }
                                                this.log.debug(logprefix + logmessage);
                                            } else {
                                                this.log.debug('Getting player properties: no result');
                                            }
                                        })
                                        .catch(error => {
                                            this.log.error('Error getting player properties: ' + error.message);
                                        });
                                } else if (!onplay) {
                                    this.intervalKodiUpdate.stop();
                                } else {
                                    this.log.debug('Getting player item: no result');
                                }
                            })
                            .catch(error => {
                                this.log.error('Error getting player item: ' + error.message);
                            });
                    } else if (!onplay) {
                        this.intervalKodiUpdate.stop();
                    }
                } else {
                    this.log.debug('Getting active players: no result');
                }
            })
            .catch(error => {
                this.log.error('Error getting active players: ' + error.message);
            });
    };

    resetAllCharacteristics = function (this: KodiPlatform, completely: boolean) {
        this.log.debug('Reset All Characteristics');
        if (completely) {
            this.televisionControlsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(false);
            this.applicationVolumeLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
            this.applicationVolumeLightbulbService?.getCharacteristic(this.api.hap.Characteristic.Brightness).updateValue(0);
        }
        this.televisionChannelsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(false);
        this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
        this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.Brightness).updateValue(0);
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Type, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Title, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.ShowTitle, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.SeasonEpisode, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Artist, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Album, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Position, '-');
        this.playerPlaySwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
        this.playerPauseSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
        this.playerStopSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
        this.videoLibraryScanSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
        this.videoLibraryCleanSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
        this.audioLibraryScanSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
        this.audioLibraryCleanSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
    };

    updateApplicationVolumeService = function (this: KodiPlatform) {
        kodi.applicationGetProperties(this.config, ['volume', 'muted'])
            .then(result => {
                if (result) {
                    const muted = result.muted ? result.muted : false;
                    const volume = result.volume ? result.volume : 0;
                    this.applicationVolumeLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(!muted && volume !== 0);
                    this.applicationVolumeLightbulbService?.getCharacteristic(this.api.hap.Characteristic.Brightness).updateValue(volume);
                } else {
                    this.log.error('Error getting application properties: no result');
                }
            })
            .catch(error => {
                this.log.error('Error getting application properties: ' + error.message);
            });
    };

    updateTelevisionChannelsService = function (this: KodiPlatform) {
        kodi.tvIsPlaying(this.config)
            .then(tvisplaying => {
                this.televisionChannelsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(tvisplaying);
            })
            .catch(error => {
                this.log.error('Error getting tv playing status: ' + error.message);
            });
    };

}