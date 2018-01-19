import {AuthenticatedUserPlaylistTrackCloudplayerModel} from './authenticated-user-playlist-track-cloudplayer.model';
import {PlaylistTracksCloudplayerCollection} from '../../../playlists/track/playlist-tracks-cloudplayer.collection';
import {PlaylistTrackCloudplayerModel} from '../../../playlists/track/playlist-track-cloudplayer.model';
import {ITrackModelConstructor} from '../../../tracks/track.interface';

export class AuthenticatedUserPlaylistTracksCloudplayerCollection<TModel extends AuthenticatedUserPlaylistTrackCloudplayerModel>
  extends PlaylistTracksCloudplayerCollection<PlaylistTrackCloudplayerModel> {

  model: ITrackModelConstructor = AuthenticatedUserPlaylistTrackCloudplayerModel;
  endpoint = '/tracks';

}
