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

  //per vedere il numero di info,tag e foto del POI
  public poi_numero_info: Array<any> = [];
  public poi_numero_tag: Array<any> = [];
  public poi_numero_foto: Array<any> = [];

  //per prendere descrizione e foto copertina del POI
  public poi_photo_description : Array<any> = [];
  descrizione_poi;
  foto_url;

  email;
  phone;

  //mi serve per mostrare a video l'avviso che il poi non ha informazioni/tag
  isEnabled_info : boolean = true;
  isEnabled_tag : boolean = true;
  isEnabled_foto : boolean = true;

  isEnabled_email : boolean = false;
  isEnabled_phone : boolean = false;

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
    
    this.pageDescriptionPhotoRefresh(); //Per caricare la descrizione e la foto

    //Carico informazioni, tag e foto
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
      this.poi_photo_description.forEach(i=>{ 
        this.descrizione_poi = i.descrizione;
        this.foto_url = i.photo_url;

        //Siccome non tutti i campi sono definiti per ogni POI, controllo quali campi ci sono e rendo poi con isEnabled visibili solo quelli presenti per il POI
        this.email = i.email;
        this.phone = i.phone;

        if(this.email != undefined){
          this.isEnabled_email = true;
        }
        
        if(this.phone != undefined){
          this.isEnabled_phone = true;
        }

      })
    });
  }


  //Mostra foto
  retrieveFoto(){
    var poi_ref = firebase.database().ref("/point_of_interest/");
    this.poi_numero_foto = [];

    poi_ref.orderByKey().equalTo(this.poi.chiave).on('value',itemSnapshot =>{
      itemSnapshot.forEach(itemSnap =>{
        this.poi_numero_foto.push(itemSnap.val());
  
        return false;
      });
      this.poi_numero_foto.forEach(i=>{ 
        //Se non ho info nel POI devo nascondere l'elenco vuoto e mostro il messaggio
        if (i.numero_foto == 0) {
          this.isEnabled_foto = false;
          
        }else{
          this.isEnabled_foto = true;
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
      })
    });
  }

  //Mostra tag preferenza
  refreshTags(){
    var poi_ref = firebase.database().ref("/point_of_interest/");
    this.poi_numero_tag = [];

    poi_ref.orderByKey().equalTo(this.poi.chiave).on('value',itemSnapshot =>{
      itemSnapshot.forEach(itemSnap =>{
        this.poi_numero_tag.push(itemSnap.val());
        return false;
      });
      this.poi_numero_tag.forEach(i=>{ 
        //Se non ho info nel POI devo nascondere l'elenco vuoto e mostro il messaggio
        if (i.numero_tag == 0) {
          this.isEnabled_tag = false;
          
        }else {
          this.isEnabled_tag = true;
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
      })
    });
  }
 
  //Mostra lista descrizioni
  refreshList(){
    var poi_ref = firebase.database().ref("/point_of_interest/");
    this.poi_numero_info = [];

    poi_ref.orderByKey().equalTo(this.poi.chiave).on('value',itemSnapshot =>{
      itemSnapshot.forEach(itemSnap =>{
        this.poi_numero_info.push(itemSnap.val());
        return false;
      });
      this.poi_numero_info.forEach(i=>{ 
        //Se non ho info nel POI devo nascondere l'elenco vuoto e mostro il messaggio
        if (i.numero_informazioni == 0) {
          this.isEnabled_info = false;
          
        }
        else{
          this.isEnabled_info = true;
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
      })
    });  
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
