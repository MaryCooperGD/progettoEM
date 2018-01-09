import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';

/**
 * Generated class for the FotoMapModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-foto-map-modal',
  templateUrl: 'foto-map-modal.html',
})
export class FotoMapModalPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FotoMapModalPage');
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

}
