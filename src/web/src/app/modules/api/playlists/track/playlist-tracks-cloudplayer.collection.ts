import {TracksCloudplayerCollection} from '../../tracks/tracks-cloudplayer.collection';
import {TrackCloudplayerModel} from '../../tracks/track-cloudplayer.model';
import {ITrackModelConstructor} from '../../tracks/track.interface';
import {PlaylistTrackCloudplayerModel} from './playlist-track-cloudplayer.model';

export class PlaylistTracksCloudplayerCollection<TModel extends PlaylistTrackCloudplayerModel>
  extends TracksCloudplayerCollection<TrackCloudplayerModel> {

  model: ITrackModelConstructor = PlaylistTrackCloudplayerModel;
  endpoint = '/tracks';

}
