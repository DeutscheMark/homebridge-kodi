import {
    Service,
    PlatformConfig,
    PlatformAccessory,
} from 'homebridge';

import { KodiPlatform, KodiLogger, KodiAccessory } from '../../internal';

import kodi = require('../kodi');

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
            .onGet(async () => {
                return kodi.applicationGetProperties(this.config, ['muted'])
                    .then(result => {
                        if (result) {
                            const muted = result.muted ? result.muted : false;
                            this.log.debug('Getting ' + this.name + ': ' + !muted);
                            return !muted;
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
                kodi.applicationSetMute(this.config, !on)
                    .then(result => {
                        this.log.debug('Setting ' + this.name + ': ' + result);
                    })
                    .catch(error => {
                        this.log.debug('Setting ' + this.name + ' - Error: ' + error.message);
                    });
            });

        this.lightbulbService.getCharacteristic(this.platform.Characteristic.Brightness)
            .onGet(async () => {
                return kodi.applicationGetProperties(this.config, ['volume'])
                    .then(result => {
                        if (result) {
                            const volume = result.volume ? result.volume : 0;
                            this.log.debug('Getting ' + this.name + ': ' + volume + ' %');
                            return volume;
                        } else {
                            return 0;
                        }
                    })
                    .catch(error => {
                        this.log.debug('Getting ' + this.name + ' - Error: ' + error.message);
                        return 0;
                    });
            })
            .onSet(async (brightness) => {
                const volume = Math.round(brightness as number);
                kodi.applicationSetMute(this.config, volume === 0)
                    .then(muteresult => {
                        if (muteresult !== null) {
                            this.log.debug('Setting ' + this.name + ' Mute: ' + muteresult);
                            kodi.applicationSetVolume(this.config, volume)
                                .then(volumeresult => {
                                    if (volumeresult) {
                                        this.log.debug('Setting ' + this.name + ': ' + volumeresult + ' %');
                                    } else {
                                        this.log.debug('Setting ' + this.name + ': (no result)');
                                    }
                                })
                                .catch(error => {
                                    this.log.error('Setting ' + this.name + ': ' + muteresult + ' % - Error: ' + error.message);
                                });
                        } else {
                            this.log.debug('Setting ' + this.name + ': ' + muteresult + ' % (no result)');
                        }
                    })
                    .catch(error => {
                        this.log.error('Setting ' + this.name + ' - Error: ' + error.message);
                    });
            });
    }

}