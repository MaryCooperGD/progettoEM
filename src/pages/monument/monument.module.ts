import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonumentPage } from './monument';

@NgModule({
  declarations: [
    MonumentPage,
  ],
  imports: [
    IonicPageModule.forChild(MonumentPage),
  ],
})
export class MonumentPageModule {}
