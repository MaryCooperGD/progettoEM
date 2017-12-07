import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UploadPhotoPage } from '../upload-photo/upload-photo';
import { EditMonumentPage } from "../edit-monument/edit-monument";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

/**
 * Generated class for the MonumentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-monument',
  templateUrl: 'monument.html',
})
export class MonumentPage {

  poi;
  poiName;
  descriptions;
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.poi = navParams.get('reference')
    this.poiName = this.poi.myPoi.nome
    this.refreshList();
    
    

    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MonumentPage');


  }

  ionViewWillEnter(){
    this.refreshList()
  }


  refreshList(){

    var ref = firebase.database().ref("/point_of_interest/"+this.poi.chiave+"/description/");
    var ref1 = firebase.database().ref("/descriptions/")
    var descpts = [];
    ref.once('value', function(poiDesc){
      poiDesc.forEach(function(singleD){
        ref1.once('value', function(descs){ 
          descs.forEach(function(d){
            if(singleD.key == d.key){
               var data = {text: d.child("testo").val(), user: d.child("username_utente").val()}
               descpts.push(data);
            }
            return false;
          })
        })
        return false;
      }) 
    })

    this.descriptions = descpts;
    

  }

  openUploadPhotoPage(){
    this.navCtrl.push(UploadPhotoPage, {
      poi: this.poi,
    })
  } 

  openEditMonumentPage(){
    this.navCtrl.push(EditMonumentPage, {
      poi: this.poi,
      
    })
  } 


}
