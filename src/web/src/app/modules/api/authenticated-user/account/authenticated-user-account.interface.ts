import {IAccount} from '../../account/account.interface';
import {IPlaylist} from '../../playlists/playlist.interface';

export interface IAuthenticatedUserAccount extends IAccount {
  loginUrl: string;

  createNewPlaylist(title: string, isPublic: boolean): Promise<IPlaylist>;
}
