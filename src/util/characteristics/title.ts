import { Formats, Perms } from 'hap-nodejs';
import type { Characteristic, WithUUID } from 'homebridge';

export default function title(DefaultCharacteristic: typeof Characteristic): WithUUID<new () => Characteristic> {
    return class Title extends DefaultCharacteristic {
        static readonly UUID = '74341e3c-271d-4f3c-b84e-595b804b1f90';

        constructor() {
            super('Title', Title.UUID, {
                format: Formats.STRING,
                perms: [Perms.PAIRED_READ, Perms.NOTIFY],
            });
        }
    };
}