import {AuthenticatedUserPlaylistSoundcloudModel} from './authenticated-user-playlist-soundcloud.model';
import {PlaylistSoundcloudModel} from '../../playlists/playlist-soundcloud.model';
import {IPlaylistModelConstructor} from '../../playlists/playlist.interface';
import {nested} from '../../../backbone/decorators/nested.decorator';
import {attributesKey} from '../../../backbone/decorators/attributes-key.decorator';
import {TracksSoundcloudAuthenticatedUserCollection} from '../track/tracks-soundcloud-authenticated-user.collection';
import {TrackSoundcloudAuthenticatedUserModel} from '../track/track-soundcloud-authenticated-user.model';
import {PlaylistsSoundcloudCollection} from '../../playlists/playlists-soundcloud.collection';

export class AuthenticatedUserPlaylistsSoundcloudCollection<TModel extends AuthenticatedUserPlaylistSoundcloudModel>
  extends PlaylistsSoundcloudCollection<PlaylistSoundcloudModel> {

  endpoint = '/me/playlists';
  model: IPlaylistModelConstructor = AuthenticatedUserPlaylistSoundcloudModel;

  @attributesKey('tracks')
  @nested()
  tracks: TracksSoundcloudAuthenticatedUserCollection<TrackSoundcloudAuthenticatedUserModel>;
}
