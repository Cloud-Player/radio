import {TracksYoutubeCollection} from '../../tracks/tracks-youtube.collection';
import {TrackYoutubeAuthenticatedUserModel} from './track-youtube-authenticated-user.model';
import {TrackYoutubeModel} from '../../tracks/track-youtube.model';
import {ITrackModelConstructor} from '../../tracks/track.interface';

export class TracksYoutubeAuthenticatedUserCollection<TModel extends TrackYoutubeAuthenticatedUserModel>
  extends TracksYoutubeCollection<TrackYoutubeModel> {

  model: ITrackModelConstructor = TrackYoutubeAuthenticatedUserModel;
  endpoint = '/search';

}
