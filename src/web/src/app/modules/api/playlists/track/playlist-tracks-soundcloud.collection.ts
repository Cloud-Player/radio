import {PlaylistTrackSoundcloudModel} from './playlist-track-soundcloud.model';
import {TracksSoundcloudCollection} from '../../tracks/tracks-soundcloud.collection';
import {TrackSoundcloudModel} from '../../tracks/track-soundcloud.model';
import {ITrackModelConstructor} from '../../tracks/track.interface';

export class PlaylistTracksSoundcloudCollection<TModel extends PlaylistTrackSoundcloudModel>
  extends TracksSoundcloudCollection<TrackSoundcloudModel> {

  model: ITrackModelConstructor = PlaylistTrackSoundcloudModel;

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

}
