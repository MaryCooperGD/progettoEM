import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { UploadPhotoPage } from '../upload-photo/upload-photo';
import { EditMonumentPage } from "../edit-monument/edit-monument";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { CallNumber } from '@ionic-native/call-number';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Api } from "../../providers/api";

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

  email_user;
  username;
  phone;
  website;
  indirizzo;
  gratuito;
  email;

  accessibility;
  families;

  //mi serve per mostrare a video l'avviso che il poi non ha informazioni/tag
  isEnabled_info : boolean = true;
  isEnabled_tag : boolean = true;
  isEnabled_foto : boolean = true;

  isEnabled_email : boolean = true;
  isEnabled_phone : boolean = true;
  isEnabled_website : boolean = true;

  isEnabled_accessibility : boolean = true;
  isEnabled_family : boolean = true;
  isEnabled_gratuito : boolean = true;
  
  //Per prendere le foto degli utenti
  public poi_user_photos: Array<any> = [];

  //Per il numero di contributi dell'utente 
  public user_informations_Ref: firebase.database.Reference = firebase.database().ref('/users/');
  public user_details : Array<any> = [];
  num_cond;
  num_ach; //per incrementare gli achievements

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public api: Api, public modal: ModalController, private callNumber: CallNumber, private sharingVar: SocialSharing) {
    this.poi = navParams.get('reference')
    this.poiName = this.poi.myPoi.nome;
    this.poiTags = this.poi.tipo;
  }

  ionViewDidLoad() { //questo metodo viene richiamato solo una volta
    console.log('ionViewDidLoad MonumentPage');

    if(this.api.user.displayName==null){
      this.username = '';
      this.email_user = '';
    }else {
      this.username = this.api.user.displayName
      this.email_user = this.api.email_id; //Ricavo dall'API la mail che mi serve per identificare l'utente
    }   
     
    this.user_informations_Ref.orderByKey().equalTo(this.email_user).on('value',itemSnapshot =>{
      this.user_details = [];
      itemSnapshot.forEach( itemSnap => {
        this.user_details.push(itemSnap.val());
        return false;
      });
      this.user_details.forEach(i=>{
        this.num_cond = i.num_cond;
        this.num_ach = i.num_ach;
      })
    });
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
        this.indirizzo = i.indirizzo;

        //Siccome non tutti i campi sono definiti per ogni POI, controllo quali campi ci sono e rendo poi con isEnabled visibili solo quelli presenti per il POI
        this.email = i.email;
        this.phone = i.phone;
        this.website = i.website;

        if(this.email == undefined){
          this.isEnabled_email = false;
        }
        
        if(this.phone == undefined){
          this.isEnabled_phone = false;
        }

        if(this.website == undefined){
          this.isEnabled_website = false;
        }

        //Check accessibilità
        this.accessibility = i.accessibilità;

        if(this.accessibility == undefined || this.accessibility == "N"){
          this.isEnabled_accessibility = false;
        }
        else if(this.accessibility == "Y"){
            this.accessibility = "Accessibile";
            this.isEnabled_accessibility = true;
        }
          
        //Check famiglia
        this.families = i.famiglia;

        if(this.families == undefined || this.families == "N"){
          this.isEnabled_family = false;
        }
        else if(this.families == "Y"){
            this.families = "Per famiglie";
            this.isEnabled_family = true;
        }

        //Check gratuito (se c'è un biglietto o meno)
        this.gratuito = i.gratuito;

        if(this.gratuito == undefined){
          this.isEnabled_gratuito = false;
        }
        else if(this.gratuito == "Y"){
            this.gratuito = "Gratuito";
            this.isEnabled_gratuito = true;

        }else if(this.gratuito == "N"){
          this.gratuito = "A pagamento";
          this.isEnabled_gratuito = true;
        }
      })
    });
  }

  phoneCall(){
    this.callNumber.callNumber(this.phone, false)
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
          ref1.orderByChild("nome").once('value', function(snapshot){ //ciclo sui tag
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

  //-------------------INIZIO--------Funzioni per la condivisione 
  whatsappShare(){
    this.sharingVar.shareViaWhatsApp("Trovo che "+this.poiName+" sia molto interessante, scopri anche tu nuovi luoghi culturali di Cesena con l'app C.I.C.E !")
      .then(()=>{
        this.displayError("Grazie per aver condiviso!");
        this.updateNumCond();
      },
      ()=>{
        this.displayError("Condivisione non possibile, assicurati di avere l'app installata");
      })
  }
 
  twitterShare(){
    this.sharingVar.shareViaTwitter("Trovo che "+this.poiName+" sia molto interessante, scopri anche tu nuovi luoghi culturali di Cesena con l'app C.I.C.E !")
    .then(()=>{
      this.displayError("Grazie per aver condiviso!");
      this.updateNumCond();
    },
    ()=>{
      this.displayError("Condivisione non possibile, assicurati di avere l'app installata");
    })
  }
 
  facebookShare(){
    this.sharingVar.shareViaFacebook("Trovo che "+this.poiName+" sia molto interessante, scopri anche tu nuovi luoghi culturali di Cesena con l'app C.I.C.E !")
    .then(()=>{
      this.displayError("Grazie per aver condiviso!");
      this.updateNumCond();
    },
    ()=>{
      this.displayError("Condivisione non possibile, assicurati di avere l'app installata");
    })
  }
 
  otherShare(){
    this.sharingVar.share("Trovo che "+this.poiName+" sia molto interessante, scopri anche tu nuovi luoghi culturali di Cesena con l'app C.I.C.E !")
    .then(()=>{
      this.displayError("Grazie per aver condiviso!");
      this.updateNumCond();
    },
    ()=>{
      this.displayError("Condivisione non possibile, assicurati di avere l'app installata");
    })
  }
  //-------------------FINE--------Funzioni per la condivisione 

  setShareAchievements(updates){
    if(this.num_cond == "1"){
      updates["/users/"+this.email_user+"/achievement/1 condivisione"];
      updates["/users/"+this.email_user+"/achievement/1 condivisione/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email_user+"/num_ach"] = this.num_ach;
    }else if(this.num_cond == "10"){
      updates["/users/"+this.email_user+"/achievement/10 condivisioni"];
      updates["/users/"+this.email_user+"/achievement/10 condivisioni/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email_user+"/num_ach"] = this.num_ach;

    }else if(this.num_cond == "50"){
      updates["/users/"+this.email_user+"/achievement/50 condivisioni"];
      updates["/users/"+this.email_user+"/achievement/50 condivisioni/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email_user+"/num_ach"] = this.num_ach;

    }else if(this.num_cond == "100"){
      updates["/users/"+this.email_user+"/achievement/100 condivisioni"];
      updates["/users/"+this.email_user+"/achievement/100 condivisioni/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email_user+"/num_ach"] = this.num_ach;
    }
  }

  updateNumCond(){
    var updates = {}
    this.num_cond = this.num_cond + 1;
    updates["/users/"+this.email_user+"/num_cond"]  = this.num_cond;
    this.setShareAchievements(updates)
    firebase.database().ref().update(updates);
  }

  //per il messaggio di avvenuto inserimento o meno
  displayError(messageErr: string){
    let toast = this.toastCtrl.create({
      message: messageErr,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }


}
