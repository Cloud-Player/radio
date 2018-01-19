import {TrackCloudplayerModel} from '../../tracks/track-cloudplayer.model';
import {CloudplayerModel} from '../../cloud-player/cloud-player.model';
import {IPlaylistItem} from './playlist-item.interface';
import {attributesKey} from '../../../backbone/decorators/attributes-key.decorator';
import {nested} from '../../../backbone/decorators/nested.decorator';
import {dynamicInstance} from '../../../backbone/decorators/dynamic-instance.decorator';
import {TrackSoundcloudModel} from '../../tracks/track-soundcloud.model';
import {TrackYoutubeModel} from '../../tracks/track-youtube.model';

export class PlaylistItemCloudplayerModel
  extends CloudplayerModel implements IPlaylistItem {

  endpoint = '/tracks';

  @attributesKey('track')
  @dynamicInstance({
    identifierKey: 'provider_id',
    identifierKeyValueMap: {
      soundcloud: TrackSoundcloudModel,
      youtube: TrackYoutubeModel
    }
  })
  track: TrackCloudplayerModel;

  parse(attributes) {
    const parsedTrack = {
      id: attributes.track_id,
      provider_id: attributes.track_provider_id
    };
    delete attributes.track_id;
    delete attributes.track_provider_id;
    attributes.track = parsedTrack;
    return attributes;
  }

}
