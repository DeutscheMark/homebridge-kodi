import { Formats, Perms } from 'hap-nodejs';
import type { Characteristic, WithUUID } from 'homebridge';

export default function showtitle(DefaultCharacteristic: typeof Characteristic): WithUUID<new () => Characteristic> {
    return class ShowTitle extends DefaultCharacteristic {
        static readonly UUID = '939cbbc9-382f-4574-903f-649ffbc24a1d';

        constructor() {
            super('ShowTitle', ShowTitle.UUID, {
                format: Formats.STRING,
                perms: [Perms.PAIRED_READ, Perms.NOTIFY],
            });
        }
    };
}