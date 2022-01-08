import {
    Service,
    PlatformConfig,
    PlatformAccessory,
    CharacteristicValue,
} from 'homebridge';

import { KodiPlatform, KodiLogger, KodiAccessory } from '../../internal';

import kodi = require('../kodi');

// ========================
// = PowerSwitchAccessory =
// ========================

export class PowerSwitchAccessory extends KodiAccessory {

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
        this.log.info('Adding PowerSwitchAccessory');

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi PowerSwitch')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.switchService =
            this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

        this.switchService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.switchService.getCharacteristic(this.platform.Characteristic.On)
            .onGet(async () => {
                return kodi.getStatus(this.config)
                    .then(status => {
                        this.log.debug('Getting ' + this.name + ': ' + status);
                        return status;
                    })
                    .catch(error => {
                        this.log.error('Getting ' + this.name + ': ' + error.message);
                        return false;
                    });
            })
            .onSet(async (on) => {
                let cmd: string | null = null;
                if (this.config.power.on && on) {
                    cmd = this.config.power.on;
                } else if (this.config.power.off && !on) {
                    cmd = this.config.power.off;
                }
                if (cmd) {
                    this.executeShellCommand(on, cmd);
                    this.platform.closedByPlugin = !on;
                } else {
                    kodi.getStatus(this.config)
                        .then(status => {
                            this.log.debug('Setting ' + this.name + ': ' + status);
                            this.updateValue(status);
                        })
                        .catch(error => {
                            this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error);
                            this.updateValue(false);
                        });
                }
            });
    }

    executeShellCommand(on: CharacteristicValue, cmd: string) {
        kodi.executeShellCommand(cmd)
            .then(output => {
                this.log.debug('Setting ' + this.name + ': ' + on + ' with output: ' + output);
                this.platform.checkKodiStatus();
            })
            .catch(error => {
                this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
            });
    }

    updateValue(on: boolean) {
        setTimeout(() => {
            this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(on);
        }, 100);
    }

}