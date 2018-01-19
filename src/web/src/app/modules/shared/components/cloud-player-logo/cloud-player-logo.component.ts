import {Component, OnInit, ViewChild, ElementRef, Input} from '@angular/core';
import {CloudPlayerLogoService} from '../../services/cloud-player-logo.service';

@Component({
  selector: 'app-cloud-player-logo',
  styleUrls: ['./cloud-player-logo.style.scss'],
  templateUrl: './cloud-player-logo.template.html',
})

export class CloudPlayerLogoComponent implements OnInit {

  @Input()
  public animate = false;

  constructor(private cloudPlayerLogoService: CloudPlayerLogoService) {
  }

  ngOnInit(): void {
  }

  play(): void {
  }

  pause(): void {
  }
}
