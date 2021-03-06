import {Component, Input, OnInit} from '@angular/core';
import {PlayQueue} from '../../../player/collections/play-queue';
import {PlayQueueItem} from '../../../player/models/play-queue-item';
import {MessageMethodTypes} from '../../../shared/services/message.service';
import {WindowMessagesService} from '../../../shared/services/window-messages.service';
import {SocketMessagesService} from '../../../shared/services/socket-messages.service';

@Component({
  selector: 'app-socket-mock-controls',
  templateUrl: './socket-mock-controls.html',
  styleUrls: ['./socket-mock-controls.scss'],
})
export class SocketMockControlsComponent implements OnInit{
  public isPlaying = false;
  public queue: string;
  public volume = 100;
  public noise = 0;

  @Input()
  public isLoading = false;

  @Input()
  public playQueue: PlayQueue<PlayQueueItem>;

  constructor(private socketMessagesService: SocketMessagesService) {
    this.queue = `
    [
      {"track_id": 154258944, "track_provider_id": "soundcloud"},
      {"track_id": 6469900, "track_provider_id": "soundcloud"},
      {"track_id": "kKqw8nY6-Eg", "track_provider_id": "youtube"},
      {"track_id": "lAwYodrBr2Q", "track_provider_id": "youtube"},
      {"track_id": 162998530, "track_provider_id": "soundcloud"},
      {"track_id": "gra4ugWIzLE", "track_provider_id": "youtube"},
      {"track_id": 4323319, "track_provider_id": "soundcloud"}
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

  ngOnInit(): void {
    this.socketMessagesService.subscribe('volume', MessageMethodTypes.PUT, this.setVolume.bind(this));
    this.socketMessagesService.subscribe('noise', MessageMethodTypes.PUT, this.setNoise.bind(this));
  }
}
