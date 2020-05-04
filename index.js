'use strict'

const platformName = 'homebridge-kodi',
    platformPrettyName = 'Kodi',
    debug = require('debug')('homebridge-kodi'),
    WebSocket = require('rpc-websockets').Client,
    setIntervalPlus = require('setinterval-plus');

const version = require('./package.json').version,
    kodi = require('./lib/kodi'),
    kodiTelevision = require('./lib/kodiTelevision'),
    kodiPlayer = require('./lib/kodiPlayer'),
    kodiApplication = require('./lib/kodiApplication'),
    kodiVideoLibrary = require('./lib/kodiVideoLibrary'),
    kodiAudioLibrary = require('./lib/kodiAudioLibrary');

let Service,
    Characteristic,
    CustomCharacteristic;

let televisionControlsService,
    televisionControlsSpeakerService,
    televisionChannelsService,
    televisionChannelsSpeakerService,
    playerLightbulbService,
    playerPlaySwitchService,
    playerPauseSwitchService,
    playerStopSwitchService,
    applicationVolumeLightbulbService,
    videoLibraryScanSwitchService,
    videoLibraryCleanSwitchService,
    audioLibraryScanSwitchService,
    audioLibraryCleanSwitchService;

let intervalSubscriptionsKodiPlayer,
    intervalUpdateKodiPlayer;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerPlatform(platformName, platformPrettyName, KodiPlatform);
}

