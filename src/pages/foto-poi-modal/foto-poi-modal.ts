import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController  } from 'ionic-angular';

/**
 * Generated class for the FotoPoiModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-foto-poi-modal',
  templateUrl: 'foto-poi-modal.html',
})
export class FotoPoiModalPage {

  //Prendo l'url dell'immagine che ho passato
  url_immagine: string = this.navParams.get('url_immagine');

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FotoPoiModalPage');
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

}
