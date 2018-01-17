import {TrackSoundcloudModel} from '../../tracks/track-soundcloud.model';
import {PlaylistTracksSoundcloudCollection} from './playlist-tracks-soundcloud.collection';

export class PlaylistTrackSoundcloudModel extends TrackSoundcloudModel {

  collection: PlaylistTracksSoundcloudCollection<PlaylistTrackSoundcloudModel>;

  setEndpoint(playlistId: number) {
    this.endpoint = `/playlists/${playlistId}`;
  }

  destroy() {
    if (this.collection) {
      const collection = this.collection;
      collection.remove(this);
      collection.triggerSave(this);
    }
  }

  save() {
    if (this.collection) {
      this.collection.add(this.toJSON(), {merge: true});
      this.collection.triggerSave(this);
    }
  }

}
