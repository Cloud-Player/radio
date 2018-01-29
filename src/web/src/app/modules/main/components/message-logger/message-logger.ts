import {Component, OnInit} from '@angular/core';
import {IMessage, MessageTypes} from '../../../shared/services/message.service';
import {
  IWindowMessageEvent,
  WindowMessagesService,
  WindowMessageStatusTypes
} from '../../../shared/services/window-messages.service';
import {ISocketEvent, SocketMessagesService, SocketStatusTypes} from '../../../shared/services/socket-messages.service';
import {attributesKey} from '../../../backbone/decorators/attributes-key.decorator';
import {BaseModel} from '../../../backbone/models/base.model';
import {BaseCollection} from '../../../backbone/collections/base.collection';

enum MessageDirection {
  IN = 'IN',
  OUT = 'OUT'
}

class Message extends BaseModel {
  @attributesKey('timestamp')
  timestamp: Date;

  @attributesKey('direction')
  direction: MessageDirection;

  @attributesKey('message')
  message: string;

  @attributesKey('type')
  type: MessageTypes;

  public isOutgoing() {
    return this.direction === MessageDirection.OUT;
  }

  public isIncoming() {
    return this.direction === MessageDirection.IN;
  }

  initialize() {
    this.timestamp = new Date();
  }
}

class Messages<TModel extends Message> extends BaseCollection<BaseModel> {
  model = Message;
}

@Component({
  selector: 'app-message-logger',
  templateUrl: './message-logger.html',
  styleUrls: ['./message-logger.scss']
})
export class MessageLoggerComponent implements OnInit {
  public messages: Messages<Message>;

  constructor(private windowMessagesService: WindowMessagesService, private socketMessagesService: SocketMessagesService) {
    this.messages = new Messages();
  }

  private logMessage(direction: MessageDirection, type: MessageTypes, message: IMessage) {
    const logMessage = new Message();
    logMessage.direction = direction;
    logMessage.type = type;
    logMessage.message = JSON.stringify(message, null, 4);
    this.messages.add(logMessage, {at: 0});
  }

  ngOnInit(): void {
    this.windowMessagesService.getObservable()
      .filter(socketEvent => socketEvent.type === WindowMessageStatusTypes.MESSAGE)
      .subscribe((socketEvent: IWindowMessageEvent) => {
        this.logMessage(MessageDirection.IN, MessageTypes.WINDOW_MESSAGE, socketEvent.detail);
      });

    this.socketMessagesService.getObservable()
      .filter(socketEvent => socketEvent.type === SocketStatusTypes.MESSAGE)
      .subscribe((socketEvent: ISocketEvent) => {
        this.logMessage(MessageDirection.IN, MessageTypes.SOCKET, socketEvent.detail);
      });

    this.socketMessagesService.getObservable()
      .filter(socketEvent => socketEvent.type === SocketStatusTypes.SEND_MESSAGE)
      .subscribe((socketEvent: ISocketEvent) => {
        this.logMessage(MessageDirection.OUT, MessageTypes.SOCKET, socketEvent.detail);
      });
  }
}
