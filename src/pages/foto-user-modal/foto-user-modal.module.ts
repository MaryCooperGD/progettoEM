import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FotoUserModalPage } from './foto-user-modal';

@NgModule({
  declarations: [
    FotoUserModalPage,
  ],
  imports: [
    IonicPageModule.forChild(FotoUserModalPage),
  ],
})
export class FotoUserModalPageModule {}
