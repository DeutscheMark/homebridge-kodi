'use strict';

const inherits = require('util').inherits,
    CustomUUID = {
        Type: '3deb7456-5196-497e-8f4e-efc455516c96',
        Label: '74341e3c-271d-4f3c-b84e-595b804b1f90',
        Position: 'cf1c85ad-ba54-48e8-9681-255278976584',
        ShowTitle: '939cbbc9-382f-4574-903f-649ffbc24a1d',
        SeasonEpisode: '1972fe3f-7fe6-4e30-acdf-951eb9aabb7a',
        Artist: 'f784b287-bf4b-4256-8ba2-9dfe7070ea16',
        Album: 'ffcdb20b-bf68-4018-a0be-8bac52bf4fdd'
    };

let CustomCharacteristic = {};

module.exports = function (homebridge) {
    let Characteristic = homebridge.hap.Characteristic;

    CustomCharacteristic.Type = function () {
        Characteristic.call(this, 'Type', CustomUUID.Type);
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CustomCharacteristic.Type, Characteristic);

    CustomCharacteristic.Label = function () {
        Characteristic.call(this, 'Label', CustomUUID.Label);
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CustomCharacteristic.Label, Characteristic);

    CustomCharacteristic.ShowTitle = function () {
        Characteristic.call(this, 'Show Title', CustomUUID.ShowTitle);
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CustomCharacteristic.ShowTitle, Characteristic);

    CustomCharacteristic.SeasonEpisode = function () {
        Characteristic.call(this, 'Season / Episode', CustomUUID.SeasonEpisode);
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CustomCharacteristic.SeasonEpisode, Characteristic);

    CustomCharacteristic.Artist = function () {
        Characteristic.call(this, 'Artist', CustomUUID.Artist);
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CustomCharacteristic.Artist, Characteristic);

    CustomCharacteristic.Album = function () {
        Characteristic.call(this, 'Album', CustomUUID.Album);
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CustomCharacteristic.Album, Characteristic);

    CustomCharacteristic.Position = function () {
        Characteristic.call(this, 'Position', CustomUUID.Position);
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CustomCharacteristic.Position, Characteristic);

    return CustomCharacteristic;
};