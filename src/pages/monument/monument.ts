import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
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
  
  //Variabili miste
  poi;
  poiName;
  descriptions;
  poiTags;

  //per la descrizione e l'immagine di copertina del POI
  descrizione_poi;
  foto_url;

  //per le info e i tag del POI
  public poi_NUMEROINFO: Array<any> = [];
  numero_info_POI;

  //per prendere descrizione e foto copertina del POI
  public poi_photo_description : Array<any> = [];

  //mi serve per mostrare a video l'avviso che il poi non ha informazioni/tag
  isEnabled_info : boolean = true;
  isEnabled_tag : boolean = true;
  isEnabled_foto : boolean = true;

  //Per prendere le foto degli utenti
  public poi_user_photos: Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public modal: ModalController) {
    this.poi = navParams.get('reference')
    this.poiName = this.poi.myPoi.nome
    this.poiTags = this.poi.tipo
  }

  ionViewDidLoad() { //questo metodo viene richiamato solo una volta
    console.log('ionViewDidLoad MonumentPage');
    
    
  }

  //Apre la modale che mi mostra la foto in dimensione originale!
  openModal(index){ 
    let obj = {url_immagine : this.poi_user_photos[index]}
    let myModal = this.modal.create('FotoPoiModalPage', obj);
    myModal.present();
  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter MonumentPage');
    
    this.pageDescriptionPhotoRefresh(); //Carico una volta soltanto la descrizione del POI e la sua foto

    this.pageDetailsRefresh();
    this.refreshList();
    this.refreshTags();
    this.retrieveFoto();
    
  }

  pageDescriptionPhotoRefresh(){
    var poi_ref = firebase.database().ref("/point_of_interest/");
    this.poi_photo_description = [];

    poi_ref.orderByKey().equalTo(this.poi.chiave).on('value',itemSnapshot =>{
      itemSnapshot.forEach(itemSnap =>{
        this.poi_photo_description.push(itemSnap.val());
  
        return false;
      });
      this.poi_photo_description.forEach(i=>{ //Retrieve the details, also the image url
        this.descrizione_poi = i.descrizione;
        this.foto_url = i.photo_url;
      })
    });
  }

  pageDetailsRefresh(){
    var poi_ref = firebase.database().ref("/point_of_interest/");
    this.poi_NUMEROINFO = [];

    poi_ref.orderByKey().equalTo(this.poi.chiave).on('value',itemSnapshot =>{
      itemSnapshot.forEach(itemSnap =>{
        this.poi_NUMEROINFO.push(itemSnap.val());
  
        return false;
      });
      this.poi_NUMEROINFO.forEach(i=>{ //Retrieve the details, also the image url
        
        if (i.numero_informazioni == 0) //Se non ho info nel POI devo nascondere l'elenco vuoto e mostro il messaggio
        {
          this.isEnabled_info = false;
          console.log("this.isEnabled_info"+this.isEnabled_info);
        }

        console.log("this.isEnabled_info"+this.isEnabled_info);
    
        if (i.numero_foto == 0) //Se non ho info nel POI devo nascondere l'elenco vuoto e mostro il messaggio
        {
          this.isEnabled_foto = false;
          console.log("this.isEnabled_foto"+this.isEnabled_foto);
        }

        console.log("this.isEnabled_info"+this.isEnabled_foto);

        if (i.numero_tag == 0) //Se non ho info nel POI devo nascondere l'elenco vuoto e mostro il messaggio
        {
          this.isEnabled_tag = false;
          console.log("this.isEnabled_tag"+this.isEnabled_tag);
        }

        console.log("this.isEnabled_info"+this.isEnabled_tag);
      })
    });
  }

  //Mostra foto
  retrieveFoto(){
    var poi_ref = firebase.database().ref("/point_of_interest/"+this.poi.chiave+"/photos");
    this.poi_user_photos = [];

    //voglio ciclare in photos dentro al POI e tirare fuori i val di photos. 
    poi_ref.on('value',itemSnapshot =>{
      itemSnapshot.forEach(itemSnap =>{
        this.poi_user_photos.push(itemSnap.val()); 
        return false;
      });
    });
  }

  //Mostra tag preferenza
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
 
  //Mostra lista descrizioni
  refreshList(){

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
