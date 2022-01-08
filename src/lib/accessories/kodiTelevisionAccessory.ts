import {
    Service,
    PlatformConfig,
    PlatformAccessory,
    CharacteristicValue,
} from 'homebridge';

import { KodiPlatform, KodiLogger, KodiTelevisionAccessory, TelevisionAccessoryType } from '../../internal';

import kodi = require('../kodi');

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
            .onGet(async () => {
                switch (this.type) {
                    case TelevisionAccessoryType.Controls:
                        return kodi.getStatus(this.config)
                            .then(status => {
                                this.log.debug('Getting ' + this.name + ': ' + status);
                                return status;
                            })
                            .catch(error => {
                                this.log.error('Getting ' + this.name + ' - Error: ' + error.message);
                                return false;
                            });

                    case TelevisionAccessoryType.Channels:
                        return kodi.tvIsPlaying(this.config)
                            .then(tvisplaying => {
                                this.log.debug('Getting ' + this.name + ': ' + tvisplaying);
                                return tvisplaying;
                            })
                            .catch(error => {
                                this.log.error('Getting ' + this.name + ' - Error: ' + error.message);
                                return false;
                            });
                }
            })
            .onSet(async (active) => {
                let cmd: string | null = null;
                if (this.config.power.on && active) {
                    cmd = this.config.power.on;
                } else if (this.config.power.off && !active) {
                    cmd = this.config.power.off;
                }
                switch (this.type) {
                    case TelevisionAccessoryType.Controls:
                        if (cmd) {
                            this.executeShellCommand(active, cmd);
                            this.platform.closedByPlugin = !active;
                        } else {
                            kodi.getStatus(this.config)
                                .then(status => {
                                    this.log.debug('Setting ' + this.name + ': ' + status);
                                    this.updateValue(status);
                                })
                                .catch(error => {
                                    this.log.error('Setting ' + this.name + ': ' + active + ' - Error: ' + error);
                                    this.updateValue(false);
                                });
                        }
                        break;

                    case TelevisionAccessoryType.Channels:
                        if (active) {
                            kodi.closeFavoritesWindowIfOpened(this.config, this.log)
                                .then(() => {
                                    kodi.tvGetChannels(this.config)
                                        .then(result => {
                                            if (result && result.channels) {
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                let channeltostart: any = null;
                                                for (let index = 0; index < result.channels.length; index++) {
                                                    const channel = result.channels[index];
                                                    if (channel.label ===
                                                        this.inputNames[(this.televisionService
                                                            .getCharacteristic(this.platform.api.hap.Characteristic.ActiveIdentifier).value as number) - 1]) {
                                                        channeltostart = channel;
                                                    }
                                                }
                                                if (channeltostart) {
                                                    kodi.getActionResult(this.config, 'Player.Open', { 'item': { 'channelid': channeltostart.channelid } })
                                                        .then(() => {
                                                            this.log
                                                                .debug('Setting ' + this.name + ' Channel: ' + channeltostart.channelid + ' ("' + channeltostart.label + '")');
                                                        })
                                                        .catch(error => {
                                                            this.log
                                                                .error('Setting ' + this.name + ' Channel: ' + channeltostart.channelid +
                                                                    ' ("' + channeltostart.label + '") - Error: ' + error.message);
                                                        });
                                                } else {
                                                    this.log.error('Setting ' + this.name + ' Channel - Error: channel not found');
                                                }
                                            } else {
                                                this.log.error('Setting ' + this.name + ' Channel - Error: no channels found');
                                            }
                                        })
                                        .catch(error => {
                                            this.log.error('Setting ' + this.name + ': false - Error: ' + error.message);
                                        });
                                })
                                .catch(error => {
                                    this.log.error('Setting ' + this.name + ': false - Error: ' + error.message);
                                });
                        } else {
                            kodi.playerGetActivePlayers(this.config)
                                .then(playerid => {
                                    if (playerid !== null && playerid !== -1) {
                                        kodi.playerStop(this.config, playerid)
                                            .then(result => {
                                                if (result) {
                                                    setTimeout(() => {
                                                        this.log.debug('Setting ' + this.name + ': false - Stopped!');
                                                        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                                                    }, 100);
                                                    this.log.debug('Setting ' + this.name + ': ' + active);
                                                } else {
                                                    setTimeout(() => {
                                                        this.log.debug('Setting ' + this.name + ': false - Stopped!');
                                                        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                                                    }, 100);
                                                }
                                            })
                                            .catch(error => {
                                                this.log.error('Setting ' + this.name + ': false - Error: ' + error.message);
                                            });
                                    } else {
                                        setTimeout(() => {
                                            this.log.debug('Setting ' + this.name + ': false - Stopped!');
                                            this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.On).updateValue(false);
                                        }, 100);
                                    }
                                })
                                .catch(error => {
                                    this.log.error('Setting ' + this.name + ': false - Error: ' + error.message);
                                });
                        }
                        break;
                }
            });

        this.televisionService.setCharacteristic(this.platform.Characteristic.ActiveIdentifier, 999999);
        this.televisionService.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
            .onGet(async () => {
                switch (this.type) {
                    case TelevisionAccessoryType.Controls:
                        this.log.debug('Getting ' + this.name + ' Active Identifier: 1 (Home)');
                        return 1;
                    case TelevisionAccessoryType.Channels:
                        return kodi.tvIsPlaying(this.config)
                            .then(tvisplaying => {
                                if (tvisplaying) {
                                    return kodi.playerGetActivePlayers(this.config)
                                        .then(playerid => {
                                            if (playerid !== null && playerid !== -1) {
                                                return kodi.playerGetItem(this.config, playerid as number, [])
                                                    .then(itemresult => {
                                                        if (itemresult && itemresult.item) {
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
                                                                    return activeIdentifier;
                                                                } else {
                                                                    return 1;
                                                                }
                                                            } else {
                                                                this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                                                return 1;
                                                            }
                                                        } else {
                                                            this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                                            return 1;
                                                        }
                                                    })
                                                    .catch(error => {
                                                        this.log.error('Getting ' + this.name + ' Active Identifier - Error: ' + error.message);
                                                        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                                        return 1;
                                                    });
                                            } else {
                                                this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                                return 1;
                                            }
                                        })
                                        .catch(error => {
                                            this.log.error('Getting ' + this.name + ' Active Identifier - Error: ' + error.message);
                                            this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                            return 1;
                                        });
                                } else {
                                    this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                    return 1;
                                }
                            })
                            .catch(error => {
                                this.log.error('Getting ' + this.name + ' Active Identifier - Error: ' + error.message);
                                this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(false);
                                return 1;
                            });
                    default:
                        return 1;
                }
            })
            .onSet(async (activeIdentifier) => {
                switch (this.type) {
                    case TelevisionAccessoryType.Controls:
                        kodi.closeFavoritesWindowIfOpened(this.config, this.log)
                            .then(() => {
                                switch (activeIdentifier) {
                                    case 1:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Home', 'Input.Home', {});
                                        break;
                                    case 2:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Settings', 'GUI.ActivateWindow', { 'window': 'settings', 'parameters': ['Root'] });
                                        break;
                                    case 3:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Movies', 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['MovieTitles'] });
                                        break;
                                    case 4:
                                        this.activeIdentiferSet(
                                            this.name, activeIdentifier, 'TV shows', 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['TVShowTitles'] });
                                        break;
                                    case 5:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'TV', 'GUI.ActivateWindow', { 'window': 'tvchannels', 'parameters': ['Root'] });
                                        break;
                                    case 6:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Music', 'GUI.ActivateWindow', { 'window': 'music', 'parameters': ['Root'] });
                                        break;
                                    case 7:
                                        this.activeIdentiferSet(
                                            this.name, activeIdentifier, 'Music videos', 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['MusicVideoTitles'] });
                                        break;
                                    case 8:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Radio', 'GUI.ActivateWindow', { 'window': 'radiochannels', 'parameters': ['Root'] });
                                        break;
                                    case 9:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Games', 'GUI.ActivateWindow', { 'window': 'games', 'parameters': ['Root'] });
                                        break;
                                    case 10:
                                        this.activeIdentiferSet(
                                            this.name, activeIdentifier, 'Add-ons', 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['Video Add-ons'] });
                                        break;
                                    case 11:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Pictures', 'GUI.ActivateWindow', { 'window': 'pictures', 'parameters': ['Root'] });
                                        break;
                                    case 12:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Videos', 'GUI.ActivateWindow', { 'window': 'videos', 'parameters': ['Root'] });
                                        break;
                                    case 13:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Favorites', 'GUI.ActivateWindow', { 'window': 'favourites', 'parameters': ['Root'] });
                                        break;
                                    case 14:
                                        this.activeIdentiferSet(this.name, activeIdentifier, 'Weather', 'GUI.ActivateWindow', { 'window': 'weather', 'parameters': ['Root'] });
                                        break;
                                    default:
                                        break;
                                }
                            })
                            .catch(error => {
                                this.log.error('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' - Error: ' + error.message);
                            });
                        break;
                    case TelevisionAccessoryType.Channels:
                        this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier);
                        kodi.closeFavoritesWindowIfOpened(this.config, this.log)
                            .then(() => {
                                kodi.tvGetChannels(this.config)
                                    .then(result => {
                                        if (result.channels) {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            let channeltostart: any = null;
                                            for (let index = 0; index < result.channels.length; index++) {
                                                const channel = result.channels[index];
                                                if (channel.label === this.inputNames[activeIdentifier as number - 1]) {
                                                    channeltostart = channel;
                                                }
                                            }
                                            if (channeltostart) {
                                                kodi.getActionResult(this.config, 'Player.Open', { 'item': { 'channelid': channeltostart.channelid } })
                                                    .then(([ok]) => {
                                                        if (ok) {
                                                            this.log
                                                                .debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' ("' + channeltostart.label + '")');
                                                        } else {
                                                            this.log.debug('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier +
                                                                ' ("' + channeltostart.label + '") (not ok)');
                                                        }
                                                    })
                                                    .catch(error => {
                                                        this.log.error('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' - Error: ' + error.message);
                                                    });
                                            } else {
                                                this.log.error('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' - Error: channel not found');
                                            }
                                        } else {
                                            this.log.error('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' - Error: no channels found');
                                        }
                                    })
                                    .catch(error => {
                                        this.log.error('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' - Error: ' + error.message);
                                    });
                            })
                            .catch(error => {
                                this.log.error('Setting ' + this.name + ' Active Identifier: ' + activeIdentifier + ' - Error: ' + error.message);
                            });
                        break;
                    default:
                        break;
                }
            });

        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.PictureMode)
            .onSet(async (picturemode) => {
                this.log.debug('Setting ' + name + ' PictureMode: ' + picturemode);
            });

        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.PowerModeSelection)
            .onSet(async (picturemode) => {
                kodi.getActionResult(config, 'Input.Home', {})
                    .then(() => {
                        this.log.debug('Setting ' + name + ' PowerModeSelection: ' + picturemode);
                    })
                    .catch(error => {
                        this.log.debug('Setting ' + name + ' PowerModeSelection: ' + picturemode + ' - Error: ' + error.message);
                    });
            });

        this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.RemoteKey)
            .onSet(async (remoteKey) => {
                switch (remoteKey) {
                    case this.platform.api.hap.Characteristic.RemoteKey.REWIND:
                        kodi.playerGetActivePlayers(config)
                            .then(playerid => {
                                this.remoteKeyPressed('REWIND', 'Player.Seek', { 'playerid': playerid, 'value': 'smallbackward' });
                            })
                            .catch(error => {
                                this.log.error('Setting RemoteKey: REWIND - Error: ' + error.message);
                            });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.FAST_FORWARD:
                        kodi.playerGetActivePlayers(config)
                            .then(playerid => {
                                this.remoteKeyPressed('FAST_FORWARD', 'Player.Seek', { 'playerid': playerid, 'value': 'smallforward' });
                            })
                            .catch(error => {
                                this.log.error('Setting RemoteKey: FAST_FORWARD - Error: ' + error.message);
                            });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.NEXT_TRACK:
                        kodi.playerGetActivePlayers(config)
                            .then(playerid => {
                                this.remoteKeyPressed('NEXT_TRACK', 'Player.GoTo', { 'playerid': playerid, 'to': 'next' });
                            })
                            .catch(error => {
                                this.log.error('Setting RemoteKey: NEXT_TRACK - Error: ' + error.message);
                            });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.PREVIOUS_TRACK:
                        kodi.playerGetActivePlayers(config)
                            .then(playerid => {
                                this.remoteKeyPressed('PREVIOUS_TRACK', 'Player.GoTo', { 'playerid': playerid, 'to': 'previous' });
                            })
                            .catch(error => {
                                this.log.error('Setting RemoteKey: PREVIOUS_TRACK - Error: ' + error.message);
                            });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.ARROW_UP:
                        this.remoteKeyPressed('ARROW_UP', 'Input.Up', {});
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.ARROW_DOWN:
                        this.remoteKeyPressed('ARROW_DOWN', 'Input.Down', {});
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.ARROW_LEFT:
                        this.remoteKeyPressed('ARROW_LEFT', 'Input.Left', {});
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.ARROW_RIGHT:
                        this.remoteKeyPressed('ARROW_RIGHT', 'Input.Right', {});
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.SELECT:
                        this.remoteKeyPressed('SELECT', 'Input.Select', {});
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.BACK:
                        this.remoteKeyPressed('BACK', 'Input.Back', {});
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.EXIT:
                        this.remoteKeyPressed('EXIT', 'Input.Home', {});
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.PLAY_PAUSE:
                        kodi.playerGetActivePlayers(config)
                            .then(playerid => {
                                this.remoteKeyPressed('PLAY_PAUSE', 'Player.PlayPause', { 'playerid': playerid });
                            })
                            .catch(error => {
                                this.log.error('Setting RemoteKey: PLAY_PAUSE - Error: ' + error.message);
                            });
                        break;
                    case this.platform.api.hap.Characteristic.RemoteKey.INFORMATION:
                        this.remoteKeyPressed('INFORMATION', 'Input.ShowOSD', {});
                        break;
                    default:
                        this.log.debug('Setting RemoteKey: Unknown key!');
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
            .onSet(async (selector) => {
                const volume = selector ? 'decrement' : 'increment';
                kodi.applicationSetVolume(config, volume)
                    .then(result => {
                        if (result) {
                            this.log.debug('Setting ' + name + ': ' + volume);
                        } else {
                            this.log.debug('Setting ' + name + ': ' + volume + ' (no result)');
                        }
                    })
                    .catch(error => {
                        this.log.debug('Setting ' + name + ': ' + volume + ' - Error: ' + error.message);
                    });
            });

        televisionSpeakerService.getCharacteristic(this.platform.api.hap.Characteristic.Volume)
            .onGet(async () => {
                return kodi.applicationGetProperties(config, ['volume'])
                    .then(result => {
                        if (result) {
                            const volume = result.volume ? result.volume : 0;
                            this.log.debug('Getting ' + name + ': ' + volume + ' %');
                            return volume;
                        } else {
                            return 0;
                        }
                    })
                    .catch(error => {
                        this.log.error('Getting ' + name + ' - Error: ' + error.message);
                        return 0;
                    });
            });

        this.televisionService.addLinkedService(televisionSpeakerService);

        const shownInputServices: Service[] = [];
        for (let index = 0; index < inputNames.length; index++) {
            const inputName = inputNames[index];
            const inputIdentifier = inputIdentifiers[index];

            this.log.info('Adding Television' + type + ' - ' + 'Input' + name + ' ' + inputName);

            const subType = 'Input' + inputName;
            let inputService = this.accessory.getServiceById(name, subType);

            if (!inputService) {
                this.log.debug('Adding new accessory: ' + 'Input' + inputName);
                inputService = new this.platform.api.hap.Service.InputSource(name, subType);
                inputService.subtype = subType;
            }

            inputService
                .setCharacteristic(this.platform.api.hap.Characteristic.Name, inputName)
                .setCharacteristic(this.platform.api.hap.Characteristic.ConfiguredName, inputName)
                .setCharacteristic(this.platform.api.hap.Characteristic.Identifier, inputIdentifier)
                .setCharacteristic(this.platform.api.hap.Characteristic.IsConfigured, this.platform.api.hap.Characteristic.IsConfigured.CONFIGURED)
                .setCharacteristic(this.platform.api.hap.Characteristic.InputSourceType, this.platform.api.hap.Characteristic.InputSourceType.APPLICATION)
                .setCharacteristic(this.platform.api.hap.Characteristic.TargetVisibilityState, this.platform.api.hap.Characteristic.TargetVisibilityState.SHOWN)
                .setCharacteristic(this.platform.api.hap.Characteristic.CurrentVisibilityState, this.platform.api.hap.Characteristic.CurrentVisibilityState.SHOWN);

            this.accessory.addService(inputService);
            this.televisionService.addLinkedService(inputService);
            shownInputServices.push(inputService);
        }

        for (let index = 0; index < this.televisionService.linkedServices.length; index++) {
            const service = this.televisionService.linkedServices[index];
            const name = service.getCharacteristic(this.platform.api.hap.Characteristic.Name).getValue();
            const shownInputService = shownInputServices.find(i => i.getCharacteristic(this.platform.api.hap.Characteristic.Name).getValue() === name);
            if (!shownInputService) {
                this.log.debug('Removing accessory and linked service from television service: ' + this.televisionService.name + ' ' + name);
                this.televisionService.removeLinkedService(service);
                this.accessory.removeService(service);
            }
        }

        this.accessory.addService(this.televisionService);
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
            this.televisionService.getCharacteristic(this.platform.api.hap.Characteristic.Active).updateValue(on);
        }, 100);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    remoteKeyPressed(name: string, method: string, parameters: any) {
        kodi.getActionResult(this.config, method, parameters)
            .then(() => {
                this.log.debug('Setting RemoteKey: ' + name);
            })
            .catch(error => {
                this.log.error('Setting RemoteKey: ' + name + ' - Error: ' + error.message);
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeIdentiferSet(name: string, activeIdentifier: CharacteristicValue, inputname: string, method: string, parameters: any) {
        kodi.getActionResult(this.config, method, parameters)
            .then(() => {
                this.log.debug('Setting ' + name + ' Active Identifier: ' + activeIdentifier + ' (' + inputname + ')');
            })
            .catch(error => {
                this.log.error('Setting ' + name + ' Active Identifier: ' + activeIdentifier + ' (' + inputname + ') - Error: ' + error.message);
            });
    }

}