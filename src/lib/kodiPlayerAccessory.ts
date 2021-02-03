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
            .on(CharacteristicEventTypes.GET, this.getOn.bind(this))
            .on(CharacteristicEventTypes.SET, this.setOn.bind(this));

        this.lightbulbService.getCharacteristic(this.platform.Characteristic.Brightness)
            .on(CharacteristicEventTypes.GET, this.getBrightness.bind(this))
            .on(CharacteristicEventTypes.SET, this.setBrightness.bind(this));

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

    getOn(callback: CharacteristicGetCallback) {
        kodi.isPlaying(this.config, this.log, (playing) => {
            callback(null, playing);
        });
    }

    setOn(on: CharacteristicValue, callback: CharacteristicSetCallback) {
        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
            if (!error && playerid && playerid !== -1) {
                kodi.playerSetPlay(this.config, this.log, playerid, on as boolean, (error, result) => {
                    if (!error && result) {
                        const speed = result.speed ? result.speed : 0;
                        if (speed !== 0) {
                            this.log.debug('Setting ' + this.name + ': ' + on);
                            callback();
                        } else {
                            setTimeout(() => {
                                this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                                kodi.isPlaying(this.config, this.log, (playing) => {
                                    this.lightbulbService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(playing);
                                });
                            }, 100);
                            callback();
                        }
                    } else {
                        setTimeout(() => {
                            this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                            kodi.isPlaying(this.config, this.log, (playing) => {
                                this.lightbulbService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(playing);
                            });
                        }, 100);
                        callback();
                    }
                });
            } else {
                setTimeout(() => {
                    this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                    kodi.isPlaying(this.config, this.log, (playing) => {
                        this.lightbulbService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(playing);
                    });
                }, 100);
                callback();
            }
        });
    }

    getBrightness(callback: CharacteristicGetCallback) {
        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
            if (!error && playerid && playerid !== -1) {
                kodi.playerGetProperties(this.config, this.log, playerid, ['percentage', 'totaltime'], (error, result) => {
                    if (!error && result) {
                        const percentage = Math.round(result.percentage ? result.percentage : 0);
                        const timeAndTotaltime =
                            result.totaltime.hours +
                            ':' +
                            result.totaltime.minutes.toString().padStart(2, '0') +
                            ':' +
                            result.totaltime.seconds.toString().padStart(2, '0');
                        if (percentage === 0 && timeAndTotaltime === '0:00:00') {
                            this.log.debug('Getting ' + this.name + ': 100 %');
                            callback(null, 100);
                        } else {
                            this.log.debug('Getting ' + this.name + ': ' + percentage + ' %');
                            callback(null, percentage);
                        }
                    } else {
                        callback(null, 0);
                    }
                });
            } else {
                callback(null, 0);
            }
        });
    }

    setBrightness(brightness: CharacteristicValue, callback: CharacteristicSetCallback) {
        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
            if (!error && playerid && playerid !== -1) {
                const percentage = Math.round(brightness as number);
                kodi.playerSeek(this.config, this.log, playerid, percentage, (error, result) => {
                    if (!error && result) {
                        const percentage = Math.round(result.percentage ? result.percentage : 0);
                        this.log.debug('Setting ' + this.name + ': ' + percentage + ' %');
                        callback();
                    } else {
                        callback();
                    }
                });
            } else {
                callback();
            }
        });
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
            .on(CharacteristicEventTypes.GET, this.getOn.bind(this))
            .on(CharacteristicEventTypes.SET, this.setOn.bind(this));
    }

    getOn(callback: CharacteristicGetCallback) {
        kodi.isPlaying(this.config, this.log, (playing) => {
            callback(null, playing);
        });
    }

    setOn(on: CharacteristicValue, callback: CharacteristicSetCallback) {
        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
            if (!error && playerid && playerid !== -1) {
                kodi.playerSetPlay(this.config, this.log, playerid, on as boolean, (error, result) => {
                    if (!error && result) {
                        const speed = result.speed ? result.speed : 0;
                        if (speed !== 0) {
                            this.log.debug('Setting ' + this.name + ': ' + on);
                            callback();
                        } else {
                            setTimeout(() => {
                                this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                                kodi.isPlaying(this.config, this.log, (playing) => {
                                    this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(playing);
                                });
                            }, 100);
                            callback();
                        }
                    } else {
                        setTimeout(() => {
                            this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                            kodi.isPlaying(this.config, this.log, (playing) => {
                                this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(playing);
                            });
                        }, 100);
                        callback();
                    }
                });
            } else {
                setTimeout(() => {
                    this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                    kodi.isPlaying(this.config, this.log, (playing) => {
                        this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(playing);
                    });
                }, 100);
                callback();
            }
        });
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
            .on(CharacteristicEventTypes.GET, this.getOn.bind(this))
            .on(CharacteristicEventTypes.SET, this.setOn.bind(this));
    }

    getOn(callback: CharacteristicGetCallback) {
        kodi.isPlaying(this.config, this.log, (_, paused) => {
            callback(null, paused);
        });
    }

    setOn(on: CharacteristicValue, callback: CharacteristicSetCallback) {
        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
            if (!error && playerid && playerid !== -1) {
                kodi.playerGetItem(this.config, this.log, playerid, [], (error, itemresult) => {
                    if (!error && itemresult && itemresult.item) {
                        kodi.playerSetPlay(this.config, this.log, playerid, !on, (error, result) => {
                            if (!error && result) {
                                const on = result.speed === 0 ? result.speed === 0 : false;
                                this.log.debug('Setting ' + this.name + ': ' + on);
                                callback();
                            } else {
                                setTimeout(() => {
                                    this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                                    kodi.isPlaying(this.config, this.log, (_, paused) => {
                                        this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(paused);
                                    });
                                }, 100);
                                callback();
                            }
                        });
                    } else {
                        setTimeout(() => {
                            this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                            kodi.isPlaying(this.config, this.log, (_, paused) => {
                                this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(paused);
                            });
                        }, 100);
                        callback();
                    }
                });
            } else {
                setTimeout(() => {
                    this.log.debug('Setting ' + this.name + ': false - Nothing pausable seems to be playing!');
                    kodi.isPlaying(this.config, this.log, (_, paused) => {
                        this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(paused);
                    });
                }, 100);
                callback();
            }
        });
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
            .on(CharacteristicEventTypes.GET, this.getOn.bind(this))
            .on(CharacteristicEventTypes.SET, this.setOn.bind(this));
    }

    getOn(callback: CharacteristicGetCallback) {
        callback(null, false);
    }

    setOn(on: CharacteristicValue, callback: CharacteristicSetCallback) {
        if (on) {
            kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                if (!error && playerid && playerid !== -1) {
                    kodi.playerStop(this.config, this.log, playerid, (error, result) => {
                        if (!error && result) {
                            setTimeout(() => {
                                this.log.debug('Setting ' + this.name + ': false - Stopped!');
                                this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(false);
                            }, 100);
                            this.log.debug('Setting ' + this.name + ': ' + on);
                            callback();
                        } else {
                            setTimeout(() => {
                                this.log.debug('Setting ' + this.name + ': false - Stopped!');
                                this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(false);
                            }, 100);
                            callback();
                        }
                    });
                } else {
                    setTimeout(() => {
                        this.log.debug('Setting ' + this.name + ': false - Stopped!');
                        this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(false);
                    }, 100);
                    callback();
                }
            });
        } else {
            setTimeout(() => {
                this.log.debug('Setting ' + this.name + ': false - Stopped!');
                this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(false);
            }, 100);
            callback();
        }
    }

}