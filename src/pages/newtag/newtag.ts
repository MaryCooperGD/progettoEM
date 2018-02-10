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

  username:any;
  email: any;

  //per ach
  num_of_tag;
  num_of_info;
  sum_of_total_contr;
  num_ach;
  num_badge;
  num_of_photo;

  //per inserire punti!
  punteggio_tag;
  punteggio_totale;
  public user_email: Array<any> = [];
  public user_emailRef: firebase.database.Reference = firebase.database().ref('/users/');
  
  //per le info e i tag
  public poi_NUMEROINFO: Array<any> = [];
  public poi_ref: firebase.database.Reference = firebase.database().ref("/point_of_interest/");
  numero_tag_POI; //numero di tag del punto di interesse

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

    if(this.api.user.displayName==null){
      this.username = '';
      this.email = '';
    }else {
      this.username = this.api.user.displayName;
      this.email = this.api.email_id; //Ricavo dall'API la mail che mi serve per identificare l'utente 
    }   
     
    this.user_emailRef.orderByChild("username").equalTo(this.username).on('value',itemSnapshot =>{
      this.user_email = [];
      itemSnapshot.forEach( itemSnap => {
        this.user_email.push(itemSnap.val());
        return false;
      });
      this.user_email.forEach(i=>{
        this.punteggio_tag = i.points_tag;
        this.punteggio_totale = i.total_points;

        this.num_of_tag = i.num_of_tag;
        this.num_of_info = i.num_of_info;
        this.num_of_photo = i.num_of_photo;

        this.num_ach = i.num_ach;
        this.num_badge = i.num_badge;

      })
    });
    this.poi_ref.orderByKey().equalTo(this.poi.chiave).on('value',itemSnapshot =>{
      this.poi_NUMEROINFO = [];
      itemSnapshot.forEach(itemSnap =>{
        this.poi_NUMEROINFO.push(itemSnap.val());
        return false;
      });
      this.poi_NUMEROINFO.forEach(i=>{
         
        this.numero_tag_POI = i.numero_tag;
        console.log("Numero tag POI "+this.numero_tag_POI);
      })
    });
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

    //Incrementa la variabile dei punti delle informazioni
    this.punteggio_tag = this.punteggio_tag + 5 ;
    updates["/users/"+this.email+"/points_tag"]  = this.punteggio_tag;

    //Incrementa la variabile dei PUNTI TOTALI
    this.punteggio_totale = this.punteggio_totale + 5 ;
    updates["/users/"+this.email+"/total_points"]  = this.punteggio_totale;

    this.num_of_tag = this.num_of_tag + 1;
    updates["/users/"+this.email+"/num_of_tag"]  = this.num_of_tag;

    this.sum_of_total_contr = this.num_of_info + this.num_of_tag + this.num_of_photo;
    updates["/users/"+this.email+"/sum_contributi"]  = this.sum_of_total_contr;

     //Incremento il numero di tag che il POI possiede
     this.numero_tag_POI ++;
     console.log(this.numero_tag_POI);
     updates["/point_of_interest/"+this.poi.chiave+"/numero_tag/"] = this.numero_tag_POI;

    this.setTagBadges(updates)
    this.setMinscBadges(updates);

    this.setTagAchievements(updates);
    this.setMinscAchievements(updates);

    firebase.database().ref().update(updates);
    
    this.presentToastOk();
    this.displayLoginError("Grazie per aver contributo, hai appena guadagnato 5 punti!") ;
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

//per il messaggio di conferma!
displayLoginError(messageErr: string){
  let toast = this.toastCtrl.create({
    message: messageErr,
    duration: 2000,
    position: 'top'
  });
  toast.present();
}

setTagBadges(updates){
  if(this.punteggio_tag == "300"){
    updates["/users/"+this.email+"/badge/Taggatore prodigio"]  = true;
    this.num_badge = this.num_badge + 1;
    updates["/users/"+this.email+"/num_badge"] = this.num_badge;

  }else if(this.punteggio_tag == "180"){
    updates["/users/"+this.email+"/badge/Taggatore esperto"]  = true;
    this.num_badge = this.num_badge + 1;
    updates["/users/"+this.email+"/num_badge"] = this.num_badge;

  }else if(this.punteggio_tag == "50"){
    updates["/users/"+this.email+"/badge/Taggatore principiante"]  = true;
    this.num_badge = this.num_badge + 1;
    updates["/users/"+this.email+"/num_badge"] = this.num_badge;

  }else if(this.punteggio_tag == "15"){
    updates["/users/"+this.email+"/badge/Taggatore novizio"]  = true;
    this.num_badge = this.num_badge + 1;
    updates["/users/"+this.email+"/num_badge"] = this.num_badge;

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

setTagAchievements(updates){
    if(this.num_of_tag == "1"){
      updates["/users/"+this.email+"/achievement/1 tag"];
      updates["/users/"+this.email+"/achievement/1 tag/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_tag == "20"){
      updates["/users/"+this.email+"/achievement/20 tag"];
      updates["/users/"+this.email+"/achievement/20 tag/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_tag == "100"){
      updates["/users/"+this.email+"/achievement/100 tag"];
      updates["/users/"+this.email+"/achievement/100 tag/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_tag == "300"){
      updates["/users/"+this.email+"/achievement/300 tag"];
      updates["/users/"+this.email+"/achievement/300 tag/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;
    }
    
  }

  setMinscAchievements(updates){
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



}

