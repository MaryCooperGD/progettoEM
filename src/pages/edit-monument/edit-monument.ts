import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { WelcomepagePage } from "../welcomepage/welcomepage";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Api } from "../../providers/api";
import { MonumentPage } from "../monument/monument";
import { NewtagPage } from "../newtag/newtag";

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
  email:any;

  //per prendere email (id dell'utente loggato) che ci serve per sapere dove aggiungere il punteggio
  public user_email: Array<any> = [];
  public user_emailRef: firebase.database.Reference = firebase.database().ref('/users/');
  
  //punteggio che verrà incrementato
  punteggio_info;
  punteggio_totale;
  punteggio_tag;

  public tagList: Array<any>;
  public loadedTagList: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public toastCtrl:ToastController,) {

    this.poi = navParams.get('poi');
    this.refreshTags();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditMonumentPage');

    if(this.api.user.displayName==null){
      this.username = '';
      this.email = '';
    }else {
      this.username = this.api.user.displayName
      this.email = this.api.email_id; //Ricavo dall'API la mail che mi serve per identificare l'utente
    }   
     
    this.user_emailRef.orderByKey().equalTo(this.email).on('value',itemSnapshot =>{
      this.user_email = [];
      itemSnapshot.forEach( itemSnap => {
        this.user_email.push(itemSnap.val());
        return false;
      });
      this.user_email.forEach(i=>{
        
        this.punteggio_info = i.points_info;
        this.punteggio_totale = i.total_points;
        this.punteggio_tag = i.points_tag;

      })
    });

  } //fine ionViewDidLoad



  refreshTags(){
    var ref = firebase.database().ref('/point_of_interest/'+this.poi.chiave+'/tags/')
    var ref1 = firebase.database().ref('/tag/');

    let tagShow = [];
    ref1.once('value', function(snapshot){ //ciclo sui tag
      snapshot.forEach(function(childSnapshot){
          var childKey = childSnapshot.key; //chiave tag
          var exists = false;
          ref.once('value', function(snapshot){
            snapshot.forEach(function(childSnapshot){
              var childKey1 = childSnapshot.key;
              if (childKey == childKey1){ //se ne trovo uno uguale, eisste nella lista dei tag del poi
                  exists = true;
              }
              return false;
            })
          }).then(a => {
            if (!exists){
              tagShow.push(childSnapshot);
            }
          })                
        return false;
      })
    }).then(a=>{
      this.tagList = tagShow;
    this.loadedTagList = tagShow;
    })

    this.tagList = tagShow;
    this.loadedTagList = tagShow;
  }


  addSelectedTag(index){
    var tagToAdd = this.tagList[index]; //corretto
    var updates = {};
   updates['/point_of_interest/'+ this.poi.chiave + '/tags/' + tagToAdd.key] = "true";

   //Incrementa la variabile dei punti delle informazioni
   this.punteggio_tag = this.punteggio_tag + 5 ;
   updates["/users/"+this.email+"/points_tag"]  = this.punteggio_tag;

   //Incrementa la variabile dei PUNTI TOTALI
   this.punteggio_totale = this.punteggio_totale + 5 ;
   updates["/users/"+this.email+"/total_points"]  = this.punteggio_totale;

  //assegnamento badge - TAGGATORE
  if(this.punteggio_tag >= 300){
    updates["/users/"+this.email+"/badge/Taggatore prodigio"]  = true;
  }else if(this.punteggio_tag >= 180){
    updates["/users/"+this.email+"/badge/Taggatore esperto"]  = true;
  }else if(this.punteggio_tag >= 50){
    updates["/users/"+this.email+"/badge/Taggatore principiante"]  = true;
  }else if(this.punteggio_tag >= 15){
    updates["/users/"+this.email+"/badge/Taggatore novizio"]  = true;   
  }

   firebase.database().ref().update(updates);
   this.displayLoginError("Grazie per aver contributo, hai appena guadagnato 5 punti!") ;
   this.refreshTags();
 }

 ionViewWillEnter(){
   this.initializeItems()
 }

 initializeItems(): void {
  this.tagList = this.loadedTagList;
}

//Aggiunge le informazioni nel database in maniera corretta, manda messaggio di conferma e torna a pagina precedente
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

    //Incrementa la variabile dei punti delle informazioni
    this.punteggio_info = this.punteggio_info + 40 ;
    updates["/users/"+this.email+"/points_info"]  = this.punteggio_info;

    //Incrementa la variabile dei PUNTI TOTALI
    this.punteggio_totale = this.punteggio_totale + 15 ;
    updates["/users/"+this.email+"/total_points"]  = this.punteggio_totale;

    //Controllo il punteggio delle informazioni, in base a quanto è, associo un badge!!! 
    //non mi piace troppo tecnicamente ma funziona. è da migliorare se possibile
    if(this.punteggio_info >= 300){
      updates["/users/"+this.email+"/badge/Informatore prodigio"]  = true;
    }else if(this.punteggio_info >= 240){
      updates["/users/"+this.email+"/badge/Informatore esperto"]  = true;
    }else if(this.punteggio_info >= 60){
      updates["/users/"+this.email+"/badge/Informatore principiante"]  = true;
    }else if(this.punteggio_info >= 15){
      updates["/users/"+this.email+"/badge/Informatore novizio"]  = true;   
    }

    firebase.database().ref().update(updates);

    this.displayLoginError("Grazie per aver contributo, hai appena guadagnato 15 punti!");
    this.navCtrl.pop(); //Bottone per tornare indietro
  }


  openAddNewTagPage(){
    this.navCtrl.push(NewtagPage, {
     poi: this.poi

    })
  }

  //per il messaggio di conferma!
  displayLoginError(messageErr: string){
    let toast = this.toastCtrl.create({
      message: messageErr,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

}
