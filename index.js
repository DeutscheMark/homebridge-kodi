'use strict'

const platformName = 'homebridge-kodi',
    platformPrettyName = 'Kodi',
    debug = require('debug')('homebridge-kodi'),
    WebSocket = require('rpc-websockets').Client,
    setIntervalPlus = require('setinterval-plus'),
    leftPad = require('left-pad');

const version = require('./package.json').version,
    kodiVideoLibrary = require('./lib/kodiVideoLibrary'),
    kodiPlayer = require('./lib/kodiPlayer'),
    kodiApplication = require('./lib/kodiApplication'),
    HomeKitTypes = require('./lib/types.js'),
    connection = require('./lib/connection.js');

let Service,
    Characteristic;

let playerPlayPauseSwitchService,
    playerStopSwitchService,
    playerSeekLightbulbService,
    applicationVolumeLightbulbService,
    videoLibraryScanSwitchService,
    videoLibraryCleanSwitchService;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerPlatform(platformName, platformPrettyName, KodiPlatform);
}

function KodiPlatform(log, config, api) {
    console.log("Init Homebridge-Kodi");
    this.log = log;
    this.debug = debug;
    this.config = config;
    this.accessoriesList = [];

    HomeKitTypes.registerWith(api.hap);

    this.name = this.config.name;
    this.host = this.config.host || 'localhost';
    this.port = this.config.port || '8080';
    this.username = this.config.username || 'kodi';
    this.password = this.config.password || 'kodi';
    this.polling = this.config.polling || 10;
    this.playerPlayPauseConfig = this.config.playerPlayPause || true;
    this.playerStopConfig = this.config.playerStop || true;
    this.playerSeekConfig = this.config.playerSeek || true;
    this.applicationVolumeConfig = this.config.applicationVolume || true;
    this.videoLibraryScanConfig = this.config.videoLibraryScan || true;
    this.videoLibraryCleanConfig = this.config.videoLibraryClean || true;

    // Add Information Service

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    // Add Services

    if (this.playerPlayPauseConfig) {
        const name = this.name + " Player Playing";
        this.log("Adding " + name);
        playerPlayPauseSwitchService = new Service.Switch(name);
        this.accessoriesList.push(new kodiPlayer.PlayerPlayPauseSwitchAccessory(this, api, playerPlayPauseSwitchService, name, version));
    }
    if (this.playerStopConfig) {
        const name = this.name + " Player Stop";
        this.log("Adding " + name);
        playerStopSwitchService = new Service.Switch(name);
        this.accessoriesList.push(new kodiPlayer.PlayerStopSwitchAccessory(this, api, playerStopSwitchService, name, version));
    }
    if (this.playerSeekConfig) {
        const name = this.name + " Player Seek";
        this.log("Adding " + name);
        playerSeekLightbulbService = new Service.Lightbulb(name);
        this.accessoriesList.push(new kodiPlayer.PlayerSeekLightbulbAccessory(this, api, playerSeekLightbulbService, name, version));
    }
    if (this.applicationVolumeConfig) {
        const name = this.name + " Application Volume";
        this.log("Adding " + name);
        applicationVolumeLightbulbService = new Service.Lightbulb(name);
        this.accessoriesList.push(new kodiApplication.ApplicationVolumeLightbulbAccessory(this, api, applicationVolumeLightbulbService, name, version));
    }
    if (this.videoLibraryScanConfig) {
        const name = this.name + " Video Library Scan";
        this.log("Adding " + name);
        videoLibraryScanSwitchService = new Service.Switch(name);
        this.accessoriesList.push(new kodiVideoLibrary.VideoLibraryScanSwitchAccessory(this, api, videoLibraryScanSwitchService, name, version));
    }
    if (this.videoLibraryCleanConfig) {
        const name = this.name + " Video Library Clean";
        this.log("Adding " + name);
        videoLibraryCleanSwitchService = new Service.Switch(name);
        this.accessoriesList.push(new kodiVideoLibrary.VideoLibraryCleanSwitchAccessory(this, api, videoLibraryCleanSwitchService, name, version));
    }

    // Get Kodi Version

    connection.kodiRequest(this.config, "Application.GetProperties", { "properties": ["version"] })
        .then(result => {
            this.log("Kodi Version: " + result.version.major + "." + result.version.minor);
        })
        .catch(error => this.log(error));

    // Intervalled Updates Start

    this.log("Starting Kodi Update with polling: " + this.polling + " seconds");
    let intervalUpdateKodiPlayer = new setIntervalPlus(this.updateKodiPlayer.bind(this), this.polling * 1000);

    // Start Updates when currently playing

    connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["speed"] })
        .then(result => {
            if (result.speed != 0) {
                playerPlayPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                playerSeekLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
                intervalUpdateKodiPlayer.start();
            } else {
                playerPlayPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                playerSeekLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                intervalUpdateKodiPlayer.stop();
            }
        })
        .catch(error => this.log(error));

    // Kodi Notifications

    let ws = new WebSocket('ws://' + this.config.host + ':9090/jsonrpc');
    ws.on('open', function () {
        // Player.OnPlay
        ws.on('Player.OnPlay', function () {
            this.log("Notification Received: Player.OnPlay");
            playerPlayPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
            playerSeekLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
            intervalUpdateKodiPlayer.start();
        }.bind(this));
        ws.subscribe('Player.OnPlay').catch(function (error) {
            console.log(error);
        });
        // Player.OnResume
        ws.on('Player.OnResume', function () {
            this.log("Notification Received: Player.OnResume");
            playerPlayPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
            playerSeekLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
            intervalUpdateKodiPlayer.start();
        }.bind(this));
        ws.subscribe('Player.OnResume').catch(function (error) {
            console.log(error);
        });
        // Player.OnPause
        ws.on('Player.OnPause', function () {
            this.log("Notification Received: Player.OnPause");
            playerPlayPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            playerSeekLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
            intervalUpdateKodiPlayer.stop();
        }.bind(this));
        ws.subscribe('Player.OnPause').catch(function (error) {
            console.log(error);
        });
        // Player.OnStop
        ws.on('Player.OnStop', function () {
            this.log("Notification Received: Player.OnStop");
            playerPlayPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            playerSeekLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
            playerStopSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            intervalUpdateKodiPlayer.stop();
        }.bind(this));
        ws.subscribe('Player.OnStop').catch(function (error) {
            console.log(error);
        });
        // Player.OnSeek
        ws.on('Player.OnSeek', function () {
            this.log("Notification Received: Player.OnSeek");
            connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["percentage"] })
                .then(result => {
                    playerSeekLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(Math.round(result.percentage));
                })
                .catch(error => this.log(error));
        }.bind(this));
        ws.subscribe('Player.OnSeek').catch(function (error) {
            console.log(error);
        });
        // Player.OnSpeedChanged
        ws.on('Player.OnSpeedChanged', function () {
            this.log("Notification Received: Application.OnSpeedChanged");
            connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["speed"] })
                .then(result => {
                    if (result.speed != 0) {
                        playerPlayPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                        playerSeekLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
                        intervalUpdateKodiPlayer.start();
                    } else {
                        playerPlayPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                        playerSeekLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                        intervalUpdateKodiPlayer.stop();
                    }
                })
                .catch(error => this.log(error));
        }.bind(this));
        ws.subscribe('Player.OnSpeedChanged').catch(function (error) {
            console.log(error);
        });
        // Player.OnVolumeChanged
        ws.on('Application.OnVolumeChanged', function () {
            this.log("Notification Received: Application.OnVolumeChanged");
            connection.kodiRequest(this.config, "Application.GetProperties", { "properties": ["muted", "volume"] })
                .then(result => {
                    if (result.muted === true && result.volume == 0) {
                        applicationVolumeLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                    } else {
                        applicationVolumeLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
                    }
                    applicationVolumeLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(result.volume);
                })
                .catch(error => this.log(error));
        }.bind(this));
        ws.subscribe('Application.OnVolumeChanged').catch(function (error) {
            console.log(error);
        });
        // VideoLibrary.OnScanStarted
        ws.on('VideoLibrary.OnScanStarted', function () {
            this.log("Notification Received: VideoLibrary.OnScanStarted");
            videoLibraryScanSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
        }.bind(this));
        ws.subscribe('VideoLibrary.OnScanStarted').catch(function (error) {
            console.log(error);
        });
        // VideoLibrary.OnScanFinished
        ws.on('VideoLibrary.OnScanFinished', function () {
            this.log("Notification Received: VideoLibrary.OnScanFinished");
            videoLibraryScanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
        }.bind(this));
        ws.subscribe('VideoLibrary.OnScanFinished').catch(function (error) {
            console.log(error);
        });
        // VideoLibrary.OnCleanStarted
        ws.on('VideoLibrary.OnCleanStarted', function () {
            this.log("Notification Received: VideoLibrary.OnCleanStarted");
            videoLibraryCleanSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
        }.bind(this));
        ws.subscribe('VideoLibrary.OnCleanStarted').catch(function (error) {
            console.log(error);
        });
        // VideoLibrary.OnCleanFinished
        ws.on('VideoLibrary.OnCleanFinished', function () {
            this.log("Notification Received: VideoLibrary.OnCleanFinished");
            videoLibraryCleanSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
        }.bind(this));
        ws.subscribe('VideoLibrary.OnCleanFinished').catch(function (error) {
            console.log(error);
        });
    }.bind(this));
}

