import {
    Service,
    PlatformConfig,
    PlatformAccessory,
    CharacteristicEventTypes,
    CharacteristicValue,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
} from 'homebridge';

import { KodiPlatform, KodiLogger, KodiAccessory } from '../internal';

import kodi = require('./kodi');

// ===================================
// = VideoLibraryScanSwitchAccessory =
// ===================================

export class VideoLibraryScanSwitchAccessory extends KodiAccessory {

    private switchService: Service;

    constructor(
        private readonly platform: KodiPlatform,
        private readonly accessory: PlatformAccessory,
        public readonly log: KodiLogger,
        public readonly config: PlatformConfig,
        public readonly name: string,
        public readonly version: string,
    ) {
        super();
        this.log.info('Adding VideoLibraryScanSwitchAccessory');

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi ApplicationVolumeLightbulb')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.switchService =
            this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

        this.switchService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.switchService.getCharacteristic(this.platform.Characteristic.On)
            .on(CharacteristicEventTypes.GET, this.getOn.bind(this))
            .on(CharacteristicEventTypes.SET, this.setOn.bind(this));
    }

    getOn(callback: CharacteristicGetCallback) {
        kodi.storageGetItem(this.platform.api.user.persistPath(), this.name, (error, on) => {
            callback(error, on === 'true' ? true : false);
        });
    }

    setOn(on: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.log.debug('Setting ' + this.name + ': ' + on);
        if (on) {
            kodi.getActionResult(this.config, this.log, 'VideoLibrary.Scan', { 'showdialogs': true }, (error, ok) => {
                if (!error && ok) {
                    kodi.storageSetItem(this.platform.api.user.persistPath(), this.name, 'true', () => {
                        callback(null);
                    });
                } else {
                    setTimeout(() => {
                        this.log.debug('Setting ' + this.name + ': false - Scan did not start!');
                        this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                    }, 100);
                    kodi.storageSetItem(this.platform.api.user.persistPath(), this.name, 'false', () => {
                        callback(error);
                    });
                }
            });
        } else {
            kodi.storageSetItem(this.platform.api.user.persistPath(), this.name, 'false', () => {
                callback(null);
            });
        }
    }

}

// ===================================
// = VideoLibraryCleanSwitchAccessory =
// ===================================

export class VideoLibraryCleanSwitchAccessory extends KodiAccessory {

    private switchService: Service;

    constructor(
        private readonly platform: KodiPlatform,
        private readonly accessory: PlatformAccessory,
        public readonly log: KodiLogger,
        public readonly config: PlatformConfig,
        public readonly name: string,
        public readonly version: string,
    ) {
        super();
        this.log.info('Adding VideoLibraryCleanSwitchAccessory');

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi ApplicationVolumeLightbulb')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.switchService =
            this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

        this.switchService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.switchService.getCharacteristic(this.platform.Characteristic.On)
            .on(CharacteristicEventTypes.GET, this.getOn.bind(this))
            .on(CharacteristicEventTypes.SET, this.setOn.bind(this));
    }

    getOn(callback: CharacteristicGetCallback) {
        kodi.storageGetItem(this.platform.api.user.persistPath(), this.name, (error, on) => {
            callback(error, on === 'true' ? true : false);
        });
    }

    setOn(on: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.log.debug('Setting ' + this.name + ': ' + on);
        if (on) {
            kodi.getActionResult(this.config, this.log, 'VideoLibrary.Clean', { 'showdialogs': true }, (error, ok) => {
                if (!error && ok) {
                    kodi.storageSetItem(this.platform.api.user.persistPath(), this.name, 'true', () => {
                        callback(null);
                    });
                } else {
                    setTimeout(() => {
                        this.log.debug('Setting ' + this.name + ': false - Clean did not start!');
                        this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                    }, 100);
                    kodi.storageSetItem(this.platform.api.user.persistPath(), this.name, 'false', () => {
                        callback(error);
                    });
                }
            });
        } else {
            kodi.storageSetItem(this.platform.api.user.persistPath(), this.name, 'false', () => {
                callback(null);
            });
        }
    }

}