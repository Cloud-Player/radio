import {TrackCloudplayerAuthenticatedUserModel} from './track-cloudplayer-authenticated-user.model';
import {TracksCloudplayerCollection} from '../../tracks/tracks-cloudplayer.collection';
import {TrackCloudplayerModel} from '../../tracks/track-cloudplayer.model';
import {ITrackModelConstructor} from '../../tracks/track.interface';

export class TracksCloudplayerAuthenticatedUserCollection<TModel extends TrackCloudplayerAuthenticatedUserModel>
  extends TracksCloudplayerCollection<TrackCloudplayerModel> {

  model: ITrackModelConstructor = TrackCloudplayerAuthenticatedUserModel;
  endpoint = '/tracks';

}
