import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchPlacePage } from './search-place';

@NgModule({
  declarations: [
    SearchPlacePage,
  ],
  imports: [
    IonicPageModule.forChild(SearchPlacePage),
  ],
})
export class SearchPlacePageModule {}
