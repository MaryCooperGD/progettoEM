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

  loadPois(){
    var list = [];
    var self = this;
     var ref = firebase.database().ref("/point_of_interest/");
     ref.once('value', function(pois){
      pois.forEach(function(singlepoi){
        if(singlepoi.child("città").val() == self.city){
          var data = { nome: singlepoi.child("nome").val(), tipo:singlepoi.child("tipologia").val() }
          list.push(data);
          console.log("Nome: " +list[0].nome)
          
        }
        return false;
      })

     })
      this.pois = list;
     

  }

  openPlace(){
    this.navCtrl.push(MonumentPage)
  }

}
