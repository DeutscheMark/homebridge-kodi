'use strict'

const HomeKitTypes = require('./types.js'),
    connection = require('./connection.js');

let Service,
    Characteristic;

module.exports = {
    PlayerLightbulbAccessory: PlayerLightbulbAccessory,
    PlayerPlaySwitchAccessory: PlayerPlaySwitchAccessory,
    PlayerPauseSwitchAccessory: PlayerPauseSwitchAccessory,
    PlayerStopSwitchAccessory: PlayerStopSwitchAccessory
};

// ======================================
// = PlayerLightbulbAccessory Accessory =
// ======================================

function PlayerLightbulbAccessory(platform, api, lightbulbService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.lightbulbService = lightbulbService;

    HomeKitTypes.registerWith(api.hap);

    this.log("Adding PlayerLightbulbAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerLightbulb")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.lightbulbService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["speed"] })
                .then(result => {
                    let on = result.speed != 0 ? result.speed != 0 : false;
                    this.log("Getting " + this.name + ": " + on);
                    callback(null, on);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        })
        .on('set', (on, callback) => {
            connection.kodiRequest(this.config, "Player.SetSpeed", { "playerid": 1, "speed": on ? 1 : 0 })
                .then(result => {
                    let speed = result.speed ? result.speed : 0;
                    if (speed == 0) {
                        setTimeout((function () {
                            this.log("Setting " + this.name + ": false - Nothing seems to be playing!");
                            this.lightbulbService.getCharacteristic(Characteristic.On).updateValue(false);
                        }).bind(this), 100);
                    }
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
                    let percentage = Math.round(result.percentage ? result.percentage : 0);
                    this.log("Getting " + this.name + ": " + percentage + " %");
                    callback(null, percentage);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        })
        .on('set', (brightness, callback) => {
            connection.kodiRequest(this.config, "Player.Seek", { "playerid": 1, "value": brightness })
                .then(result => {
                    if (result) {
                        this.log(result);
                        let percentage = result.percentage ? result.percentage : 0;
                        this.log("Setting " + this.name + ": " + percentage);
                    }
                    callback();
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.lightbulbService.getCharacteristic(Characteristic.Type)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1 })
                .then(result => {
                    let type = typeof result.item.type !== 'undefined' && result.item.type != 'unknown' ? result.item.type : "-";
                    this.log("Getting " + this.name + " Type: " + type);
                    callback(null, type);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.lightbulbService.getCharacteristic(Characteristic.ShowTitle)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1 })
                .then(result => {
                    let showtitle = typeof result.item.showtitle !== 'undefined' && result.item.showtitle != '' ? result.item.showtitle : "-";
                    this.log("Getting " + this.name + " Show Title: " + showtitle);
                    callback(null, showtitle);
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
                    let seasonEpisode = "-";
                    if (typeof result.item.type !== 'undefined' && result.item.type == 'episode') {
                        if ((result.item.season != -1 && result.item.episode != -1) || (typeof result.item.season !== 'undefined' && typeof result.item.episode !== 'undefined')) {
                            seasonEpisode = "S" + result.item.season.toString().padStart(2, '0') + "E" + result.item.episode.toString().padStart(2, '0');
                        } else if ((result.item.season == -1 && result.item.episode != -1) || (typeof result.item.season == 'undefined' && typeof result.item.episode !== 'undefined')) {
                            seasonEpisode = "E" + result.item.episode.toString().padStart(2, '0');
                        }
                    }
                    this.log("Getting " + this.name + " Season / Episode: " + seasonEpisode);
                    callback(null, seasonEpisode);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.lightbulbService.getCharacteristic(Characteristic.Label)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1 })
                .then(result => {
                    let label = typeof result.item.label !== 'undefined' && result.item.label != '' ? result.item.label : "-"
                    this.log("Getting " + this.name + " Label: " + label);
                    callback(null, label);
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
                    let position = result.time.hours + ":" + result.time.minutes.toString().padStart(2, '0') + ":" + result.time.seconds.toString().padStart(2, '0') + " / " +
                        result.totaltime.hours + ":" + result.totaltime.minutes.toString().padStart(2, '0') + ":" + result.totaltime.seconds.toString().padStart(2, '0');
                    this.log("Getting " + this.name + " Position: " + position);
                    callback(null, position);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
}

PlayerLightbulbAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.lightbulbService];
    }
};

// =======================================
// = PlayerPlaySwitchAccessory Accessory =
// =======================================

function PlayerPlaySwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;
    HomeKitTypes.registerWith(api.hap);

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding PlayerPlaySwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerPlaySwitch")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["speed"] })
                .then(result => {
                    let on = result.speed != 0 ? result.speed != 0 : false;
                    this.log("Getting " + this.name + ": " + on);
                    callback(null, on);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        })
        .on('set', (on, callback) => {
            connection.kodiRequest(this.config, "Player.SetSpeed", { "playerid": 1, "speed": on ? 1 : 0 })
                .then(result => {
                    let stopped = result.speed == 0 ? result.speed == 0 : true;
                    if (stopped) {
                        setTimeout((function () {
                            this.log("Setting " + this.name + ": false - Nothing seems to be playing!");
                            this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                        }).bind(this), 100);
                    }
                    this.log("Setting " + this.name + ": " + on);
                    callback();
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
}

PlayerPlaySwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};

// ========================================
// = PlayerPauseSwitchAccessory Accessory =
// ========================================

function PlayerPauseSwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;
    HomeKitTypes.registerWith(api.hap);

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding PlayerPauseSwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerPauseSwitch")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1 })
                .then(result => {
                    if (result.item.id) {
                        connection.kodiRequest(this.config, "Player.GetProperties", { "playerid": 1, "properties": ["speed"] })
                            .then(result => {
                                let on = result.speed == 0 ? result.speed == 0 : false;
                                this.log("Getting " + this.name + ": " + on);
                                callback(null, on);
                            })
                            .catch(error => {
                                this.log(error);
                                callback(error);
                            });
                    } else {
                        this.log("Getting " + this.name + ": false - Nothing seems to be playing!");
                        callback(null, false);
                    }
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        })
        .on('set', (on, callback) => {
            connection.kodiRequest(this.config, "Player.SetSpeed", { "playerid": 1, "speed": on ? 0 : 1 })
                .then(result => {
                    connection.kodiRequest(this.config, "Player.GetItem", { "playerid": 1 })
                        .then(itemresult => {
                            if (!itemresult.item.id) {
                                setTimeout((function () {
                                    this.log("Setting " + this.name + ": false - Nothing seems to be playing!");
                                    this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                                }).bind(this), 100);
                            }
                            let on = result.speed == 0 ? result.speed == 0 : false;
                            this.log("Setting " + this.name + ": " + on);
                            callback();
                        })
                        .catch(error => {
                            this.log(error);
                            callback(error);
                        });
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
}

PlayerPauseSwitchAccessory.prototype = {
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

    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            callback(null, false);
        })
        .on('set', (on, callback) => {
            if (on) {
                connection.kodiRequest(this.config, "Player.Stop", { "playerid": 1 })
                    .then(result => {
                        setTimeout((function () {
                            this.log("Setting " + this.name + ": false - Nothing seems to be playing!");
                            this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                        }).bind(this), 100);
                        this.log("Setting " + this.name + ": " + on);
                        callback();
                    })
                    .catch(error => {
                        this.log(error);
                        callback(error);
                    });
            } else {
                callback();
            };
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