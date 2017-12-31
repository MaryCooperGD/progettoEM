import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public camera:Camera,
  public toastCtrl:ToastController) {
      this.poi = navParams.get('poi')
      this.poiName = this.poi.myPoi.nome
      this.poiKey = this.poi.chiave;
      var num_photos_ref = firebase.database().ref('point_of_interest/'+this.poiKey+'/numero_foto/')
      var ref = firebase.database().ref('/point_of_interest/'+this.poiKey+'/photos/');
      var key = firebase.database().ref().child('point_of_interest').push().key; 
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

  }

  //Per scegliere l'avatar dalla galleria del cellulare
  selectPhoto_phone(){
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY, 
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 100,
      encodingType: this.camera.EncodingType.PNG,
    }).then(imageData => {
      this.displayError("La foto è stata convertita correttamente. Clicca su 'Carica foto' per completare il caricamento.")
      this.isEnabled = true;
      this.myPhoto = imageData;
    }, error => {
      this.displayError("C'è stato un errore nel convertire la foto.")
      this.isEnabled = false;
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }

  selectPhoto_camera(){
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.CAMERA, 
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 100,
      encodingType: this.camera.EncodingType.PNG,
    }).then(imageData => {
      this.displayError("La foto è stata convertita correttamente. Clicca su 'Carica foto' per completare il caricamento.")
      this.isEnabled = true;
      this.myPhoto = imageData;
    }, error => {
      this.displayError("C'è stato un errore nel convertire la foto.")
      this.isEnabled = false;
      console.log("ERROR -> " + JSON.stringify(error));
    });

  }
  
  
  //Per caricare la foto sullo storage - si attiva dal pulsante carica foto!
  uploadPhoto(): void {
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
          firebase.database().ref().update(updates).then(function(){
            self.displayError("Foto caricata correttamente!")
            self.isEnabled = false;
            self.navCtrl.push(MonumentPage);
          }).catch(function(error){
            self.displayError("C'è stato un errore nel caricamento della foto.")
          })
          //console.log("url avatar appena caricato"+this.myPhotoURL);
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

  displayError(messageErr: string){
    let toast = this.toastCtrl.create({
      message: messageErr,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
   

}
