import './rxjs-extensions';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {NgModule} from '@angular/core';
import {MainComponent} from './components/main/main.component';
import {BackboneModule} from '../backbone/backbone.module';
import {SharedModule} from '../shared/shared.module';
import {PlayerModule} from '../player/player.module';
import {UserAnalyticsModule} from '../user-analytics/user-analytics.module';
import {MainRoutingModule} from './main.routes';
import {SocketMockControlsComponent} from './components/socket-mock-controls/socket-mock-controls';
import {SocketOpenerComponent} from './components/socket-opener/socket-opener';
import {RadioComponent} from './components/radio/radio';
import {MessageLoggerComponent} from './components/message-logger/message-logger';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    BackboneModule,
    SharedModule,
    PlayerModule,
    UserAnalyticsModule,
    MainRoutingModule
  ],
  declarations: [
    MainComponent,
    RadioComponent,
    SocketMockControlsComponent,
    SocketOpenerComponent,
    MessageLoggerComponent
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [MainComponent]
})
export class MainModule {
}
