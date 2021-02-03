import {
    Service,
    PlatformConfig,
    PlatformAccessory,
    CharacteristicValue,
    CharacteristicEventTypes,
    CharacteristicSetCallback,
    CharacteristicGetCallback,
} from 'homebridge';

import { KodiPlatform, KodiLogger, KodiTelevisionAccessory, TelevisionAccessoryType } from '../internal';

import kodi = require('./kodi');

// =======================
// = TelevisionAccessory =
// =======================

export class TelevisionAccessory extends KodiTelevisionAccessory {

    private televisionService: Service;

    constructor(
        private readonly platform: KodiPlatform,
        private readonly accessory: PlatformAccessory,
        public readonly log: KodiLogger,
        public readonly config: PlatformConfig,
        public readonly name: string,
        public readonly version: string,
        public readonly type: TelevisionAccessoryType,
        public readonly inputNames: string[],
        public readonly inputIdentifiers: number[],
    ) {
        super();
        this.log.info('Adding Television' + type + 'Accessory');

        this.accessory.category = this.platform.api.hap.Categories.TELEVISION;

        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Name, name)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'github.com DeutscheMark')
            .setCharacteristic(this.platform.Characteristic.Model, 'Homebridge-Kodi Television' + type)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.api.hap.uuid.generate(name))
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, version);

        this.televisionService = new this.platform.api.hap.Service.Television(name, 'televisionService' + name);

        this.televisionService.setCharacteristic(this.platform.Characteristic.Name, name);

        this.televisionService.setCharacteristic(this.platform.Characteristic.ConfiguredName, name);

        this.televisionService.setCharacteristic(this.platform.Characteristic.SleepDiscoveryMode, this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        this.televisionService.getCharacteristic(this.platform.Characteristic.Active)
            .on(CharacteristicEventTypes.GET, this.getActive.bind(this))
            .on(CharacteristicEventTypes.SET, this.setActive.bind(this));

        this.televisionService.setCharacteristic(this.platform.Characteristic.ActiveIdentifier, 999999);
        this.televisionService.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
            .on(CharacteristicEventTypes.GET, this.getActiveIdentifier.bind(this))
            .on(CharacteristicEventTypes.SET, this.setActiveIdentifier.bind(this));

        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.PictureMode)
            .on(CharacteristicEventTypes.SET, (mode: CharacteristicValue, callback: CharacteristicSetCallback) => {
                this.log.debug('Setting ' + name + ' PictureMode: ' + mode);
                callback();
            });

        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.PowerModeSelection)
            .on(CharacteristicEventTypes.SET, (mode: CharacteristicValue, callback: CharacteristicSetCallback) => {
                kodi.getActionResult(config, this.log, 'Input.Home', {}, (error) => {
                    this.log.debug('Setting ' + name + ' PowerModeSelection: ' + mode);
                    callback(error);
                });
            });

        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.RemoteKey)
            .on(CharacteristicEventTypes.SET, (remoteKey: CharacteristicValue, callback: CharacteristicSetCallback) => {
                switch (remoteKey) {
                    case this.platform.api.hap.Characteristic.RemoteKey.REWIND:
                        kodi.playerGetActivePlayers(config, this.log, (error, playerid) => {
                            if (!error && playerid && playerid !== -1) {
                                kodi.getActionResult(config, this.log, 'Player.Seek', { 'playerid': playerid, 'value': 'smallbackward' }, (error) => {
                                    this.log.debug('Setting RemoteKey: REWIND');
                                    callback(error);
                                });
                            }
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.FAST_FORWARD:
                        kodi.playerGetActivePlayers(config, this.log, (error, playerid) => {
                            if (!error && playerid && playerid !== -1) {
                                kodi.getActionResult(config, this.log, 'Player.Seek', { 'playerid': playerid, 'value': 'smallforward' }, (error) => {
                                    this.log.debug('Setting RemoteKey: FAST_FORWARD');
                                    callback(error);
                                });
                            }
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.NEXT_TRACK:
                        kodi.playerGetActivePlayers(config, this.log, (error, playerid) => {
                            if (!error && playerid && playerid !== -1) {
                                kodi.getActionResult(config, this.log, 'Player.GoTo', { 'playerid': playerid, 'to': 'next' }, (error) => {
                                    this.log.debug('Setting RemoteKey: NEXT_TRACK');
                                    callback(error);
                                });
                            }
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.PREVIOUS_TRACK:
                        kodi.playerGetActivePlayers(config, this.log, (error, playerid) => {
                            if (!error && playerid && playerid !== -1) {
                                kodi.getActionResult(config, this.log, 'Player.GoTo', { 'playerid': playerid, 'to': 'previous' }, (error) => {
                                    this.log.debug('Setting RemoteKey: PREVIOUS_TRACK');
                                    callback(error);
                                });
                            }
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.ARROW_UP:
                        kodi.getActionResult(config, this.log, 'Input.Up', {}, (error) => {
                            this.log.debug('Setting RemoteKey: ARROW_UP');
                            callback(error);
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.ARROW_DOWN:
                        kodi.getActionResult(config, this.log, 'Input.Down', {}, (error) => {
                            this.log.debug('Setting RemoteKey: ARROW_DOWN');
                            callback(error);
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.ARROW_LEFT:
                        kodi.getActionResult(config, this.log, 'Input.Left', {}, (error) => {
                            this.log.debug('Setting RemoteKey: ARROW_LEFT');
                            callback(error);
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.ARROW_RIGHT:
                        kodi.getActionResult(config, this.log, 'Input.Right', {}, (error) => {
                            this.log.debug('Setting RemoteKey: ARROW_RIGHT');
                            callback(error);
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.SELECT:
                        kodi.getActionResult(config, this.log, 'Input.Select', {}, (error) => {
                            this.log.debug('Setting RemoteKey: SELECT');
                            callback(error);
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.BACK:
                        kodi.getActionResult(config, this.log, 'Input.Back', {}, (error) => {
                            this.log.debug('Setting RemoteKey: BACK');
                            callback(error);
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.EXIT:
                        kodi.getActionResult(config, this.log, 'Input.Home', {}, (error) => {
                            this.log.debug('Setting RemoteKey: EXIT');
                            callback(error);
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.PLAY_PAUSE:
                        kodi.playerGetActivePlayers(config, this.log, (error, playerid) => {
                            if (!error && playerid && playerid !== -1) {
                                kodi.getActionResult(config, this.log, 'Player.PlayPause', { 'playerid': playerid }, (error) => {
                                    this.log.debug('Setting RemoteKey: PLAY_PAUSE');
                                    callback(error);
                                });
                            }
                        });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.INFORMATION:
                        kodi.getActionResult(config, this.log, 'Input.ShowOSD', {}, (error) => {
                            this.log.debug('Setting RemoteKey: INFORMATION');
                            callback(error);
                        });
                        break;
                    default:
                        callback(null);
                        break;
                }
            });

        this.log.info('Adding Television' + type + ' - ' + name + ' Speaker');

        const subType = name + ' Speaker';
        let televisionSpeakerService = this.accessory.getServiceById(name, subType);

        if (!televisionSpeakerService) {
            this.log.debug('Adding new accessory: ' + name + ' Speaker');
            televisionSpeakerService = new this.platform.api.hap.Service.TelevisionSpeaker(name, subType);
            televisionSpeakerService.subtype = subType;
            this.accessory.addService(televisionSpeakerService);
        }

        televisionSpeakerService
            .setCharacteristic(this.platform.api.hap.Characteristic.Active, this.platform.api.hap.Characteristic.Active.ACTIVE)
            .setCharacteristic(this.platform.api.hap.Characteristic.VolumeControlType, this.platform.api.hap.Characteristic.VolumeControlType.ABSOLUTE);

        televisionSpeakerService.getCharacteristic(this.platform.api.hap.Characteristic.VolumeSelector)
            .on(CharacteristicEventTypes.SET, (selector: CharacteristicValue, callback: CharacteristicSetCallback) => {
                const volume = selector ? 'decrement' : 'increment';
                kodi.applicationSetVolume(config, this.log, volume, (error, result) => {
                    if (!error && result) {
                        this.log.debug('Setting ' + name + ': ' + volume);
                    }
                    callback();
                });
            });

        televisionSpeakerService.getCharacteristic(this.platform.api.hap.Characteristic.Volume)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                kodi.applicationGetProperties(config, this.log, ['volume'], (error, result) => {
                    if (!error && result) {
                        const volume = result.volume ? result.volume : 0;
                        this.log.debug('Getting ' + name + ': ' + volume + ' %');
                        callback(null, volume);
                    } else {
                        callback(null, 0);
                    }
                });
            });

        this.televisionService.addLinkedService(televisionSpeakerService);

        for (let index = 0; index < inputNames.length; index++) {
            const inputName = inputNames[index];
            const inputIdentifier = inputIdentifiers[index];

            this.log.info('Adding Television' + type + ' - ' + 'Input' + name + inputName);

            const subType = 'Input' + inputName;
            let inputService = this.accessory.getServiceById(name, subType);

            if (!inputService) {
                this.log.debug('Adding new accessory: ' + 'Input' + inputName);
                inputService = new this.platform.api.hap.Service.InputSource(name, subType);
                inputService.subtype = subType;
                this.accessory.addService(inputService);
            }

            inputService
                .setCharacteristic(this.platform.api.hap.Characteristic.ConfiguredName, inputName)
                .setCharacteristic(this.platform.api.hap.Characteristic.Identifier, inputIdentifier)
                .setCharacteristic(this.platform.api.hap.Characteristic.IsConfigured, this.platform.api.hap.Characteristic.IsConfigured.CONFIGURED)
                .setCharacteristic(this.platform.api.hap.Characteristic.InputSourceType, this.platform.api.hap.Characteristic.InputSourceType.APPLICATION)
                .setCharacteristic(this.platform.api.hap.Characteristic.TargetVisibilityState, this.platform.api.hap.Characteristic.TargetVisibilityState.SHOWN)
                .setCharacteristic(this.platform.api.hap.Characteristic.CurrentVisibilityState, this.platform.api.hap.Characteristic.CurrentVisibilityState.SHOWN);

            this.televisionService.addLinkedService(inputService);
        }

        this.accessory.addService(this.televisionService);
    }

    getActive(callback: CharacteristicGetCallback) {
        switch (this.type) {
            case TelevisionAccessoryType.Controls:
                kodi.getStatus(this.config, (error, status) => {
                    if (!error) {
                        this.log.debug('Getting ' + this.name + ': ' + status);
                        callback(null, status);
                    } else {
                        callback(null, false);
                    }
                });
                break;

            case TelevisionAccessoryType.Channels:
                kodi.tvIsPlaying(this.config, this.log, (tvplaying) => {
                    this.log.debug('Getting ' + this.name + ': ' + tvplaying);
                    callback(null, tvplaying);
                });
                break;

            default:
                break;
        }
    }

    setActive(active: CharacteristicValue, callback: CharacteristicSetCallback) {
        switch (this.type) {
            case TelevisionAccessoryType.Controls:
                kodi.getStatus(this.config, (error, status) => {
                    this.log.debug('Setting ' + this.name + ': ' + (!error && status));
                    setTimeout(() => {
                        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active)
                            .updateValue(
                                (!error && status) ?
                                    this.platform.api.hap.Characteristic.Active.ACTIVE :
                                    this.platform.api.hap.Characteristic.Active.INACTIVE,
                            );
                    }, 100);
                });
                callback();
                break;

            case TelevisionAccessoryType.Channels:
                if (active) {
                    kodi.closeFavoritesWindowIfOpened(this.config, this.log, () => {
                        kodi.tvGetChannels(this.config, this.log, (error, result) => {
                            if (!error && result && result.channels) {
                                let channeltostart: any = null;
                                for (let index = 0; index < result.channels.length; index++) {
                                    const channel = result.channels[index];
                                    if (channel.label ===
                                        this.inputNames[(this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.ActiveIdentifier).value as number) - 1]) {
                                        channeltostart = channel;
                                        
                                    }
                                }
                                if (channeltostart) {
                                    kodi.getActionResult(this.config, this.log, 'Player.Open', { 'item': { 'channelid': channeltostart.channelid } }, (error) => {
                                        this.log.debug('Setting ' + this.name + ' Channel: ' + channeltostart.channelid + ' ("' + channeltostart.label + '")');
                                        callback(error);
                                    });
                                } else {
                                    callback(new Error('channel not found'));
                                }
                            } else {
                                callback(error);
                            }
                        });
                    });
                } else {
                    kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                        if (!error && playerid && playerid !== -1) {
                            kodi.playerStop(this.config, this.log, playerid, (error, result) => {
                                if (!error && result) {
                                    setTimeout(() => {
                                        this.log.debug('Setting ' + this.name + ': false - Stopped!');
                                        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                                    }, 100);
                                    this.log.debug('Setting ' + this.name + ': ' + active);
                                    callback();
                                } else {
                                    setTimeout(() => {
                                        this.log.debug('Setting ' + this.name + ': false - Stopped!');
                                        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                                    }, 100);
                                    callback();
                                }
                            });
                        } else {
                            setTimeout(() => {
                                this.log.debug('Setting ' + this.name + ': false - Stopped!');
                                this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                            }, 100);
                            callback();
                        }
                    });
                }
                break;

            default:
                callback();
                break;
        }
    }

    getActiveIdentifier(callback: CharacteristicGetCallback) {
        switch (this.type) {
            case TelevisionAccessoryType.Controls:
                this.log.debug('Getting ' + this.name + ' Active Identifier: 1 (Home)');
                callback(null, 1);
                break;
            case TelevisionAccessoryType.Channels:
                kodi.tvIsPlaying(this.config, this.log, (tvplaying) => {
                    if (tvplaying) {
                        kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                            if (!error && playerid !== -1) {
                                kodi.playerGetItem(this.config, this.log, playerid as number, [], (error, itemresult) => {
                                    if (!error && itemresult && itemresult.item) {
                                        const itemtype = itemresult.item.type !== '' ? itemresult.item.type : '-';
                                        if (itemtype === 'channel') {
                                            let inputName;
                                            let activeIdentifier;
                                            for (let index = 0; index < this.inputNames.length; index++) {
                                                if (itemresult.item.label === this.inputNames[index]) {
                                                    inputName = this.inputNames[index];
                                                    activeIdentifier = this.inputIdentifiers[index];
                                                }
                                            }
                                            this.log.debug('Getting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' ("' + inputName + '")');
                                            if (activeIdentifier) {
                                                callback(null, activeIdentifier);
                                            } else {
                                                callback(null, 1);
                                            }
                                        } else {
                                            this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                            callback(null, 1);
                                        }
                                    } else {
                                        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                        callback(null, 1);
                                    }
                                });
                            } else {
                                this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                callback(null, 1);
                            }
                        });
                    } else {
                        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                        callback(null, 1);
                    }
                });
                break;
            default:
                callback(null, 1);
                break;
        }
    }

    setActiveIdentifier(activeIdentifier: CharacteristicValue, callback: CharacteristicSetCallback) {
        switch (this.type) {
            case TelevisionAccessoryType.Controls:
                kodi.closeFavoritesWindowIfOpened(this.config, this.log, () => {
                    switch (activeIdentifier) {
                        case 1:
                            kodi.getActionResult(this.config, this.log, 'Input.Home', {}, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Home)');
                                callback(error);
                            });
                            break;
                        case 2:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'settings', 'parameters': ['Root'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Settings)');
                                callback(error);
                            });
                            break;
                        case 3:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['MovieTitles'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Movies)');
                                callback(error);
                            });
                            break;
                        case 4:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['TVShowTitles'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (TV shows)');
                                callback(error);
                            });
                            break;
                        case 5:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'tvchannels', 'parameters': ['Root'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (TV)');
                                callback(error);
                            });
                            break;
                        case 6:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'music', 'parameters': ['Root'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Music)');
                                callback(error);
                            });
                            break;
                        case 7:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['MusicVideoTitles'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Music videos)');
                                callback(error);
                            });
                            break;
                        case 8:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'radiochannels', 'parameters': ['Root'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Radio)');
                                callback(error);
                            });
                            break;
                        case 9:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'games', 'parameters': ['Root'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Games)');
                                callback(error);
                            });
                            break;
                        case 10:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['Video Add-ons'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Add-ons)');
                                callback(error);
                            });
                            break;
                        case 11:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'pictures', 'parameters': ['Root'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Pictures)');
                                callback(error);
                            });
                            break;
                        case 12:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['Root'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Videos)');
                                callback(error);
                            });
                            break;
                        case 13:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'favourites', 'parameters': ['Root'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Favorites)');
                                callback(error);
                            });
                            break;
                        case 14:
                            kodi.getActionResult(this.config, this.log, 'GUI.ActivateWindow', { 'window': 'weather', 'parameters': ['Root'] }, (error) => {
                                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' (Weather)');
                                callback(error);
                            });
                            break;
                        default:
                            callback(null);
                            break;
                    }
                });
                break;
            case TelevisionAccessoryType.Channels:
                this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier);
                kodi.closeFavoritesWindowIfOpened(this.config, this.log, () => {
                    kodi.tvGetChannels(this.config, this.log, (error, result) => {
                        if (!error && result.channels) {
                            let channeltostart: any = null;
                            for (let index = 0; index < result.channels.length; index++) {
                                const channel = result.channels[index];
                                if (channel.label === this.inputNames[activeIdentifier as number - 1]) {
                                    channeltostart = channel;
                                }
                            }
                            if (channeltostart) {
                                kodi.getActionResult(this.config, this.log, 'Player.Open', { 'item': { 'channelid': channeltostart.channelid } }, (error) => {
                                    this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' ("' + channeltostart.label + '")');
                                    callback(error);
                                    return;
                                });
                            } else {
                                callback(new Error('channel not found'));
                            }
                        } else {
                            callback(error);
                        }
                    });
                });
                break;
            default:
                callback(null);
                break;
        }
    }

}