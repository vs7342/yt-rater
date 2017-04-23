import { NgModule } from '@angular/core';
import { Comments } from './comments';

@NgModule({
  declarations: [
    Comments,
  ],
  exports: [
    Comments
  ]
})
export class CommentsModule {}
