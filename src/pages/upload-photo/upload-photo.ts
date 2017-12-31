import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WelcomepagePage } from "../welcomepage/welcomepage";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Api } from "../../providers/api";
import { Camera } from "@ionic-native/camera";
import * as firebase from 'firebase/app';
import { FirebaseApp } from "angularfire2";


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

  username;
  email;

  //Per gestire il caricamento delle foto
  public myPhotosRef: any;
  public myPhoto: any;
  public myPhotoURL: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public camera:Camera) {
      this.poi = navParams.get('poi')
      this.poiName = this.poi.myPoi.nome

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
      this.myPhoto = imageData;
      //this.uploadPhoto();
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }
  
  
  //Per caricare la foto sullo storage - si attiva dal pulsante carica foto!
  uploadPhoto(): void {
    this.myPhotosRef.child("photo_"+this.poiName).child(this.generateUUID()+'.png') //dare un nome univoco
        .putString(this.myPhoto, 'base64', { contentType: 'image/png' })
        .then((savedPicture) => {
          this.myPhotoURL = savedPicture.downloadURL;
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
   

}
