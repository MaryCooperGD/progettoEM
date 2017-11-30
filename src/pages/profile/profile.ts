import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from "../../providers/api";
import { Camera } from "@ionic-native/camera";
import * as firebase from 'firebase/app';
import { FirebaseApp } from "angularfire2";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';

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

  username:any;
  public myPhotosRef: any;
  public myPhoto: any;
  public myPhotoURL: any;

  //--Per mostrare punti utente e altre informazioni
  public items_user_details: Array<any> = [];
  public itemRef_user_details: firebase.database.Reference = firebase.database().ref('/users/');

  correct_data; //variabile per inserire la data corretta della registrazione dell'utente.

  //--Per mostrare le preferenze utente
  public user_preferences:Array<any>;
  public tags:Array<any>;

  id_user; //Siccome da noi l'utente è identificato dalla mail con i caratteri strani strani (email_user nell'albero), qui ci metteremo tale mail. es: "jerikam92@gmail%2Ecom"

  number_of_preferences;


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
  }else {
      this.username = this.api.user.displayName
  }      

   //----Questa query ci permette di recuperare tutte le informazioni inserite nel nodo dell'utente loggato, nella tabella users + le sue preferenze
   this.itemRef_user_details.orderByChild("username").equalTo(this.username).on('value',itemSnapshot =>{
    this.items_user_details = [];
    itemSnapshot.forEach( itemSnap => {
      this.items_user_details.push(itemSnap.val());
      
      return false;
    });
    this.items_user_details.forEach(i=>{ //Dentro a questo forEach vado a recuperare informazioni che mi interessano
      this.correct_data = new Date(i.data_registrazione); //Serve per recuperare la data corretta dal costrutto Data. poi su html viene convertita in DD/MM/YY
      this.id_user = i.email_user; //Prendiamo dal forEach la mail (quella sporca che rappresenta l'id utente)

      //Da qui facciamo il join per vedere le preferenze dell'utente loggato
          let userTags = [];
          var ref = firebase.database().ref('/users/'+ this.id_user +'/preferenze/') //this.id_user permette di utilizzare l'identificativo per trovare le preferenze dell'utente loggato
          var ref1 = firebase.database().ref('/tag/');
          ref.once('value', function(preferenze){ //sto ciclando sulle preferenze dell'utente.
            preferenze.forEach(function(singolaPref){//snapshot è l'intero albero, singolaPref è la singola componente dell'albero
              ref1.once('value', function(tags){ //adesso invece ciclo su tutti i tag.
                tags.forEach(function (singoloTag){ //come sopra! è speculare
                  if(singolaPref.key == singoloTag.key){ //effettuo il confronto tra le chiavi per vedere quali possiede l'utente
                  //rispetto a quelle presenti nel nodo dei tag totali

                  //console.log("Nome tag " + singoloTag.child("nome").val()) 
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
          
            }) //--- fine di .then(a=>{
      //Fine parte delle preferenze dell'utente
     
    }) //foreach dei dettagli utente
    
    return this.items_user_details; //Restituisce tutte le informazioni
  });
  //----

  } //--Fine ionViewDidLoad

}
