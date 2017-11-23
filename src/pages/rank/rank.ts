import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from "../../providers/api";
import * as firebase from 'firebase/app';


// import {UserService} from '../../providers/user_service'; IMPORT DEL FILE DEL TIZIO

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
  //position;


  //Per la Classifica (rank.ts)
  public items: Array<any> = [];
  public itemRef: firebase.database.Reference = firebase.database().ref('/users');
  
  //---------CODICE DEL TIZIO-----------------//
  /*constructor(public userService:UserService,public api: Api){
    this.username = this.api.user.displayName;
    this.userService.getUsers()//.getUserPosition(this.usern;
    this.position = this.userService.getUserPosition(this.username); // you need to pass the user accessing the rank page
 }*/

  constructor(public navCtrl: NavController, public navParams: NavParams, public api:Api) {
  }

  ionViewDidLoad() {
    if(this.api.user.displayName==null){
      this.username = '';
    }else {
      this.username = this.api.user.displayName
  }    

   //--- per la classifica
    //Ordina i dati in base al punteggio dei giocatori. Mostra la lista decrescente
    this.itemRef.orderByChild("total_points").on('value',itemSnapshot =>{
      this.items = [];
      itemSnapshot.forEach( itemSnap => {
        this.items.push(itemSnap.val());
        return false;
      });
      return this.items.reverse(); //Siccome da firebase i dati si estraggono solamente in ordine crescente, il reverse serve per ottenere l'ordinamento decrescente
    });
  //---fine classifica


  } //Fine metodo ionViewDidLoad
}




