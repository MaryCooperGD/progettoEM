import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from "../../providers/api";
import { Camera } from "@ionic-native/camera";
import * as firebase from 'firebase/app';
import { FirebaseApp } from "angularfire2";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AchievementsPage } from "../achievements/achievements";

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage() 
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})


export class ProfilePage {

  //---INIZIO--parte per far funzionare i segment
  menu: string = "Preferenze";
  //---FINE--parte funzionamento segment

  username:any;
  email:any;

  public myPhotosRef: any;
  public myPhoto: any;
  public myPhotoURL: any;

  //--Per mostrare punti utente e altre informazioni
  public items_user_details: Array<any> = [];
  public itemRef_user_details: firebase.database.Reference = firebase.database().ref('/users/');

  correct_data; //variabile per inserire la data corretta della registrazione dell'utente.

  //--Per mostrare le preferenze utente
  public tags:Array<any>;

  //--Per mostrare i badge dell'utente
  public badges_utente_misto:Array<any>;
  public badges_utente_taggatore:Array<any>;
  public badges_utente_informatore:Array<any>;
  public badges_utente_fotografo:Array<any>;

  //per sapere il numero di contributi
  num_of_info;
  num_of_photo;
  num_of_tag;

  //mi serve per mostrare a video l'avviso i badge utente
  isEnabled : boolean = true;
 
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public camera:Camera) {
  this.myPhotosRef = firebase.storage().ref('photos/');
  }

  selectPhoto(){
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 100,
      encodingType: this.camera.EncodingType.PNG,
    }).then(imageData => {
      this.myPhoto = imageData;
      this.uploadPhoto();
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });

  }

  uploadPhoto(): void {
    this.myPhotosRef.child(this.generateUUID()).child('myPhoto.png')
      .putString(this.myPhoto, 'base64', { contentType: 'image/png' })
      .then((savedPicture) => {
        this.myPhotoURL = savedPicture.downloadURL;
      });
  }

  generateUUID(): any {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  ionViewDidLoad() {
    if(this.api.user.displayName==null){
      this.username = '';
      this.email = '';
      
    }else {
          this.username = this.api.user.displayName;
          this.email = this.api.email_id; //Ricavo dall'API la mail che mi serve per identificare l'utente 
    }      

   //----Questa query ci permette di recuperare tutte le informazioni inserite nel nodo dell'utente loggato, nella tabella users + le sue preferenze
   this.itemRef_user_details.orderByKey().equalTo(this.email).on('value',itemSnapshot =>{
    this.items_user_details = [];
    itemSnapshot.forEach( itemSnap => {
      this.items_user_details.push(itemSnap.val());
      return false;
    });
    this.items_user_details.forEach(i=>{ //Dentro a questo forEach vado a recuperare informazioni che mi interessano
      this.correct_data = new Date(i.data_registrazione); //Serve per recuperare la data corretta dal costrutto Data. poi su html viene convertita in DD/MM/YY
      
      //numero di contributi dell'utente
      this.num_of_info = i.num_of_info;
      this.num_of_photo = i.num_of_photo;
      this.num_of_tag = i.num_of_tag;

      if (i.total_points == 0)
      {
        this.isEnabled = false;
      }
     
    }) //foreach dei dettagli utente
    
    this.showUserPreferences();
    this.showUserBadges();
    
    return this.items_user_details; //Restituisce tutte le informazioni
  });

  } //--Fine ionViewDidLoad

  openAchievementsPage(){
    this.navCtrl.push(AchievementsPage)
  }
  
  showUserPreferences(){
    //Da qui facciamo il join per vedere le preferenze dell'utente loggato
    let userTags = [];
    var ref = firebase.database().ref('/users/'+ this.email+'/preferenze/') //this.id_user permette di utilizzare l'identificativo per trovare le preferenze dell'utente loggato
    var ref1 = firebase.database().ref('/tag/');
    ref.once('value', function(preferenze){ //sto ciclando sulle preferenze dell'utente.
      preferenze.forEach(function(singolaPref){//snapshot è l'intero albero, singolaPref è la singola componente dell'albero
        ref1.once('value', function(tags){ //adesso invece ciclo su tutti i tag.
          tags.forEach(function (singoloTag){ //come sopra! è speculare
            if(singolaPref.key == singoloTag.key){ //effettuo il confronto tra le chiavi per vedere quali possiede l'utente
            //rispetto a quelle presenti nel nodo dei tag totali

            //console.log("Nome tag " + singoloTag.child("nome").val()) 
            
            //console.log("Nome tag " + singolaPref.val()) //Così facendo vediamo il true delle preferenze dell'utente
            //.child non funziona perchè non ha figli

            /*---> se decommenti la linea sopra, vedrai che ti stampa i nomi dei tag che ha l'utente tra le
            preferenze. */
            
            /*qui inserisci le istruzioni che ti servono. Ad esempio, probabilmente vorrai riempire un vettore, da mostrare
            nell'html, con i nomi dei tag che l'utente ha tra le preferenze. Quindi farai una cosa del tipo: */
            
            userTags.push(singoloTag.child("nome").val()) //STAI RIEMPIENDO UN VETTORE!
             
          /* Nota BENE che singoloTag è la chiave del (dei) tag: facendo .child("nome campo") accedi al campo specifico
            per quell'oggetto (in questo caso a  noi serve "nome"), e il .val() restituisce il valore associato al campo.
            Nel DB infatti abbiamo "name" = "Acquedotto", ad esempio, quindi il .val() restituirà acquedotto.
            
            */
            }
            return false;
           
          })
        })
        return false;
       
      })
     
    }).then(a=>{
        this.tags = userTags;
        
        /* QUESTO PASSAGGIO QUI SOPRA E' FONDAMENTALE. 
        Ti sembrerà superfluo copiare un vettore dentro un altro, tu dirai "perché non posso usare direttamente un 
        unico vettore?". Il fatto è che essendo questa una callback, non puoi accedere agli elementi esterni della classe,
        e oltretutto per avere il vettore "pieno" devi attendere che la callback faccia il return. è per questo motivo che
        userTags viene riempito durante il ciclo, e soltanto in questo THEN (che sta a significare "quando la callback ha 
        finito, allora fai queste istruzioni") copierai il valore di userTags in tags, che è il vettore pubblico dichiarato
        in cima alla classe. 
        Quindi, nel tuo HTML avrai un *ngFor classico per mostrare una lista di elementi che utilizzerà il vettore "tags".
        */

      }) 
  }

  showUserBadges(){
    //Inizio parte dei badge
    let userMiscBadges = [];
    let userTagBadges = [];
    let userFotoBadges = [];
    let userInfoBadges = [];

    var ref2 = firebase.database().ref('/users/'+ this.email+'/badge/');
    var ref3 = firebase.database().ref('/badges/');
    
    ref2.once('value',function(badge){ //ciclo sui badge dell'utente
      badge.forEach(function(singolo_Badge_Utente){
            ref3.once('value', function(badge_totali){
               badge_totali.forEach(function(badge_lista_totale){ //come sopra! è speculare
                
                    if((singolo_Badge_Utente.key == badge_lista_totale.key) && (badge_lista_totale.child("tipologia").val()== "misto")){ //effettuo il confronto tra le chiavi per vedere quali possiede l'utente
                      //rispetto a quelle presenti nel nodo dei badge complessivi
                      userMiscBadges.push(badge_lista_totale.key) //Questa volta devo pushare la chiave perchè è l'identificativo stesso che mi interessa. 
                    }
                    if((singolo_Badge_Utente.key == badge_lista_totale.key) && (badge_lista_totale.child("tipologia").val()== "taggatore")){ //effettuo il confronto tra le chiavi per vedere quali possiede l'utente
                    //rispetto a quelle presenti nel nodo dei badge complessivi
                      userTagBadges.push(badge_lista_totale.key) //Questa volta devo pushare la chiave perchè è l'identificativo stesso che mi interessa. 
                    }
                    if((singolo_Badge_Utente.key == badge_lista_totale.key) && (badge_lista_totale.child("tipologia").val()== "foto")){ //effettuo il confronto tra le chiavi per vedere quali possiede l'utente
                    //rispetto a quelle presenti nel nodo dei badge complessivi
                      userFotoBadges.push(badge_lista_totale.key) //Questa volta devo pushare la chiave perchè è l'identificativo stesso che mi interessa. 
                    }
                    if((singolo_Badge_Utente.key == badge_lista_totale.key) && (badge_lista_totale.child("tipologia").val()== "info")){ //effettuo il confronto tra le chiavi per vedere quali possiede l'utente
                    //rispetto a quelle presenti nel nodo dei badge complessivi
                      userInfoBadges.push(badge_lista_totale.key) //Questa volta devo pushare la chiave perchè è l'identificativo stesso che mi interessa. 
                    }
                    return false;
                })
    
            })
            return false;
        })
    }).then(a=>{
        this.badges_utente_misto = userMiscBadges;
        this.badges_utente_taggatore = userTagBadges;
        this.badges_utente_fotografo = userFotoBadges;
        this.badges_utente_informatore = userInfoBadges;
    })
    //Fine parte dei badge
  }

}
