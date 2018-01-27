import {Injectable} from '@angular/core';
import {isObject, isString} from 'underscore';
import {IMessage, MessageMethodTypes, MessageService, MessageSubscription, MessageTypes} from './message.service';

@Injectable()
export class SocketMessagesService {
  private _socket: WebSocket;
  private _isOpened: boolean;

  constructor(private messageService: MessageService) {
  }

  private onOpen(event: Event) {
    this._isOpened = true;
    console.log('[SOCKET] Open');
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
  }

  private onClose(event: Event) {
    this._isOpened = false;
    console.warn('[SOCKET] Closed');
  }

  private onError(event: ErrorEvent) {
    console.error('[SOCKET] Error', event.error);
  }

  public init(socketUrl: string) {
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
}
