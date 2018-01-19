import {BaseModel} from '../../backbone/models/base.model';
import {ITrack} from '../tracks/track.interface';
import {ITracks} from '../tracks/tracks.interface';
import {IPlaylistAccount} from './account/playlist-account.interface';
import {IPlaylistItem} from './playlist-item/playlist-item.interface';
import {IPlaylistItems} from './playlist-item/playlist-items.interface';
import {AbstractImageModel} from '../image/abstract-image';

export interface IPlaylistModelConstructor {
  new(...args): IPlaylist;
}

export interface IPlaylist extends BaseModel {
  canEdit: boolean;
  title: string;
  artist: IPlaylistAccount;
  image: AbstractImageModel;
  isPublic: boolean;
  items: IPlaylistItems<IPlaylistItem>;
  provider: string;
}

