import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ToastController } from 'ionic-angular';
import { Api } from '../../providers/api';
import firebase from 'firebase';
import { EditMonumentPage } from "../edit-monument/edit-monument";
@Component({
  selector: 'page-newtag',
  templateUrl: 'newtag.html',
})
export class NewtagPage {

  public poiName:any;
  public tagList: Array<any>;
  public loadedTagList: Array<any>;
  public poiSelected: any;
  public poiKey:any;
  public isEnabled :boolean;
  public textSearch:any;
  poi;


  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, 
  public menuCtrl: MenuController, public toastCtrl: ToastController) {
 
    this.poi = navParams.get('poi')
      
      var ref1 = firebase.database().ref('/tag/'); //prendo tutti i tag esistenti

      
      //creo la lista di tag
       ref1.once('value', tagList => {
      let tags = [];
      tagList.forEach( poi => {
        tags.push(poi.val());
        return false;
      });

      this.tagList = tags;
      this.loadedTagList = tags;
    });
        
  }

  ionViewDidLoad() {
    this.menuCtrl.close();
  }

  ionViewWillEnter() {
    this.initializeItems();

  }

  addSelectedTag(index){
   var tagToAdd = this.tagList[index]; //corretto
   var updates = {};
  updates['/point_of_interest/'+ this.poi.chiave + '/tags/' + tagToAdd.key] = "true";
  firebase.database().ref().update(updates);
}

refreshItems():void{
var ref1 = firebase.database().ref('/tag/'); //prendo tutti i tag esistenti


      //creo la lista di tag
       ref1.on('value', tagList => {
      let tags = [];
      tagList.forEach( poi => {
        tags.push(poi.val());
        return false;
      });

      this.tagList = tags;
      this.loadedTagList = tags;
    });
}

initializeItems(): void {
  this.tagList = this.loadedTagList;
}

presentToastOk(){
  
  let toast = this.toastCtrl.create({
    message: 'Il tag è stato aggiunto correttamente!',
    duration: 2000,
    position: 'top'
  }).present();
  this.initializeItems();
} 

presentToastWrong(){
  let toast = this.toastCtrl.create({
    message: 'Ops! Sembra che tu stia cercando di aggiungere un tag esistente!',
    duration: 2000,
    position: 'top'
  }).present();

}

clickedButton(){
  if (this.tagList.length==0){//posso aggiungere il tag
    var tagData = {
      nome: this.textSearch
    }
    var key = firebase.database().ref().child('tag').push().key;
    var updates = {};
    updates['/tag/'+key] = tagData;
    updates['/point_of_interest/'+ this.poi.chiave + '/tags/' + key] = "true";
    firebase.database().ref().update(updates);
    this.presentToastOk();
    this.refreshItems();
    this.isEnabled = false;
  } else {
    this.presentToastWrong();
    
  }
}


getItems(searchbar) {
  // Reset items back to all of the items
  this.initializeItems();

  // set q to the value of the searchbar
  var q = searchbar.srcElement.value;
  this.textSearch = q;

  // if the value is an empty string don't filter the items
  if (!q) {
    return;
  }


  this.tagList = this.tagList.filter((v) => {
    if(v.nome && q) {
      if (v.nome.toLowerCase().indexOf(q.toLowerCase()) > -1) {
        return true;
      }
      return false;
    }
  });

  if (this.tagList.length==0){
    this.isEnabled = true;
  } else{
    this.isEnabled = false;
  }

 
}
}
