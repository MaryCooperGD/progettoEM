import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,Slides, ToastController  } from 'ionic-angular';

import { HomePage } from "../home/home";
import { LoginPage } from "../login/login";
import { Api } from "../../providers/api";
import * as firebase from 'firebase/app';
/*
 * Generated class for the TutorialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

export interface Slide {
  title: string;
  description: string;
  image: string;
}

@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html',
})

export class TutorialPage {

  public preferences: Array<any>

  @ViewChild(Slides) slides: Slides;
  slidess: Slide[];
  showSkip = true;
  second =false;
  
  email:any;
  //per prendere email (id dell'utente loggato) in modo da poter avere il riferimento dell'utente
  public user_email: Array<any> = [];
  public user_emailRef: firebase.database.Reference = firebase.database().ref('/users/');
  id_user; //conterrà la mail

  num_of_tag;

  public preferenze_not_user: Array<any>;

  //Mi serve per far comparire o meno la card con le preferenze da poter aggiungere
  isEnabled : boolean = false; //Di base non si vede

  constructor(public navCtrl: NavController, public api: Api, public navParams: NavParams, public toastCtrl:ToastController,) {
    
    this.second = false;
    
     this.slidess = [
      {
        title: "Benvenuto su C.I.C.E.",
        description: "C.I.C.E. ti permette di organizzare il tuo viaggio culturale in giro per la città",
        image: 'assets/img/loc.png', 
      },
      {
        title: "Organizza il tuo viaggio",
        description: "Scegli i tag che ti interessano e inizia ad esplorare",
        image: 'assets/img/trip.png', 
      },
      {
        title: "Contribuisci alla conoscenza",
        description: "Aggiungi foto e aneddoti dei luoghi visitati, ottieni punti e scala la classifica",
        image: 'assets/img/edit.png', 
      }
    ]; 
  }

  ionViewDidLoad() {
    this.email = this.api.email_id; //Ricavo dall'API la mail che mi serve per identificare l'utente a cui aggiungere le preferenze

    this.user_emailRef.orderByChild("email_user").equalTo(this.email).on('value',itemSnapshot =>{
      this.user_email = [];
      itemSnapshot.forEach( itemSnap => {
        this.user_email.push(itemSnap.val());
        return false;
      });
      this.user_email.forEach(i=>{
        this.num_of_tag = i.num_of_tag;
      })
    });


    this.showUserPref_Registration();

  } // fine --  ionViewDidLoad()

  showUserPref_Registration(){

    var preferencesRef = firebase.database().ref('/users/'+this.email+'/preferenze/') 
    var tagsRef = firebase.database().ref('/tag/');

    preferencesRef.once('value')
        .then(userPrefSnap => {
            //Salvo i tag utente all'interno di una MAP
            let userPrefMap: { [key: string]: boolean } = {}
            userPrefSnap.forEach(userTagSnap => {
                userPrefMap[userTagSnap.key] = true
                //console.log("Tag che l'utente possiede  "+userPrefMap[userTagSnap.key]); //mi restituisce true per tutti i tag che l'utente possiede
            })
            return tagsRef.once('value')
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
  /*showUserPref_Registration(){
    console.log("DENTRO IL REFRESH DELLE PREFERENZE")
     //Tiro fuori tutti i tag presenti nel database, che in questo caso diventano le preferenze dell'utente
     let pref_List = []
     var ref = firebase.database().ref('/tag/')
     ref.orderByChild("nome").once('value',function(snapshot){ //ciclo sui tag/preferenze
       snapshot.forEach(function(childSnapshot){
         var childKey = childSnapshot.key;
         pref_List.push(childSnapshot)
         return false;
       })
     }).then(v => {
       this.preferences = pref_List;
     })
  }*/

  addSelectedPreference(index){

    //una volta che ho la mail (presa dalle API) posso inserire la preferenza correttamente
    var prefToAdd = this.preferenze_not_user[index]; //preferenza
    var updates = {};
    updates["/users/"+this.email+"/preferenze/"+prefToAdd.key] ="true";
    updates["/users/"+this.email+"/num_of_tag"] = this.num_of_tag + 1;
        
    firebase.database().ref().update(updates);
    this.showUserPref_Registration(); //Mi refresha ad ogni click la lista delle preferenze.
    this.displayLoginError("Hai aggiunto il tag alle tue preferenze") ;
 }

  startApp() {
    this.navCtrl.setRoot(LoginPage, {}, {
      animate: true,
      direction: 'forward'
    });
  }

  //Controlla il cambiamento delle slide. Utilizzo qui isEnabled
  slideChanged(){
    let currentIndex = this.slides.getActiveIndex();
    //Se siamo nella currentIndex = 1 significa che siamo nella slide dove deve apparire la card.
    if (currentIndex == 1){
      this.isEnabled = true; //Abilito la presenza della card nell'html.
      this.second = true;
    } 
    //Nelle altre 2 slide non si deve vedere quindi mantengo a false la variabile
    else if(currentIndex == 2){
      this.isEnabled = false;
      this.second = false;
    }
    else {
      this.second = false;
      this.isEnabled = false;
    }
  }
  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd;
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
