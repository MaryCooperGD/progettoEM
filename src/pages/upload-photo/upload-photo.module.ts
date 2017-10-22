import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UploadPhotoPage } from './upload-photo';

@NgModule({
  declarations: [
    UploadPhotoPage,
  ],
  imports: [
    IonicPageModule.forChild(UploadPhotoPage),
  ],
})
export class UploadPhotoPageModule {}
