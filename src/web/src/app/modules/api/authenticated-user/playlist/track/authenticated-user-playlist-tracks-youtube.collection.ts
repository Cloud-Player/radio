import {AuthenticatedUserPlaylistTrackYoutubeModel} from './authenticated-user-playlist-track-youtube.model';
import {PlaylistTracksYoutubeCollection} from '../../../playlists/track/playlist-tracks-youtube.collection';
import {PlaylistTrackYoutubeModel} from '../../../playlists/track/playlist-track-youtube.model';
import {ITrackModelConstructor} from '../../../tracks/track.interface';

export class AuthenticatedUserPlaylistTracksYoutubeCollection<TModel extends AuthenticatedUserPlaylistTrackYoutubeModel>
  extends PlaylistTracksYoutubeCollection<PlaylistTrackYoutubeModel> {

  model: ITrackModelConstructor = AuthenticatedUserPlaylistTrackYoutubeModel;

  endpoint = '/search';

}
