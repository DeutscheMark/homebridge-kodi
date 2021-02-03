import { Formats, Perms } from 'hap-nodejs';
import type { Characteristic, WithUUID } from 'homebridge';

export default function album(DefaultCharacteristic: typeof Characteristic): WithUUID<new () => Characteristic> {
    return class Album extends DefaultCharacteristic {
        static readonly UUID = 'ffcdb20b-bf68-4018-a0be-8bac52bf4fdd';

        constructor() {
            super('Album', Album.UUID, {
                format: Formats.STRING,
                perms: [Perms.PAIRED_READ, Perms.NOTIFY],
            });
        }
    };
}