KodiPlatform.prototype = {
    accessories: function (callback) {
        this.log("Kodi Accessories read.");
        callback(this.accessoriesList);
    },

    updateKodiPlayer: async function () {
        connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["speed", "percentage"] })
            .then(result => {
                let speed = result.speed != 0;
                let percentage = Math.round(result.percentage);
                playerPlayPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(speed);
                playerSeekLightbulbService.getCharacteristic(Characteristic.On).updateValue(speed);
                playerSeekLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(percentage);

                connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1, "properties": ["showtitle", "season", "episode", "duration"] })
                    .then(result => {
                        let showtitle = typeof result.item.showtitle !== 'undefined' ? result.item.showtitle : "-";
                        let seasonAndEpisode = "S" + leftPad(result.item.season, 2, 0) + "E" + leftPad(result.item.episode, 2, 0);
                        let label = typeof result.item.label !== 'undefined' ? result.item.label : "-";
                        playerPlayPauseSwitchService.getCharacteristic(Characteristic.IPAdd).updateValue(showtitle);
                        playerPlayPauseSwitchService.getCharacteristic(Characteristic.Host).updateValue(label);
                        playerSeekLightbulbService.getCharacteristic(Characteristic.IPAdd).updateValue(showtitle);
                        playerSeekLightbulbService.getCharacteristic(Characteristic.Host).updateValue(label);
                        if (result.item.season && result.item.episode) {
                            playerPlayPauseSwitchService.getCharacteristic(Characteristic.Caller).updateValue(seasonAndEpisode);
                            playerSeekLightbulbService.getCharacteristic(Characteristic.Caller).updateValue(seasonAndEpisode);
                        } else {
                            playerPlayPauseSwitchService.getCharacteristic(Characteristic.Caller).updateValue("-");
                            playerSeekLightbulbService.getCharacteristic(Characteristic.Caller).updateValue("-");
                        }

                        connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["time", "totaltime"] })
                            .then(result => {
                                let timeAndTotaltime = result.time.hours + ":" + leftPad(result.time.minutes, 2, 0) + ":" + leftPad(result.time.seconds, 2, 0) + " / " +
                                    result.totaltime.hours + ":" + leftPad(result.totaltime.minutes, 2, 0) + ":" + leftPad(result.totaltime.seconds, 2, 0);
                                this.log("Setting Info: " + showtitle + " " + seasonAndEpisode + " \"" + label + "\" - " + timeAndTotaltime + " (" + percentage + " %)");
                                playerPlayPauseSwitchService.getCharacteristic(Characteristic.Adresse).updateValue(timeAndTotaltime);
                                playerSeekLightbulbService.getCharacteristic(Characteristic.Adresse).updateValue(timeAndTotaltime);
                            })
                            .catch(error => this.log(error));
                    })
                    .catch(error => this.log(error));
            })
            .catch(error => this.log(error));
    }
}