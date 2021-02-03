import {
    Service,
    PlatformConfig,
    PlatformAccessory,
    CharacteristicValue,
    CharacteristicEventTypes,
    CharacteristicSetCallback,
    CharacteristicGetCallback,
} from 'homebridge';

import { KodiPlatform, KodiLogger, KodiAccessory } from '../internal';

import kodi = require('./kodi');

// =======================================
// = ApplicationVolumeLightbulbAccessory =
// =======================================

export class ApplicationVolumeLightbulbAccessory extends KodiAccessory {

    public lightbulbService: Service;

    constructor(
        private readonly platform: KodiPlatform,
        private readonly accessory: PlatformAccessory,
        public readonly log: KodiLogger,
        public readonly config: PlatformConfig,
        public readonly name: string,
        public readonly version: string,
    ) {
        super();
        this.log.info('Adding ApplicationVolumeLightbulbAccessory');

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi ApplicationVolumeLightbulb')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.lightbulbService =
            this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

        this.lightbulbService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.lightbulbService.getCharacteristic(this.platform.Characteristic.On)
            .on(CharacteristicEventTypes.GET, this.getOn.bind(this))
            .on(CharacteristicEventTypes.SET, this.setOn.bind(this));

        this.lightbulbService.getCharacteristic(this.platform.Characteristic.Brightness)
            .on(CharacteristicEventTypes.GET, this.getBrightness.bind(this))
            .on(CharacteristicEventTypes.SET, this.setBrightness.bind(this));
    }

    getOn(callback: CharacteristicGetCallback) {
        kodi.applicationGetProperties(this.config, this.log, ['muted'], (error, result) => {
            if (!error && result) {
                const muted = result.muted ? result.muted : false;
                this.log.debug('Getting ' + this.name + ': ' + !muted);
                callback(null, !muted);
            } else {
                callback(null, false);
            }
        });
    }

    setOn(on: CharacteristicValue, callback: CharacteristicSetCallback) {
        kodi.applicationSetMute(this.config, this.log, !on, (error, result) => {
            if (!error) {
                this.log.debug('Setting ' + this.name + ': ' + result);
            }
            callback(error);
        });
    }

    getBrightness(callback: CharacteristicGetCallback) {
        kodi.applicationGetProperties(this.config, this.log, ['volume'], (error, result) => {
            if (!error && result) {
                const volume = result.volume ? result.volume : 0;
                this.log.debug('Getting ' + this.name + ': ' + volume + ' %');
                callback(null, volume);
            } else {
                callback(error, 0);
            }
        });
    }

    setBrightness(brightness: CharacteristicValue, callback: CharacteristicSetCallback) {
        const volume = Math.round(brightness as number);
        kodi.applicationSetMute(this.config, this.log, volume === 0, (error, result) => {
            if (!error) {
                this.log.debug('Setting ' + this.name + '-Mute: ' + result);
                kodi.applicationSetVolume(this.config, this.log, volume, (error, result) => {
                    if (!error && result) {
                        this.log.debug('Setting ' + this.name + ': ' + result + ' %');
                    }
                    callback(error);
                });
            } else {
                callback(error);
            }
        });
    }

}