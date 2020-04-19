'use strict'

const kodi = require('./kodi');

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

    let UUIDGen = api.hap.uuid;

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
        .setCharacteristic(Characteristic.SerialNumber, UUIDGen.generate(this.name))
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .updateValue(false)
        .on('set', (on, callback) => {
            this.log("Setting " + this.name + ": " + on);
            if (on) {
                kodi.getActionResult(this.config, this.log, "VideoLibrary.Scan", { "showdialogs": true }, (error, result) => {
                    if (!error && result && result != 'OK') {
                        setTimeout(() => {
                            this.log("Setting " + this.name + ": false - Scan did not start!");
                            this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                        }, 100);
                        callback();
                    } else {
                        callback();
                    }
                });
            } else {
                callback();
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

    let UUIDGen = api.hap.uuid;

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
        .setCharacteristic(Characteristic.SerialNumber, UUIDGen.generate(this.name))
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .updateValue(false)
        .on('set', (on, callback) => {
            this.log("Setting " + this.name + ": " + on);
            if (on) {
                kodi.getActionResult(this.config, this.log, "VideoLibrary.Clean", { "showdialogs": true }, (error, result) => {
                    if (!error && result && result != 'OK') {
                        setTimeout(() => {
                            this.log("Setting " + this.name + ": false - Clean did not start!");
                            this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                        }, 100);
                        callback();
                    } else {
                        callback();
                    }
                });
            } else {
                callback();
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