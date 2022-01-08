import {
    Service,
    PlatformConfig,
    PlatformAccessory,
    CharacteristicValue,
} from 'homebridge';

import { KodiPlatform, KodiLogger, KodiAccessory } from '../../internal';

import kodi = require('../kodi');

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
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi VideoLibraryScanSwitch')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.switchService =
            this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

        this.switchService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.switchService.getCharacteristic(this.platform.Characteristic.On)
            .onGet(async () => {
                return kodi.getActionResult(this.config, 'XBMC.GetInfoBooleans', { 'booleans': ['Library.IsScanningVideo'] })
                    .then(([, result]) => {
                        if (result) {
                            const isScanning = result['Library.IsScanningVideo'];
                            this.log.debug('Getting ' + this.name + ': ' + isScanning);
                            return isScanning;
                        } else {
                            return false;
                        }
                    })
                    .catch(error => {
                        this.log.error('Getting ' + this.name + ' - Error: ' + error.message);
                        return false;
                    });
            })
            .onSet(async (on) => {
                if (on) {
                    kodi.getActionResult(this.config, 'VideoLibrary.Scan', { 'showdialogs': true })
                        .then(ok => {
                            if (ok) {
                                this.log.debug('Setting ' + this.name + ': ' + on);
                            } else {
                                this.log.debug('Setting ' + this.name + ': ' + on + ' (not ok)');
                            }
                        })
                        .catch(error => {
                            this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                        });
                } else {
                    this.log.debug('Setting ' + this.name + ': ' + on + ' - A scan can\'t be stopped.');
                    this.resetToCurrentStatus(on); // Setting to off is not supported by Kodi JSON-RPC
                }
            });
    }

    resetToCurrentStatus(on: CharacteristicValue) {
        kodi.getActionResult(this.config, 'XBMC.GetInfoBooleans', { 'booleans': ['Library.IsScanningVideo'] })
            .then(([, result]) => {
                if (result) {
                    const isScanning = result['Library.IsScanningVideo'];
                    this.log.debug('Setting ' + this.name + ': ' + isScanning);
                    this.updateValue(isScanning);
                } else {
                    this.log.debug('Setting ' + this.name + ': ' + on + ' (no result)');
                    this.updateValue(false);
                }
            })
            .catch(error => {
                this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                this.updateValue(false);
            });
    }

    updateValue(on: boolean) {
        setTimeout(() => {
            this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(on);
        }, 100);
    }

}

// ====================================
// = VideoLibraryCleanSwitchAccessory =
// ====================================

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
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi VideoLibraryCleanSwitch')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.switchService =
            this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

        this.switchService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.switchService.getCharacteristic(this.platform.Characteristic.On)
            .onGet(async () => {
                return kodi.storageGetItem(this.platform.api.user.persistPath(), this.name)
                    .then(on => {
                        this.log.debug('Getting ' + this.name + ': ' + on);
                        return on === 'true' ? true : false;
                    })
                    .catch(error => {
                        this.log.error('Getting ' + this.name + ' - Error: ' + error.message);
                        return false;
                    });
            })
            .onSet(async (on) => {
                if (on) {
                    // TODO: This takes as long as the clean and produces Timeout-Errors because of that. Should be more async!
                    kodi.getActionResult(this.config, 'VideoLibrary.Clean', { 'showdialogs': true })
                        .then(([ok, result]) => {
                            if (ok && result) {
                                this.persistStatus(true);
                            } else {
                                this.log.debug('Setting ' + this.name + ': ' + on + ' - Clean did not start!');
                                this.updateValueAndPersist(false);
                            }
                        })
                        .catch(error => {
                            this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                            this.updateValueAndPersist(false);
                        });
                } else {
                    this.log.debug('Setting ' + this.name + ': ' + on + ' - A clean can\'t be stopped.');
                    this.persistStatus(false); // Setting to off is not supported by Kodi JSON-RPC
                }
            });
    }

    updateValueAndPersist(on: boolean) {
        setTimeout(() => {
            this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(on);
        }, 100);
        this.persistStatus(on);
    }

    persistStatus(status: boolean) {
        kodi.storageSetItem(this.platform.api.user.persistPath(), this.name, status ? 'true' : 'false')
            .then(() => {
                this.log.debug('Setting ' + this.name + ': ' + status + ' - Status is persisted!');
            })
            .catch(error => {
                this.log.error('Setting ' + this.name + ': ' + status + ' - Error: ' + error.message);
            });
    }

}