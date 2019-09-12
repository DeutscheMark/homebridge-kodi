'use strict'

const connection = require('./connection.js');

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
            connection.kodiRequest(this.config, "Application.GetProperties", { "properties": ["muted"] })
                .then(result => {
                    this.log("Getting " + this.name + ": " + (result.muted === false));
                    callback(null, (result.muted === false));
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        })
        .on('set', (on, callback) => {
            connection.kodiRequest(this.config, "Application.SetMute", { "mute": !on })
                .then(result => {
                    this.log("Setting " + this.name + ": " + result);
                    callback();
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        });
    this.lightbulbService.addCharacteristic(Characteristic.Brightness)
        .on('get', (callback) => {
            connection.kodiRequest(this.config, "Application.GetProperties", { "properties": ["volume"] })
                .then(result => {
                    this.log("Getting " + this.name + ": " + result.volume + " %");
                    callback(null, result.volume);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
                });
        })
        .on('set', (brightness, callback) => {
            connection.kodiRequest(this.config, "Application.SetVolume", { "volume": brightness })
                .then(result => {
                    this.log("Setting " + this.name + ": " + brightness + " %");
                    callback(null, result.volume);
                })
                .catch(error => {
                    this.log(error);
                    callback(error);
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