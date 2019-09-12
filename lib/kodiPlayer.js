'use strict'

const leftPad = require('left-pad');

const HomeKitTypes = require('./types.js'),
    connection = require('./connection.js');

let Service,
    Characteristic;

module.exports = {
    PlayerPlayPauseSwitchAccessory: PlayerPlayPauseSwitchAccessory,
    PlayerStopSwitchAccessory: PlayerStopSwitchAccessory,
    PlayerSeekLightbulbAccessory: PlayerSeekLightbulbAccessory
};

// ============================================
// = PlayerPlayPauseSwitchAccessory Accessory =
// ============================================

function PlayerPlayPauseSwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;
    HomeKitTypes.registerWith(api.hap);

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding PlayerPlayPauseSwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerPlayPauseSwitch")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["speed"] })
                .then(result => {
                    this.log("Getting " + this.name + ": " + (result.speed != 0));
                    callback(null, result.speed != 0);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        })
        .on('set', (on, callback) => {
            connection.kodiRequest(this.config, "Player.SetSpeed", { "playerid": 1, "speed": on ? 1 : 0 })
                .then(result => {
                    this.log("Setting " + this.name + ": " + on);
                    callback();
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.switchService.getCharacteristic(Characteristic.ShowTitle)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1, "properties": ["showtitle"] })
                .then(result => {
                    callback(null, result.item.showtitle);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.switchService.getCharacteristic(Characteristic.SeasonEpisode)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1, "properties": ["season", "episode"] })
                .then(result => {
                    callback(null, "S" + leftPad(result.item.season, 2, 0) + "E" + leftPad(result.item.episode, 2, 0));
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.switchService.getCharacteristic(Characteristic.EpisodeTitle)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1, "properties": ["showtitle", "season", "episode", "duration"] })
                .then(result => {
                    callback(result.item.label);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.switchService.getCharacteristic(Characteristic.Position)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["time", "totaltime"] })
                .then(result => {
                    callback(null, result.time.hours + ":" + leftPad(result.time.minutes, 2, 0) + ":" + leftPad(result.time.seconds, 2, 0) + " / " +
                        result.totaltime.hours + ":" + leftPad(result.totaltime.minutes, 2, 0) + ":" + leftPad(result.totaltime.seconds, 2, 0));
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
}

PlayerPlayPauseSwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};

// ==============================
// = PlayerStopSwitch Accessory =
// ==============================

function PlayerStopSwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding PlayerStopSwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerStopSwitch")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On).updateValue(false)
        .updateValue(false)
        .on('set', (on, callback) => {
            if (on) {
                connection.kodiRequest(this.config, "Player.Stop", { "playerid": 1 })
                    .then(result => {
                        this.log("Setting " + this.name + ": " + on);
                        callback();
                    })
                    .catch(error => {
                        this.log(error);
                        callback(error);
                    });
            }
        });
}

PlayerStopSwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};

// ==========================================
// = PlayerSeekLightbulbAccessory Accessory =
// ==========================================

function PlayerSeekLightbulbAccessory(platform, api, lightbulbService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.lightbulbService = lightbulbService;

    HomeKitTypes.registerWith(api.hap);

    this.log("Adding PlayerSeekLightbulbAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerSeekLightbulb")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.lightbulbService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["speed"] })
                .then(result => {
                    this.log("Getting " + this.name + ": " + result.speed != 0);
                    callback(null, result.speed != 0);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        })
        .on('set', (on, callback) => {
            connection.kodiRequest(this.config, "Player.SetSpeed", { "playerid": 1, "speed": on ? 1 : 0 })
                .then(result => {
                    this.log("Setting " + this.name + ": " + on);
                    callback();
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.lightbulbService.addCharacteristic(Characteristic.Brightness)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["percentage"] })
                .then(result => {
                    this.log("Getting " + this.name + ": " + Math.round(result.percentage) + " %");
                    callback(null, Math.round(result.percentage));
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        })
        .on('set', (brightness, callback) => {
            connection.kodiRequest(this.config, "Player.Seek", { "playerid": 1, "value": brightness })
                .then(result => {
                    if (result.percentage) {
                        this.log("Setting " + this.name + ": " + result.percentage);
                    }
                    callback();
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.lightbulbService.getCharacteristic(Characteristic.ShowTitle)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1, "properties": ["showtitle"] })
                .then(result => {
                    callback(null, result.item.showtitle);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.lightbulbService.getCharacteristic(Characteristic.SeasonEpisode)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1, "properties": ["season", "episode"] })
                .then(result => {
                    callback(null, "S" + leftPad(result.item.season, 2, 0) + "E" + leftPad(result.item.episode, 2, 0));
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.lightbulbService.getCharacteristic(Characteristic.EpisodeTitle)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1, "properties": ["showtitle", "season", "episode", "duration"] })
                .then(result => {
                    callback(result.item.label);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.lightbulbService.getCharacteristic(Characteristic.Position)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["time", "totaltime"] })
                .then(result => {
                    callback(null, result.time.hours + ":" + leftPad(result.time.minutes, 2, 0) + ":" + leftPad(result.time.seconds, 2, 0) + " / " +
                        result.totaltime.hours + ":" + leftPad(result.totaltime.minutes, 2, 0) + ":" + leftPad(result.totaltime.seconds, 2, 0));
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
}

PlayerSeekLightbulbAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.lightbulbService];
    }
};