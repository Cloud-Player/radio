import {NgModule} from '@angular/core';
import {HumanReadableSecondsPipe} from './pipes/h-readable-seconds.pipe';
import {BrowserModule} from '@angular/platform-browser';
import {BackboneModule} from '../backbone/backbone.module';
import {FormsModule} from '@angular/forms';
import {CloudPlayerLogoService} from './services/cloud-player-logo.service';
import {TimeAgoDirective} from './directives/time-ago.directive';
import {KMilShortenerPipe} from './pipes/k-mil-shortener.pipe';

import {LimitCollectionresultsPipe} from './pipes/limit-collection-results.pipe';
import {EaseService} from './services/ease.service';
import {FullScreenService} from './services/fullscreen.service';
import {TrackCoverComponent} from './components/track-cover/track-cover.component';
import {CloudPlayerLogoComponent} from './components/cloud-player-logo/cloud-player-logo.component';
import {MessageService} from './services/message.service';
import {SocketMessagesService} from './services/socket-messages.service';
import {WindowMessagesService} from './services/window-messages.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    BackboneModule
  ],
  declarations: [
    TimeAgoDirective,
    HumanReadableSecondsPipe,
    KMilShortenerPipe,
    LimitCollectionresultsPipe,
    TrackCoverComponent,
    CloudPlayerLogoComponent
  ],
  exports: [
    TimeAgoDirective,
    HumanReadableSecondsPipe,
    KMilShortenerPipe,
    LimitCollectionresultsPipe,
    TrackCoverComponent,
    CloudPlayerLogoComponent
  ],
  providers: [
    HumanReadableSecondsPipe,
    CloudPlayerLogoService,
    FullScreenService,
    MessageService,
    SocketMessagesService,
    WindowMessagesService
  ]
})
export class SharedModule {
}
