import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateRoutePage } from './create-route';

@NgModule({
  declarations: [
    CreateRoutePage,
  ],
  imports: [
    IonicPageModule.forChild(CreateRoutePage),
  ],
})
export class CreateRoutePageModule {}
