'use strict'

const kodi = require('./kodi');

let Service,
    Characteristic;

module.exports = {
    ApplicationVolumeLightbulbAccessory: ApplicationVolumeLightbulbAccessory
};

// =================================================
// = ApplicationVolumeLightbulbAccessory Accessory =
// =================================================

function ApplicationVolumeLightbulbAccessory(platform, api, lightbulbService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.lightbulbService = lightbulbService;

    this.log("Adding ApplicationVolumeLightbulbAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi ApplicationVolumeLightbulb")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.lightbulbService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            kodi.applicationGetProperties(this.config, this.log, ["muted"], (error, result) => {
                if (!error && result) {
                    let muted = result.muted ? result.muted : false;
                    this.log("Getting " + this.name + ": " + !muted);
                    callback(null, !muted);
                } else {
                    callback(null, false);
                }
            });
        })
        .on('set', (on, callback) => {
            kodi.applicationSetMute(this.config, this.log, !on, (error, result) => {
                if (!error && result) {
                    this.log("Setting " + this.name + ": " + result);
                }
                callback();
            });
        });
    this.lightbulbService.addCharacteristic(Characteristic.Brightness)
        .on('get', (callback) => {
            kodi.applicationGetProperties(this.config, this.log, ["volume"], (error, result) => {
                if (!error && result) {
                    let volume = result.volume ? result.volume : 0;
                    this.log("Getting " + this.name + ": " + volume + " %");
                    callback(null, volume);
                } else {
                    callback(null, 0);
                }
            });
        })
        .on('set', (brightness, callback) => {
            let volume = Math.round(brightness);
            kodi.applicationSetMute(this.config, this.log, volume == 0, (error, result) => {
                if (!error && result) {
                    this.log("Setting " + this.name + ": " + result);
                }
            });
            kodi.applicationSetVolume(this.config, this.log, volume, (error, result) => {
                if (!error && result) {
                    this.log("Setting " + this.name + ": " + volume + " %");
                }
                callback();
            });
        });
}

ApplicationVolumeLightbulbAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.lightbulbService];
    }
};