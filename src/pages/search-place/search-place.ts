import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MonumentPage } from "../monument/monument";
import { Api } from "../../providers/api";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
/**
 * Generated class for the SearchPlacePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search-place',
  templateUrl: 'search-place.html',
})
export class SearchPlacePage {

  public city:string;
  public pois = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,public api:Api) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPlacePage');
    //this.city = this.api.getCity();
    this.city = "Cesena";
    this.loadPois()

  }

  ionViewWillEnter(){
    this.loadPois();

  }


  loadPois(){
    var list = [];
    var self = this;
     var ref = firebase.database().ref("/point_of_interest/");
     var ref1 = firebase.database().ref("/tag/")
     ref.once('value', function(pois){
      pois.forEach(function(singlepoi){
        if(singlepoi.child("città").val() == self.city){

          var tagsList = [];
          singlepoi.child("tags").forEach(t=>{ //scorro i tag associati al punto di interesse
            ref1.once('value', function(tag){
              tag.forEach(function(singletag){
                if(t.key == singletag.key){
                  tagsList.push(singletag.child("nome").val())
                }
                return false;
              })
            })
            return false;
          })

          //var data = { nome: singlepoi.child("nome").val(), tipo:tagsList, chiave: singlepoi.key }
          //var data = { myPoi: singlepoi, tipo:tagsList }
          var data = {myPoi: singlepoi.val(), tipo: tagsList, chiave: singlepoi.key}
          list.push(data);
        }
        return false;
      })

     })
      this.pois = list;
     

  }

  openPlace(item){
    this.navCtrl.push(MonumentPage, {
      reference: item
    })
  }


  
}
