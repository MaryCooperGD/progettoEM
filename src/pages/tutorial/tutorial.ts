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
  
  username:any;
  //per prendere email (id dell'utente loggato) in modo da poter avere il riferimento dell'utente
  public user_email: Array<any> = [];
  public user_emailRef: firebase.database.Reference = firebase.database().ref('/users/');
  id_user; //conterrà la mail

  //Mi serve per far comparire o meno la card con le preferenze da poter aggiungere
  isEnabled : boolean = false; //Di base non si vede

  constructor(public navCtrl: NavController, public api: Api, public navParams: NavParams, public toastCtrl:ToastController,) {
    
    this.second = false;
    
     this.slidess = [
      {
        title: "Benvenuto su C.I.C.E.",
        description: "C.I.C.E. ti permette di organizzare il tuo viaggio culturale in giro per la città",
        image: 'src/assets/img/loc.png', //DEVO CAPIRE PERCHè NON VANNO
      },
      {
        title: "Organizza il tuo viaggio",
        description: "Scegli i tag che ti interessano e inizia ad esplorare",
        image: '/assets/img/trip.png', //DEVO CAPIRE PERCHè NON VANNO
      },
      {
        title: "Contribuisci alla conoscenza",
        description: "Aggiungi foto e aneddoti dei luoghi visitati, ottieni punti e scala la classifica",
        image: '../assets/img/edit.png', //DEVO CAPIRE PERCHè NON VANNO
      }
    ]; 
  }

  ionViewDidLoad() {
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

  } // fine --  ionViewDidLoad()

  addSelectedPreference(index){
    //prendo l'username per la query sottostante
    if(this.api.user.displayName==null){
      this.username = '';
    }else {
      this.username = this.api.user.displayName
    }   
    
    //prendo la mail del tizio 
    this.user_emailRef.orderByChild("username").equalTo(this.username).on('value',itemSnapshot =>{
      this.user_email = [];
      itemSnapshot.forEach( itemSnap => {
        this.user_email.push(itemSnap.val());
        return false;
      });
      this.user_email.forEach(i=>{
        this.id_user = i.email_user;

        //una volta che ho la mail posso inserire la preferenza correttamente
        var prefToAdd = this.preferences[index]; //preferenza
        var updates = {};
        updates['/users/'+this.id_user+'/preferenze/'+prefToAdd.key] ="true";
        
       firebase.database().ref().update(updates);
       
      })
      
    }); // fine --- this.user_emailRef.orderByChild("username").equalTo(this.username).on('value',itemSnapshot =>{

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
