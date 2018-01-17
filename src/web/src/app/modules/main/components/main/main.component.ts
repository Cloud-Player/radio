import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {PlayQueue} from '../../../player/collections/play-queue';
import {PlayQueueItem} from '../../../player/models/play-queue-item';

@Component({
  selector: 'app-cloud-radio',
  templateUrl: './main.template.html',
  styleUrls: ['./main.style.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MainComponent implements AfterViewInit {
  public playQueue: PlayQueue<PlayQueueItem>;

  constructor() {
    this.playQueue = PlayQueue.getInstance();
  }

  public addYT(id, play = false) {
    const item = this.playQueue.add({
      provider: 'youtube',
      track: {
        id: id,
        provider: 'youtube'
      }
    });
    if (play) {
      item.play();
    }
  }

  public addSC(id, play = false) {
    const item = this.playQueue.add({
      provider: 'soundcloud',
      track: {
        id: id,
        provider: 'soundcloud'
      }
    });
    if (play) {
      item.play();
    }
  }

  ngAfterViewInit(): void {
    this.addSC(130470654, true);
  }
}
