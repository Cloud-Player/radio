import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PlayQueue} from '../../../player/collections/play-queue';
import {PlayQueueItem} from '../../../player/models/play-queue-item';
import {MessageMethodTypes} from '../../../shared/services/message.service';
import {WindowMessagesService} from '../../../shared/services/window-messages.service';
import {SocketMessagesService} from '../../../shared/services/socket-messages.service';
import {PlayQueueItemStatus} from '../../../player/src/playqueue-item-status.enum';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.html',
  styleUrls: ['./radio.scss'],
})
export class RadioComponent implements OnInit, AfterViewInit {
  public playQueue: PlayQueue<PlayQueueItem>;
  public noiseQueue: PlayQueue<PlayQueueItem>;
  public noise = 0;
  public volume = 0;
  public isLoading = false;
  public playerVolume = 100;
  public noiseVolume = 0;

  @Input()
  showPlayer: boolean;

  @Output()
  loadingChange: EventEmitter<boolean>;

  constructor(private windowMessagesService: WindowMessagesService, private socketMessagesService: SocketMessagesService) {
    this.playQueue = new PlayQueue();
    this.noiseQueue = new PlayQueue();
    this.noiseQueue.add({
      track: {id: 28907786, provider: 'soundcloud'}
    });
    this.loadingChange = new EventEmitter();
  }

  private onQueueChange(queue) {
    this.startLoading();
    this.playQueue.reset();
    this.playQueue.add(queue, {parse: true});
    this.playQueue.first().play();
  }

  private startLoading() {
    console.warn('START LOADING');
    this.isLoading = true;
    this.loadingChange.emit(true);
  }

  private stopLoading() {
    this.isLoading = false;
    this.loadingChange.emit(false);
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

  public getProgress() {
    const playingItem = this.playQueue.getPlayingItem();
    if (playingItem) {
      return Math.round((playingItem.progress / playingItem.duration) * 100);
    }
  }

  ngOnInit() {
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

    this.socketMessagesService.subscribe('queue', MessageMethodTypes.PUT, this.onQueueChange.bind(this));
    this.socketMessagesService.subscribe('playerState', MessageMethodTypes.PUT, this.onPlayerStateChange.bind(this));
    this.socketMessagesService.subscribe('volume', MessageMethodTypes.PUT, this.onVolumeChange.bind(this));
    this.socketMessagesService.subscribe('noise', MessageMethodTypes.PUT, this.onNoiseChange.bind(this));
  }

  ngAfterViewInit(): void {
    this.noiseQueue.first().play();
  }
}
