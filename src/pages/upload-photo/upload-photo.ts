import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { WelcomepagePage } from "../welcomepage/welcomepage";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Api } from "../../providers/api";
import { Camera } from "@ionic-native/camera";
import * as firebase from 'firebase/app';
import { FirebaseApp } from "angularfire2";
import { MonumentPage } from "../monument/monument";


/**
 * Generated class for the UploadPhotoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-upload-photo',
  templateUrl: 'upload-photo.html',
})
export class UploadPhotoPage {

  poi;
  poiName;
  poiKey;
  isEnabled =false;
  username;
  email;
  num_of_photos = 0;

  //Per gestire il caricamento delle foto
  public myPhotosRef: any;
  public myPhoto: any;
  public myPhotoURL: any;

  //Per prendere i dati dal profilo utente
  public user_emailRef: firebase.database.Reference = firebase.database().ref('/users/');
  public user_email: Array<any> = [];
  num_of_photo;
  points_photos;
  punteggio_totale;
  sum_contributi;
  num_of_info; 
  num_of_tag;
  sum_of_total_contr;
  num_badge;
  num_ach;
  loadingConvert;
  loadingUpload;

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public camera:Camera,
  public toastCtrl:ToastController, public loadingController:LoadingController) {
      this.poi = navParams.get('poi')
      this.poiName = this.poi.myPoi.nome
      this.poiKey = this.poi.chiave;
      this.loadingConvert = this.loadingController.create({content: "Attendi mentre la foto viene convertita...", spinner:"crescent"})
      this.loadingUpload = this.loadingController.create({content: "Attendi mentre la foto viene caricata...", spinner:"crescent"})
      var num_photos_ref = firebase.database().ref('point_of_interest/'+this.poiKey+'/numero_foto/')

      //Per memorizzare le foto nel POI
      var ref = firebase.database().ref('/point_of_interest/'+this.poiKey+'/photos/');
      var key = firebase.database().ref().child('point_of_interest').push().key; 

      //Per memorizzare le foto nell'utente
      var ref = firebase.database().ref('/users/'+this.email+'/photos/');
      var key = firebase.database().ref().child('users').push().key; 

      num_photos_ref.on('value',snapshot=>{
        this.num_of_photos = snapshot.val()
      })
      //Riferimento alla cartella principale dove voglio mettere le foto
      this.myPhotosRef = firebase.storage().ref('usersPhotos/');

      

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UploadPhotoPage');

    if(this.api.user.displayName==null){
      this.username = '';
      this.email = '';
    }else {
          this.username = this.api.user.displayName;
          this.email = this.api.email_id; //Ricavo dall'API la mail che mi serve per identificare l'utente 
    }
    
    this.user_emailRef.orderByChild("email_user").equalTo(this.email).on('value',itemSnapshot =>{
      this.user_email = [];
      itemSnapshot.forEach( itemSnap => {
        this.user_email.push(itemSnap.val());
        return false;
      });
      this.user_email.forEach(i=>{
        this.num_of_photo = i.num_of_photo;
        this.points_photos = i.points_photos;
        this.punteggio_totale = i.total_points;
        this.sum_contributi = i.sum_contributi;
        this.num_of_info = i.num_of_info;
        this.num_of_tag = i.num_of_tag;
        this.num_badge = i.num_badge;
        this.num_ach = i.num_ach;
      })
    });
  } // fine ionViewDidLoad()

  //Per scegliere l'avatar dalla galleria del cellulare
  selectPhoto_phone(){
    //this.loadingConvert.present();
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY, 
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 90, //MODIFICA PER PROVARE LA QUALITA' DELLA FOTO - 100 è IL MAX
      //Do una dimensione di larghezza.
      targetWidth: 400,
      encodingType: this.camera.EncodingType.PNG,
    }).then(imageData => {
      //this.loadingConvert.dismiss();
      this.displayError("La foto è stata convertita correttamente. Clicca su 'Carica foto' per completare il caricamento.")
      this.isEnabled = true;
      this.myPhoto = imageData;
    }, error => {
      //this.loadingConvert.dismiss();
      this.displayError("C'è stato un errore nel convertire la foto.")
      this.isEnabled = false;
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }

  //Per scegliere l'avatar da una foto appena scattata
  selectPhoto_camera(){
    this.callCheck()
    //this.loadingConvert.present();
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.CAMERA, 
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 90, //MODIFICA PER PROVARE LA QUALITA' DELLA FOTO - 100 è IL MAX
      targetWidth: 400,
      encodingType: this.camera.EncodingType.PNG,
    }).then(imageData => {
     // this.loadingConvert.dismiss();
      this.displayError("La foto è stata convertita correttamente. Clicca su 'Carica foto' per completare il caricamento.")
      this.isEnabled = true;
      this.myPhoto = imageData;
    }, error => {
     // this.loadingConvert.dismiss();
      this.displayError("C'è stato un errore nel convertire la foto.")
      this.isEnabled = false;
      console.log("ERROR -> " + JSON.stringify(error));
    });

  }

  callCheck(){
        var updates = {};
          var ref = firebase.database().ref('/point_of_interest/'+this.poiKey+'/photos/');
          var key = firebase.database().ref().child('/point_of_interest/'+this.poiKey+'/photos/').push().key; 
          console.log("point_of_interest/"+this.poiKey+"/photos/"+key +" = " +this.myPhotoURL);
          console.log("point_of_interest/"+this.poiKey+"/numero_foto"+" = " +this.num_of_photos);

           //Per memorizzare le foto nell'utente
          var ref = firebase.database().ref('/users/'+this.email+'/photos/');
          var key = firebase.database().ref().child('/users/'+this.email+'/photos/').push().key; 
          console.log('/users/'+this.email+'/photos/'+key+" = "+ this.myPhotoURL);
          
          //Incremento i valori nel profilo utente
          this.num_of_photo = this.num_of_photo + 1; //Incremento il contatore del numero di foto
          console.log("users/"+this.email+"/num_of_photo"+" = "+this.num_of_photo);

          this.points_photos = this.points_photos + 20; //Incremento il punteggio ottenuto dalle foto
          console.log("users/"+this.email+"/points_photos"+" = "+this.points_photos);

          this.punteggio_totale = this.punteggio_totale + 20 ; //Incremento il punteggio totale
          console.log("/users/"+this.email+"/total_points"+" = "+this.punteggio_totale); 

          this.sum_of_total_contr = this.num_of_info + this.num_of_tag + this.num_of_photo; //Incremento il valore della somma dei contributi.
          console.log("/users/"+this.email+"/sum_contributi"+" = "+this.sum_of_total_contr);

  }
  
  //Per caricare la foto sullo storage - si attiva dal pulsante carica foto!
  uploadPhoto(): void {
    this.isEnabled = false;
    this.loadingUpload.present();
    this.myPhotosRef.child("photo_"+this.poiName).child(this.generateUUID()+'.png') //dare un nome univoco
        .putString(this.myPhoto, 'base64', { contentType: 'image/png' })
        .then((savedPicture) => {
          var self = this;
          this.myPhotoURL = savedPicture.downloadURL; //download URL da inserire nel database come CHIAVE
          var updates = {};
          var ref = firebase.database().ref('/point_of_interest/'+this.poiKey+'/photos/');
          var key = firebase.database().ref().child('/point_of_interest/'+this.poiKey+'/photos/').push().key; 
          updates["point_of_interest/"+this.poiKey+"/photos/"+key] = this.myPhotoURL;
          updates["point_of_interest/"+this.poiKey+"/numero_foto"] = (this.num_of_photos+1);

           //Per memorizzare le foto nell'utente
          var ref = firebase.database().ref('/users/'+this.email+'/photos/');
          var key = firebase.database().ref().child('/users/'+this.email+'/photos/').push().key; 
          updates['/users/'+this.email+'/photos/'+key] = this.myPhotoURL;
          
          //Incremento i valori nel profilo utente
          this.num_of_photo = this.num_of_photo + 1; //Incremento il contatore del numero di foto
          updates["users/"+this.email+"/num_of_photo"] = this.num_of_photo;

          this.points_photos = this.points_photos + 20; //Incremento il punteggio ottenuto dalle foto
          updates["users/"+this.email+"/points_photos"] = this.points_photos;

          this.punteggio_totale = this.punteggio_totale + 20 ; //Incremento il punteggio totale
          updates["/users/"+this.email+"/total_points"]  = this.punteggio_totale; 

          this.sum_of_total_contr = this.num_of_info + this.num_of_tag + this.num_of_photo; //Incremento il valore della somma dei contributi.
          updates["/users/"+this.email+"/sum_contributi"]  = this.sum_of_total_contr;

          //Assegno i badge e gli achievement
          this.setPhotoBadges(updates);
          this.setPhotoAchievement(updates);
          this.setMiscAchievements(updates);
          this.setMinscBadges(updates);

          firebase.database().ref().update(updates).then(function(){        
            self.loadingUpload.dismiss();
            self.displayError("Foto caricata correttamente!")
            self.isEnabled = false;

            self.navCtrl.setRoot(MonumentPage, {
              reference: self.poi,
            });
          }).catch(function(error){
            self.loadingUpload.dismiss();
            self.isEnabled = true;
            self.displayError("C'è stato un errore nel caricamento della foto.")
          })
        });   
        
   
  }

  setPhotoBadges(updates){
    if(this.points_photos == "380"){
      updates["/users/"+this.email+"/badge/Fotografo prodigio"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.points_photos == "260"){
      updates["/users/"+this.email+"/badge/Fotografo esperto"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.points_photos == "140"){
      updates["/users/"+this.email+"/badge/Fotografo principiante"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.points_photos == "60"){
      updates["/users/"+this.email+"/badge/Fotografo novizio"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;
    }
  }

  setPhotoAchievement(updates){
    if(this.num_of_photo == "1"){
      updates["/users/"+this.email+"/achievement/1 foto"];
      updates["/users/"+this.email+"/achievement/1 foto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_photo == "10"){
      updates["/users/"+this.email+"/achievement/10 foto"];
      updates["/users/"+this.email+"/achievement/10 foto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_photo == "30"){
      updates["/users/"+this.email+"/achievement/30 foto"];
      updates["/users/"+this.email+"/achievement/30 foto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_photo == "100"){
      updates["/users/"+this.email+"/achievement/100 foto"];
      updates["/users/"+this.email+"/achievement/100 foto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;
    }
  }

  setMinscBadges(updates){
    if(this.punteggio_totale == "1000"){
      updates["/users/"+this.email+"/badge/Guru della cultura"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.punteggio_totale == "680"){
      updates["/users/"+this.email+"/badge/Contributore prodigio"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.punteggio_totale == "450"){
      updates["/users/"+this.email+"/badge/Contributore esperto"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;
      
    }else if(this.punteggio_totale == "300"){
      updates["/users/"+this.email+"/badge/Contributore principiante"]  = true;  
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge; 

    }else if(this.punteggio_totale == "60"){
      updates["/users/"+this.email+"/badge/Contributore novizio"]  = true; 
      this.num_badge = this.num_badge + 1; 
      updates["/users/"+this.email+"/num_badge"] = this.num_badge; 
    }
  }

  setMiscAchievements(updates){
    if(this.sum_of_total_contr == "1"){
      updates["/users/"+this.email+"/achievement/1 misto"];
      updates["/users/"+this.email+"/achievement/1 misto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.sum_of_total_contr == "50"){
      updates["/users/"+this.email+"/achievement/50 misto"];
      updates["/users/"+this.email+"/achievement/50 misto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.sum_of_total_contr == "150"){
      updates["/users/"+this.email+"/achievement/150 misto"];
      updates["/users/"+this.email+"/achievement/150 misto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.sum_of_total_contr == "300"){
      updates["/users/"+this.email+"/achievement/300 misto"];
      updates["/users/"+this.email+"/achievement/300 misto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;
    }
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

  displayError(messageErr: string){
    let toast = this.toastCtrl.create({
      message: messageErr,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
   

}
