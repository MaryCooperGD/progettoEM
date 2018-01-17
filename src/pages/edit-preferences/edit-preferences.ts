import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { FirebaseApp } from "angularfire2";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Api } from "../../providers/api";

/**
 * Generated class for the EditPreferencesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-preferences',
  templateUrl: 'edit-preferences.html',
})
export class EditPreferencesPage {
  //public tags: Array<any>
  //number_of_preferences; CODICE PER CHECKBOX VECCHIO

  public tags: Array<any>;
  public preferenze_not_user: Array<any>;
  username:any;
  email:any;

  //per segnare il numero di preferenze che l'utente possiede
  numb_pref;

  public user_email: Array<any> = [];
  public user_emailRef: firebase.database.Reference = firebase.database().ref('/users/');
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public toastCtrl:ToastController,) {
  }

  ionViewDidLoad() {
    if(this.api.user.displayName==null){
      this.username = '';
      this.email = '';
    }else {
      this.username = this.api.user.displayName
      this.email = this.api.email_id; //Ricavo dall'API la mail che mi serve per identificare l'utente
    } 
    
       
    this.user_emailRef.orderByChild("email_user").equalTo(this.email).on('value',itemSnapshot =>{
      this.user_email = [];
      itemSnapshot.forEach( itemSnap => {
        this.user_email.push(itemSnap.val());
        return false;
      });
      this.user_email.forEach(i=>{
        this.numb_pref = i.numb_pref;
      })
    });

    this.showMissingPreferences(); //Mi mostra le preferenze che l'utente non ha scelto e non possiede!
    this.showUserPreferences(); //Mi mostra le preferenze che l'utente possiede e può togliere!
  }

  //Mi mostra i tag che l'utente non ha scelto e non possiede!
  showMissingPreferences() { 
    var preferencesRef = firebase.database().ref('/users/'+ this.email+'/preferenze/') 
    var tagsRef = firebase.database().ref('/tag/');

    preferencesRef.once('value')
        .then(userPrefSnap => {
            //Salvo i tag utente all'interno di una MAP
            let userPrefMap: { [key: string]: boolean } = {}
            userPrefSnap.forEach(userTagSnap => {
                userPrefMap[userTagSnap.key] = true
                //console.log("Tag che l'utente possiede  "+userPrefMap[userTagSnap.key]); //mi restituisce true per tutti i tag che l'utente possiede
            })
            return tagsRef.orderByChild("nome").once('value')
                .then((tagsSnap) => {
                    let missingTags = []
                    tagsSnap.forEach(tagSnap => {
                        //Pusho i tag che non sono nel map.
                        if(!userPrefMap[tagSnap.key]) {
                          // missingTags.push(tagSnap.child("nome").val()) -> così facendo inserirei il nome del tag, ma dopo ho un problema di retrieve quando clicco
                          missingTags.push(tagSnap) //--> in questo modo mi inserisce l'oggetto da cui posso prendere la chiave, il nome e tutto il resto
                          //console.log("Intero elenco dei tag   "+tagSnap.child("nome").val()); //mi restituisce l'intero elenco dei tag (albero) -> NOME
                        }
                    })
                    return missingTags;     
                })
        })
        .then(missingTags => {
            this.preferenze_not_user = missingTags
            //console.log("Tags finali(che l'utente non ha)  "+this.preferenze_not_user)
        })
  }

  addSelectedPreferences(index){
    var tagToAdd = this.preferenze_not_user[index]; //corretto
    //console.log("this.tags[index] "+this.preferenze_not_user[index])
    var updates = {};

    updates["/users/"+this.email+"/preferenze/"+tagToAdd.key]  = "true";
    updates["/users/"+this.email+"/numb_pref"] = this.numb_pref + 1;
    
    firebase.database().ref().update(updates);
    this.displayLoginError("Hai inserito una nuova preferenza") ;

    //Richiamo queste due funzioni per refreshare le liste che mostrano i tag che l'utente ha e non ha!
    this.showUserPreferences(); 
    this.showMissingPreferences(); 
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

  //Mostro tutti i tag che l'utente ha 
  showUserPreferences(){
   let userTag = [];
   var ref = firebase.database().ref('/users/'+ this.email+'/preferenze/') 
   var ref1 = firebase.database().ref('/tag/');
   ref1.orderByChild("nome").once('value', function(tags){ 
    tags.forEach(function (singoloTag){ 
   ref.once('value', function(preferenze){ 
     preferenze.forEach(function(singolaPref){
           if(singolaPref.key == singoloTag.key){ 
            userTag.push(singoloTag); //Pusho tutti i tag che l'utente ha
           }
           return false;
         })
       })
       return false;
     })
   }) .then(a=>{   
       this.tags = userTag;  
       this.tags.sort(function(b,c){
         return b.child('nome').val()-c.child('nome').val()
       })
     })  
    
  }

  deleteSelectedPreferences(index){
    var tagToDelete = this.tags[index]; //corretto
    //console.log("this.tags[index] "+this.preferenze_not_user[index])
    var updates = {};

    updates["/users/"+this.email+"/preferenze/"+tagToDelete.key]  = null; //questo mi rimuove il record!!
    updates["/users/"+this.email+"/numb_pref"] = this.numb_pref - 1;

    firebase.database().ref().update(updates);
    this.displayLoginError("Hai eliminato una preferenza") ;

    //Richiamo queste due funzioni per refreshare le liste che mostrano i tag che l'utente ha e non ha!
    this.showUserPreferences(); 
    this.showMissingPreferences(); 
  }
}

