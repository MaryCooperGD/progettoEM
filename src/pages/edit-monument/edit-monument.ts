import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { WelcomepagePage } from "../welcomepage/welcomepage";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Api } from "../../providers/api";
import { MonumentPage } from "../monument/monument";
import { NewtagPage } from "../newtag/newtag";

/**
 * Generated class for the EditMonumentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-monument',
  templateUrl: 'edit-monument.html',
})
export class EditMonumentPage {

  public textSearch: any;
  public myInput;
  public poi;
  username:any;
  email:any;
  isAccessibilityOn = false;
  isFamilyOn = false;

  //per prendere email (id dell'utente loggato) che ci serve per sapere dove aggiungere il punteggio
  public user_email: Array<any> = [];
  public user_informations_Ref: firebase.database.Reference = firebase.database().ref('/users/');

  //per le info e i tag
  public poi_NUMEROINFO: Array<any> = [];
  public poi_ref: firebase.database.Reference = firebase.database().ref("/point_of_interest/");

  numero_info_POI;
  numero_tag_POI;
  
  //punteggi che verranno incrementati
  punteggio_info;
  punteggio_totale;
  punteggio_tag;

  public tagList: Array<any>;
  public loadedTagList: Array<any>;

  //Variabili necessarie per assegnare gli achievements
  num_of_tag;
  num_of_info;
  data_ach;
  sum_of_total_contr;
  num_of_photo;
  num_ach;
  num_badge;

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public toastCtrl:ToastController,) {
    this.poi = navParams.get('poi');
    this.refreshTags();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditMonumentPage');

    if(this.api.user.displayName==null){
      this.username = '';
      this.email = '';
    }else {
      this.username = this.api.user.displayName
      this.email = this.api.email_id; //Ricavo dall'API la mail che mi serve per identificare l'utente
    }   
     
    this.user_informations_Ref.orderByKey().equalTo(this.email).on('value',itemSnapshot =>{
      this.user_email = [];
      itemSnapshot.forEach( itemSnap => {
        this.user_email.push(itemSnap.val());
        return false;
      });
      this.user_email.forEach(i=>{
        
        this.punteggio_info = i.points_info;
        this.punteggio_totale = i.total_points;
        this.punteggio_tag = i.points_tag;

        //numero contributi
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
        this.isAccessibilityOn = (i.accessibilità=="Y") ? true : false
        this.isFamilyOn = (i.famiglia=="Y") ? true : false
        this.numero_info_POI = i.numero_informazioni;
        this.numero_tag_POI = i.numero_tag;
      })
    });

  } //fine ionViewDidLoad

  refreshTags(){
    var ref = firebase.database().ref('/point_of_interest/'+this.poi.chiave+'/tags/')
    var ref1 = firebase.database().ref('/tag/');

    let tagShow = [];
    ref1.orderByChild("nome").once('value', function(snapshot){ //ciclo sui tag
      snapshot.forEach(function(childSnapshot){
          var childKey = childSnapshot.key; //chiave tag
          var exists = false;
          ref.once('value', function(snapshot){
            snapshot.forEach(function(childSnapshot){
              var childKey1 = childSnapshot.key;
              if (childKey == childKey1){ //se ne trovo uno uguale, eisste nella lista dei tag del poi
                  exists = true;
              }
              return false;
            })
          }).then(a => {
            if (!exists){
              tagShow.push(childSnapshot);
            }
          })                
        return false;
      })
    }).then(a=>{
      this.tagList = tagShow;
 
    this.loadedTagList = tagShow;
    })

    this.tagList = tagShow;
    this.loadedTagList = tagShow;
  }

  addSelectedTag(index){
    var tagToAdd = this.tagList[index]; //corretto
   
    var updates = {};
   updates['/point_of_interest/'+ this.poi.chiave + '/tags/' + tagToAdd.key] = "true";

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
    updates["/point_of_interest/"+this.poi.chiave+"/numero_tag/"] = this.numero_tag_POI;

    this.setTagBadges(updates)
    this.setMinscBadges(updates);

    this.setTagAchievements(updates);
    this.setMinscAchievements(updates);

   firebase.database().ref().update(updates);
   this.displayLoginError("Grazie per aver contributo, hai appena guadagnato 5 punti!") ;
   this.refreshTags();
  }

 ionViewWillEnter(){
   this.initializeItems()
}

 initializeItems(): void {
  this.tagList = this.loadedTagList;
}

//Aggiunge le informazioni nel database in maniera corretta, manda messaggio di conferma e torna a pagina precedente
  addInfo(){

    var ref = firebase.database().ref("/descriptions/");
    var ref1 = firebase.database().ref("/point_of_interest/"+this.poi.chiave+"/")
    var key = firebase.database().ref().child('descriptions').push().key;

    var data = {
      testo: this.myInput,
      username_utente: this.username,
      insert_data : new Date().getTime()
    }

    var updates = {}
    updates["/descriptions/"+key] = data;
    updates["/point_of_interest/"+this.poi.chiave+"/description/" + key ] = true;

    //Incrementa la variabile dei punti delle informazioni
    this.punteggio_info = this.punteggio_info + 15 ;
    updates["/users/"+this.email+"/points_info"]  = this.punteggio_info;

    //Incrementa la variabile dei PUNTI TOTALI
    this.punteggio_totale = this.punteggio_totale + 15 ;
    updates["/users/"+this.email+"/total_points"]  = this.punteggio_totale;

    //incrementa la variabile del numero delle info inserite 
    this.num_of_info = this.num_of_info + 1;
    updates["/users/"+this.email+"/num_of_info"]  = this.num_of_info;
   
    this.sum_of_total_contr = this.num_of_info + this.num_of_tag;
    updates["/users/"+this.email+"/sum_contributi"]  = this.sum_of_total_contr
    //console.log("Dentro addInfo: "+this.sum_of_total_contr);

    this.numero_info_POI ++;
    updates["/point_of_interest/"+this.poi.chiave+"/numero_informazioni/"] = this.numero_info_POI;
    //Controllo il punteggio delle informazioni, in base a quanto è, associo un badge!!! 
    //non mi piace troppo tecnicamente ma funziona. è da migliorare se possibile
    this.setInfoBadges(updates);
    this.setMinscBadges(updates);

    this.setInfoAchievements(updates);
    this.setMinscAchievements(updates);

    firebase.database().ref().update(updates);
    this.displayLoginError("Grazie per aver contributo, hai appena guadagnato 15 punti!");
  }

  openAddNewTagPage(){
    this.navCtrl.push(NewtagPage, {
     poi: this.poi

    })
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

  setInfoBadges(updates){
    if(this.punteggio_info == "390"){
      updates["/users/"+this.email+"/badge/Informatore prodigio"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.punteggio_info == "225"){
      updates["/users/"+this.email+"/badge/Informatore esperto"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.punteggio_info == "120"){
      updates["/users/"+this.email+"/badge/Informatore principiante"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;
      
    }else if(this.punteggio_info == "45"){
      updates["/users/"+this.email+"/badge/Informatore novizio"]  = true;  
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

  setInfoAchievements(updates){
    if(this.num_of_info == "1"){
      updates["/users/"+this.email+"/achievement/1 info"];
      updates["/users/"+this.email+"/achievement/1 info/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;
      
    }else if(this.num_of_info == "10"){
      updates["/users/"+this.email+"/achievement/10 info"];
      updates["/users/"+this.email+"/achievement/10 info/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;
      
    }else if(this.num_of_info == "50"){
      updates["/users/"+this.email+"/achievement/50 info"];
      updates["/users/"+this.email+"/achievement/50 info/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_info == "150"){
      updates["/users/"+this.email+"/achievement/150 info"];
      updates["/users/"+this.email+"/achievement/150 info/data"] = new Date().getTime();
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

  addInfoAF(){
    var self = this;
    var ref = firebase.database().ref('/point_of_interest');
    var updates = {};
    updates['/point_of_interest/'+this.poi.chiave+'/accessibilità'] = this.isAccessibilityOn ? 'Y' : 'N'
    updates['/point_of_interest/'+this.poi.chiave+'/famiglia'] = this.isFamilyOn ? 'Y' : 'N'
    firebase.database().ref().update(updates);
    
  }
}
