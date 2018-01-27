import {AfterViewInit, Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {PlayQueue} from '../../../player/collections/play-queue';
import {PlayQueueItem} from '../../../player/models/play-queue-item';
import {IMessage, MessageMethodTypes} from '../../../shared/services/message.service';
import {WindowMessagesService} from '../../../shared/services/window-messages.service';

@Component({
  selector: 'app-socket-mock-controls',
  templateUrl: './socket-mock-controls.html',
  styleUrls: ['./socket-mock-controls.scss'],
})
export class SocketMockControlsComponent {
  public isPlaying = false;
  public queue: string;

  @Input()
  public isLoading = false;

  @Input()
  public volume = 100;

  @Input()
  public noise = 0;

  @Input()
  public playQueue: PlayQueue<PlayQueueItem>;

  constructor() {
    this.queue = `
    [
      {"track_id":130470654,"track_provider_id":"soundcloud"},
      {"track_id":"lAwYodrBr2Q","track_provider_id":"youtube"},
      {"track_id":337816824,"track_provider_id":"soundcloud"}
    ]`;
  }

  private setPlayerState(state: string) {
    WindowMessagesService.emitAppEvent({
      channel: 'playerState',
      method: MessageMethodTypes.PUT,
      body: state
    });
  }

  public setQueue() {
    WindowMessagesService.emitAppEvent({
      channel: 'queue',
      method: MessageMethodTypes.PUT,
      body: JSON.parse(`{"body":${this.queue}}`).body
    });
  }

  public play() {
    this.isPlaying = true;
    this.setPlayerState('Play');
  }

  public pause() {
    this.isPlaying = false;
    this.setPlayerState('Pause');
  }

  public next() {
    this.setPlayerState('Next');
  }

  public previous() {
    this.setPlayerState('Previous');
  }

  public setVolume(volume: number) {
    this.volume = volume;
    WindowMessagesService.emitAppEvent({
      channel: 'volume',
      method: MessageMethodTypes.PUT,
      body: volume
    });
  }

  public setNoise(frequency: number) {
    WindowMessagesService.emitAppEvent({
      channel: 'noise',
      method: MessageMethodTypes.PUT,
      body: frequency
    });
  }
}
