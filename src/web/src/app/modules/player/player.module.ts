import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {SharedModule} from '../shared/shared.module';
import {SoundcloudPlayerComponent} from './components/soundcloud-player/soundcloud-player';
import {PlayerManagerComponent} from './components/player-manager/player-manager';
import {YoutubePlayerComponent} from './components/youtube-player/youtube-player';
import {CommentsModule} from '../comments/comments.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    SharedModule,
    CommentsModule
  ],
  declarations: [
    SoundcloudPlayerComponent,
    YoutubePlayerComponent,
    PlayerManagerComponent
  ],
  exports: [
    PlayerManagerComponent
  ]
})
export class PlayerModule {
}
