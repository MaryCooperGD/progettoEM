import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController  } from 'ionic-angular';

/**
 * Generated class for the FotoUserModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-foto-user-modal',
  templateUrl: 'foto-user-modal.html',
})
export class FotoUserModalPage {


  //Prendo l'url dell'immagine che ho passato
  url_immagine: string = this.navParams.get('url_immagine');

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FotoUserModalPage');
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }


}
