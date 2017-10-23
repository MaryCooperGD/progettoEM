import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditPreferencesPage } from './edit-preferences';

@NgModule({
  declarations: [
    EditPreferencesPage,
  ],
  imports: [
    IonicPageModule.forChild(EditPreferencesPage),
  ],
})
export class EditPreferencesPageModule {}
