import {BaseModel} from '../../backbone/models/base.model';
import {AbstractImageModel} from '../image/abstract-image';
import {IAccount} from '../account/account.interface';

export interface ITrackModelConstructor {
  new(...args): ITrack;
}

export interface ITrack extends BaseModel {
  provider: string;
  artist: IAccount;
  image: AbstractImageModel;
  title: string;
  duration: number;
  genre: string;
  createdAt: number;
  likes: number;
  clicks: number;
  aspectRatio: number;
  isLikeable: boolean;

  toMiniJSON(): {};
}

