import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {PlayQueue} from '../../../player/collections/play-queue';
import {PlayQueueItem} from '../../../player/models/play-queue-item';
import {RadioComponent} from '../radio/radio';

@Component({
  selector: 'app-cloud-radio',
  templateUrl: './main.template.html',
  styleUrls: ['./main.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  public showPlayer = false;
  public playQueue: PlayQueue<PlayQueueItem>;
  public isLoading: boolean;

  @ViewChild('radio')
  public radio: RadioComponent;

  public loadingChange(isLoading) {
    this.isLoading = isLoading;
  }

  ngOnInit(): void {
    this.playQueue = this.radio.playQueue;
  }
}
