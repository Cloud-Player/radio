import {Injectable} from '@angular/core';
import {isObject, isString} from 'underscore';
import {IMessage, MessageMethodTypes, MessageService, MessageSubscription, MessageTypes} from './message.service';

@Injectable()
export class WindowMessagesService {
  public static emitAppEvent(message: IMessage) {
    const ev = new CustomEvent('appMessage', {
      detail: JSON.stringify(message)
    });
    window.dispatchEvent(ev);
  }

  constructor(private messageService: MessageService) {
    window.addEventListener('appMessage', this.onMessage.bind(this));
  }

  private onMessage(event: CustomEvent) {
    let jsonData;
    if (isString(event.detail)) {
      jsonData = JSON.parse(event.detail);
    } else if (isObject(event.detail)) {
      jsonData = event.detail;
    }
    this.messageService.handleMessage(MessageTypes.WINDOW_MESSAGE, {
      channel: jsonData.channel,
      method: MessageMethodTypes[jsonData.method as keyof typeof MessageMethodTypes],
      body: jsonData.body
    });
  }

  public sendMessage(channelId: string, method: MessageMethodTypes, body: any) {
    const message: IMessage = {channel: channelId, method: method, body: body};
    WindowMessagesService.emitAppEvent(message);
  }

  public subscribe(channelId: string, method: MessageMethodTypes, callback: Function): MessageSubscription {
    return this.messageService.subscribe(MessageTypes.WINDOW_MESSAGE, channelId, method, callback);
  }

  public unSubscribe(channelId: string, method?: MessageMethodTypes, callback?: Function) {
    return this.messageService.unSubscribe(MessageTypes.WINDOW_MESSAGE, channelId, method, callback);
  }
}
