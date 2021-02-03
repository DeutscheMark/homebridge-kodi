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
import Characteristics from './util/characteristics';

import WebSockets = require('rpc-websockets');
const WebSocket = WebSockets.Client;

/* eslint-disable */
// @ts-ignore
import setIntervalPlus = require('setinterval-plus');
/* eslint-enable */

//import CustomCharacteristic = require('./util/characteristics2');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJSON = require('../package.json');

export class KodiPlatform implements DynamicPlatformPlugin {

    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

    public customCharacteristics: {
        [key: string]: WithUUID<new () => Characteristic>;
    };

    public readonly accessories: PlatformAccessory[] = [];

    public intervalSubscriptionsKodiPlayer: setIntervalPlus;
    public intervalUpdateKodiPlayer: setIntervalPlus;

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

        const platformname = this.config.name || 'Kodi';
        const polling = this.config.polling || 10;
        const retrytime = this.config.retrytime || 30;
        const tvConfig = this.config.television && this.config.television.controls || false;
        const tvMenuItemsConfig = this.config.television && this.config.television.controls.menuitems || [];
        const tvChannelsConfig = this.config.television && this.config.television.tv && this.config.television.tv.channels || false;
        const tvChannelsChannelsConfig = this.config.television && this.config.television.tv && this.config.television.tv.channels || [];
        const playerMainConfig = this.config.player && this.config.player.main;
        const playerPlayConfig = this.config.player && this.config.player.play || false;
        const playerPauseConfig = this.config.player && this.config.player.pause || false;
        const playerStopConfig = this.config.player && this.config.player.stop || false;
        const applicationVolumeConfig = this.config.application && this.config.application.volume || false;
        const videoLibraryScanConfig = this.config.videolibrary && this.config.videolibrary.scan || false;
        const videoLibraryCleanConfig = this.config.videolibrary && this.config.videolibrary.clean || false;
        const audioLibraryScanConfig = this.config.audiolibrary && this.config.audiolibrary.scan || false;
        const audioLibraryCleanConfig = this.config.audiolibrary && this.config.audiolibrary.clean || false;
        const commandsConfig = this.config.commands || [];

