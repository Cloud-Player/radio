import {IAuthenticatedUserAccount} from './authenticated-user-account.interface';
import {dynamicInstance} from '../../../backbone/decorators/dynamic-instance.decorator';
import {CloudplayerCollection} from '../../cloud-player/cloud-player.collection';
import {AuthenticatedUserAccountCloudplayerModel} from './authenticated-user-account-cloudplayer.model';
import {AuthenticatedUserAccountYoutubeModel} from './authenticated-user-account-youtube.model';
import {AuthenticatedUserAccountSoundcloudModel} from './authenticated-user-account-soundcloud.model';
import {AccountsCollection} from '../../account/accounts.collection';
import {IAccount} from '../../account/account.interface';

export class AuthenticatedUserAccountsCollection<TModel extends IAuthenticatedUserAccount>
  extends AccountsCollection<TModel> {

  endpoint = '/account';

  @dynamicInstance({
    identifierKey: 'provider_id',
    identifierKeyValueMap: {
      cloudplayer: AuthenticatedUserAccountCloudplayerModel,
      youtube: AuthenticatedUserAccountYoutubeModel,
      soundcloud: AuthenticatedUserAccountSoundcloudModel
    }
  })
  model = AuthenticatedUserAccountSoundcloudModel;

  initialize() {
    [
      AuthenticatedUserAccountCloudplayerModel,
      AuthenticatedUserAccountSoundcloudModel,
      AuthenticatedUserAccountYoutubeModel
    ].forEach((account) => {
      const tmpAccountModel: IAccount = new account({tmp: 1});
      this.add(tmpAccountModel);
      this.on('add', (addedAccount: IAccount) => {
        if (addedAccount.provider === tmpAccountModel.provider) {
          const addedAccountJSON = addedAccount.toJSON();
          this.remove(addedAccount, {silent: true});
          tmpAccountModel.set(addedAccountJSON);
        }
      });
    });
  }

}
