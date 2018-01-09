import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FotoMapModalPage } from './foto-map-modal';

@NgModule({
  declarations: [
    FotoMapModalPage,
  ],
  imports: [
    IonicPageModule.forChild(FotoMapModalPage),
  ],
})
export class FotoMapModalPageModule {}
