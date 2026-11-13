import type { Characteristic, Perms, WithUUID } from 'homebridge';

export default function album(DefaultCharacteristic: typeof Characteristic): WithUUID<new () => Characteristic> {
    return class Album extends DefaultCharacteristic {
        static readonly UUID = 'ffcdb20b-bf68-4018-a0be-8bac52bf4fdd';

        constructor() {
            super('Album', Album.UUID, {
                format: 'string',
                perms: ['pr' as Perms, 'ev' as Perms],
            });
        }
    };
}
