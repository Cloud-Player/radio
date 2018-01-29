import {Component, OnInit} from '@angular/core';
import {SocketMessagesService, SocketStatusTypes} from '../../../shared/services/socket-messages.service';

@Component({
  selector: 'app-socket-opener',
  templateUrl: './socket-opener.html',
  styleUrls: ['./socket-opener.scss'],
})
export class SocketOpenerComponent implements OnInit {
  private _socketReconnectTimer;
  public socketIsOpen = false;
  public socketUrl = 'localhost:8050/websocket';
  public socketRetryWait = 3000;
  public socketRetryProgress = 3000;
  public socketStatus;

  constructor(private socketMessagesService: SocketMessagesService) {
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

  ngOnInit() {
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

    this.openSocket();
  }
}
