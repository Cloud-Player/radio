import {SoundcloudProxyCollection} from '../soundcloud/soundcloud-proxy.collection';
import {ITracks} from './tracks.interface';
import {ITrackModelConstructor} from './track.interface';
import {TrackCloudplayerModel} from './track-cloudplayer.model';

export class TracksCloudplayerCollection<TModel extends TrackCloudplayerModel>
  extends SoundcloudProxyCollection<TModel> implements ITracks<TModel> {

  model: ITrackModelConstructor = TrackCloudplayerModel;

  endpoint = '/tracks';

  queryParams: {
    [key: string]: string | number | boolean
  } = {};
}
