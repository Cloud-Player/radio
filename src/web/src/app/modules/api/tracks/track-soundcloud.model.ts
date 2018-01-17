import {Comments} from '../../comments/collections/comments.collection';
import {attributesKey} from '../../backbone/decorators/attributes-key.decorator';
import {nested} from '../../backbone/decorators/nested.decorator';
import {Comment} from '../../comments/models/comment.model';
import {Globals} from '../../../../globals';
import {defaultValue} from '../../backbone/decorators/default-value.decorator';
import {SoundcloudProxyModel} from '../soundcloud/soundcloud-proxy.model';
import {ITrack} from './track.interface';
import {ImageSoundcloudModel} from '../image/image-soundcloud.model';
import {AccountSoundcloudModel} from '../account/account-soundcloud.model';

export class TrackSoundcloudModel extends SoundcloudProxyModel implements ITrack {
  endpoint = '/tracks';

  isLikeable = true;

  @attributesKey('provider_id')
  @defaultValue('soundcloud')
  provider: string;

  @attributesKey('user')
  @nested()
  artist: AccountSoundcloudModel;

  @attributesKey('artwork_url')
  @nested()
  image: ImageSoundcloudModel;

  @attributesKey('comments')
  @nested()
  comments: Comments<Comment>;

  @attributesKey('title')
  title: string;

  @attributesKey('duration')
  duration: number;

  @attributesKey('genre')
  genre: string;

  @attributesKey('created_at')
  createdAt: number;

  @attributesKey('likes')
  likes: number;

  @attributesKey('playback_count')
  clicks: number;

  @attributesKey('stream_url')
  streamUrl: string;

  @attributesKey('aspectRatio')
  @defaultValue(1)
  aspectRatio: number;

  getResourceUrl(): string {
    if (this.streamUrl) {
      return `${this.streamUrl}?client_id=${Globals.soundcloudClientId}`;
    } else {
      return `https://api.soundcloud.com/tracks/${this.id}/stream?client_id=${Globals.soundcloudClientId}`;
    }
  }

  parse(attrs: any) {
    attrs = super.parse(attrs);
    attrs.likes = attrs.likes_count || attrs.favoritings_count;
    return attrs;
  }

  public toMiniJSON() {
    const obj: any = {};
    obj.provider = this.provider;
    obj.id = this.id;
    obj.title = this.title;
    obj.duration = this.duration;
    obj.stream_url = this.streamUrl;
    obj.artwork_url = this.image.imageUrl;
    obj.user = this.artist.toJSON();

    return obj;
  }

  initialize(): void {
    if (this.id) {
      this.comments.setTrackId(this.id);
    }
    this.on('change:id', () => {
      this.comments.setTrackId(this.id);
    });
  }
}
