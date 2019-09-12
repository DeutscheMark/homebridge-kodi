'use strict'

const r2 = require('r2');

module.exports = {
    getOptions: function (config, method, params) {
        const options = {
            uri: 'http://' + config.username + ':' + config.password + '@' + config.host + ':' + config.port + '/jsonrpc',
            method: 'POST',
            json: { "jsonrpc": "2.0", "id": 1, "method": method, "params": params }
        };
        return options;
    },

    kodiRequest: async function (config, method, params) {
        const request = async options => {
            const response = await r2.post(options.uri, { json: options.json }).json
            return response.result;
        };
        return await request(this.getOptions(config, method, params));
    }
}