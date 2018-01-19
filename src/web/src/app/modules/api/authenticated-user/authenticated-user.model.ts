import {CloudplayerModel} from '../cloud-player/cloud-player.model';
import {attributesKey} from '../../backbone/decorators/attributes-key.decorator';
import {nested} from '../../backbone/decorators/nested.decorator';
import {AuthenticatedUserAccountsCollection} from './account/authenticated-user-accounts.collection';
import {IAuthenticatedUserAccount} from './account/authenticated-user-account.interface';
import {AuthenticatedUserAccountCloudplayerModel} from './account/authenticated-user-account-cloudplayer.model';
import {AuthenticatedUserAccountSoundcloudModel} from './account/authenticated-user-account-soundcloud.model';
import {AuthenticatedUserAccountYoutubeModel} from './account/authenticated-user-account-youtube.model';
import {IAccount} from '../account/account.interface';

export class AuthenticatedUserModel extends CloudplayerModel {
  private static instance: AuthenticatedUserModel;

  endpoint = '/user';

  @attributesKey('accounts')
  @nested()
  public accounts: AuthenticatedUserAccountsCollection<IAuthenticatedUserAccount>;

  static getInstance(): AuthenticatedUserModel {
    if (!AuthenticatedUserModel.instance) {
      AuthenticatedUserModel.instance = new AuthenticatedUserModel();
    }
    return AuthenticatedUserModel.instance;
  }

  initialize() {
    this.set('id', 'me');
  }
}


