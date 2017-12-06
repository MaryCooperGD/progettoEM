import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UploadPhotoPage } from '../upload-photo/upload-photo';
import { EditMonumentPage } from "../edit-monument/edit-monument";

/**
 * Generated class for the MonumentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-monument',
  templateUrl: 'monument.html',
})
export class MonumentPage {

  public poi;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.poi = navParams.get('reference')
    
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MonumentPage');


  }

  openUploadPhotoPage(){
    this.navCtrl.push(UploadPhotoPage)
  } 

  openEditMonumentPage(){
    this.navCtrl.push(EditMonumentPage, {
      poi: this.poi,
      
    })
  } 


}
