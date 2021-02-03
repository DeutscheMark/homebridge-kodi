import type {
    Characteristic as CharacteristicClass,
    WithUUID,
} from 'homebridge';

import DefaultCharacteristicImport from './default-characteristic';
import TypeImport from './type';
import TitleImport from './title';
import PositionImport from './position';
import ShowTitleImport from './showtitle';
import SeasonEpisodeImport from './seasonepisode';
import ArtistImport from './artist';
import AlbumImport from './album';

export default function characteristic(Characteristic: typeof CharacteristicClass): Record<
    | 'Type'
    | 'Title'
    | 'Position'
    | 'ShowTitle'
    | 'SeasonEpisode'
    | 'Artist'
    | 'Album',
    WithUUID<new () => CharacteristicClass>
> {
    const DefaultCharacteristic = DefaultCharacteristicImport(Characteristic);

    return {
        Type: TypeImport(DefaultCharacteristic),
        Title: TitleImport(DefaultCharacteristic),
        Position: PositionImport(DefaultCharacteristic),
        ShowTitle: ShowTitleImport(DefaultCharacteristic),
        SeasonEpisode: SeasonEpisodeImport(DefaultCharacteristic),
        Artist: ArtistImport(DefaultCharacteristic),
        Album: AlbumImport(DefaultCharacteristic),
    };
}