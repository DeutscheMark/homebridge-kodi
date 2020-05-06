'use strict'

const kodi = require('./kodi');

let Service,
    Characteristic;

module.exports = {
    CommandSwitchAccessory: CommandSwitchAccessory
};

// ====================================
// = CommandSwitchAccessory Accessory =
// ====================================

function CommandSwitchAccessory(platform, api, switchService, interval, sequence, name, version) {
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
                for (let index = 0; index < sequence.length; index++) {
                    let commandarr = sequence[index].split(":");
                    let command = commandarr[0];
                    let params = commandarr[1];
                    let intervalValue = interval || 500;
                    setTimeout(() => {
                        kodi.input(this.config, this.log, command, params, (error, result) => {
                            if (!error && result) {
                                this.log(this.name + ": \"" + sequence[index] + "\" command sent.");
                                if (index == sequence.length - 1) {
                                    setTimeout(() => {
                                        this.log(this.name + ": Command sequence successfully sent.");
                                        this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                                    }, 100);
                                    callback();
                                }
                            } else if (index == sequence.length - 1) {
                                setTimeout(() => {
                                    this.log(this.name + ": Command sequence successfully sent.");
                                    this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                                }, 100);
                                callback();
                            }
                        });
                    }, intervalValue * index);
                }
            } else {
                callback();
            }
        });
}

CommandSwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};