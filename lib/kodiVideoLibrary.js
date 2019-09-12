'use strict'

const connection = require('./connection.js');

let Service,
    Characteristic;

module.exports = {
    VideoLibraryScanSwitchAccessory: VideoLibraryScanSwitchAccessory,
    VideoLibraryCleanSwitchAccessory: VideoLibraryCleanSwitchAccessory
};

// ====================================
// = VideoLibraryScanSwitch Accessory =
// ====================================

function VideoLibraryScanSwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding VideoLibraryScanSwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi VideoLibraryScanSwitch")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .updateValue(false)
        .on('set', (on, callback) => {
            this.log("Setting " + this.name + ": " + on);
            if (on) {
                connection.kodiRequest(this.config, "VideoLibrary.Scan", { "showdialogs": true })
                    .then(result => {
                        callback();
                    })
                    .catch(error => {
                        this.log(error);
                        callback(error);
                    });
            }
        });
}

VideoLibraryScanSwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};

// =====================================
// = VideoLibraryCleanSwitch Accessory =
// =====================================

function VideoLibraryCleanSwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding VideoLibraryCleanSwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi VideoLibraryCleanSwitch")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .updateValue(false)
        .on('set', (on, callback) => {
            this.log("Setting " + this.name + ": " + on);
            if (on) {
                connection.kodiRequest(this.config, "VideoLibrary.Clean", { "showdialogs": true })
                    .then(result => {
                        callback();
                    })
                    .catch(error => {
                        this.log(error);
                        callback(error);
                    });
            }
        });
}

VideoLibraryCleanSwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};