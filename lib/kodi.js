'use strict';

const connection = require('../util/connection');

module.exports = {
    getStatus: function (config, log, callback) {
        connection.kodiRequest(config, "JSONRPC.Ping")
            .then(result => {
                callback(null, result == 'pong' ? true : false);
            })
            .catch(error => {
                callback(error);
            });
    },

    getActionResult: function (config, log, method, parameters, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, method, parameters)
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

    applicationGetProperties: function (config, log, properties, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "Application.GetProperties", { "properties": properties })
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

    applicationSetMute: function (config, log, mute, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "Application.SetMute", { "mute": mute })
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

    applicationSetVolume: function (config, log, volume, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "Application.SetVolume", { "volume": volume })
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

    playerGetActivePlayers: function (config, log, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "Player.GetActivePlayers")
                    .then(activeplayers => {
                        if (activeplayers.length == 0) {
                            callback(null);
                        } else {
                            for (let i = 0; i < activeplayers.length; i++) {
                                let player = activeplayers[i];
                                let playerid = typeof player.playerid != 'undefined' ? player.playerid : -1;
                                let playertype = player.playertype ? player.playertype : '';
                                let type = player.type ? player.type : '';
                                if ((playerid != -1 && playertype == 'internal') && (type == 'video' || type == 'audio')) {
                                    callback(null, playerid);
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

    playerGetItem: function (config, log, playerid, properties, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "Player.GetItem", { "playerid": playerid, "properties": properties })
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

    playerGetProperties: function (config, log, playerid, properties, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "Player.GetProperties", { "playerid": playerid, "properties": properties })
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

    playerSetPlay: function (config, log, playerid, play, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "Player.PlayPause", { "playerid": playerid, "play": play })
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

    playerSeek: function (config, log, playerid, percentage, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "Player.Seek", { "playerid": playerid, "value": percentage })
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

    playerStop: function (config, log, playerid, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "Player.Stop", { "playerid": playerid })
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

    tvGetChannels: function (config, log, callback) {
        this.getStatus(config, log, (error, status) => {
            if (!error && status) {
                connection.kodiRequest(config, "PVR.GetChannels", { "channelgroupid": 1, "properties": ["channel"] })
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

    isPlaying: function (config, log, callback) {
        this.playerGetActivePlayers(config, log, (error, playerid) => {
            if (!error && playerid != -1) {
                this.playerGetProperties(config, log, playerid, ["speed"], (error, result) => {
                    if (!error && result) {
                        let playing = result.speed != 0 ? result.speed != 0 : false;
                        let paused = result.speed == 0 ? result.speed == 0 : false;
                        if (playing) {
                            callback(true, false);
                        } else if (paused) {
                            callback(false, true);
                        } else {
                            callback(false, false);
                        }
                    }
                });
            } else {
                callback(false, false);
            }
        });
    },

    tvIsPlaying: function (config, log, callback) {
        this.playerGetActivePlayers(config, log, (error, playerid) => {
            if (!error && playerid != -1) {
                this.playerGetItem(config, log, playerid, [], (error, result) => {
                    if (!error && result) {
                        if (result.item.type == "channel") {
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
    }
}