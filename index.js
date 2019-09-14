'use strict'

const platformName = 'homebridge-kodi',
    platformPrettyName = 'Kodi',
    debug = require('debug')('homebridge-kodi'),
    WebSocket = require('rpc-websockets').Client,
    setIntervalPlus = require('setinterval-plus');

const version = require('./package.json').version,
    kodiVideoLibrary = require('./lib/kodiVideoLibrary'),
    kodiPlayer = require('./lib/kodiPlayer'),
    kodiApplication = require('./lib/kodiApplication'),
    HomeKitTypes = require('./lib/types.js'),
    connection = require('./lib/connection.js');

let Service,
    Characteristic;

let playerLightbulbService,
    playerPlaySwitchService,
    playerPauseSwitchService,
    playerStopSwitchService,
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
    this.playerPlayConfig = this.config.playerPlay || false;
    this.playerPauseConfig = this.config.playerPause || false;
    this.playerStopConfig = this.config.playerStop || false;
    this.applicationVolumeConfig = this.config.applicationVolume || false;
    this.videoLibraryScanConfig = this.config.videoLibraryScan || false;
    this.videoLibraryCleanConfig = this.config.videoLibraryClean || false;

    // Add Information Service

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    // Add Services

    const name = this.name + " Player";
    this.log("Adding " + name);
    playerLightbulbService = new Service.Lightbulb(name);
    this.accessoriesList.push(new kodiPlayer.PlayerLightbulbAccessory(this, api, playerLightbulbService, name, version));

    if (this.playerPlayConfig) {
        const name = this.name + " Player Play";
        this.log("Adding " + name);
        playerPlaySwitchService = new Service.Switch(name);
        this.accessoriesList.push(new kodiPlayer.PlayerPlaySwitchAccessory(this, api, playerPlaySwitchService, name, version));
    }
    if (this.playerPauseConfig) {
        const name = this.name + " Player Pause";
        this.log("Adding " + name);
        playerPauseSwitchService = new Service.Switch(name);
        this.accessoriesList.push(new kodiPlayer.PlayerPauseSwitchAccessory(this, api, playerPauseSwitchService, name, version));
    }
    if (this.playerStopConfig) {
        const name = this.name + " Player Stop";
        this.log("Adding " + name);
        playerStopSwitchService = new Service.Switch(name);
        this.accessoriesList.push(new kodiPlayer.PlayerStopSwitchAccessory(this, api, playerStopSwitchService, name, version));
    }
    if (this.applicationVolumeConfig) {
        const name = this.name + " Volume";
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
                playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
                playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                intervalUpdateKodiPlayer.start();
            } else {
                playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
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
            playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
            playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(true);
            playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            intervalUpdateKodiPlayer.start();
        }.bind(this));
        ws.subscribe('Player.OnPlay').catch(function (error) {
            console.log(error);
        });
        // Player.OnResume
        ws.on('Player.OnResume', function () {
            this.log("Notification Received: Player.OnResume");
            playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
            playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(true);
            playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            intervalUpdateKodiPlayer.start();
        }.bind(this));
        ws.subscribe('Player.OnResume').catch(function (error) {
            console.log(error);
        });
        // Player.OnPause
        ws.on('Player.OnPause', function () {
            this.log("Notification Received: Player.OnPause");
            playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
            playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
            intervalUpdateKodiPlayer.stop();
        }.bind(this));
        ws.subscribe('Player.OnPause').catch(function (error) {
            console.log(error);
        });
        // Player.OnStop
        ws.on('Player.OnStop', function () {
            this.log("Notification Received: Player.OnStop");
            playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
            playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(false);
            playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
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
                    playerLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(Math.round(result.percentage));
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
                        playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(true);
                        playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(true);
                        playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                        intervalUpdateKodiPlayer.start();
                    } else {
                        playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                        playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(false);
                        playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(true);
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
                playerLightbulbService.getCharacteristic(Characteristic.On).updateValue(speed);
                playerLightbulbService.getCharacteristic(Characteristic.Brightness).updateValue(percentage);
                playerPlaySwitchService.getCharacteristic(Characteristic.On).updateValue(speed);
                playerPauseSwitchService.getCharacteristic(Characteristic.On).updateValue(!speed);

                connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1, "properties": ["showtitle", "season", "episode", "duration"] })
                    .then(result => {
                        let showtitle = typeof result.item.showtitle !== 'undefined' ? result.item.showtitle : "-";
                        let seasonAndEpisode = "S" + result.item.season.toStart().padStart(2, 0) + "E" + result.item.episode.toStart().padStart(2, 0);
                        let label = typeof result.item.label !== 'undefined' ? result.item.label : "-";
                        playerLightbulbService.getCharacteristic(Characteristic.ShowTitle).updateValue(showtitle);
                        playerLightbulbService.getCharacteristic(Characteristic.EpisodeTitle).updateValue(label);
                        if (result.item.season && result.item.episode) {
                            playerLightbulbService.getCharacteristic(Characteristic.SeasonEpisode).updateValue(seasonAndEpisode);
                        } else {
                            playerLightbulbService.getCharacteristic(Characteristic.SeasonEpisode).updateValue("-");
                        }

                        connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["time", "totaltime"] })
                            .then(result => {
                                let timeAndTotaltime = result.time.hours + ":" + result.time.minutes.toStart().padStart(2, 0) + ":" + result.time.seconds.toStart().padStart(2, 0) + " / " +
                                    result.totaltime.hours + ":" + result.totaltime.minutes.toStart().padStart(2, 0) + ":" + result.totaltime.seconds.toStart().padStart(2, 0);
                                this.log("Setting Info: " + showtitle + " " + seasonAndEpisode + " \"" + label + "\" - " + timeAndTotaltime + " (" + percentage + " %)");
                                playerLightbulbService.getCharacteristic(Characteristic.Position).updateValue(timeAndTotaltime);
                            })
                            .catch(error => this.log(error));
                    })
                    .catch(error => this.log(error));
            })
            .catch(error => this.log(error));
    }
}