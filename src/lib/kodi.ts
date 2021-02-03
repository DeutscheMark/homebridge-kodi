import { PlatformConfig } from 'homebridge';

import { KodiLogger } from '../internal';

import connection = require('../util/connection');

export = {
    getStatus: function (config: PlatformConfig, callback: (error: Error | null, result: boolean) => void) {
        connection.kodiRequest(config, 'JSONRPC.Ping', {})
            .then(result => {
                callback(null, result && result === 'pong' ? true : false);
            })
            .catch(error => {
                callback(error, false);
            });
    },

    getActionResult: function (
        config: PlatformConfig,
        log: KodiLogger,
        method: string,
        parameters: any,
        callback: (error: Error | null, ok: boolean, result?: any) => void,
    ) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, method, parameters)
                    .then(result => {
                        callback(null, result && (result === 'OK' || result !== undefined || result !== null), result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error, false);
                    });
            } else {
                callback(error, false);
            }
        });
    },

    applicationGetProperties: function (
        config: PlatformConfig,
        log: KodiLogger,
        properties: string[],
        callback: (error: Error | null, result?: any) => void,
    ) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'Application.GetProperties', { 'properties': properties })
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    applicationSetMute: function (
        config: PlatformConfig,
        log: KodiLogger,
        mute: boolean,
        callback: (error: Error | null, result?: any) => void,
    ) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'Application.SetMute', { 'mute': mute })
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    applicationSetVolume: function (
        config: PlatformConfig,
        log: KodiLogger,
        volume: number | string,
        callback: (error: Error | null, result?: any) => void,
    ) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'Application.SetVolume', { 'volume': volume })
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    input: function (
        config: PlatformConfig,
        log: KodiLogger,
        command: string,
        params: string,
        callback: (error: Error | null, result?: any) => void,
    ) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                let input = '';
                switch (command) {
                    case 'home':
                        input = 'Input.Home';
                        break;

                    case 'select':
                        input = 'Input.Select';
                        break;

                    case 'back':
                        input = 'Input.Back';
                        break;

                    case 'info':
                        input = 'Input.Info';
                        break;

                    case 'contextmenu':
                        input = 'Input.ContextMenu';
                        break;

                    case 'left':
                        input = 'Input.Left';
                        break;

                    case 'right':
                        input = 'Input.Right';
                        break;

                    case 'up':
                        input = 'Input.Up';
                        break;

                    case 'down':
                        input = 'Input.Down';
                        break;

                    case 'showcodec':
                        input = 'Input.ShowCodec';
                        break;

                    case 'showosd':
                        input = 'Input.ShowOSD';
                        break;

                    case 'showplayerprocessinfo':
                        input = 'Input.ShowPlayerProcessInfo';
                        break;

                    case 'sendtext':
                        input = 'Input.SendText';
                        break;

                    case 'executeaction':
                        input = 'Input.ExecuteAction';
                        break;

                    default:
                        input = 'Input.ExecuteAction';
                        break;
                }
                let paramsValue = {};
                if (input === 'Input.ExecuteAction') {
                    if (params && params !== '') {
                        paramsValue = { 'action': params };
                    } else {
                        paramsValue = { 'action': command };
                    }
                } else if (input === 'Input.SendText') {
                    if (params && params !== '') {
                        paramsValue = { 'text': params };
                    }
                }
                connection.kodiRequest(config, input, paramsValue)
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    playerGetActivePlayers: function (config: PlatformConfig, log: KodiLogger, callback: (error: Error | null, playerid?: number) => void) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'Player.GetActivePlayers', {})
                    .then(activeplayers => {
                        if (activeplayers.length === 0) {
                            callback(null);
                        } else {
                            for (let i = 0; i < activeplayers.length; i++) {
                                const player = activeplayers[i];
                                const playerid = typeof player.playerid !== 'undefined' ? player.playerid as number : -1;
                                const playertype = player.playertype ? player.playertype : '';
                                const type = player.type ? player.type : '';
                                if ((playerid !== -1 && playertype === 'internal') && (type === 'video' || type === 'audio')) {
                                    callback(null, playerid as number);
                                } else {
                                    callback(null);
                                }
                            }
                        }
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    playerGetItem: function (
        config: PlatformConfig,
        log: KodiLogger,
        playerid: number,
        properties: string[],
        callback: (error: Error | null, result?: any) => void,
    ) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'Player.GetItem', { 'playerid': playerid, 'properties': properties })
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    playerGetProperties: function (
        config: PlatformConfig,
        log: KodiLogger,
        playerid: number,
        properties: string[],
        callback: (error: Error | null, result?: any) => void,
    ) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'Player.GetProperties', { 'playerid': playerid, 'properties': properties })
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    playerSetPlay: function (
        config: PlatformConfig,
        log: KodiLogger,
        playerid: number,
        play: boolean,
        callback: (error: Error | null, result?: any) => void,
    ) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'Player.PlayPause', { 'playerid': playerid, 'play': play })
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    playerSeek: function (
        config: PlatformConfig,
        log: KodiLogger,
        playerid: number,
        percentage: number,
        callback: (error: Error | null, result?: any) => void,
    ) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'Player.Seek', { 'playerid': playerid, 'value': { 'percentage': percentage } })
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    playerStop: function (config: PlatformConfig, log: KodiLogger, playerid: number, callback: (error: Error | null, result?: any) => void) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'Player.Stop', { 'playerid': playerid })
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    tvGetChannels: function (config: PlatformConfig, log: KodiLogger, callback: (error: Error | null, result?: any) => void) {
        this.getStatus(config, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, 'PVR.GetChannels', { 'channelgroupid': 1, 'properties': ['channel'] })
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(error => {
                        log.error(error);
                        callback(error);
                    });
            } else {
                callback(error);
            }
        });
    },

    isPlaying: function (config: PlatformConfig, log: KodiLogger, callback: (playing: boolean, paused: boolean) => void) {
        this.playerGetActivePlayers(config, log, (error, playerid) => {
            if (!error && playerid !== -1) {
                this.playerGetProperties(config, log, playerid as number, ['speed'], (error, result) => {
                    if (!error && result) {
                        const playing = result.speed !== 0 ? result.speed !== 0 : false;
                        const paused = result.speed === 0 ? result.speed === 0 : false;
                        if (playing) {
                            callback(true, false);
                        } else if (paused) {
                            callback(false, true);
                        } else {
                            callback(false, false);
                        }
                    } else {
                        callback(false, false);
                    }
                });
            } else {
                callback(false, false);
            }
        });
    },

    tvIsPlaying: function (config: PlatformConfig, log: KodiLogger, callback: (playing: boolean) => void) {
        this.playerGetActivePlayers(config, log, (error, playerid) => {
            if (!error && playerid && playerid !== -1) {
                this.playerGetItem(config, log, playerid, [], (error, result) => {
                    if (!error && result) {
                        if (result.item.type === 'channel') {
                            callback(true);
                        } else {
                            callback(false);
                        }
                    } else {
                        callback(false);
                    }
                });
            } else {
                callback(false);
            }
        });
    },

    closeFavoritesWindowIfOpened: function(config: PlatformConfig, log: KodiLogger, callback: () => void) {
        this.getActionResult(config, log, 'GUI.GetProperties', { 'properties': ['currentwindow'] }, (error, ok, result) => {
            if (!error && ok && result && result.currentwindow.id && result.currentwindow.id === 10134) {
                this.getActionResult(config, log, 'Input.ExecuteAction', { 'action': 'close' }, (error, ok) => {
                    if (!error && ok) {
                        log.debug('Closing Favorites');
                    } else {
                        log.debug('Closing Favorites: Failed (maybe not opened...)');
                    }
                    callback();
                });
            } else {
                log.debug('Closing Favorites: Not opened');
                callback();
            }
        });
    },

    storageGetItem: async function (cachedir: string, name: string | null | undefined, callback: (error: Error | null, value: string | null) => void) {
        // this.platform.api.user.persistPath()
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const storage = require('node-persist');
        try {
            await storage.init({ dir: cachedir, forgiveParseErrors: true });
            callback(null, await storage.getItem(name));
        } catch(error) {
            callback(error, null);
        }
    },

    storageSetItem: async function (cachedir: string, name: string | null | undefined, value: string, callback: (error: Error | null) => void) {
        // this.platform.api.user.persistPath()
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const storage = require('node-persist');
        try {
            await storage.init({ dir: cachedir, forgiveParseErrors: true });
            await storage.setItem(name, value);
            callback(null);
        } catch(error) {
            callback(error);
        }
    },
};