import { Formats, Perms } from 'hap-nodejs';
import type { Characteristic, WithUUID } from 'homebridge';

export default function position(DefaultCharacteristic: typeof Characteristic): WithUUID<new () => Characteristic> {
    return class Position extends DefaultCharacteristic {
        static readonly UUID = 'cf1c85ad-ba54-48e8-9681-255278976584';

        constructor() {
            super('Position', Position.UUID, {
                format: Formats.STRING,
                perms: [Perms.PAIRED_READ, Perms.NOTIFY],
            });
        }
    };
}