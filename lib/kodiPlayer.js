'use strict'

const kodi = require('./kodi');

let Service,
    Characteristic,
    CustomCharacteristic;

module.exports = {
    PlayerTelevisionAccessory: PlayerTelevisionAccessory,
    PlayerTelevisionChannelsAccessory: PlayerTelevisionChannelsAccessory,
    PlayerLightbulbAccessory: PlayerLightbulbAccessory,
    PlayerPlaySwitchAccessory: PlayerPlaySwitchAccessory,
    PlayerPauseSwitchAccessory: PlayerPauseSwitchAccessory,
    PlayerStopSwitchAccessory: PlayerStopSwitchAccessory
};

// =======================================
// = PlayerTelevisionAccessory Accessory =
// =======================================

function PlayerTelevisionAccessory(platform, api, televisionService, televisionSpeakerService, inputServices, inputNames, inputIdentifiers, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;
    CustomCharacteristic = require('../util/characteristics')(api);

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.televisionService = televisionService;
    this.televisionSpeakerService = televisionSpeakerService;
    this.inputServices = inputServices;

    this.services = [];

    this.log("Adding PlayerTelevisionAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerTelevision")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.televisionService.setCharacteristic(Characteristic.ConfiguredName, name)
        .setCharacteristic(Characteristic.ActiveIdentifier, 1)
        .setCharacteristic(Characteristic.PowerModeSelection, Characteristic.PowerModeSelection.SHOW)
        .setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);


    this.televisionService.getCharacteristic(Characteristic.Active)
        .on('get', (callback) => {
            callback(null, Characteristic.Active.ACTIVE);
        })
        .on('set', (active, callback) => {
            if (!active) {
                setTimeout(() => {
                    this.televisionService.getCharacteristic(Characteristic.Active).updateValue(Characteristic.Active.ACTIVE);
                }, 100);
            }
            callback();
        });

    this.televisionService.getCharacteristic(Characteristic.ActiveIdentifier)
        .on('get', (callback) => {
            kodi.getActionResult(this.config, this.log, "GUI.GetProperties", { "properties": ["currentwindow"] }, (error, result) => {
                if (!error && result && result.currentwindow.label && result.currentwindow.label == "Favorites") {
                    kodi.getActionResult(this.config, this.log, "Input.ExecuteAction", { "action": "close" }, (error, result) => {
                        this.log("Closing: FAVORITES");
                    });
                }
            });
            callback(null, 1);
        })
        .on('set', (activeIdentifier, callback) => {
            this.log('Setting Active Identifier: ' + activeIdentifier);
            let timeout = 0;
            kodi.getActionResult(this.config, this.log, "GUI.GetProperties", { "properties": ["currentwindow"] }, (error, result) => {
                if (!error && result && result.currentwindow.label && result.currentwindow.id == 10134) {
                    timeout = 500;
                    kodi.getActionResult(this.config, this.log, "Input.ExecuteAction", { "action": "close" }, (error, result) => {
                        this.log("Closing: Favorites");
                    });
                }
                setTimeout(() => {
                    switch (activeIdentifier) {
                        case 1:
                            kodi.getActionResult(this.config, this.log, "Input.Home", {}, (error, result) => {
                                this.log("Setting Active Window: Home");
                            });
                            break;
                        case 2:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "settings", "parameters": ["Root"] }, (error, result) => {
                                this.log("Setting Active Window: Settings");
                            });
                            break;
                        case 3:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "videos", "parameters": ["MovieTitles"] }, (error, result) => {
                                this.log("Setting Active Window: Movies");
                            });
                            break;
                        case 4:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "videos", "parameters": ["TVShowTitles"] }, (error, result) => {
                                this.log("Setting Active Window: TVShows");
                            });
                            break;
                        case 5:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "tvchannels", "parameters": ["Root"] }, (error, result) => {
                                this.log("Setting Active Window: TV");
                            });
                            break;
                        case 6:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "music", "parameters": ["Root"] }, (error, result) => {
                                this.log("Setting Active Window: Music");
                            });
                            break;
                        case 7:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "videos", "parameters": ["MusicVideoTitles"] }, (error, result) => {
                                this.log("Setting Active Window: MusicVideos");
                            });
                            break;
                        case 8:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "radiochannels", "parameters": ["Root"] }, (error, result) => {
                                this.log("Setting Active Window: Radio");
                            });
                            break;
                        case 9:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "games", "parameters": ["Root"] }, (error, result) => {
                                this.log("Setting Active Window: Games");
                            });
                            break;
                        case 10:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "videos", "parameters": ["Video Add-ons"] }, (error, result) => {
                                this.log("Setting Active Window: Add-Ons");
                            });
                            break;
                        case 11:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "pictures", "parameters": ["Root"] }, (error, result) => {
                                this.log("Setting Active Window: Pictures");
                            });
                            break;
                        case 12:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "videos", "parameters": ["Root"] }, (error, result) => {
                                this.log("Setting Active Window: Videos");
                            });
                            break;
                        case 13:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "favourites", "parameters": ["Root"] }, (error, result) => {
                                this.log("Setting Active Window: Favorites");
                            });
                            break;
                        case 14:
                            kodi.getActionResult(this.config, this.log, "GUI.ActivateWindow", { "window": "weather", "parameters": ["Root"] }, (error, result) => {
                                this.log("Setting Active Window: Weather");
                            });
                            break;
                        default:
                            break;
                    }
                }, timeout);
            });
            callback();
        });

    this.televisionService.getCharacteristic(Characteristic.PictureMode)
        .on('set', (mode, callback) => {
            this.log('Setting PictureMode: ' + mode);
            callback();
        });

    this.televisionService.getCharacteristic(Characteristic.PowerModeSelection)
        .on('set', (mode, callback) => {
            kodi.getActionResult(this.config, this.log, "Input.Home", {}, (error, result) => {
                this.log("Setting: PowerModeSelection");
            });
            callback();
        });

    this.televisionService.getCharacteristic(Characteristic.RemoteKey)
        .on('set', (remoteKey, callback) => {
            switch (remoteKey) {
                case Characteristic.RemoteKey.REWIND:
                    kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                        if (!error && playerid != -1) {
                            kodi.getActionResult(this.config, this.log, "Player.Seek", "params", { "playerid": playerid, "value": "smallbackward" }, (error, result) => {
                                this.log("Setting RemoteKey: REWIND");
                            });
                        }
                        callback();
                    });
                    break;
                case Characteristic.RemoteKey.FAST_FORWARD:
                    kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                        if (!error && playerid != -1) {
                            kodi.getActionResult(this.config, this.log, "Player.Seek", "params", { "playerid": playerid, "value": "smallforward" }, (error, result) => {
                                this.log("Setting RemoteKey: FAST_FORWARD");
                            });
                        }
                        callback();
                    });
                    break;
                case Characteristic.RemoteKey.NEXT_TRACK:
                    kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                        if (!error && playerid != -1) {
                            kodi.getActionResult(this.config, this.log, "Player.GoTo", { "playerid": playerid, "to": "next" }, (error, result) => {
                                this.log("Setting RemoteKey: NEXT_TRACK");
                            });
                        }
                    });
                    break;
                case Characteristic.RemoteKey.PREVIOUS_TRACK:
                    kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                        if (!error && playerid != -1) {
                            kodi.getActionResult(this.config, this.log, "Player.GoTo", { "playerid": playerid, "to": "previous" }, (error, result) => {
                                this.log("Setting RemoteKey: PREVIOUS_TRACK");
                            });
                        }
                    });
                    break;
                case Characteristic.RemoteKey.ARROW_UP:
                    kodi.getActionResult(this.config, this.log, "Input.Up", {}, (error, result) => {
                        this.log("Setting RemoteKey: ARROW_UP");
                    });
                    break;
                case Characteristic.RemoteKey.ARROW_DOWN:
                    kodi.getActionResult(this.config, this.log, "Input.Down", {}, (error, result) => {
                        this.log("Setting RemoteKey: ARROW_DOWN");
                    });
                    break;
                case Characteristic.RemoteKey.ARROW_LEFT:
                    kodi.getActionResult(this.config, this.log, "Input.Left", {}, (error, result) => {
                        this.log("Setting RemoteKey: ARROW_LEFT");
                    });
                    break;
                case Characteristic.RemoteKey.ARROW_RIGHT:
                    kodi.getActionResult(this.config, this.log, "Input.Right", {}, (error, result) => {
                        this.log("Setting RemoteKey: ARROW_RIGHT");
                    });
                    break;
                case Characteristic.RemoteKey.SELECT:
                    kodi.getActionResult(this.config, this.log, "Input.Select", {}, (error, result) => {
                        this.log("Setting RemoteKey: SELECT");
                    });
                    break;
                case Characteristic.RemoteKey.BACK:
                    kodi.getActionResult(this.config, this.log, "Input.Back", {}, (error, result) => {
                        this.log("Setting RemoteKey: BACK");
                    });
                    break;
                case Characteristic.RemoteKey.EXIT:
                    kodi.getActionResult(this.config, this.log, "Input.Home", {}, (error, result) => {
                        this.log("Setting RemoteKey: EXIT");
                    });
                    break;
                case Characteristic.RemoteKey.PLAY_PAUSE:
                    kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                        if (!error && playerid != -1) {
                            kodi.getActionResult(this.config, this.log, "Player.PlayPause", { "playerid": playerid }, (error, result) => {
                                this.log("Setting RemoteKey: PLAY_PAUSE");
                            });
                        }
                        callback();
                    });
                    break;
                case Characteristic.RemoteKey.INFORMATION:
                    kodi.getActionResult(this.config, this.log, "Input.ShowOSD", {}, (error, result) => {
                        this.log("Setting RemoteKey: INFORMATION");
                    });
                    break;
                default:
                    break;
            }
            callback();
        });

    this.log("Adding PlayerTelevisionSpeakerAccessory");

    this.televisionSpeakerService
        .setCharacteristic(Characteristic.Active, Characteristic.Active.ACTIVE)
        .setCharacteristic(Characteristic.VolumeControlType, Characteristic.VolumeControlType.ABSOLUTE);

    this.televisionSpeakerService.getCharacteristic(Characteristic.VolumeSelector)
        .on('set', (selector, callback) => {
            let volume = selector ? "decrement" : "increment";
            kodi.applicationSetVolume(this.config, this.log, volume, (error, result) => {
                if (!error && result) {
                    this.log("Setting " + this.name + ": " + volume);
                }
                callback();
            });
        });

    this.televisionSpeakerService.getCharacteristic(Characteristic.Volume)
        .on('get', (callback) => {
            kodi.applicationGetProperties(this.config, this.log, ["volume"], (error, result) => {
                if (!error && result) {
                    let volume = result.volume ? result.volume : 0;
                    this.log("Getting " + this.name + ": " + volume + " %");
                    callback(null, volume);
                } else {
                    callback(null, 0);
                }
            });
        });

    this.televisionService.addLinkedService(this.televisionSpeakerService);

    this.services.push(this.informationService, this.televisionService, this.televisionSpeakerService);

    for (let index = 0; index < this.inputServices.length; index++) {
        let inputService = this.inputServices[index];
        let inputName = inputNames[index];
        let inputIdentifier = inputIdentifiers[index];

        inputService
            .setCharacteristic(Characteristic.Identifier, inputIdentifier)
            .setCharacteristic(Characteristic.ConfiguredName, inputName)
            .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
            .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.APPLICATION)
            .setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN);

        this.televisionService.addLinkedService(inputService);
        this.services.push(inputService);
    }
}

PlayerTelevisionAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return this.services;
    }
};

// ===============================================
// = PlayerTelevisionChannelsAccessory Accessory =
// ===============================================

function PlayerTelevisionChannelsAccessory(platform, api, televisionService, inputServices, inputNames, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;
    CustomCharacteristic = require('../util/characteristics')(api);

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.televisionService = televisionService;
    this.televisionInputServices = inputServices;
    this.televisionInputNames = inputNames;

    this.services = [];

    this.log("Adding PlayerTelevisionChannelsAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerTelevisionChannels")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.televisionService.setCharacteristic(Characteristic.ConfiguredName, name)
        .setCharacteristic(Characteristic.ActiveIdentifier, 1)
        .setCharacteristic(Characteristic.PowerModeSelection, Characteristic.PowerModeSelection.SHOW)
        .setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

    this.televisionService.getCharacteristic(Characteristic.Active)
        .on('get', (callback) => {
            kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                if (!error && playerid != -1) {
                    kodi.playerGetItem(this.config, this.log, playerid, [], (error, result) => {
                        if (!error && result) {
                            if (result.item.type == "channel") {
                                callback(null, true);
                            } else {
                                callback(null, false);
                            }
                        } else {
                            callback(null, false);
                        }
                    });
                } else {
                    callback(null, false);
                }
            });
        })
        .on('set', (active, callback) => {
            if (active) {
                kodi.getActionResult(this.config, this.log, "GUI.GetProperties", { "properties": ["currentwindow"] }, (error, result) => {
                    if (!error && result && result.currentwindow.label && result.currentwindow.label == "Favorites") {
                        kodi.getActionResult(this.config, this.log, "Input.ExecuteAction", { "action": "close" }, (error, result) => {
                            this.log("Closing: FAVORITES");
                        });
                    }
                });
                setTimeout(() => {
                    kodi.tvGetChannels(this.config, this.log, (error, result) => {
                        if (!error && result.channels) {
                            for (let index = 0; index < result.channels.length; index++) {
                                let channel = result.channels[index];
                                if (channel.label == this.televisionInputNames[0]) {
                                    kodi.getActionResult(this.config, this.log, "Player.Open", { "item": { "channelid": channel.channelid } }, (error, result) => {
                                        this.log("Setting Active TV Channel: " + channel.label);
                                    });
                                }
                            }
                        }
                    });
                    callback();
                }, 100);
            } else {
                kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                    if (!error && playerid != -1) {
                        kodi.playerStop(this.config, this.log, playerid, (error, result) => {
                            if (!error && result) {
                                setTimeout(() => {
                                    this.log("Setting " + this.name + ": false - Stopped!");
                                    this.televisionService.getCharacteristic(Characteristic.On).updateValue(false);
                                }, 100);
                                this.log("Setting " + this.name + ": " + active);
                                callback();
                            } else {
                                setTimeout(() => {
                                    this.log("Setting " + this.name + ": false - Stopped!");
                                    this.televisionService.getCharacteristic(Characteristic.On).updateValue(false);
                                }, 100);
                                callback();
                            }
                        });
                    } else {
                        setTimeout(() => {
                            this.log("Setting " + this.name + ": false - Stopped!");
                            this.televisionService.getCharacteristic(Characteristic.On).updateValue(false);
                        }, 100);
                        callback();
                    }
                });
            }
        });

    this.televisionService.getCharacteristic(Characteristic.ActiveIdentifier)
        .on('get', (callback) => {
            this.log('Getting Active Identifier: ' + 1);
            callback();
        })
        .on('set', (activeIdentifier, callback) => {
            this.log('Setting Active Identifier: ' + activeIdentifier);
            kodi.getActionResult(this.config, this.log, "GUI.GetProperties", { "properties": ["currentwindow"] }, (error, result) => {
                if (!error && result && result.currentwindow.label && result.currentwindow.label == "Favorites") {
                    kodi.getActionResult(this.config, this.log, "Input.ExecuteAction", { "action": "close" }, (error, result) => {
                        this.log("Closing: FAVORITES");
                    });
                }
            });
            setTimeout(() => {
                kodi.tvGetChannels(this.config, this.log, (error, result) => {
                    if (!error && result.channels) {
                        for (let index = 0; index < result.channels.length; index++) {
                            let channel = result.channels[index];
                            if (channel.label == this.televisionInputNames[activeIdentifier - 1]) {
                                kodi.getActionResult(this.config, this.log, "Player.Open", { "item": { "channelid": channel.channelid } }, (error, result) => {
                                    this.log("Setting Active TV Channel: " + channel.label);
                                });
                            }
                        }
                    }
                });
                callback();
            }, 100);
        });

    this.televisionService.getCharacteristic(Characteristic.PictureMode)
        .on('set', (mode, callback) => {
            this.log('Setting PictureMode: ' + mode);
            callback();
        });

    this.televisionService.getCharacteristic(Characteristic.PowerModeSelection)
        .on('set', (mode, callback) => {
            kodi.getActionResult(this.config, this.log, "Input.Home", {}, (error, result) => {
                this.log("Setting: PowerModeSelection");
            });
            callback();
        });

    this.services.push(this.informationService, this.televisionService);

    for (let index = 0; index < this.televisionInputServices.length; index++) {
        let inputService = this.televisionInputServices[index];
        let inputName = this.televisionInputNames[index];
        inputService
            .setCharacteristic(Characteristic.Identifier, index + 1)
            .setCharacteristic(Characteristic.ConfiguredName, inputName)
            .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
            .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.APPLICATION)
            .setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN);

        this.televisionService.addLinkedService(inputService);
        this.services.push(inputService);
    }
}

PlayerTelevisionChannelsAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return this.services;
    }
};

// ======================================
// = PlayerLightbulbAccessory Accessory =
// ======================================

function PlayerLightbulbAccessory(platform, api, lightbulbService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;
    CustomCharacteristic = require('../util/characteristics')(api);

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.lightbulbService = lightbulbService;

    this.log("Adding PlayerLightbulbAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerLightbulb")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.lightbulbService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            kodi.isPlaying(this.config, this.log, (playing, paused) => {
                callback(null, playing);
            });
        })
        .on('set', (on, callback) => {
            kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                if (!error && playerid != -1) {
                    kodi.playerSetPlay(this.config, this.log, playerid, on, (error, result) => {
                        if (!error && result) {
                            let speed = result.speed ? result.speed : 0;
                            if (speed != 0) {
                                this.log("Setting " + this.name + ": " + on);
                                callback();
                            } else {
                                setTimeout(() => {
                                    this.log("Setting " + this.name + ": false - Nothing pausable seems to be playing!");
                                    kodi.isPlaying(this.config, this.log, (playing, paused) => {
                                        this.lightbulbService.getCharacteristic(Characteristic.On).updateValue(playing);
                                    });
                                }, 100);
                                callback();
                            }
                        } else {
                            setTimeout(() => {
                                this.log("Setting " + this.name + ": false - Nothing pausable seems to be playing!");
                                kodi.isPlaying(this.config, this.log, (playing, paused) => {
                                    this.lightbulbService.getCharacteristic(Characteristic.On).updateValue(playing);
                                });
                            }, 100);
                            callback();
                        }
                    });
                } else {
                    setTimeout(() => {
                        this.log("Setting " + this.name + ": false - Nothing pausable seems to be playing!");
                        kodi.isPlaying(this.config, this.log, (playing, paused) => {
                            this.lightbulbService.getCharacteristic(Characteristic.On).updateValue(playing);
                        });
                    }, 100);
                    callback();
                }
            });
        });
    this.lightbulbService.addCharacteristic(Characteristic.Brightness)
        .on('get', (callback) => {
            kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                if (!error && playerid != -1) {
                    kodi.playerGetProperties(this.config, this.log, playerid, ["percentage", "totaltime"], (error, result) => {
                        if (!error && result) {
                            let percentage = Math.round(result.percentage ? result.percentage : 0);
                            let timeAndTotaltime = result.totaltime.hours + ":" + result.totaltime.minutes.toString().padStart(2, '0') + ":" + result.totaltime.seconds.toString().padStart(2, '0');
                            if (percentage == 0 && timeAndTotaltime == "0:00:00") {
                                this.log("Getting " + this.name + ": 100 %");
                                callback(null, 100);
                            } else {
                                this.log("Getting " + this.name + ": " + percentage + " %");
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
        })
        .on('set', (brightness, callback) => {
            kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                if (!error && playerid != -1) {
                    let percentage = Math.round(brightness);
                    kodi.playerSeek(this.config, this.log, playerid, percentage, (error, result) => {
                        if (!error && result) {
                            let percentage = Math.round(result.percentage ? result.percentage : 0);
                            this.log("Setting " + this.name + ": " + percentage + " %");
                            callback();
                        } else {
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            });
        });
    this.lightbulbService.addCharacteristic(CustomCharacteristic.Type);
    this.lightbulbService.addCharacteristic(CustomCharacteristic.ShowTitle);
    this.lightbulbService.addCharacteristic(CustomCharacteristic.SeasonEpisode);
    this.lightbulbService.addCharacteristic(CustomCharacteristic.Label);
    this.lightbulbService.addCharacteristic(CustomCharacteristic.Position);
    this.lightbulbService.addCharacteristic(CustomCharacteristic.Artist);
    this.lightbulbService.addCharacteristic(CustomCharacteristic.Album);
}

PlayerLightbulbAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.lightbulbService];
    }
};

// =======================================
// = PlayerPlaySwitchAccessory Accessory =
// =======================================

function PlayerPlaySwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding PlayerPlaySwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerPlaySwitch")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            kodi.isPlaying(this.config, this.log, (playing, paused) => {
                callback(null, playing);
            });
        })
        .on('set', (on, callback) => {
            kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                if (!error && playerid != -1) {
                    kodi.playerSetPlay(this.config, this.log, playerid, on, (error, result) => {
                        if (!error && result) {
                            let speed = result.speed ? result.speed : 0;
                            if (speed != 0) {
                                this.log("Setting " + this.name + ": " + on);
                                callback();
                            } else {
                                setTimeout(() => {
                                    this.log("Setting " + this.name + ": false - Nothing pausable seems to be playing!");
                                    kodi.isPlaying(this.config, this.log, (playing, paused) => {
                                        this.switchService.getCharacteristic(Characteristic.On).updateValue(playing);
                                    });
                                }, 100);
                                callback();
                            }
                        } else {
                            setTimeout(() => {
                                this.log("Setting " + this.name + ": false - Nothing pausable seems to be playing!");
                                kodi.isPlaying(this.config, this.log, (playing, paused) => {
                                    this.switchService.getCharacteristic(Characteristic.On).updateValue(playing);
                                });
                            }, 100);
                            callback();
                        }
                    });
                } else {
                    setTimeout(() => {
                        this.log("Setting " + this.name + ": false - Nothing pausable seems to be playing!");
                        kodi.isPlaying(this.config, this.log, (playing, paused) => {
                            this.switchService.getCharacteristic(Characteristic.On).updateValue(playing);
                        });
                    }, 100);
                    callback();
                }
            });
        });
}

PlayerPlaySwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};

// ========================================
// = PlayerPauseSwitchAccessory Accessory =
// ========================================

function PlayerPauseSwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding PlayerPauseSwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerPauseSwitch")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            kodi.isPlaying(this.config, this.log, (playing, paused) => {
                callback(null, paused);
            });
        })
        .on('set', (on, callback) => {
            kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                if (!error && playerid != -1) {
                    kodi.playerGetItem(this.config, this.log, playerid, [], (error, itemresult) => {
                        if (!error && itemresult && itemresult.item) {
                            kodi.playerSetPlay(this.config, this.log, playerid, !on, (error, result) => {
                                if (!error && result) {
                                    let on = result.speed == 0 ? result.speed == 0 : false;
                                    this.log("Setting " + this.name + ": " + on);
                                    callback();
                                } else {
                                    setTimeout(() => {
                                        this.log("Setting " + this.name + ": false - Nothing pausable seems to be playing!");
                                        kodi.isPlaying(this.config, this.log, (playing, paused) => {
                                            this.switchService.getCharacteristic(Characteristic.On).updateValue(paused);
                                        });
                                    }, 100);
                                    callback();
                                }
                            });
                        } else {
                            setTimeout(() => {
                                this.log("Setting " + this.name + ": false - Nothing pausable seems to be playing!");
                                kodi.isPlaying(this.config, this.log, (playing, paused) => {
                                    this.switchService.getCharacteristic(Characteristic.On).updateValue(paused);
                                });
                            }, 100);
                            callback();
                        }
                    });
                } else {
                    setTimeout(() => {
                        this.log("Setting " + this.name + ": false - Nothing pausable seems to be playing!");
                        kodi.isPlaying(this.config, this.log, (playing, paused) => {
                            this.switchService.getCharacteristic(Characteristic.On).updateValue(paused);
                        });
                    }, 100);
                    callback();
                }
            });
        });
}

PlayerPauseSwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};

// ==============================
// = PlayerStopSwitch Accessory =
// ==============================

function PlayerStopSwitchAccessory(platform, api, switchService, name, version) {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;

    this.platform = platform;
    this.log = platform.log;
    this.config = platform.config;
    this.name = name;
    this.switchService = switchService;

    this.log("Adding PlayerStopSwitchAccessory");

    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "github.com DeutscheMark")
        .setCharacteristic(Characteristic.Model, "Homebridge-Kodi PlayerStopSwitch")
        .setCharacteristic(Characteristic.SerialNumber, version)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
            callback(null, false);
        })
        .on('set', (on, callback) => {
            if (on) {
                kodi.playerGetActivePlayers(this.config, this.log, (error, playerid) => {
                    if (!error && playerid != -1) {
                        kodi.playerStop(this.config, this.log, playerid, (error, result) => {
                            if (!error && result) {
                                setTimeout(() => {
                                    this.log("Setting " + this.name + ": false - Stopped!");
                                    this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                                }, 100);
                                this.log("Setting " + this.name + ": " + on);
                                callback();
                            } else {
                                setTimeout(() => {
                                    this.log("Setting " + this.name + ": false - Stopped!");
                                    this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                                }, 100);
                                callback();
                            }
                        });
                    } else {
                        setTimeout(() => {
                            this.log("Setting " + this.name + ": false - Stopped!");
                            this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                        }, 100);
                        callback();
                    }
                });
            } else {
                setTimeout(() => {
                    this.log("Setting " + this.name + ": false - Stopped!");
                    this.switchService.getCharacteristic(Characteristic.On).updateValue(false);
                }, 100);
                callback();
            };
        });
}

PlayerStopSwitchAccessory.prototype = {
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        return [this.informationService, this.switchService];
    }
};