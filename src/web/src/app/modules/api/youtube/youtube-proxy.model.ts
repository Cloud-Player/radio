import {CloudplayerModel} from '../cloud-player/cloud-player.model';
import {ModelSaveOptions} from 'backbone';

export class YoutubeProxyModel extends CloudplayerModel {
  url = (...args): string => {
    const id = this.get(this.idAttribute);
    this.set(this.idAttribute, null, {silent: true});
    const superCall = CloudplayerModel.prototype.url.apply(this, args);
    this.set(this.idAttribute, id, {silent: true});
    return superCall;
  };

  basePath() {
    return '/proxy/youtube';
  }

  sync(method: string, model: any, options: any = {}) {
    const id = model.get(model.idAttribute);
    model.queryParams.id = id;
    const superCall = super.sync.call(this, method, model, options);
    delete model.queryParams.id;
    return superCall;
  }

  save(attributes?: any, options?: ModelSaveOptions): Promise<any> {
    options.patch = false;
    return super.save.call(this, attributes, options);
  }
}
