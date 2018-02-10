import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController, LoadingController, ToastController } from 'ionic-angular';
import { Camera } from "@ionic-native/camera";
import { Api } from "../../providers/api";
import * as firebase from 'firebase/app';
import { FirebaseApp } from "angularfire2";
import { SocialSharing } from '@ionic-native/social-sharing';
/**
 * Generated class for the FotoMapModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-foto-map-modal',
  templateUrl: 'foto-map-modal.html',
})
export class FotoMapModalPage {

  point;
  poiKey;
  isEnabled =false;
  username;
  email;
  num_of_photos = 0;
  myInput;
  public poi_NUMEROINFO: Array<any> = [];
  public poi_ref: firebase.database.Reference = firebase.database().ref("/point_of_interest/");

  numero_info_POI;
  
  //punteggi che verranno incrementati
  punteggio_info;
  punteggio_totale;

  //Per gestire il caricamento delle foto
  public myPhotosRef: any;
  public myPhoto: any;
  public myPhotoURL: any;

  //Per prendere i dati dal profilo utente
  public user_emailRef: firebase.database.Reference = firebase.database().ref('/users/');
  public user_email: Array<any> = [];
 
  public user_informations_Ref: firebase.database.Reference = firebase.database().ref('/users/');

  num_of_photo;
  points_photos;
  sum_contributi;
  num_of_info; 
  num_of_tag;
  sum_of_total_contr;
  num_badge;
  num_ach;
  loadingConvert;
  loadingUpload;
  poiName;
  description;
  num_cond;  


  constructor(public navCtrl: NavController, public navParams: NavParams,public viewCtrl: ViewController,
    public loadingController:LoadingController,public toastCtrl:ToastController,public camera:Camera,public api: Api, private sharingVar: SocialSharing) {
    this.point = this.navParams.get('poi');
    this.poiName = this.point.nome;
    this.poiKey = this.point.key;
    this.description = this.point.desc;
    this.loadingConvert = this.loadingController.create({content: "Attendi mentre la foto viene convertita...", spinner:"crescent"})
    this.loadingUpload = this.loadingController.create({content: "Attendi mentre la foto viene caricata...", spinner:"crescent"})
    var num_photos_ref = firebase.database().ref('point_of_interest/'+this.poiKey+'/numero_foto/')

      //Per memorizzare le foto nel POI
      var ref = firebase.database().ref('/point_of_interest/'+this.poiKey+'/photos/');
      var key = firebase.database().ref().child('point_of_interest').push().key; 

      //Per memorizzare le foto nell'utente
      var ref = firebase.database().ref('/users/'+this.email+'/photos/');
      var key = firebase.database().ref().child('users').push().key; 

      num_photos_ref.on('value',snapshot=>{
        this.num_of_photos = snapshot.val()
      })
      //Riferimento alla cartella principale dove voglio mettere le foto
      this.myPhotosRef = firebase.storage().ref('usersPhotos/');
  }

  ionViewDidLoad() {
    if(this.api.user.displayName==null){
      this.username = '';
      this.email = '';
    }else {
          this.username = this.api.user.displayName;
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

        //numero contributi
        this.num_of_tag = i.num_of_tag;
        this.num_of_info = i.num_of_info;
        this.num_of_photo = i.num_of_photo;
        this.points_photos = i.points_photos;
        this.num_ach = i.num_ach;
        this.num_badge = i.num_badge;

        this.num_cond = i.num_cond;

        console.log("this.num_badge "+this.num_badge);
      })
    });


    this.poi_ref.orderByKey().equalTo(this.poiKey).on('value',itemSnapshot =>{
      this.poi_NUMEROINFO = [];
      itemSnapshot.forEach(itemSnap =>{
        this.poi_NUMEROINFO.push(itemSnap.val());
        return false;
      });
      this.poi_NUMEROINFO.forEach(i=>{
        this.numero_info_POI = i.numero_informazioni;
        //console.log("Numero contributi POI "+this.numero_info_POI);
        //console.log("Numero tag POI "+this.numero_tag_POI);
      })
    });
  }


  selectPhoto_phone(){
    
    //this.loadingConvert.present();
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY, 
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 90, //MODIFICA PER PROVARE LA QUALITA' DELLA FOTO - 100 è IL MAX
      //Do una dimensione di larghezza.
      targetWidth: 400,
      encodingType: this.camera.EncodingType.PNG,
    }).then(imageData => {
      //this.loadingConvert.dismiss();
      this.displayError("La foto è stata convertita correttamente. Clicca su 'Carica foto' per completare il caricamento.")
      this.isEnabled = true;
      this.myPhoto = imageData;
    }, error => {
      //this.loadingConvert.dismiss();
      this.displayError("C'è stato un errore nel convertire la foto.")
      this.isEnabled = false;
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }

  //Per scegliere l'avatar da una foto appena scattata
  selectPhoto_camera(){
    this.callCheck()
    //this.loadingConvert.present();
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.CAMERA, 
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 90, //MODIFICA PER PROVARE LA QUALITA' DELLA FOTO - 100 è IL MAX
      targetWidth: 400,
      encodingType: this.camera.EncodingType.PNG,
    }).then(imageData => {
     // this.loadingConvert.dismiss();
      this.displayError("La foto è stata convertita correttamente. Clicca su 'Carica foto' per completare il caricamento.")
      this.isEnabled = true;
      this.myPhoto = imageData;
    }, error => {
     // this.loadingConvert.dismiss();
      this.displayError("C'è stato un errore nel convertire la foto.")
      this.isEnabled = false;
      console.log("ERROR -> " + JSON.stringify(error));
    });

  }
  
  //Per caricare la foto sullo storage - si attiva dal pulsante carica foto!
  uploadPhoto(): void {
    this.isEnabled = false;
    this.loadingUpload.present();
    this.myPhotosRef.child("photo_"+this.poiName).child(this.generateUUID()+'.png') //dare un nome univoco
        .putString(this.myPhoto, 'base64', { contentType: 'image/png' })
        .then((savedPicture) => {
          var self = this;
          this.myPhotoURL = savedPicture.downloadURL; //download URL da inserire nel database come CHIAVE
          var updates = {};
          var ref = firebase.database().ref('/point_of_interest/'+this.poiKey+'/photos/');
          var key = firebase.database().ref().child('/point_of_interest/'+this.poiKey+'/photos/').push().key; 
          updates["point_of_interest/"+this.poiKey+"/photos/"+key] = this.myPhotoURL;
          updates["point_of_interest/"+this.poiKey+"/numero_foto"] = (this.num_of_photos+1);

           //Per memorizzare le foto nell'utente
          var ref = firebase.database().ref('/users/'+this.email+'/photos/');
          var key = firebase.database().ref().child('/users/'+this.email+'/photos/').push().key; 
          updates['/users/'+this.email+'/photos/'+key] = this.myPhotoURL;
          
          //Incremento i valori nel profilo utente
          this.num_of_photo = this.num_of_photo + 1; //Incremento il contatore del numero di foto
          updates["users/"+this.email+"/num_of_photo"] = this.num_of_photo;

          this.points_photos = this.points_photos + 20; //Incremento il punteggio ottenuto dalle foto
          updates["users/"+this.email+"/points_photos"] = this.points_photos;

          this.punteggio_totale = this.punteggio_totale + 20 ; //Incremento il punteggio totale
          updates["/users/"+this.email+"/total_points"]  = this.punteggio_totale; 

          this.sum_of_total_contr = this.num_of_info + this.num_of_tag + this.num_of_photo; //Incremento il valore della somma dei contributi.
          updates["/users/"+this.email+"/sum_contributi"]  = this.sum_of_total_contr;

          //Assegno i badge e gli achievement
          this.setPhotoBadges(updates);
          this.setPhotoAchievement(updates);
          this.setMinscAchievements(updates);
          this.setMinscBadges(updates);

          firebase.database().ref().update(updates).then(function(){   
            //this.displayError("Faccio l'update")     
            self.loadingUpload.dismiss();
            self.displayError("Foto caricata correttamente, hai appena guadagnato 20 punti!")
            self.isEnabled = false;
            self.closeModal();

          }).catch(function(error){
            self.loadingUpload.dismiss();
            self.isEnabled = true;
            self.displayError("C'è stato un errore nel caricamento della foto.")
          })
        });   
        
   
  }

  callCheck(){
    var updates = {};
      var ref = firebase.database().ref('/point_of_interest/'+this.poiKey+'/photos/');
      var key = firebase.database().ref().child('/point_of_interest/'+this.poiKey+'/photos/').push().key; 
      console.log("point_of_interest/"+this.poiKey+"/photos/"+key +" = " +this.myPhotoURL);
      console.log("point_of_interest/"+this.poiKey+"/numero_foto"+" = " +this.num_of_photos);

       //Per memorizzare le foto nell'utente
      var ref = firebase.database().ref('/users/'+this.email+'/photos/');
      var key = firebase.database().ref().child('/users/'+this.email+'/photos/').push().key; 
      console.log('/users/'+this.email+'/photos/'+key+" = "+ this.myPhotoURL);
      
      //Incremento i valori nel profilo utente
      this.num_of_photo = this.num_of_photo + 1; //Incremento il contatore del numero di foto
      console.log("users/"+this.email+"/num_of_photo"+" = "+this.num_of_photo);

      this.points_photos = this.points_photos + 20; //Incremento il punteggio ottenuto dalle foto
      console.log("users/"+this.email+"/points_photos"+" = "+this.points_photos);

      this.punteggio_totale = this.punteggio_totale + 20 ; //Incremento il punteggio totale
      console.log("/users/"+this.email+"/total_points"+" = "+this.punteggio_totale); 

      this.sum_of_total_contr = this.num_of_info + this.num_of_tag + this.num_of_photo; //Incremento il valore della somma dei contributi.
      console.log("/users/"+this.email+"/sum_contributi"+" = "+this.sum_of_total_contr);
}

  setPhotoBadges(updates){
    if(this.points_photos == "380"){
      updates["/users/"+this.email+"/badge/Fotografo prodigio"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.points_photos == "260"){
      updates["/users/"+this.email+"/badge/Fotografo esperto"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.points_photos == "140"){
      updates["/users/"+this.email+"/badge/Fotografo principiante"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;

    }else if(this.points_photos == "60"){
      updates["/users/"+this.email+"/badge/Fotografo novizio"]  = true;
      this.num_badge = this.num_badge + 1;
      updates["/users/"+this.email+"/num_badge"] = this.num_badge;
    }
  }

  setPhotoAchievement(updates){
    if(this.num_of_photo == "1"){
      updates["/users/"+this.email+"/achievement/1 foto"];
      updates["/users/"+this.email+"/achievement/1 foto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_photo == "10"){
      updates["/users/"+this.email+"/achievement/10 foto"];
      updates["/users/"+this.email+"/achievement/10 foto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_photo == "30"){
      updates["/users/"+this.email+"/achievement/30 foto"];
      updates["/users/"+this.email+"/achievement/30 foto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_of_photo == "100"){
      updates["/users/"+this.email+"/achievement/100 foto"];
      updates["/users/"+this.email+"/achievement/100 foto/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;
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

  addInfo(){
    var ref = firebase.database().ref("/descriptions/");
    var ref1 = firebase.database().ref("/point_of_interest/"+this.poiKey+"/")
    var key = firebase.database().ref().child('descriptions').push().key;

    var data = {
      testo: this.myInput,
      username_utente: this.username,
      insert_data : new Date().getTime()
    }

    var updates = {}
    updates["/descriptions/"+key] = data;
    updates["/point_of_interest/"+this.poiKey+"/description/" + key ] = true;

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
    updates["/point_of_interest/"+this.poiKey+"/numero_informazioni/"] = this.numero_info_POI;
    //Controllo il punteggio delle informazioni, in base a quanto è, associo un badge!!! 
    //non mi piace troppo tecnicamente ma funziona. è da migliorare se possibile
    this.setInfoBadges(updates);
    this.setMinscBadges(updates);

    this.setInfoAchievements(updates);
    this.setMinscAchievements(updates);

    firebase.database().ref().update(updates);

    this.displayError("Grazie per aver contributo, hai appena guadagnato 15 punti!");
   
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

  generateUUID(): any {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
  }

  displayError(messageErr: string){
    let toast = this.toastCtrl.create({
      message: messageErr,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  //-------------------INIZIO--------Funzioni per la condivisione 
  whatsappShare(){
    this.sharingVar.shareViaWhatsApp("Ho visitato "+this.poiName+" e l'ho trovato molto interessante! Scopri anche tu nuovi luoghi culturali di Cesena con l'app C.I.C.E !")
      .then(()=>{
        this.displayError("Grazie per aver condiviso!");
        this.updateNumCond();
      },
      ()=>{
        this.displayError("Condivisione non possibile, assicurati di avere l'app installata");
      })
  }
 
  twitterShare(){
    this.sharingVar.shareViaTwitter("Ho visitato "+this.poiName+" e l'ho trovato molto interessante! Scopri anche tu nuovi luoghi culturali di Cesena con l'app C.I.C.E !")
    .then(()=>{
      this.displayError("Grazie per aver condiviso!");
      this.updateNumCond();
    },
    ()=>{
      this.displayError("Condivisione non possibile, assicurati di avere l'app installata");
    })
  }
 
  facebookShare(){
    this.sharingVar.shareViaFacebook("Ho visitato "+this.poiName+" e l'ho trovato molto interessante! Scopri anche tu nuovi luoghi culturali di Cesena con l'app C.I.C.E !")
    .then(()=>{
      this.displayError("Grazie per aver condiviso!");
      this.updateNumCond();
    },
    ()=>{
      this.displayError("Condivisione non possibile, assicurati di avere l'app installata");
    })
  }
 
  otherShare(){
    this.sharingVar.share("Ho visitato "+this.poiName+" e l'ho trovato molto interessante! Scopri anche tu nuovi luoghi culturali di Cesena con l'app C.I.C.E !")
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
      updates["/users/"+this.email+"/achievement/1 condivisione"];
      updates["/users/"+this.email+"/achievement/1 condivisione/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;
    }else if(this.num_cond == "10"){
      updates["/users/"+this.email+"/achievement/10 condivisioni"];
      updates["/users/"+this.email+"/achievement/10 condivisioni/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_cond == "50"){
      updates["/users/"+this.email+"/achievement/50 condivisioni"];
      updates["/users/"+this.email+"/achievement/50 condivisioni/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;

    }else if(this.num_cond == "100"){
      updates["/users/"+this.email+"/achievement/100 condivisioni"];
      updates["/users/"+this.email+"/achievement/100 condivisioni/data"] = new Date().getTime();
      this.num_ach = this.num_ach + 1;
      updates["/users/"+this.email+"/num_ach"] = this.num_ach;
    }
  }

  updateNumCond(){
    var updates = {}
    this.num_cond = this.num_cond + 1;
    updates["/users/"+this.email+"/num_cond"]  = this.num_cond;
    this.setShareAchievements(updates)
    firebase.database().ref().update(updates);
  }
}
