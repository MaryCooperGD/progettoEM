import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WelcomepagePage } from "../welcomepage/welcomepage";

/**
 * Generated class for the UploadPhotoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-upload-photo',
  templateUrl: 'upload-photo.html',
})
export class UploadPhotoPage {

  poi;
  poiName;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
      this.poi = navParams.get('poi')
      this.poiName = this.poi.myPoi.nome

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UploadPhotoPage');
  }

}
