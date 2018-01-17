import {PlaylistItemSoundcloudModel} from './playlist-item-soundcloud.model';
import {TracksSoundcloudCollection} from '../../tracks/tracks-soundcloud.collection';
import {TrackSoundcloudModel} from '../../tracks/track-soundcloud.model';
import {ITrack, ITrackModelConstructor} from '../../tracks/track.interface';
import {SoundcloudProxyModel} from '../../soundcloud/soundcloud-proxy.model';
import {SoundcloudProxyCollection} from '../../soundcloud/soundcloud-proxy.collection';
import {IPlaylistItem} from './playlist-item.interface';
import {IPlaylistItems} from './playlist-items.interface';
import {PlaylistItemYoutubeModel} from './playlist-item-youtube.model';
import {TracksYoutubeCollection} from '../../tracks/tracks-youtube.collection';

export class PlaylistItemsSoundcloudCollection<TModel extends PlaylistItemSoundcloudModel>
  extends SoundcloudProxyCollection<SoundcloudProxyModel> implements IPlaylistItems<IPlaylistItem>{

  model = PlaylistItemSoundcloudModel;

  private fetchTrackDetails() {
    const trackIds = [];
    this.pluck('track').forEach((track: ITrack) => {
      trackIds.push(track.id);
    });
    return this.getTrackDetails(trackIds);
  }

  parse(attrs: any) {
    return attrs.tracks;
  }

  create(track: TModel): TModel {
    this.add(track);
    this.triggerSave(track);
    return track;
  }

  triggerSave(track: TModel) {
    this.trigger('save', track, this);
  }

  setEndpoint(playlistId: number) {
    this.endpoint = `/playlists/${playlistId}`;
  }

  public getTrackDetails(trackIds: Array<string>) {
    return TracksSoundcloudCollection.getTrackDetails(trackIds).then((rsp: any) => {
      rsp.forEach((rspItem) => {
        const playlistItem = <PlaylistItemSoundcloudModel>this.find((item: PlaylistItemSoundcloudModel) => {
          return item.track.id.toString() === rspItem.id.toString();
        });
        if (playlistItem) {
          playlistItem.track.set(playlistItem.track.parse(rspItem));
        }
      });
      return this;
    });
  }

}
