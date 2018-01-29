import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {PlayQueue} from '../../../player/collections/play-queue';
import {PlayQueueItem} from '../../../player/models/play-queue-item';
import {IMessage, MessageMethodTypes, MessageTypes} from '../../../shared/services/message.service';
import {
  IWindowMessageEvent, WindowMessagesService,
  WindowMessageStatusTypes
} from '../../../shared/services/window-messages.service';
import {ISocketEvent, SocketMessagesService, SocketStatusTypes} from '../../../shared/services/socket-messages.service';
import {PlayQueueItemStatus} from '../../../player/src/playqueue-item-status.enum';
import {BaseCollection} from '../../../backbone/collections/base.collection';
import {BaseModel} from '../../../backbone/models/base.model';
import {attributesKey} from '../../../backbone/decorators/attributes-key.decorator';

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
  selector: 'app-cloud-radio',
  templateUrl: './main.template.html',
  styleUrls: ['./main.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit, AfterViewInit {
  private _socketReconnectTimer;
  public noise = 0;
  public volume = 0;
  public playQueue: PlayQueue<PlayQueueItem>;
  public noiseQueue: PlayQueue<PlayQueueItem>;
  public isLoading = false;
  public playerVolume = 100;
  public noiseVolume = 0;
  public showPlayer = false;
  public socketIsOpen = false;
  public socketUrl = 'localhost:8050/websocket';
  public socketRetryWait = 3000;
  public socketRetryProgress = 3000;
  public socketStatus;
  public messages: Messages<Message>;

  constructor(private windowMessagesService: WindowMessagesService, private socketMessagesService: SocketMessagesService) {
    this.playQueue = new PlayQueue();
    this.noiseQueue = new PlayQueue();
    this.noiseQueue.add({
      track: {id: 28907786, provider: 'soundcloud'}
    });
    this.messages = new Messages();
  }

  private onQueueChange(queue) {
    this.startLoading();
    this.playQueue.reset();
    this.playQueue.add(queue, {parse: true});
    this.playQueue.first().play();
  }

  private startLoading() {
    this.isLoading = true;
  }

  private stopLoading() {
    this.isLoading = false;
  }

  private setPlayerVolume() {
    this.noiseVolume = this.noise * (this.volume / 100);
    this.playerVolume = this.volume - this.noiseVolume;
  }

  private onVolumeChange(volume: number) {
    this.volume = volume;
    this.setPlayerVolume();
  }

  private onNoiseChange(noise: number) {
    this.noise = noise;
    this.setPlayerVolume();
  }

  private play() {
    const currentItem = this.playQueue.getCurrentItem();
    if (currentItem) {
      return currentItem.play();
    } else {
      Promise.reject('No current item found');
    }
  }

  private pause() {
    const playingItem = this.playQueue.getPlayingItem();
    if (playingItem) {
      return playingItem.pause();
    } else {
      return Promise.reject('No playing item found');
    }
  }

  private next() {
    if (this.playQueue.hasNextItem()) {
      return this.playQueue.getNextItem().play();
    } else {
      return Promise.reject('No next item found');
    }
  }

  private previous() {
    if (this.playQueue.hasPreviousItem()) {
      return this.playQueue.getPreviousItem().play();
    } else {
      return Promise.reject('No previous item found');
    }
  }

  private onPlayerStateChange(state) {
    switch (state.toUpperCase()) {
      case 'PLAY':
        this.play();
        break;
      case 'PAUSE':
        this.pause();
        break;
      case 'NEXT':
        this.next();
        break;
      case 'PREVIOUS':
        this.previous();
        break;
    }
  }

  private reconnect() {
    this.socketStatus = 'SOCKET_OPEN_RETRY';
    this._socketReconnectTimer = setInterval(() => {
      if (this.socketRetryProgress > 0) {
        this.socketRetryProgress -= 1000;
      } else {
        this.stopRetry();
        this.openSocket();
      }
    }, 1000);
  }

  private logMessage(direction: MessageDirection, type: MessageTypes, message: IMessage) {
    const logMessage = new Message();
    logMessage.direction = direction;
    logMessage.type = type;
    logMessage.message = JSON.stringify(message, null, 4);
    this.messages.add(logMessage, {at: 0});
  }

  public openSocket() {
    this.socketStatus = 'SOCKET_TRY_OPEN';
    this.socketIsOpen = false;
    this.socketMessagesService.open(`ws://${this.socketUrl}`);
  }

  public stopRetry() {
    this.socketStatus = 'SOCKET_WAITING';
    this.socketRetryProgress = this.socketRetryWait;
    clearInterval(this._socketReconnectTimer);
  }

  ngOnInit(): void {
    this.playQueue.on('change:status', (item: PlayQueueItem) => {
      if (item.status === PlayQueueItemStatus.RequestedPlaying) {
        this.startLoading();
      }
      if (item.status === PlayQueueItemStatus.Playing) {
        this.socketMessagesService.sendMessage('queue_item', MessageMethodTypes.PUT, {
          track_id: item.track.id,
          track_provider_id: item.track.provider
        });
        this.stopLoading();
      }
    });

    this.windowMessagesService.subscribe('queue', MessageMethodTypes.PUT, this.onQueueChange.bind(this));
    this.windowMessagesService.subscribe('playerState', MessageMethodTypes.PUT, this.onPlayerStateChange.bind(this));
    this.windowMessagesService.subscribe('volume', MessageMethodTypes.PUT, this.onVolumeChange.bind(this));
    this.windowMessagesService.subscribe('noise', MessageMethodTypes.PUT, this.onNoiseChange.bind(this));

    this.windowMessagesService.getObservable()
      .filter(socketEvent => socketEvent.type === WindowMessageStatusTypes.MESSAGE)
      .subscribe((socketEvent: IWindowMessageEvent) => {
        this.logMessage(MessageDirection.IN, MessageTypes.WINDOW_MESSAGE, socketEvent.detail);
      });

    this.socketMessagesService.subscribe('queue', MessageMethodTypes.PUT, this.onQueueChange.bind(this));
    this.socketMessagesService.subscribe('playerState', MessageMethodTypes.PUT, this.onPlayerStateChange.bind(this));
    this.socketMessagesService.subscribe('volume', MessageMethodTypes.PUT, this.onVolumeChange.bind(this));
    this.socketMessagesService.subscribe('noise', MessageMethodTypes.PUT, this.onNoiseChange.bind(this));

    this.socketMessagesService.getObservable()
      .filter(socketEvent => socketEvent.type === SocketStatusTypes.CLOSED)
      .subscribe(() => {
        this.socketStatus = 'SOCKET_CLOSED';
        this.reconnect();
      });

    this.socketMessagesService.getObservable()
      .filter(socketEvent => socketEvent.type === SocketStatusTypes.OPEN)
      .subscribe(() => {
        this.stopRetry();
        this.socketStatus = 'SOCKET_OPEN';
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

    this.openSocket();
  }

  ngAfterViewInit(): void {
    this.noiseQueue.first().play();
  }
}
