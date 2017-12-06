import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WelcomepagePage } from "../welcomepage/welcomepage";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Api } from "../../providers/api";

/**
 * Generated class for the EditMonumentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-monument',
  templateUrl: 'edit-monument.html',
})
export class EditMonumentPage {

  public textSearch: any;
  public myInput;
  public poi;
  username:any;

  //per prendere email (id dell'utente loggato) che ci serve per sapere dove aggiungere il punteggio
  public user_email: Array<any> = [];
  public user_emailRef: firebase.database.Reference = firebase.database().ref('/users/');
  id_user;

  //punteggio che verrà incrementato
  punteggio;

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {

    this.poi = navParams.get('poi');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditMonumentPage');

    if(this.api.user.displayName==null){
      this.username = '';
    }else {
      this.username = this.api.user.displayName
    }   
     
    this.user_emailRef.orderByChild("username").equalTo(this.username).on('value',itemSnapshot =>{
      this.user_email = [];
      itemSnapshot.forEach( itemSnap => {
        this.user_email.push(itemSnap.val());
        return false;
      });
      this.user_email.forEach(i=>{
        this.id_user = i.email_user;
        this.punteggio = i.points_info;
      })
    });

  } //fine ionViewDidLoad

//Aggiunge le informazioni nel database in maniera corretta
  addInfo(){

    var ref = firebase.database().ref("/descriptions/");
    var ref1 = firebase.database().ref("/point_of_interest/"+this.poi.chiave+"/")
    var key = firebase.database().ref().child('descriptions').push().key;

    var data = {
      testo: this.myInput,
      username_utente: this.username,
    }

    var updates = {}
    updates["/descriptions/"+key] = data;
    updates["/point_of_interest/"+this.poi.chiave+"/description/" + key ] = true;

    //Incrementa la variabile dei punti
    this.punteggio = this.punteggio + 15 ;
    updates["/users/"+this.id_user+"/points_info"]  = this.punteggio;

    firebase.database().ref().update(updates);
     
  }

}
