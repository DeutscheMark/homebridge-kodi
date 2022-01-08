import {
    Service,
    PlatformConfig,
    PlatformAccessory,
} from 'homebridge';

import { KodiPlatform, KodiLogger, KodiAccessory } from '../../internal';

import kodi = require('../kodi');

// ============================
// = PlayerLightbulbAccessory =
// ============================

export class PlayerLightbulbAccessory extends KodiAccessory {

    private lightbulbService: Service;

    constructor(
        private readonly platform: KodiPlatform,
        private readonly accessory: PlatformAccessory,
        public readonly log: KodiLogger,
        public readonly config: PlatformConfig,
        public readonly name: string,
        public readonly version: string,
    ) {
        super();
        this.log.info('Adding PlayerLightbulbAccessory');

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi PlayerLightbulb')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.lightbulbService =
            this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

        this.lightbulbService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.lightbulbService.getCharacteristic(this.platform.Characteristic.On)
            .onGet(async () => {
                return kodi.isPlaying(this.config)
                    .then(([playing]) => {
                        this.log.debug('Getting ' + this.name + ': ' + playing);
                        return playing;
                    })
                    .catch(error => {
                        this.log.error('Getting ' + this.name + ': - Error: ' + error);
                        return false;
                    });
            })
            .onSet(async (on) => {
                kodi.playerGetActivePlayers(this.config)
                    .then(playerid => {
                        if (playerid !== null && playerid !== -1) {
                            kodi.playerSetPlay(this.config, playerid, on as boolean)
                                .then(result => {
                                    if (result) {
                                        const speed = result.speed ? result.speed : 0;
                                        if (speed !== 0) {
                                            this.log.debug('Setting ' + this.name + ': ' + on);
                                        } else {
                                            this.updateValueToFalse();
                                        }
                                    } else {
                                        this.updateValueToFalse();
                                    }
                                })
                                .catch(error => {
                                    this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                                    this.updateValueToFalse();
                                });
                        } else {
                            this.updateValueToFalse();
                        }
                    })
                    .catch(error => {
                        this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                        this.updateValueToFalse();
                    });
            });

        this.lightbulbService.getCharacteristic(this.platform.Characteristic.Brightness)
            .onGet(async () => {
                return kodi.playerGetActivePlayers(this.config)
                    .then(playerid => {
                        if (playerid !== null && playerid !== -1) {
                            return kodi.playerGetProperties(this.config, playerid, ['percentage', 'totaltime'])
                                .then(result => {
                                    if (result && result.percentage) {
                                        const percentage = Math.round(result.percentage ? result.percentage : 0);
                                        const timeAndTotaltime =
                                            result.totaltime.hours +
                                            ':' +
                                            result.totaltime.minutes.toString().padStart(2, '0') +
                                            ':' +
                                            result.totaltime.seconds.toString().padStart(2, '0');
                                        if (percentage === 0 && timeAndTotaltime === '0:00:00') {
                                            this.log.debug('Getting ' + this.name + ': 100 %');
                                            return 100;
                                        } else {
                                            this.log.debug('Getting ' + this.name + ': ' + percentage + ' %');
                                            return percentage;
                                        }
                                    } else {
                                        this.log.debug('Getting ' + this.name + ': 0 % (no result)');
                                        return 0;
                                    }
                                })
                                .catch(error => {
                                    this.log.error('Getting ' + this.name + ': - Error: ' + error.message);
                                    return 0;
                                });
                        } else {
                            this.log.debug('Getting ' + this.name + ': Nothing seems to be playing!');
                            return 0;
                        }
                    })
                    .catch(error => {
                        this.log.error('Getting ' + this.name + ': - Error: ' + error.message);
                        return 0;
                    });
            })
            .onSet(async (brightness) => {
                const percentage = Math.round(brightness as number);
                kodi.playerGetActivePlayers(this.config)
                    .then(playerid => {
                        if (playerid !== null && playerid !== -1) {
                            kodi.playerSeek(this.config, playerid, percentage)
                                .then(result => {
                                    if (result && result.percentage) {
                                        const percentage = Math.round(result.percentage ? result.percentage : 0);
                                        this.log.debug('Setting ' + this.name + ': ' + percentage + ' %');
                                    } else {
                                        this.log.debug('Setting ' + this.name + ': ' + percentage + ' % (no result)');
                                    }
                                })
                                .catch(error => {
                                    this.log.error('Sertting ' + this.name + ': ' + percentage + ' % - Error: ' + error.message);
                                });
                        } else {
                            this.log.debug('Setting ' + this.name + ': ' + percentage + ' % - Nothing seems to be playing!');
                        }
                    })
                    .catch(error => {
                        this.log.error('Setting ' + this.name + ': ' + percentage + ' % - Error: ' + error.message);
                    });
            });

        this.lightbulbService.getCharacteristic(platform.customCharacteristics.Type) ||
            this.lightbulbService.addCharacteristic(platform.customCharacteristics.Type);
        this.lightbulbService.getCharacteristic(platform.customCharacteristics.ShowTitle) ||
            this.lightbulbService.addCharacteristic(platform.customCharacteristics.ShowTitle);
        this.lightbulbService.getCharacteristic(platform.customCharacteristics.Title) ||
            this.lightbulbService.addCharacteristic(platform.customCharacteristics.Title);
        this.lightbulbService.getCharacteristic(platform.customCharacteristics.Position) ||
            this.lightbulbService.addCharacteristic(platform.customCharacteristics.Position);
        this.lightbulbService.getCharacteristic(platform.customCharacteristics.Artist) ||
            this.lightbulbService.addCharacteristic(platform.customCharacteristics.Artist);
        this.lightbulbService.getCharacteristic(platform.customCharacteristics.Album) ||
            this.lightbulbService.addCharacteristic(platform.customCharacteristics.Album);
    }