function KodiPlatform(log, config, api) {
    this.debug = debug;
    this.config = config;
    this.log = this.config.debug ? log : () => { };
    this.log.error = log.error;
    this.accessoriesList = [];

    let UUIDGen = api.hap.uuid;

    this.log("Init Homebridge-Kodi");

    this.name = this.config.name;
    this.host = this.config.host || 'localhost';
    this.port = this.config.port || '8080';
    this.username = this.config.username || 'kodi';
    this.password = this.config.password || 'kodi';
    this.polling = this.config.polling || 10;
    this.retrytime = this.config.retrytime || 30;
    this.tvConfig = this.config.television && this.config.television.controls || false;
    this.tvMenuItemsConfig = this.config.television && this.config.television.controls.menuitems || [];
    this.tvChannelsConfig = this.config.television && this.config.television.tv && this.config.television.tv.channels || false;
    this.tvChannelsChannelsConfig = this.config.television && this.config.television.tv && this.config.television.tv.channels || [];
    this.playerMainConfig = this.config.player && this.config.player.main;
    this.playerPlayConfig = this.config.player && this.config.player.play || false;
    this.playerPauseConfig = this.config.player && this.config.player.pause || false;
    this.playerStopConfig = this.config.player && this.config.player.stop || false;
    this.applicationVolumeConfig = this.config.application && this.config.application.volume || false;
    this.videoLibraryScanConfig = this.config.videolibrary && this.config.videolibrary.scan || false;
    this.videoLibraryCleanConfig = this.config.videolibrary && this.config.videolibrary.clean || false;
    this.audioLibraryScanConfig = this.config.audiolibrary && this.config.audiolibrary.scan || false;
    this.audioLibraryCleanConfig = this.config.audiolibrary && this.config.audiolibrary.clean || false;

    // Add Information Service

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi")
        .setCharacteristic(Characteristic.SerialNumber, UUIDGen.generate(this.name))
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    // Add Services

    CustomCharacteristic = require('./util/characteristics')(api);

    let name = this.name + " Controls";
    televisionControlsService = new Service.Television(name);
    televisionControlsSpeakerService = new Service.TelevisionSpeaker(name + " Speaker");
    if (this.tvConfig) {
        this.log("Adding " + name);
        let inputServices = [];
        let inputNames = [];
        let inputIdentifiers = [];
        for (let index = 0; index < this.tvMenuItemsConfig.length; index++) {
            let inputName = this.tvMenuItemsConfig[index];
            let inputIdentifier;
            switch (inputName) {
                case "home":
                    inputName = "Home";
                    inputIdentifier = 1;
                    break;
                case "settings":
                    inputName = "Settings";
                    inputIdentifier = 2;
                    break;
                case "movies":
                    inputName = "Movies";
                    inputIdentifier = 3;
                    break;
                case "tvshows":
                    inputName = "TV shows";
                    inputIdentifier = 4;
                    break;
                case "tv":
                    inputName = "TV";
                    inputIdentifier = 5;
                    break;
                case "music":
                    inputName = "Music";
                    inputIdentifier = 6;
                    break;
                case "musicvideos":
                    inputName = "Music videos";
                    inputIdentifier = 7;
                    break;
                case "radio":
                    inputName = "Radio";
                    inputIdentifier = 8;
                    break;
                case "games":
                    inputName = "Games";
                    inputIdentifier = 9;
                    break;
                case "addons":
                    inputName = "Add-ons";
                    inputIdentifier = 10;
                    break;
                case "pictures":
                    inputName = "Pictures";
                    inputIdentifier = 11;
                    break;
                case "videos":
                    inputName = "Videos";
                    inputIdentifier = 12;
                    break;
                case "favorites":
                    inputName = "Favorites";
                    inputIdentifier = 13;
                    break;
                case "weather":
                    inputName = "Weather";
                    inputIdentifier = 14;
                    break;
                default:
                    inputName = null;
                    break;
            }
            if (inputName && inputIdentifier) {
                this.log("Adding input for " + name + ": " + inputName);
                let inputService = new Service.InputSource(inputName, "menuitem" + inputIdentifier);
                inputServices.push(inputService);
                inputNames.push(inputName);
                inputIdentifiers.push(inputIdentifier);
            }
        }
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiTelevision.TelevisionAccessory(this, api, "Controls", televisionControlsService, televisionControlsSpeakerService, inputServices, inputNames, inputIdentifiers, name, version));
    }
    name = this.name + " Channels";
    televisionChannelsService = new Service.Television(name);
    televisionChannelsSpeakerService = new Service.TelevisionSpeaker(name + " Speaker");
    if (this.tvChannelsConfig) {
        this.log("Adding " + name);
        let inputServices = [];
        let inputNames = [];
        let inputIdentifiers = [];
        for (let index = 0; index < this.tvChannelsChannelsConfig.length; index++) {
            let inputName = this.tvChannelsChannelsConfig[index];
            this.log("Adding input for " + name + ": " + inputName);
            let inputService = new Service.InputSource(inputName, "channel" + index + 1);
            inputServices.push(inputService);
            inputNames.push(inputName);
            inputIdentifiers.push(index + 1);
        }
        this.accessoriesList.push(new kodiTelevision.TelevisionAccessory(this, api, "Channels", televisionChannelsService, televisionChannelsSpeakerService, inputServices, inputNames, inputIdentifiers, name, version));
    }
    name = this.name + " Player";
    playerLightbulbService = new Service.Lightbulb(name);
    if (this.playerMainConfig || typeof this.playerMainConfig === 'undefined') {
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiPlayer.PlayerLightbulbAccessory(this, api, playerLightbulbService, name, version));
    }
    name = this.name + " Player Play";
    playerPlaySwitchService = new Service.Switch(name);
    if (this.playerPlayConfig) {
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiPlayer.PlayerPlaySwitchAccessory(this, api, playerPlaySwitchService, name, version));
    }
    name = this.name + " Player Pause";
    playerPauseSwitchService = new Service.Switch(name);
    if (this.playerPauseConfig) {
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiPlayer.PlayerPauseSwitchAccessory(this, api, playerPauseSwitchService, name, version));
    }
    name = this.name + " Player Stop";
    playerStopSwitchService = new Service.Switch(name);
    if (this.playerStopConfig) {
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiPlayer.PlayerStopSwitchAccessory(this, api, playerStopSwitchService, name, version));
    }
    name = this.name + " Volume";
    applicationVolumeLightbulbService = new Service.Lightbulb(name);
    if (this.applicationVolumeConfig) {
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiApplication.ApplicationVolumeLightbulbAccessory(this, api, applicationVolumeLightbulbService, name, version));
    }
    name = this.name + " Video Library Scan";
    videoLibraryScanSwitchService = new Service.Switch(name);
    if (this.videoLibraryScanConfig) {
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiVideoLibrary.VideoLibraryScanSwitchAccessory(this, api, videoLibraryScanSwitchService, name, version));
    }
    name = this.name + " Video Library Clean";
    videoLibraryCleanSwitchService = new Service.Switch(name);
    if (this.videoLibraryCleanConfig) {
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiVideoLibrary.VideoLibraryCleanSwitchAccessory(this, api, videoLibraryCleanSwitchService, name, version));
    }
    name = this.name + " Audio Library Scan";
    audioLibraryScanSwitchService = new Service.Switch(name);
    if (this.audioLibraryScanConfig) {
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiAudioLibrary.AudioLibraryScanSwitchAccessory(this, api, audioLibraryScanSwitchService, name, version));
    }
    name = this.name + " Audio Library Clean";
    audioLibraryCleanSwitchService = new Service.Switch(name);
    if (this.audioLibraryCleanConfig) {
        this.log("Adding " + name);
        this.accessoriesList.push(new kodiAudioLibrary.AudioLibraryCleanSwitchAccessory(this, api, audioLibraryCleanSwitchService, name, version));
    }

    // Kodi Version

    kodi.applicationGetProperties(this.config, this.log, ["version"], (error, result) => {
        if (!error) {
            if (result && result.version && result.version.major && result.version.minor) {
                this.log("Kodi Version: " + result.version.major + "." + result.version.minor);
            }
        } else {
            this.log("Kodi Version: Kodi does not seem to be running");
        }
    });

    // Reset all services on start

    this.resetAllServices(true);

    // Check volume on start

    this.updateApplicationVolumeService();

    // Kodi Notifications

    this.log("Starting Subscription to Kodi Notifications");
    this.kodiNotificationsSubscription();
    intervalSubscriptionsKodiPlayer = new setIntervalPlus(this.kodiNotificationsSubscription.bind(this), this.retrytime * 1000);

    // Intervalled Updating Start

    this.log("Starting Updating Kodi with polling: " + this.polling + " seconds");
    this.updateKodiPlayer(false);
    intervalUpdateKodiPlayer = new setIntervalPlus(this.updateKodiPlayer.bind(this), (this.polling != 0 ? this.polling : 10) * 1000);

    // Start Updates when currently playing

    kodi.isPlaying(this.config, this.log, (playing, paused) => {
        if (playing) {
            kodi.tvIsPlaying(this.config, this.log, (tvplaying) => {
                televisionChannelsService.getCharacteristic(Characteristic.Active).updateValue(tvplaying);
            });
            playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
            playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(true);
            playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            this.updateKodiPlayer(false);
            intervalUpdateKodiPlayer.start();
        } else if (paused) {
            playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
            playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
            intervalUpdateKodiPlayer.stop();
        } else {
            playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
            playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            intervalUpdateKodiPlayer.stop();
        }
    });
}

