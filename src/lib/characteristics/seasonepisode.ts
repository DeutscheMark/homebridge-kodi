import type { Characteristic, Perms, WithUUID } from 'homebridge';

export default function seasonepisode(DefaultCharacteristic: typeof Characteristic): WithUUID<new () => Characteristic> {
    return class SeasonEpisode extends DefaultCharacteristic {
        static readonly UUID = '1972fe3f-7fe6-4e30-acdf-951eb9aabb7a';

        constructor() {
            super('SeasonEpisode', SeasonEpisode.UUID, {
                format: 'string',
                perms: ['pr' as Perms, 'ev' as Perms],
            });
        }
    };
}
