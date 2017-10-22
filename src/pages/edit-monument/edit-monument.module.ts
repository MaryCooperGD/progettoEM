import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditMonumentPage } from './edit-monument';

@NgModule({
  declarations: [
    EditMonumentPage,
  ],
  imports: [
    IonicPageModule.forChild(EditMonumentPage),
  ],
})
export class EditMonumentPageModule {}
