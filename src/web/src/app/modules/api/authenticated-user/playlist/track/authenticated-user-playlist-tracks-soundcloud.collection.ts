import {AuthenticatedUserPlaylistTrackSoundcloudModel} from './authenticated-user-playlist-track-soundcloud.model';
import {PlaylistTrackSoundcloudModel} from '../../../playlists/track/playlist-track-soundcloud.model';
import {PlaylistTracksSoundcloudCollection} from '../../../playlists/track/playlist-tracks-soundcloud.collection';
import {ITrackModelConstructor} from '../../../tracks/track.interface';

export class AuthenticatedUserPlaylistTracksSoundcloudCollection<TModel extends AuthenticatedUserPlaylistTrackSoundcloudModel>
  extends PlaylistTracksSoundcloudCollection<PlaylistTrackSoundcloudModel> {

  model: ITrackModelConstructor = AuthenticatedUserPlaylistTrackSoundcloudModel;

  setEndpoint(playlistId: number) {
    this.endpoint = `/me/playlists/${playlistId}`;
  }

}
