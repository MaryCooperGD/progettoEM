import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from "../../providers/api";

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  username:any;


  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
   

  }

  ionViewDidLoad() {
    if(this.api.user.displayName==null){
      this.username = '';
  }else {
      this.username = this.api.user.displayName
  }      


  }

}
