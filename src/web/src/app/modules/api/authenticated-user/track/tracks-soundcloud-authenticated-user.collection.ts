import {TrackSoundcloudAuthenticatedUserModel} from './track-soundcloud-authenticated-user.model';
import {TracksSoundcloudCollection} from '../../tracks/tracks-soundcloud.collection';
import {TrackSoundcloudModel} from '../../tracks/track-soundcloud.model';
import {ITrackModelConstructor} from '../../tracks/track.interface';

export class TracksSoundcloudAuthenticatedUserCollection<TModel extends TrackSoundcloudAuthenticatedUserModel>
  extends TracksSoundcloudCollection<TrackSoundcloudModel> {

  model: ITrackModelConstructor = TrackSoundcloudAuthenticatedUserModel;
  endpoint = '/me/tracks';

}
