import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from "../home/home";

/**
 * Generated class for the CreateRoutePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-route',
  templateUrl: 'create-route.html',
})
export class CreateRoutePage {

  myInputPartenza: string;
  myInputArrivo: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateRoutePage');
  }


  calculateRoute(){
    console.log("Partenza " +  this.myInputPartenza + " Arrivo " + this.myInputArrivo)
    this.navCtrl.setRoot(HomePage)

  }

}
