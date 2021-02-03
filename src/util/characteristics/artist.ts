import { Formats, Perms } from 'hap-nodejs';
import type { Characteristic, WithUUID } from 'homebridge';

export default function artist(DefaultCharacteristic: typeof Characteristic): WithUUID<new () => Characteristic> {
    return class Artist extends DefaultCharacteristic {
        static readonly UUID = 'f784b287-bf4b-4256-8ba2-9dfe7070ea16';

        constructor() {
            super('Artist', Artist.UUID, {
                format: Formats.STRING,
                perms: [Perms.PAIRED_READ, Perms.NOTIFY],
            });
        }
    };
}