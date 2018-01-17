import {CloudplayerModel} from '../cloud-player/cloud-player.model';
import {IPlaylist} from './playlist.interface';
import {attributesKey} from '../../backbone/decorators/attributes-key.decorator';
import {defaultValue} from '../../backbone/decorators/default-value.decorator';
import {nested} from '../../backbone/decorators/nested.decorator';
import {dynamicInstance} from '../../backbone/decorators/dynamic-instance.decorator';
import {ITracks} from '../tracks/tracks.interface';
import {ITrack} from '../tracks/track.interface';
import {PlaylistTracksSoundcloudCollection} from './track/playlist-tracks-soundcloud.collection';
import {PlaylistTracksYoutubeCollection} from './track/playlist-tracks-youtube.collection';
import {PlaylistAccountCloudPlayerModel} from './account/playlist-account-cloudplayer.model';
import {ImageCloudplayerModel} from '../image/image-cloudplayer.model';
import {IPlaylistItem} from './playlist-item/playlist-item.interface';
import {IPlaylistItems} from './playlist-item/playlist-items.interface';
import {PlaylistItemsSoundcloudCollection} from './playlist-item/playlist-items-soundcloud.collection';
import {PlaylistItemsYoutubeCollection} from './playlist-item/playlist-items-youtube.collection';
import {PlaylistItemsCloudplayerCollection} from './playlist-item/playlist-items-cloudplayer.collection';
import {PlaylistItemCloudplayerModel} from './playlist-item/playlist-item-cloudplayer.model';

export class PlaylistCloudplayerModel extends CloudplayerModel implements IPlaylist {
  endpoint = '/playlist/cloudplayer';

  @attributesKey('provider')
  @defaultValue('cloudplayer')
  provider: string;

  @attributesKey('canEdit')
  @defaultValue(false)
  canEdit: boolean;

  @attributesKey('isPublic')
  @defaultValue(false)
  isPublic: boolean;

  @attributesKey('title')
  @defaultValue('')
  title: string;

  @attributesKey('user')
  @nested()
  artist: PlaylistAccountCloudPlayerModel;

  @attributesKey('image')
  @nested()
  image: ImageCloudplayerModel;

  @attributesKey('items')
  @nested()
  items: PlaylistItemsCloudplayerCollection<PlaylistItemCloudplayerModel>;

  parse(attributes) {
    delete attributes.items;
    return attributes;
  }

  initialize(): void {
    if (this.id) {
      this.items.setEndpoint(this.id);
    }
    this.on('change:id', () => {
      this.items.setEndpoint(this.id);
    });
    this.items.once('add', (item: IPlaylistItem) => {
      if (!this.image.getSmallSizeUrl()) {
        if (item.track.image.getSmallSizeUrl()) {
          this.image.small = item.track.image.getSmallSizeUrl();
        } else {
          item.track.image.on('change', () => {
            this.image.small = item.track.image.getSmallSizeUrl();
          });
        }
      }
    });
  }
}
