import {PlaylistTrackSoundcloudModel} from '../../../playlists/track/playlist-track-soundcloud.model';

export class AuthenticatedUserPlaylistTrackSoundcloudModel extends PlaylistTrackSoundcloudModel {

  setEndpoint(playlistId: number) {
    this.endpoint = `/me/playlists/${playlistId}`;
  }

}
