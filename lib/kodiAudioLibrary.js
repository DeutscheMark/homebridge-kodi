'use strict'

const kodi = require('./kodi');

let Service,
    Characteristic;

module.exports = {
    AudioLibraryScanSwitchAccessory: AudioLibraryScanSwitchAccessory,
    AudioLibraryCleanSwitchAccessory: AudioLibraryCleanSwitchAccessory
};

// ====================================
// = AudioLibraryScanSwitch Accessory =
// ====================================

function AudioLibraryScanSwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    let UUIDGen = api.hap.uuid;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding AudioLibraryScanSwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi AudioLibraryScanSwitch")
        .setCharacteristic(Characteristic.SerialNumber, UUIDGen.generate(this.name))
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .updateValue(false)
        .on('set', (on, callback) => {
            this.log("Setting " + this.name + ": " + on);
            if (on) {
                kodi.getActionResult(this.config, this.log, "AudioLibrary.Scan", { "showdialogs": true }, (error, result) => {
                    setTimeout(() => {
                        this.log("Setting " + this.name + ": false - Scan did not start!");
                        this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                    }, 100);
                    if (!error && result && result != 'OK') {
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

AudioLibraryScanSwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};

// =====================================
// = AudioLibraryCleanSwitch Accessory =
// =====================================

function AudioLibraryCleanSwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    let UUIDGen = api.hap.uuid;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding AudioLibraryCleanSwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi AudioLibraryCleanSwitch")
        .setCharacteristic(Characteristic.SerialNumber, UUIDGen.generate(this.name))
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .updateValue(false)
        .on('set', (on, callback) => {
            this.log("Setting " + this.name + ": " + on);
            if (on) {
                kodi.getActionResult(this.config, this.log, "AudioLibrary.Clean", { "showdialogs": true }, (error, result) => {
                    setTimeout(() => {
                        this.log("Setting " + this.name + ": false - Clean did not start!");
                        this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                    }, 100);
                    if (!error && result && result != 'OK') {
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

AudioLibraryCleanSwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};