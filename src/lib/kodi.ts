import { PlatformConfig } from 'homebridge';

import { KodiLogger } from '../internal';

import connection = require('../util/connection');

import util = require('util');
import child_process = require('child_process');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const storage = require('node-persist');

export = {
    getStatus: async function (config: PlatformConfig) {
        return await connection.kodiRequest(config, 'JSONRPC.Ping', {})
            .then(result => {
                return result && result === 'pong' ? true : false;
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch(_ => {
                // Don't log an error here anymore, because of the new power on/off capabilities since v1.1.0
                return false;
            });
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getActionResult: async function (config: PlatformConfig, method: string, parameters: any) {
        const status = await this.getStatus(config);
        if (status) {
            const result = await connection.kodiRequest(config, method, parameters);
            return [result && (result === 'OK' || result !== undefined || result !== null), result];
        } else {
            return [false, null];
        }
    },

    applicationGetProperties: async function (config: PlatformConfig, properties: string[]) {
        return await this.getStatus(config) ?
            await connection.kodiRequest(config, 'Application.GetProperties', { 'properties': properties }) :
            null;
    },

    applicationSetMute: async function (config: PlatformConfig, mute: boolean) {
        return await this.getStatus(config) ?
            await connection.kodiRequest(config, 'Application.SetMute', { 'mute': mute }) :
            null;
    },

    applicationSetVolume: async function (config: PlatformConfig, volume: number | string) {
        return await this.getStatus(config) ?
            await connection.kodiRequest(config, 'Application.SetVolume', { 'volume': volume }) :
            null;
    },

    input: async function (config: PlatformConfig, command: string, params: string) {
        const status = await this.getStatus(config);
        if (status) {
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
            return await connection.kodiRequest(config, input, paramsValue);
        } else {
            return null;
        }
    },

    playerGetActivePlayers: async function (config: PlatformConfig) {
        const status = await this.getStatus(config);
        if (status) {
            const activeplayers = await connection.kodiRequest(config, 'Player.GetActivePlayers', {});
            if (activeplayers.length === 0) {
                return null;
            } else {
                for (let i = 0; i < activeplayers.length; i++) {
                    const player = activeplayers[i];
                    const playerid = typeof player.playerid !== 'undefined' ? player.playerid as number : -1;
                    const playertype = player.playertype ? player.playertype : '';
                    const type = player.type ? player.type : '';
                    if ((playerid !== -1 && playertype === 'internal') && (type === 'video' || type === 'audio')) {
                        return playerid as number;
                    }
                }
                return null;
            }
        } else {
            return null;
        }
    },

    playerGetItem: async function (config: PlatformConfig, playerid: number, properties: string[]) {
        return await this.getStatus(config) ?
            await connection.kodiRequest(config, 'Player.GetItem', { 'playerid': playerid, 'properties': properties }) :
            null;
    },

    playerGetProperties: async function (config: PlatformConfig, playerid: number, properties: string[]) {
        return await this.getStatus(config) ?
            await connection.kodiRequest(config, 'Player.GetProperties', { 'playerid': playerid, 'properties': properties }) :
            null;
    },

    playerSetPlay: async function (config: PlatformConfig, playerid: number, play: boolean) {
        return await this.getStatus(config) ?
            await connection.kodiRequest(config, 'Player.PlayPause', { 'playerid': playerid, 'play': play }) :
            null;
    },

    playerSeek: async function (config: PlatformConfig, playerid: number, percentage: number) {
        return await this.getStatus(config) ?
            await connection.kodiRequest(config, 'Player.Seek', { 'playerid': playerid, 'value': { 'percentage': percentage } }) :
            null;
    },

    playerStop: async function (config: PlatformConfig, playerid: number) {
        return await this.getStatus(config) ?
            await connection.kodiRequest(config, 'Player.Stop', { 'playerid': playerid }) :
            null;
    },

    tvGetChannels: async function (config: PlatformConfig) {
        return await this.getStatus(config) ?
            await connection.kodiRequest(config, 'PVR.GetChannels', { 'channelgroupid': 1, 'properties': ['channel'] }) :
            null;
    },

    isPlaying: async function (config: PlatformConfig) {
        const playerid = await this.playerGetActivePlayers(config);
        if (playerid !== null && playerid !== -1) {
            const result = await this.playerGetProperties(config, playerid as number, ['speed']);
            if (result) {
                const playing = result.speed !== 0 ? result.speed !== 0 : false;
                const paused = result.speed === 0 ? result.speed === 0 : false;
                if (playing) {
                    return [true, false];
                } else if (paused) {
                    return [false, true];
                } else {
                    return [false, false];
                }
            } else {
                return [false, false];
            }
        } else {
            return [false, false];
        }
    },

    tvIsPlaying: async function (config: PlatformConfig) {
        const playerid = await this.playerGetActivePlayers(config);
        if (playerid !== null && playerid !== -1) {
            const result = await this.playerGetItem(config, playerid, []);
            if (result) {
                if (result.item.type === 'channel') {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    },

    closeFavoritesWindowIfOpened: async function (config: PlatformConfig, log: KodiLogger) {
        const [ok, result] = await this.getActionResult(config, 'GUI.GetProperties', { 'properties': ['currentwindow'] });
        if (ok && result && result.currentwindow.id && result.currentwindow.id === 10134) {
            const [ok] = await this.getActionResult(config, 'Input.ExecuteAction', { 'action': 'close' });
            if (ok) {
                log.debug('Closing Favorites');
            } else {
                log.debug('Closing Favorites: Failed (maybe not opened...)');
            }
        } else {
            log.debug('Closing Favorites: Not opened');
        }
    },

    storageGetItem: async function (cachedir: string, name: string | null | undefined) {
        await storage.init({ dir: cachedir, forgiveParseErrors: true });
        return storage.getItem(name);
    },

    storageSetItem: async function (cachedir: string, name: string | null | undefined, value: string) {
        await storage.init({ dir: cachedir, forgiveParseErrors: true });
        await storage.setItem(name, value);
        return;
    },

    executeShellCommand: async function (cmd: string) {
        const exec = util.promisify(child_process.exec);
        const { stdout, stderr } = await exec(cmd, { timeout: 5000 });
        return stdout ? stdout : stderr;
    },
};