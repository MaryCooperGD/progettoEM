import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from "../../providers/api";
import * as firebase from 'firebase/app';

/**
 * Generated class for the RankPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rank',
  templateUrl: 'rank.html',
})
export class RankPage {

  username:any;

  //Per la Classifica (rank.ts)
  public items: Array<any> = [];
  public itemRef: firebase.database.Reference = firebase.database().ref('/users');
  constructor1(){}

  constructor(public navCtrl: NavController, public navParams: NavParams, public api:Api) {
  }

  ionViewDidLoad() {
    if(this.api.user.displayName==null){
      this.username = '';
    }else {
      this.username = this.api.user.displayName
  }    

  //--- per la classifica
  this.itemRef.on('value', itemSnapshot => {
    this.items = [];
    itemSnapshot.forEach( itemSnap => {
      this.items.push(itemSnap.val());
      return false;
    });
  });
  //---fine classifica


  }

}
