import {IAccount} from './account.interface';
import {attributesKey} from '../../backbone/decorators/attributes-key.decorator';
import {nested} from '../../backbone/decorators/nested.decorator';
import {defaultValue} from '../../backbone/decorators/default-value.decorator';
import {CloudplayerModel} from '../cloud-player/cloud-player.model';
import {TracksCloudplayerCollection} from '../tracks/tracks-cloudplayer.collection';
import {TrackCloudplayerModel} from '../tracks/track-cloudplayer.model';
import {ImageCloudplayerModel} from '../image/image-cloudplayer.model';
import {AuthenticatedUserPlaylistsCloudplayerCollection} from '../authenticated-user/playlist/authenticated-user-playlists-cloudplayer.collection';
import {AuthenticatedUserPlaylistCloudplayerModel} from '../authenticated-user/playlist/authenticated-user-playlist-cloudplayer.model';

export class AccountCloudplayerModel extends CloudplayerModel implements IAccount {

  endpoint = '/account';

  @attributesKey('provider_id')
  @defaultValue('cloudplayer')
  provider: string;

  @attributesKey('image')
  @nested()
  image: ImageCloudplayerModel;

  @attributesKey('title')
  @defaultValue('')
  title: string;

  @attributesKey('playlists')
  @nested()
  playlists: AuthenticatedUserPlaylistsCloudplayerCollection<AuthenticatedUserPlaylistCloudplayerModel>;

  @attributesKey('tracks')
  @nested()
  tracks: TracksCloudplayerCollection<TrackCloudplayerModel>;

  getFullName(): string {
    return this.title;
  }
}
