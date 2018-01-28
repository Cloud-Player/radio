import {EventEmitter, Injectable} from '@angular/core';
import {isObject, isString} from 'underscore';
import {IMessage, MessageMethodTypes, MessageService, MessageSubscription, MessageTypes} from './message.service';
import {Observable} from 'rxjs/Observable';

export enum SocketStatusTypes {
  OPEN = 'OPEN',
  MESSAGE = 'MESSAGE',
  CLOSED = 'CLOSED',
  ERROR = 'ERROR'
}

export interface ISocketEvent {
  type: SocketStatusTypes;
  detail?: any;
}

@Injectable()
export class SocketMessagesService {
  private _socket: WebSocket;
  private _isOpened: boolean;
  private _observable: EventEmitter<ISocketEvent>;

  constructor(private messageService: MessageService) {
    this._observable = new EventEmitter();
  }

  private onOpen(event: Event) {
    console.log('[SOCKET] Open');
    this._isOpened = true;
    this._observable.emit({type: SocketStatusTypes.OPEN});
  }

  private onMessage(event: MessageEvent) {
    console.log('[SOCKET] Message', event);

    let jsonData;
    if (isString(event.data)) {
      jsonData = JSON.parse(event.data);
    } else if (isObject(event.data)) {
      jsonData = event.data;
    }

    this.messageService.handleMessage(MessageTypes.SOCKET, {
      channel: jsonData.channel,
      method: MessageMethodTypes[jsonData.method as keyof typeof MessageMethodTypes],
      body: jsonData.body
    });
    this._observable.emit({type: SocketStatusTypes.MESSAGE, detail: jsonData});
  }

  private onClose(event: Event) {
    console.warn('[SOCKET] Closed');
    this._isOpened = false;
    this._observable.emit({type: SocketStatusTypes.CLOSED});
  }

  private onError(event: ErrorEvent) {
    console.error('[SOCKET] Error', event.error);
    this._observable.emit({type: SocketStatusTypes.ERROR, detail: event.error});
  }

  public open(socketUrl: string) {
    if (this._isOpened) {
      this._socket.close();
    }
    this._socket = new WebSocket(socketUrl);
    this._socket.addEventListener('open', this.onOpen.bind(this));
    this._socket.addEventListener('message', this.onMessage.bind(this));
    this._socket.addEventListener('close', this.onClose.bind(this));
    this._socket.addEventListener('error', this.onError.bind(this));
  }

  public sendMessage(channelId: string, method: MessageMethodTypes, body: any) {
    if (this._isOpened) {
      const message: IMessage = {channel: channelId, method: method, body: body};
      this._socket.send(JSON.stringify(message));
    }
  }

  public subscribe(channelId: string, method: MessageMethodTypes, callback: Function): MessageSubscription {
    return this.messageService.subscribe(MessageTypes.SOCKET, channelId, method, callback);
  }

  public unSubscribe(channelId: string, method?: MessageMethodTypes, callback?: Function) {
    return this.messageService.unSubscribe(MessageTypes.SOCKET, channelId, method, callback);
  }

  public getObservable() {
    return this._observable;
  }
}
