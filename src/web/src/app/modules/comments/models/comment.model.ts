import {attributesKey} from '../../backbone/decorators/attributes-key.decorator';
import {nested} from '../../backbone/decorators/nested.decorator';
import {SoundcloudProxyModel} from '../../api/soundcloud/soundcloud-proxy.model';
import {AccountSoundcloudModel} from '../../api/account/account-soundcloud.model';

export class Comment extends SoundcloudProxyModel {
  endpoint = '/comments';

  @attributesKey('user')
  @nested()
  user: AccountSoundcloudModel;

  @attributesKey('timestamp')
  timestamp: number;

  @attributesKey('body')
  body: string;
}