        let name = platformname + ' Controls';
        if (tvConfig) {
            this.log.info('Adding ' + name);
            const inputNames: string[] = [];
            const inputIdentifiers: number[] = [];
            for (let index = 0; index < tvMenuItemsConfig.length; index++) {
                let inputName = tvMenuItemsConfig[index];
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

        // Kodi Version

        kodi.applicationGetProperties(this.config, this.log, ['version'], (error, result) => {
            if (!error) {
                if (result && result.version && result.version.major && result.version.minor) {
                    this.log.info('Kodi Version: ' + result.version.major + '.' + result.version.minor);
                }
            } else {
                this.log.info('Kodi Version: Kodi does not seem to be running');
            }
        });

        // Reset all services on start

        this.resetAllServices(this.api, true);

        // Check volume on start

        this.updateApplicationVolumeService.bind(this, this.api);

        // Kodi Notifications

        this.log.debug('Starting Subscription to Kodi Notifications');
        this.kodiNotificationsSubscription.bind(this, this.api);
        this.intervalSubscriptionsKodiPlayer = new setIntervalPlus(this.kodiNotificationsSubscription.bind(this, this.api), retrytime * 1000);

        // Intervalled Updating Start

        this.log.debug('Starting Updating Kodi with polling: ' + polling + ' seconds');
        this.updateKodiPlayer(this.api, false);
        this.intervalUpdateKodiPlayer = new setIntervalPlus(this.updateKodiPlayer.bind(this, this.api, false), (polling !== 0 ? polling : 10) * 1000);

        // Start Updates when currently playing

        kodi.isPlaying(this.config, this.log, (playing, paused) => {
            if (playing) {
                kodi.tvIsPlaying(this.config, this.log, (tvplaying) => {
                    this.televisionChannelsService?.getCharacteristic(this.api.hap.Characteristic.Active).updateValue(tvplaying);
                });
                this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(true);
                this.playerPlaySwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(true);
                this.playerPauseSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                this.updateKodiPlayer(this.api, false);
                this.intervalUpdateKodiPlayer.start();
            } else if (paused) {
                this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                this.playerPlaySwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                this.playerPauseSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(true);
                this.intervalUpdateKodiPlayer.stop();
            } else {
                this.playerLightbulbService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                this.playerPlaySwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                this.playerPauseSwitchService?.getCharacteristic(this.api.hap.Characteristic.On).updateValue(false);
                this.intervalUpdateKodiPlayer.stop();
            }
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
                return existingAccessory;
            } else {
                this.log.debug('Adding new accessory:' + name);
                const accessory = new this.api.platformAccessory(name, uuid);
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
                new KodiAccessory(this, accessory, this.log, this.config, name, packageJSON.version);
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
        } else {
            this.log.debug('Adding new accessory: ' + name);
            const accessory = new this.api.platformAccessory(name, uuid);
            new KodiCommandAccessory(this, accessory, this.log, this.config, name, packageJSON.version, interval, sequence);
            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
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
        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

        if (existingAccessory) {
            this.log.debug('Restoring existing accessory from cache: ' + existingAccessory.displayName);
            new KodiTelevisionAccessory(this, existingAccessory, this.log, this.config, name, packageJSON.version, type, inputNames, inputIdentifiers);
            return existingAccessory;
        } else {
            this.log.debug('Adding new accessory: ' + name);
            const accessory = new this.api.platformAccessory(name, uuid, this.api.hap.Categories.TELEVISION);
            new KodiTelevisionAccessory(this, accessory, this.log, this.config, name, packageJSON.version, type, inputNames, inputIdentifiers);
            this.api.publishExternalAccessories(PLUGIN_NAME, [accessory]);
            return accessory;
        }
    }

    getAccessory(name: string): PlatformAccessory | undefined {
        const uuid = this.api.hap.uuid.generate(name);
        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
        if (existingAccessory) {
            return existingAccessory;
        }
        return undefined;
    }

    kodiNotificationsSubscription = async function (this: KodiPlatform, api: API) {
        kodi.getStatus(this.config, (error, status) => {
            if (!error && status) {
                const ws = new WebSocket('ws://' + this.config.host + ':9090/jsonrpc');
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
                        // this.log.error('Subscription Error: ', error);
                        this.televisionControlsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(true);
                        this.updateApplicationVolumeService.bind(this, api);
                        this.updateTelevisionChannelsService.bind(this, api);
                        this.intervalSubscriptionsKodiPlayer.stop();
                        this.log.debug('Kodi Notifications: Subscribed successfully');
                    });
                    // System.OnSleep
                    ws.on('System.OnSleep', () => {
                        this.log.debug('Notification Received: System.OnSleep');
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ws.unsubscribe(subscriptions).catch(_ => {
                            this.televisionControlsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
                            this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
                            this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                            this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.Brightness).updateValue(0);
                            this.intervalSubscriptionsKodiPlayer.start();
                            this.log.debug('Kodi Notifications: Unsubscribed successfully');
                        });
                        this.resetAllServices(api, true);
                    });
                    // System.OnWake
                    ws.on('System.OnWake', () => {
                        this.log.debug('Notification Received: System.OnWake');
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ws.subscribe(subscriptions).catch(_ => {
                            // this.log.error('Subscription Error: ' + error); // Always throws 'Method not found' warning after successfully subscribing?!
                            this.televisionControlsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(true);
                            this.updateApplicationVolumeService.bind(this, api);
                            this.updateTelevisionChannelsService.bind(this, api);
                            this.intervalSubscriptionsKodiPlayer.stop();
                            this.log.debug('Kodi Notifications: Subscribed successfully');
                        });
                    });
                    // System.OnQuit
                    ws.on('System.OnQuit', () => {
                        this.log.debug('Notification Received: System.OnQuit');
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ws.unsubscribe(subscriptions).catch(_ => {
                            this.televisionControlsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
                            this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
                            this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                            this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.Brightness).updateValue(0);
                            this.intervalSubscriptionsKodiPlayer.start();
                            this.log.debug('Kodi Notifications: Unsubscribed successfully');
                        });
                        this.resetAllServices(api, true);
                    });
                    // System.OnRestart
                    ws.on('System.OnRestart', () => {
                        this.log.debug('Notification Received: System.OnRestart');
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ws.unsubscribe(subscriptions).catch(_ => {
                            this.televisionControlsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
                            this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
                            this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                            this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.Brightness).updateValue(0);
                            this.intervalSubscriptionsKodiPlayer.start();
                            this.log.debug('Kodi Notifications: Unsubscribed successfully');
                        });
                        this.resetAllServices(api, true);
                    });
                    // Player.OnVolumeChanged
                    ws.on('Application.OnVolumeChanged', () => {
                        this.log.debug('Notification Received: Application.OnVolumeChanged');
                        kodi.applicationGetProperties(this.config, this.log, ['muted', 'volume'], (error, result) => {
                            if (!error && result) {
                                const muted = result.muted ? result.muted : false;
                                const volume = result.volume ? result.volume : 0;
                                this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(!muted && volume !== 0);
                                this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.Brightness).updateValue(volume);
                            }
                        });
                    });
                    // Player.OnPlay
                    ws.on('Player.OnPlay', () => {
                        this.log.debug('Notification Received: Player.OnPlay');
                        this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                        this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                        this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        this.updateTelevisionChannelsService.bind(this, api);
                        this.updateKodiPlayer(api, true);
                        this.intervalUpdateKodiPlayer.start();
                    });
                    // Player.OnResume
                    ws.on('Player.OnResume', () => {
                        this.log.debug('Notification Received: Player.OnResume');
                        this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                        this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                        this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        this.updateTelevisionChannelsService.bind(this, api);
                        this.updateKodiPlayer(api, false);
                        this.intervalUpdateKodiPlayer.start();
                    });
                    // Player.OnPause
                    ws.on('Player.OnPause', () => {
                        this.log.debug('Notification Received: Player.OnPause');
                        this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                        this.updateTelevisionChannelsService.bind(this, api);
                        this.intervalUpdateKodiPlayer.stop();
                    });
                    // Player.OnStop
                    ws.on('Player.OnStop', () => {
                        this.log.debug('Notification Received: Player.OnStop');
                        this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
                        this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        this.intervalUpdateKodiPlayer.stop();
                        this.resetAllServices(api, false);
                    });
                    // Player.OnSeek
                    ws.on('Player.OnSeek', () => {
                        this.log.debug('Notification Received: Player.OnSeek');
                        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                            if (!error && playerid && playerid !== -1) {
                                kodi.playerGetProperties(this.config, this.log, playerid, ['percentage'], (error, result) => {
                                    if (!error && result) {
                                        this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.Brightness).updateValue(Math.round(result.percentage));
                                    }
                                });
                            }
                        });
                    });
                    // Player.OnSpeedChanged
                    ws.on('Player.OnSpeedChanged', () => {
                        this.log.debug('Notification Received: Application.OnSpeedChanged');
                        kodi.isPlaying(this.config, this.log, (playing, paused) => {
                            if (playing) {
                                this.intervalUpdateKodiPlayer.start();
                                this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                                this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                            } else if (paused) {
                                this.intervalUpdateKodiPlayer.stop();
                                this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                                this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                            } else {
                                this.intervalUpdateKodiPlayer.stop();
                                this.resetAllServices(api, false);
                            }
                        });
                    });
                    // VideoLibrary.OnScanStarted
                    ws.on('VideoLibrary.OnScanStarted', () => {
                        this.log.debug('Notification Received: VideoLibrary.OnScanStarted');
                        kodi.storageSetItem(api.user.persistPath(), this.videoLibraryScanSwitchService?.name, 'true', () => {
                            this.videoLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                        });
                    });
                    // VideoLibrary.OnScanFinished
                    ws.on('VideoLibrary.OnScanFinished', () => {
                        this.log.debug('Notification Received: VideoLibrary.OnScanFinished');
                        kodi.storageSetItem(api.user.persistPath(), this.videoLibraryScanSwitchService?.name, 'true', () => {
                            this.videoLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        });
                    });
                    // VideoLibrary.OnCleanStarted
                    ws.on('VideoLibrary.OnCleanStarted', () => {
                        this.log.debug('Notification Received: VideoLibrary.OnCleanStarted');
                        kodi.storageSetItem(api.user.persistPath(), this.videoLibraryCleanSwitchService?.name, 'true', () => {
                            this.videoLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                        });
                    });
                    // VideoLibrary.OnCleanFinished
                    ws.on('VideoLibrary.OnCleanFinished', () => {
                        this.log.debug('Notification Received: VideoLibrary.OnCleanFinished');
                        kodi.storageSetItem(api.user.persistPath(), this.videoLibraryCleanSwitchService?.name, 'true', () => {
                            this.videoLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        });
                    });
                    // AudioLibrary.OnScanStarted
                    ws.on('AudioLibrary.OnScanStarted', () => {
                        this.log.debug('Notification Received: AudioLibrary.OnScanStarted');
                        kodi.storageSetItem(api.user.persistPath(), this.audioLibraryScanSwitchService?.name, 'true', () => {
                            this.audioLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                        });
                    });
                    // AudioLibrary.OnScanFinished
                    ws.on('AudioLibrary.OnScanFinished', () => {
                        this.log.debug('Notification Received: AudioLibrary.OnScanFinished');
                        kodi.storageSetItem(api.user.persistPath(), this.audioLibraryScanSwitchService?.name, 'true', () => {
                            this.audioLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        });
                    });
                    // AudioLibrary.OnCleanStarted
                    ws.on('AudioLibrary.OnCleanStarted', () => {
                        this.log.debug('Notification Received: AudioLibrary.OnCleanStarted');
                        kodi.storageSetItem(api.user.persistPath(), this.audioLibraryCleanSwitchService?.name, 'true', () => {
                            this.audioLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(true);
                        });
                    });
                    // AudioLibrary.OnCleanFinished
                    ws.on('AudioLibrary.OnCleanFinished', () => {
                        this.log.debug('Notification Received: AudioLibrary.OnCleanFinished');
                        kodi.storageSetItem(api.user.persistPath(), this.audioLibraryCleanSwitchService?.name, 'false', () => {
                            this.audioLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
                        });
                    });
                });
            } else {
                this.log.debug('Kodi Notifications: Kodi does not seem to be running - Retry in ' + this.config.retrytime + ' seconds');
            }
        });
    }

    updateKodiPlayer = async function (this: KodiPlatform, api: API, onplay: boolean) {
        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
            if (!error && playerid !== -1) {
                kodi.playerGetItem(this.config, this.log, playerid as number, ['artist', 'album', 'showtitle', 'season', 'episode', 'duration'], (error, itemresult) => {
                    if (!error && itemresult && itemresult.item) {
                        let artist = '-';
                        if (itemresult.item.artist) {
                            for (let i = 0; i < itemresult.item.artist.length; i++) {
                                if (artist === '-') {
                                    artist = itemresult.item.artist[i];
                                }
                                artist += itemresult.item.artist[i];
                                if (i !== itemresult.item.artist.length - 1) {
                                    artist += ', ';
                                }
                            }
                        }
                        const album = itemresult.item.album !== '' ? itemresult.item.album : '-';
                        const itemtype = itemresult.item.type !== '' ? itemresult.item.type : '-';
                        const title = itemresult.item.label !== '' ? itemresult.item.label : '-';
                        const showtitle = typeof itemresult.item.showtitle !== 'undefined' && itemresult.item.showtitle !== '' ? itemresult.item.showtitle : '-';
                        let seasonEpisode = '-';
                        if (itemtype === 'episode') {
                            if ((itemresult.item.season !== -1 && itemresult.item.episode !== -1) ||
                                (typeof itemresult.item.season !== 'undefined' && typeof itemresult.item.episode !== 'undefined')) {
                                seasonEpisode = 'S' + itemresult.item.season.toString().padStart(2, '0') + 'E' + itemresult.item.episode.toString().padStart(2, '0');
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
                        kodi.playerGetProperties(this.config, this.log, playerid as number, ['speed', 'percentage', 'time', 'totaltime'], (error, result) => {
                            if (!error && result) {
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
                                this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(speed);
                                this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.Brightness).updateValue(Math.round(percentage));
                                this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(speed);
                                this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(!speed);
                                this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Position, timeAndTotaltime);
                                let activeIdentifier = -1;
                                const tvChannelsChannelsConfig = this.config.television && this.config.television.tv && this.config.television.tv.channels || [];
                                switch (itemtype) {
                                    case 'movie':
                                        this.log.debug('Setting Info (' + itemtype + '): "' + title + '" - ' + timeAndTotaltime + ' (' + percentage + ' %)');
                                        break;
                                    case 'episode':
                                        this.log.debug('Setting Info (' + itemtype + '): ' + showtitle + ' ' + seasonEpisode + ' "' + title + '" - ' +
                                            timeAndTotaltime + ' (' + percentage + ' %)');
                                        break;
                                    case 'song':
                                        this.log.debug('Setting Info (' + itemtype + '): ' + artist + ' "' + title + '" (' + album + ') - ' +
                                            timeAndTotaltime + ' (' + percentage + ' %)');
                                        break;
                                    case 'unknown':
                                        this.log.debug('Setting Info (' + itemtype + '): "' + title + '" - ' + timeAndTotaltime + ' (' + percentage + ' %)');
                                        break;
                                    case 'channel':
                                        this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(true);
                                        for (let index = 0; index < tvChannelsChannelsConfig.length; index++) {
                                            if (title === tvChannelsChannelsConfig[index]) {
                                                activeIdentifier = index + 1;
                                            }
                                        }
                                        if (activeIdentifier && activeIdentifier !== -1) {
                                            this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.ActiveIdentifier).updateValue(activeIdentifier);
                                        } else {
                                            this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.ActiveIdentifier).updateValue(1);
                                        }
                                        this.log.debug('Setting Info (' + itemtype + '): "' + title + '" (' + activeIdentifier + ')');
                                        break;
                                    default:
                                        this.log.debug('Setting Info (' + itemtype + '): "' + title + '"');
                                }
                            }
                        });
                    } else if (!onplay) {
                        this.intervalUpdateKodiPlayer.stop();
                    }
                });
            } else if (!onplay) {
                this.intervalUpdateKodiPlayer.stop();
            }
        });
    }

    resetAllServices = function (this: KodiPlatform, api: API, completely: boolean) {
        this.log.debug('Reset All Services');
        if (completely) {
            this.televisionControlsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
            this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
            this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.Brightness).updateValue(0);
        }
        this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(false);
        this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
        this.playerLightbulbService?.getCharacteristic(api.hap.Characteristic.Brightness).updateValue(0);
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Type, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Title, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.ShowTitle, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.SeasonEpisode, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Artist, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Album, '-');
        this.playerLightbulbService?.setCharacteristic(this.customCharacteristics.Position, '-');
        this.playerPlaySwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
        this.playerPauseSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
        this.playerStopSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
        this.videoLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
        this.videoLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
        this.audioLibraryScanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
        this.audioLibraryCleanSwitchService?.getCharacteristic(api.hap.Characteristic.On).updateValue(false);
    }

    updateApplicationVolumeService = function (this: KodiPlatform, api: API) {
        kodi.applicationGetProperties(this.config, this.log, ['volume', 'muted'], (error, result) => {
            if (!error && result) {
                const volume = result.volume ? result.volume : 0;
                const muted = result.muted ? result.muted : false;
                this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.On).updateValue(!muted);
                this.applicationVolumeLightbulbService?.getCharacteristic(api.hap.Characteristic.Brightness).updateValue(volume);
            }
        });
    }

    updateTelevisionChannelsService = function (this: KodiPlatform, api: API) {
        kodi.tvIsPlaying(this.config, this.log, (tvplaying) => {
            this.televisionChannelsService?.getCharacteristic(api.hap.Characteristic.Active).updateValue(tvplaying);
        });
    }
}