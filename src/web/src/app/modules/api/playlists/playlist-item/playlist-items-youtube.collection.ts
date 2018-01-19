import {TracksYoutubeCollection} from '../../tracks/tracks-youtube.collection';
import {TrackYoutubeModel} from '../../tracks/track-youtube.model';
import {ITrack, ITrackModelConstructor} from '../../tracks/track.interface';
import {PlaylistItemYoutubeModel} from './playlist-item-youtube.model';
import {queryParam} from '../../../backbone/decorators/query-param.decorator';
import {YoutubeProxyCollection} from '../../youtube/youtube-proxy.collection';
import {YoutubeProxyModel} from '../../youtube/youtube-proxy.model';
import {IPlaylists} from '../playlists.interface';
import {IPlaylistItems} from './playlist-items.interface';
import {IPlaylistItem} from './playlist-item.interface';

export class PlaylistItemsYoutubeCollection<TModel extends PlaylistItemYoutubeModel>
  extends YoutubeProxyCollection<YoutubeProxyModel> implements IPlaylistItems<IPlaylistItem> {

  model = PlaylistItemYoutubeModel;

  @queryParam()
  part = 'snippet';

  private fetchTrackDetails() {
    const trackIds = [];
    this.pluck('track').forEach((track: ITrack) => {
      trackIds.push(track.id);
    });
    return this.getTrackDetails(trackIds);
  }

  setEndpoint(playlistId: number) {
    this.queryParams.playlistId = playlistId;
    this.endpoint = `/playlistItems`;
  }

  fetch(...args) {
    return super.fetch.apply(this, args).then(() => {
      this.fetchTrackDetails();
    });
  }

  public getTrackDetails(trackIds: Array<string>) {
    return TracksYoutubeCollection.getTrackDetails(trackIds).then((rsp: any) => {
      rsp.items.forEach((rspItem) => {
        const playlistItem = <PlaylistItemYoutubeModel>this.find((item: PlaylistItemYoutubeModel) => {
          return item.track.id === rspItem.id;
        });
        if (playlistItem) {
          playlistItem.track.set(playlistItem.track.parse(rspItem));
        }
      });
      return this;
    });
  }

}
