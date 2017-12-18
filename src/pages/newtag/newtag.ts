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

  //per inserire punti!
  punteggio_tag;
  punteggio_totale;
  public user_email: Array<any> = [];
  public user_emailRef: firebase.database.Reference = firebase.database().ref('/users/');
  

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

    this.setTagBadges(updates)
    this.setMinscBadges(updates);

    this.setTagAchievements(updates);

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
      if(this.punteggio_tag >= 300){
        updates["/users/"+this.email+"/badge/Taggatore prodigio"]  = true;
      }else if(this.punteggio_tag >= 180){
        updates["/users/"+this.email+"/badge/Taggatore esperto"]  = true;
      }else if(this.punteggio_tag >= 50){
        updates["/users/"+this.email+"/badge/Taggatore principiante"]  = true;
      }else if(this.punteggio_tag >= 15){
        updates["/users/"+this.email+"/badge/Taggatore novizio"]  = true;   
      }
  }


  setMinscBadges(updates){
     if(this.punteggio_totale >= 1000){
       updates["/users/"+this.email+"/badge/Guru della cultura"]  = true;
     }else if(this.punteggio_totale >= 500){
       updates["/users/"+this.email+"/badge/Contributore prodigio"]  = true;
     }else if(this.punteggio_totale >= 350){
       updates["/users/"+this.email+"/badge/Contributore esperto"]  = true;
     }else if(this.punteggio_totale >= 200){
       updates["/users/"+this.email+"/badge/Contributore principiante"]  = true;   
     }else if(this.punteggio_totale >= 50){
       updates["/users/"+this.email+"/badge/Contributore novizio"]  = true;   
     }
   }

   setTagAchievements(updates){
    
    if(this.num_of_tag == "1"){
      updates["/users/"+this.email+"/achievement/1 tag"]  = true;
      
    }else if(this.num_of_tag == "20"){
      updates["/users/"+this.email+"/achievement/20 tag"]  = true;
      
    }else if(this.num_of_tag == "100"){
      updates["/users/"+this.email+"/achievement/100 tag"]  = true;

    }else if(this.num_of_tag == "300"){
      updates["/users/"+this.email+"/achievement/300 tag"]  = true;
    }
    
  }




}

