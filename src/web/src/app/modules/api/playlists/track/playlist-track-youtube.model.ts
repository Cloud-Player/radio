import {TrackYoutubeModel} from '../../tracks/track-youtube.model';

export class PlaylistTrackYoutubeModel extends TrackYoutubeModel {
  setEndpoint(playlistId: number) {
    this.queryParams.playlistId = playlistId;
    this.endpoint = `/playlistItems`;
  }

  parse(attributes: any) {
    if (attributes.snippet) {
      if (attributes.snippet.resourceId) {
        attributes.videoId = attributes.snippet.resourceId.videoId;
      }
    }
    return super.parse.call(this, attributes);
  }
}
