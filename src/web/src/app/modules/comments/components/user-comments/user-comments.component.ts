import {Component, ElementRef, Input} from '@angular/core';
import {Comments} from '../../collections/comments.collection';
import {Comment} from '../../models/comment.model';
import {HumanReadableSecondsPipe} from '../../../shared/pipes/h-readable-seconds.pipe';

@Component({
  selector: 'app-user-comments',
  styleUrls: ['./user-comments.style.scss'],
  templateUrl: './user-comments.template.html'
})

export class UserCommentsComponent {
  @Input()
  currentTime: number;

  @Input()
  bigComments: boolean;

  @Input()
  comments: Comments<Comment>;
}
