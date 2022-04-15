/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlatformConfig } from 'homebridge';

import got from 'got';

export = {

    getOptions: function (config: PlatformConfig, method: string, params: any) {
        const host = config.host || 'localhost';
        const port = config.port || '8080';
        const username = config.username || 'kodi';
        const password = config.password || 'kodi';
        const options = {
            uri: 'http://' + username + ':' + password + '@' + host + ':' + port + '/jsonrpc',
            method: 'POST',
            json: { 'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': params },
        };
        return options;
    },

    kodiRequest: async function (config: PlatformConfig, method: string, params: any) {
        const request = async function (options: any) {
            const response = await got.post(options.uri, { json: options.json, timeout: { request: 1000 }, retry: { limit: 2 } }).json() as any;
            return (response.result as any);
        };
        return await request(this.getOptions(config, method, params));
    },
}