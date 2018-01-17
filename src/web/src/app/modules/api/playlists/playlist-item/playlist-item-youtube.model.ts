import {TrackYoutubeModel} from '../../tracks/track-youtube.model';
import {IPlaylistItem} from './playlist-item.interface';
import {attributesKey} from '../../../backbone/decorators/attributes-key.decorator';
import {nested} from '../../../backbone/decorators/nested.decorator';
import {YoutubeProxyModel} from '../../youtube/youtube-proxy.model';

export class PlaylistItemYoutubeModel
  extends YoutubeProxyModel implements IPlaylistItem {

  @attributesKey('track')
  @nested()
  track: TrackYoutubeModel;

  setEndpoint(playlistId: number) {
    this.queryParams.playlistId = playlistId;
    this.endpoint = `/playlistItems`;
  }

  parse(attributes: any) {
    const parsedPlaylistItem: any = {
      id: attributes.id
    };
    if (attributes.snippet) {
      parsedPlaylistItem.title = attributes.snippet.title;
      if (attributes.snippet.resourceId) {
        parsedPlaylistItem.track = {
          id: attributes.snippet.resourceId.videoId,
          title: attributes.snippet.title
        };
      }
    }
    return parsedPlaylistItem;
  }
}