KodiPlatform.prototype = {
    accessories: function (callback) {
        this.log("Kodi Accessories read");
        callback(this.accessoriesList);
    },

    kodiNotificationsSubscription: async function () {
        kodi.getStatus(this.config, this.log, (error, status) => {
            if (!error && status) {
                let ws = new WebSocket('ws://' + this.config.host + ':9090/jsonrpc');
                ws.on('open', () => {
                    // Player.OnPlay
                    const subscriptions = [
                        'System.OnSleep',
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
                        'AudioLibrary.OnCleanFinished'
                    ];
                    ws.subscribe(subscriptions).catch(error => {
                        //this.log.error("Subscription Error: " + error); // Always throws 'Method not found' warning after successfully subscribing?!
                        televisionControlsService.getCharacteristic(Characteristic.Active).updateValue(true);
                        this.updateApplicationVolumeService();
                        this.updateTelevisionChannelsService();
                        intervalSubscriptionsKodiPlayer.stop();
                        this.log("Kodi Notifications: Subscribed successfully");
                    });
                    // System.OnSleep
                    ws.on('System.OnSleep', () => {
                        this.log("Notification Received: System.OnSleep");
                        ws.unsubscribe(subscriptions).catch(error => {
                            //this.log.error("Subscription Error: " + error); // Always throws 'Method not found' warning after successfully unsubscribing?!
                            televisionControlsService.getCharacteristic(Characteristic.Active).updateValue(false);
                            televisionChannelsService.getCharacteristic(Characteristic.Active).updateValue(false);
                            applicationVolumeLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                            applicationVolumeLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(0);
                            intervalSubscriptionsKodiPlayer.start();
                            this.log("Kodi Notifications: Unsubscribed successfully");
                        });
                        this.resetAllServices(true);
                    });
                    // System.OnQuit
                    ws.on('System.OnQuit', () => {
                        this.log("Notification Received: System.OnQuit");
                        ws.unsubscribe(subscriptions).catch(error => {
                            //this.log.error("Subscription Error: " + error); // Always throws 'Method not found' warning after successfully unsubscribing?!
                            televisionControlsService.getCharacteristic(Characteristic.Active).updateValue(false);
                            televisionChannelsService.getCharacteristic(Characteristic.Active).updateValue(false);
                            applicationVolumeLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                            applicationVolumeLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(0);
                            intervalSubscriptionsKodiPlayer.start();
                            this.log("Kodi Notifications: Unsubscribed successfully");
                        });
                        this.resetAllServices(true);
                    });
                    // System.OnRestart
                    ws.on('System.OnRestart', () => {
                        this.log("Notification Received: System.OnRestart");
                        ws.unsubscribe(subscriptions).catch(error => {
                            //this.log.error("Subscription Error: " + error); // Always throws 'Method not found' warning after successfully unsubscribing?!
                            televisionControlsService.getCharacteristic(Characteristic.Active).updateValue(false);
                            televisionChannelsService.getCharacteristic(Characteristic.Active).updateValue(false);
                            applicationVolumeLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                            applicationVolumeLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(0);
                            intervalSubscriptionsKodiPlayer.start();
                            this.log("Kodi Notifications: Unsubscribed successfully");
                        });
                        this.resetAllServices(true);
                    });
                    // Player.OnVolumeChanged
                    ws.on('Application.OnVolumeChanged', () => {
                        this.log("Notification Received: Application.OnVolumeChanged");
                        kodi.applicationGetProperties(this.config, this.log, ["muted", "volume"], (error, result) => {
                            if (!error && result) {
                                let muted = result.muted ? result.muted : false;
                                let volume = result.volume ? result.volume : 0;
                                applicationVolumeLightbulbService.getCharacteristic(Characteristic.On).updateValue(!muted && volume != 0);
                                applicationVolumeLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(volume);
                            }
                        });
                    });
                    // Player.OnPlay
                    ws.on('Player.OnPlay', () => {
                        this.log("Notification Received: Player.OnPlay");
                        playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
                        playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                        playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                        this.updateTelevisionChannelsService();
                        this.updateKodiPlayer(true);
                        intervalUpdateKodiPlayer.start();
                    });
                    // Player.OnResume
                    ws.on('Player.OnResume', () => {
                        this.log("Notification Received: Player.OnResume");
                        playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
                        playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                        playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                        this.updateTelevisionChannelsService();
                        this.updateKodiPlayer(false);
                        intervalUpdateKodiPlayer.start();
                    });
                    // Player.OnPause
                    ws.on('Player.OnPause', () => {
                        this.log("Notification Received: Player.OnPause");
                        playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                        playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                        playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                        this.updateTelevisionChannelsService();
                        intervalUpdateKodiPlayer.stop();
                    });
                    // Player.OnStop
                    ws.on('Player.OnStop', () => {
                        this.log("Notification Received: Player.OnStop");
                        televisionChannelsService.getCharacteristic(Characteristic.Active).updateValue(false);
                        intervalUpdateKodiPlayer.stop();
                        this.resetAllServices(false);
                    });
                    // Player.OnSeek
                    ws.on('Player.OnSeek', () => {
                        this.log("Notification Received: Player.OnSeek");
                        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                            if (!error && playerid != -1) {
                                kodi.playerGetProperties(this.config, this.log, playerid, ["percentage"], (error, result) => {
                                    if (!error && result) {
                                        playerLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(Math.round(result.percentage));
                                    }
                                });
                            }
                        });
                    });
                    // Player.OnSpeedChanged
                    ws.on('Player.OnSpeedChanged', () => {
                        this.log("Notification Received: Application.OnSpeedChanged");
                        kodi.isPlaying(this.config, this.log, (playing, paused) => {
                            if (playing) {
                                intervalUpdateKodiPlayer.start();
                                playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
                                playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                                playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                            } else if (paused) {
                                intervalUpdateKodiPlayer.stop();
                                playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                                playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                                playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                            } else {
                                intervalUpdateKodiPlayer.stop();
                                this.resetAllServices(false);
                            }
                        });
                    });
                    // VideoLibrary.OnScanStarted
                    ws.on('VideoLibrary.OnScanStarted', () => {
                        this.log("Notification Received: VideoLibrary.OnScanStarted");
                        videoLibraryScanSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                    });
                    // VideoLibrary.OnScanFinished
                    ws.on('VideoLibrary.OnScanFinished', () => {
                        this.log("Notification Received: VideoLibrary.OnScanFinished");
                        videoLibraryScanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                    });
                    // VideoLibrary.OnCleanStarted
                    ws.on('VideoLibrary.OnCleanStarted', () => {
                        this.log("Notification Received: VideoLibrary.OnCleanStarted");
                        videoLibraryCleanSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                    });
                    // VideoLibrary.OnCleanFinished
                    ws.on('VideoLibrary.OnCleanFinished', () => {
                        this.log("Notification Received: VideoLibrary.OnCleanFinished");
                        videoLibraryCleanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                    });
                    // AudioLibrary.OnScanStarted
                    ws.on('AudioLibrary.OnScanStarted', () => {
                        this.log("Notification Received: AudioLibrary.OnScanStarted");
                        audioLibraryScanSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                    });
                    // AudioLibrary.OnScanFinished
                    ws.on('AudioLibrary.OnScanFinished', () => {
                        this.log("Notification Received: AudioLibrary.OnScanFinished");
                        audioLibraryScanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                    });
                    // AudioLibrary.OnCleanStarted
                    ws.on('AudioLibrary.OnCleanStarted', () => {
                        this.log("Notification Received: AudioLibrary.OnCleanStarted");
                        audioLibraryCleanSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                    });
                    // AudioLibrary.OnCleanFinished
                    ws.on('AudioLibrary.OnCleanFinished', () => {
                        this.log("Notification Received: AudioLibrary.OnCleanFinished");
                        audioLibraryCleanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                    });
                });
            } else {
                this.log("Kodi Notifications: Kodi does not seem to be running - Retry in " + this.retrytime + " seconds");
            }
        });
    },

    updateKodiPlayer: async function (onplay) {
        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
            if (!error && playerid != -1) {
                kodi.playerGetItem(this.config, this.log, playerid, ["artist", "album", "showtitle", "season", "episode", "duration"], (error, itemresult) => {
                    if (!error && itemresult && itemresult.item) {
                        let artist = itemresult.item.artist != '' ? itemresult.item.artist : "-";
                        let album = itemresult.item.album != '' ? itemresult.item.album : "-";
                        let itemtype = itemresult.item.type != '' ? itemresult.item.type : "-";
                        let label = itemresult.item.label != '' ? itemresult.item.label : "-";
                        let showtitle = typeof itemresult.item.showtitle !== 'undefined' && itemresult.item.showtitle != '' ? itemresult.item.showtitle : "-";
                        let seasonEpisode = "-";
                        if (itemtype == 'episode') {
                            if ((itemresult.item.season != -1 && itemresult.item.episode != -1) || (typeof resitemresultult.item.season !== 'undefined' && typeof itemresult.item.episode !== 'undefined')) {
                                seasonEpisode = "S" + itemresult.item.season.toString().padStart(2, '0') + "E" + itemresult.item.episode.toString().padStart(2, '0');
                            } else if ((itemresult.item.season == -1 && itemresult.item.episode != -1) || (typeof itemresult.item.season == 'undefined' && typeof itemresult.item.episode !== 'undefined')) {
                                seasonEpisode = "E" + itemresult.item.episode.toString().padStart(2, '0');
                            }
                        }
                        playerLightbulbService.setCharacteristic(CustomCharacteristic.Type, itemtype);
                        playerLightbulbService.setCharacteristic(CustomCharacteristic.Label, label);
                        playerLightbulbService.setCharacteristic(CustomCharacteristic.ShowTitle, showtitle);
                        playerLightbulbService.setCharacteristic(CustomCharacteristic.SeasonEpisode, seasonEpisode);
                        playerLightbulbService.setCharacteristic(CustomCharacteristic.Artist, artist);
                        playerLightbulbService.setCharacteristic(CustomCharacteristic.Album, album);
                        kodi.playerGetProperties(this.config, this.log, playerid, ["speed", "percentage", "time", "totaltime"], (error, result) => {
                            if (!error && result) {
                                let speed = result.speed != 0 ? result.speed != 0 : 0;
                                let percentage = Math.round(result.percentage ? result.percentage : 0);
                                let timeAndTotaltime = result.time.hours + ":" + result.time.minutes.toString().padStart(2, '0') + ":" + result.time.seconds.toString().padStart(2, '0') + " / " +
                                    result.totaltime.hours + ":" + result.totaltime.minutes.toString().padStart(2, '0') + ":" + result.totaltime.seconds.toString().padStart(2, '0');
                                if (timeAndTotaltime == "0:00:00 / 0:00:00") {
                                    timeAndTotaltime = "-"
                                }
                                if (percentage == 0 && timeAndTotaltime == "-") {
                                    percentage = 100;
                                }
                                playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(speed);
                                playerLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(Math.round(percentage));
                                playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(speed);
                                playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(!speed);
                                playerLightbulbService.setCharacteristic(CustomCharacteristic.Position, timeAndTotaltime);
                                switch (itemtype) {
                                    case "movie":
                                        this.log("Setting Info (" + itemtype + "): \"" + label + "\" - " + timeAndTotaltime + " (" + percentage + " %)");
                                        break;
                                    case "episode":
                                        this.log("Setting Info (" + itemtype + "): " + showtitle + " " + seasonEpisode + " \"" + label + "\" - " + timeAndTotaltime + " (" + percentage + " %)");
                                        break;
                                    case "song":
                                        this.log("Setting Info (" + itemtype + "): " + artist + " \"" + label + "\" (" + album + ") - " + timeAndTotaltime + " (" + percentage + " %)");
                                        break;
                                    case "unknown":
                                        this.log("Setting Info (" + itemtype + "): \"" + label + "\" - " + timeAndTotaltime + " (" + percentage + " %)");
                                        break;
                                    case "channel":
                                        televisionChannelsService.getCharacteristic(Characteristic.Active).updateValue(true);
                                        let activeIdentifier;
                                        for (let index = 0; index < this.tvChannelsChannelsConfig.length; index++) {
                                            if (label == this.tvChannelsChannelsConfig[index]) {
                                                activeIdentifier = index + 1;
                                            }
                                        }
                                        if (activeIdentifier) {
                                            televisionChannelsService.getCharacteristic(Characteristic.ActiveIdentifier).updateValue(activeIdentifier);
                                        } else {
                                            televisionChannelsService.getCharacteristic(Characteristic.ActiveIdentifier).updateValue(1);
                                        }
                                        this.log("Setting Info (" + itemtype + "): \"" + label + "\" (" + activeIdentifier + ")");
                                        break;
                                    default:
                                        this.log("Setting Info (" + itemtype + "): \"" + label + "\"");
                                }
                            }
                        });
                    } else if (!onplay) {
                        intervalUpdateKodiPlayer.stop();
                    }
                });
            } else if (!onplay) {
                intervalUpdateKodiPlayer.stop();
            }
        });
    },

    resetAllServices: function (completely) {
        if (completely) {
        televisionControlsService.getCharacteristic(Characteristic.Active).updateValue(false);
            applicationVolumeLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
            applicationVolumeLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(0);
        }
        televisionChannelsService.getCharacteristic(Characteristic.Active).updateValue(false);
        playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
        playerLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(0);
        playerLightbulbService.setCharacteristic(CustomCharacteristic.Type, "-");
        playerLightbulbService.setCharacteristic(CustomCharacteristic.Label, "-");
        playerLightbulbService.setCharacteristic(CustomCharacteristic.ShowTitle, "-");
        playerLightbulbService.setCharacteristic(CustomCharacteristic.SeasonEpisode, "-");
        playerLightbulbService.setCharacteristic(CustomCharacteristic.Artist, "-");
        playerLightbulbService.setCharacteristic(CustomCharacteristic.Album, "-");
        playerLightbulbService.setCharacteristic(CustomCharacteristic.Position, "-");
        playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(false);
        playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
        playerStopSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
        videoLibraryScanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
        videoLibraryCleanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
        audioLibraryScanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
        audioLibraryCleanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
    },

    updateApplicationVolumeService: function () {
        kodi.applicationGetProperties(this.config, this.log, ["volume", "muted"], (error, result) => {
            if (!error && result) {
                let volume = result.volume ? result.volume : 0;
                let muted = result.muted ? result.muted : false;
                applicationVolumeLightbulbService.getCharacteristic(Characteristic.On).updateValue(!muted);
                applicationVolumeLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(volume);
            }
        });
    },

    updateTelevisionChannelsService: function () {
        kodi.tvIsPlaying(this.config, this.log, (tvplaying) => {
            televisionChannelsService.getCharacteristic(Characteristic.Active).updateValue(tvplaying);
        });
    }
}