import {
    Service,
    PlatformConfig,
    PlatformAccessory,
} from 'homebridge';

import { KodiPlatform, KodiLogger, KodiCommandAccessory } from '../../internal';

import kodi = require('../kodi');

// ==========================
// = CommandSwitchAccessory =
// ==========================

export class CommandSwitchAccessory extends KodiCommandAccessory {

    private switchService: Service;

    constructor(
        private readonly platform: KodiPlatform,
        private readonly accessory: PlatformAccessory,
        public readonly log: KodiLogger,
        public readonly config: PlatformConfig,
        public readonly name: string,
        public readonly version: string,
        public readonly interval: number,
        public readonly sequence: string,
    ) {
        super();
        this.log.info('Adding CommandSwitchAccessory');

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi CommandSwitch')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.switchService =
            this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

        this.switchService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.switchService.getCharacteristic(this.platform.Characteristic.On)
            .onGet(async () => {
                return false;
            })
            .onSet(async (on) => {
                this.log.debug('Setting ' + this.name + ': ' + on);
                if (on) {
                    for (let index = 0; index < this.sequence.length; index++) {
                        const commandarr = this.sequence[index].split(':');
                        const command = commandarr[0];
                        const params = commandarr[1];
                        const intervalValue = this.interval || 500;
                        setTimeout(() => {
                            kodi.input(this.config, command, params)
                                .then(result => {
                                    if (result) {
                                        this.log.info(this.name + ': "' + this.sequence[index] + '" command sent.');
                                        if (index === this.sequence.length - 1) {
                                            setTimeout(() => {
                                                this.log.info(this.name + ': Command sequence successfully sent.');
                                                this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                                            }, 100);
                                        }
                                    } else if (index === this.sequence.length - 1) {
                                        setTimeout(() => {
                                            this.log.info(this.name + ': Command sequence successfully sent.');
                                            this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                                        }, 100);
                                    }
                                })
                                .catch(error => {
                                    this.log.error(this.name + ' - Error: ' + error.message);
                                });
                        }, intervalValue * index);
                    }
                }
            });
    }

}