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

  //---INIZIO--parte per far funzionare i segment
  menu: string = "Descrizione";
  
  //---FINE--parte funzionamento segment

  poi;
  poiName;
  descriptions;
  poiTags;
  
  

   //per le info e i tagdel poi
   public poi_NUMEROINFO: Array<any> = [];
  // public poi_ref: firebase.database.Reference = firebase.database().ref("/point_of_interest/");
   numero_info_POI;

   //mi serve per mostrare a video l'avviso che il poi non ha informazioni/tag
    isEnabled_info : boolean = true;
    isEnabled_tag : boolean = true;
   
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.poi = navParams.get('reference')
    this.poiName = this.poi.myPoi.nome
    this.poiTags = this.poi.tipo
    this.refreshList();
    this.refreshTags();
   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MonumentPage');
    this.pageDetailsRefresh()
    

  }

  ionViewWillEnter(){
    
    this.refreshList()
    this.refreshTags()
    
  }

  pageDetailsRefresh(){
    
    
    var poi_ref = firebase.database().ref("/point_of_interest/");

    this.poi_NUMEROINFO = [];
    poi_ref.orderByKey().equalTo(this.poi.chiave).on('value',itemSnapshot =>{
      
      itemSnapshot.forEach(itemSnap =>{
        this.poi_NUMEROINFO.push(itemSnap.val());
        return false;
      });
      this.poi_NUMEROINFO.forEach(i=>{
        
        if(i.numero_tag == 0) //Se non ho tag devo nascondere l'elenco vuoto e mostro il messaggio
        {
         this.isEnabled_tag = false;
          console.log("VALORE ISENABLED_INFO"+this.isEnabled_tag);
        }

        if (i.numero_informazioni == 0) //Se non ho info devo nascondere l'elenco vuoto e mostro il messaggio
        {
          this.isEnabled_info = false;
          console.log("VALORE ISENABLED_INFO"+this.isEnabled_info);
        }

        console.log("DENTRO NUMERO CONTRIBUTI POI ")
      })
    });
  }

  refreshTags(){
    var ref = firebase.database().ref('/point_of_interest/'+this.poi.chiave+'/tags/')
    var ref1 = firebase.database().ref('/tag/');

    let tagShow = [];
    ref1.once('value', function(snapshot){ //ciclo sui tag
      snapshot.forEach(function(childSnapshot){
          var childKey = childSnapshot.key; //chiave tag
          ref.once('value', function(snapshot1){
            snapshot1.forEach(function(childSnapshot1){
              var childKey1 = childSnapshot1.key;
              if (childKey == childKey1){ //se ne trovo uno uguale, eisste nella lista dei tag del poi
                  tagShow.push(childSnapshot.child("nome").val())
              }
              return false;
            })
          })             
        return false;
      })
    }).then(a=>{
      this.poiTags = tagShow;
    
    })

    this.poiTags = tagShow;
  }
 
  


  refreshList(){
    console.log("dentro refresh list dopo aver aggiunto info")

    this.isEnabled_info= true; //Mi serve perchè quando refresho la pagina mi fa subito comparire i commenti inseriti
    console.log("isenabled: "+this.isEnabled_info)

    var ref = firebase.database().ref("/point_of_interest/"+this.poi.chiave+"/description/");
    var ref1 = firebase.database().ref("/descriptions/")
    var descpts = [];
    ref.once('value', function(poiDesc){
      poiDesc.forEach(function(singleD){
        ref1.once('value', function(descs){ 
          descs.forEach(function(d){
            if(singleD.key == d.key){
              //Per comporre la descrizione completa pushamo il testo, l'username di chi lo ha scritto e la data di inserimento del commento
               var data = {text: d.child("testo").val(), user: d.child("username_utente").val(), data_ins : d.child("insert_data").val()}
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
