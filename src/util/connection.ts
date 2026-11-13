/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlatformConfig } from 'homebridge';

class KodiJsonRpcError extends Error { }
class KodiHttpError extends Error { }

export = {

    getOptions: function (config: PlatformConfig, method: string, params: any) {
        const host = config.host || 'localhost';
        const port = config.port || '8080';
        const options = {
            uri: 'http://' + host + ':' + port + '/jsonrpc',
            method: 'POST',
            json: { 'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': params },
        };
        return options;
    },

    kodiRequest: async function (config: PlatformConfig, method: string, params: any): Promise<any> {
        const options = this.getOptions(config, method, params);
        const url = new URL(options.uri);
        const username = config.username || 'kodi';
        const password = config.password || 'kodi';

        let lastError: unknown;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(options.json),
                    signal: AbortSignal.timeout(1000),
                });

                if (!response.ok) {
                    const retryable = [408, 429, 500, 502, 503, 504, 505, 521, 522, 524].includes(response.status);
                    if (retryable && attempt < 2) {
                        continue;
                    }
                    throw new KodiHttpError('Kodi returned HTTP ' + response.status);
                }

                const data = await response.json() as { result?: any; error?: { code?: number; message?: string } };
                if (data.error) {
                    throw new KodiJsonRpcError('Kodi JSON-RPC error ' + (data.error.code ?? '') + ': ' + (data.error.message ?? 'Unknown error'));
                }
                return data.result;
            } catch (error) {
                if (error instanceof KodiJsonRpcError || error instanceof KodiHttpError) {
                    throw error;
                }
                lastError = error;
            }
        }

        throw lastError;
    },
}
