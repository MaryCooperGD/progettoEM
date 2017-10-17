import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WelcomepagePage } from './welcomepage';

@NgModule({
  declarations: [
    WelcomepagePage,
  ],
  imports: [
    IonicPageModule.forChild(WelcomepagePage),
  ],
})
export class WelcomepagePageModule {}