    updateValueToFalse() {
        setTimeout(() => {
            kodi.isPlaying(this.config)
                .then(([, playing]) => {
                    this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                    this.lightbulbService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(playing);
                })
                .catch(error => {
                    this.log.error('Setting ' + this.name + ': false - Nothing pausable seems to be playing! - Error: ' + error.message);
                });
        }, 100);
    }

}

// =============================
// = PlayerPlaySwitchAccessory =
// =============================

export class PlayerPlaySwitchAccessory extends KodiAccessory {

    public switchService: Service;

    constructor(
        private readonly platform: KodiPlatform,
        private readonly accessory: PlatformAccessory,
        public readonly log: KodiLogger,
        public readonly config: PlatformConfig,
        public readonly name: string,
        public readonly version: string,
    ) {
        super();
        this.log.info('Adding PlayerPlaySwitchAccessory');

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi PlayerPlaySwitch')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.switchService =
            this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

        this.switchService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.switchService.getCharacteristic(this.platform.Characteristic.On)
            .onGet(async () => {
                return kodi.isPlaying(this.config)
                    .then(([playing]) => {
                        this.log.debug('Getting ' + this.name + ': ' + playing);
                        return playing;
                    })
                    .catch(error => {
                        this.log.error('Getting ' + this.name + ': - Error: ' + error);
                        return false;
                    });
            })
            .onSet(async (on) => {
                kodi.playerGetActivePlayers(this.config)
                    .then(playerid => {
                        if (playerid !== null && playerid !== -1) {
                            kodi.playerSetPlay(this.config, playerid, on as boolean)
                                .then(result => {
                                    if (result) {
                                        const speed = result.speed ? result.speed : 0;
                                        if (speed !== 0) {
                                            this.log.debug('Setting ' + this.name + ': ' + on);
                                        } else {
                                            this.updateValueToFalse();
                                        }
                                    } else {
                                        this.updateValueToFalse();
                                    }
                                })
                                .catch(error => {
                                    this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                                    this.updateValueToFalse();
                                });
                        } else {
                            this.updateValueToFalse();
                        }
                    })
                    .catch(error => {
                        this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                        this.updateValueToFalse();
                    });
            });
    }

    updateValueToFalse() {
        setTimeout(() => {
            kodi.isPlaying(this.config)
                .then(([, playing]) => {
                    this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                    this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(playing);
                })
                .catch(error => {
                    this.log.error('Setting ' + this.name + ': false - Nothing pausable seems to be playing! - Error: ' + error.message);
                });
        }, 100);
    }

}

// ==============================
// = PlayerPauseSwitchAccessory =
// ==============================

export class PlayerPauseSwitchAccessory extends KodiAccessory {

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
        this.log.info('Adding PlayerPauseSwitchAccessory');

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi PlayerPauseSwitch')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.switchService =
            this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

        this.switchService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.switchService.getCharacteristic(this.platform.Characteristic.On)
            .onGet(async () => {
                return kodi.isPlaying(this.config)
                    .then(([paused]) => {
                        this.log.debug('Getting ' + this.name + ': ' + paused);
                        return paused;
                    })
                    .catch(error => {
                        this.log.error('Getting ' + this.name + ': - Error: ' + error);
                        return false;
                    });
            })
            .onSet(async (on) => {
                kodi.playerGetActivePlayers(this.config)
                    .then(playerid => {
                        if (playerid !== null && playerid !== -1) {
                            kodi.playerSetPlay(this.config, playerid, !on)
                                .then(result => {
                                    if (result) {
                                        const on = result.speed === 0 ? result.speed === 0 : false;
                                        this.log.debug('Setting ' + this.name + ': ' + on);
                                    } else {
                                        this.updateValueToFalse();
                                    }
                                })
                                .catch(error => {
                                    this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                                    this.updateValueToFalse();
                                });
                        } else {
                            this.updateValueToFalse();
                        }
                    })
                    .catch(error => {
                        this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                        this.updateValueToFalse();
                    });
            });
    }

    updateValueToFalse() {
        setTimeout(() => {
            kodi.isPlaying(this.config)
                .then(([, playing]) => {
                    this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                    this.switchService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(playing);
                })
                .catch(error => {
                    this.log.error('Setting ' + this.name + ': false - Nothing pausable seems to be playing! - Error: ' + error.message);
                });
        }, 100);
    }

}

// =============================
// = PlayerStopSwitchAccessory =
// =============================

export class PlayerStopSwitchAccessory extends KodiAccessory {

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
        this.log.info('Adding PlayerStopSwitchAccessory');

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi PlayerStopSwitch')
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
                if (on) {
                    kodi.playerGetActivePlayers(this.config)
                        .then(playerid => {
                            if (playerid !== null && playerid !== -1) {
                                kodi.playerStop(this.config, playerid)
                                    .then(result => {
                                        if (result) {
                                            this.log.debug('Setting ' + this.name + ': ' + on);
                                        } else {
                                            this.log.debug('Setting ' + this.name + ': ' + on + ' (no result)');
                                        }
                                    })
                                    .catch(error => {
                                        this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                                    });
                            }
                        })
                        .catch(error => {
                            this.log.error('Setting ' + this.name + ': ' + on + ' - Error: ' + error.message);
                        });
                }
                this.updateValueToFalse();
            });
    }

    updateValueToFalse() {
        setTimeout(() => {
            this.log.debug('Setting ' + this.name + ': false - Stopped!');
            this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(false);
        }, 100);
    }

}