import {TracksYoutubeCollection} from '../../tracks/tracks-youtube.collection';
import {TrackYoutubeModel} from '../../tracks/track-youtube.model';
import {ITrackModelConstructor} from '../../tracks/track.interface';
import {PlaylistTrackYoutubeModel} from './playlist-track-youtube.model';
import {queryParam} from '../../../backbone/decorators/query-param.decorator';

export class PlaylistTracksYoutubeCollection<TModel extends PlaylistTrackYoutubeModel>
  extends TracksYoutubeCollection<TrackYoutubeModel> {

  model: ITrackModelConstructor = PlaylistTrackYoutubeModel;

  @queryParam()
  part = 'snippet';

  setEndpoint(playlistId: number) {
    this.queryParams.playlistId = playlistId;
    this.endpoint = `/playlistItems`;
  }

}
