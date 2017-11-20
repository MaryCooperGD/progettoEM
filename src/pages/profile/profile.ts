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


  }

}
