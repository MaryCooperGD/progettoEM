import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AchievementsPage } from './achievements';

@NgModule({
  declarations: [
    AchievementsPage,
  ],
  imports: [
    IonicPageModule.forChild(AchievementsPage),
  ],
})
export class AchievementsPageModule {}
