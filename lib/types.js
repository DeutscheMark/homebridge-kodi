'use strict';

const inherits = require('util').inherits;

module.exports = {
    registerWith: function (hap) {
        const Characteristic = hap.Characteristic;

        // =============================
        // = Show Title Characteristic =
        // =============================
        Characteristic.ShowTitle = function () {
            Characteristic.call(this, 'Show Title', '939cbbc9-382f-4574-903f-649ffbc24a1d');
            this.setProps({
                format: Characteristic.Formats.STRING,
                perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
            });
            this.value = this.getDefaultValue();
        };
        inherits(Characteristic.ShowTitle, Characteristic);
        Characteristic.ShowTitle.UUID = '939cbbc9-382f-4574-903f-649ffbc24a1d';

        // ===================================
        // = Season / Episode Characteristic =
        // ===================================
        Characteristic.SeasonEpisode = function () {
            Characteristic.call(this, 'Season / Episode', '1972fe3f-7fe6-4e30-acdf-951eb9aabb7a');
            this.setProps({
                format: Characteristic.Formats.STRING,
                perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
            });
            this.value = this.getDefaultValue();
        };
        inherits(Characteristic.SeasonEpisode, Characteristic);
        Characteristic.SeasonEpisode.UUID = '1972fe3f-7fe6-4e30-acdf-951eb9aabb7a';

        // ===========================
        // = Position Characteristic =
        // ===========================
        Characteristic.Position = function () {
            Characteristic.call(this, 'Position', 'cf1c85ad-ba54-48e8-9681-255278976584');
            this.setProps({
                format: Characteristic.Formats.STRING,
                perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
            });
            this.value = this.getDefaultValue();
        };
        inherits(Characteristic.Position, Characteristic);
        Characteristic.Position.UUID = 'cf1c85ad-ba54-48e8-9681-255278976584';

        // ================================
        // = Episode Title Characteristic =
        // ================================
        Characteristic.EpisodeTitle = function () {
            Characteristic.call(this, 'Episode Title', 'f547b996-8bbb-4c56-8165-bb0441da5570');
            this.setProps({
                format: Characteristic.Formats.STRING,
                perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
            });
            this.value = this.getDefaultValue();
        };
        inherits(Characteristic.EpisodeTitle, Characteristic);
        Characteristic.EpisodeTitle.UUID = 'f547b996-8bbb-4c56-8165-bb0441da5570';
    }
};