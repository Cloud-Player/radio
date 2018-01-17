import {BaseModel} from '../../backbone/models/base.model';
import {ITracks} from '../tracks/tracks.interface';
import {IPlaylists} from '../playlists/playlists.interface';
import {IPlaylist} from '../playlists/playlist.interface';
import {ITrack} from '../tracks/track.interface';
import {AbstractImageModel} from '../image/abstract-image';

export interface IAccount extends BaseModel {
  endpoint: string;
  image: AbstractImageModel;
  provider: string;
  playlists: IPlaylists<IPlaylist>;
  tracks: ITracks<ITrack>;

  getFullName(): string;
}
