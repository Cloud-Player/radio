import {PlaylistSoundcloudModel} from '../../playlists/playlist-soundcloud.model';
import {AuthenticatedUserPlaylistTracksSoundcloudCollection} from './track/authenticated-user-playlist-tracks-soundcloud.collection';
import {attributesKey} from '../../../backbone/decorators/attributes-key.decorator';
import {nested} from '../../../backbone/decorators/nested.decorator';
import {AuthenticatedUserPlaylistTrackSoundcloudModel} from './track/authenticated-user-playlist-track-soundcloud.model';
import {PlaylistItemsSoundcloudCollection} from '../../playlists/playlist-item/playlist-items-soundcloud.collection';
import {PlaylistItemSoundcloudModel} from '../../playlists/playlist-item/playlist-item-soundcloud.model';
import {defaultValue} from '../../../backbone/decorators/default-value.decorator';

export class AuthenticatedUserPlaylistSoundcloudModel
  extends PlaylistSoundcloudModel {

  endpoint = '/me/playlists';

  @attributesKey('canEdit')
  @defaultValue(true)
  canEdit: boolean;

  @attributesKey('items')
  @nested()
  items: PlaylistItemsSoundcloudCollection<PlaylistItemSoundcloudModel>;
}
