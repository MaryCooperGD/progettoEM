import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from "../../providers/api";
import * as firebase from 'firebase/app';

/**
 * Generated class for the AchievementsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-achievements',
  templateUrl: 'achievements.html',
})
export class AchievementsPage {

  //per sapere di che utente stiamo parlando
  username:any;
  email:any;

  //--Per mostrare gli achievements dell'utente
  public achievements_TAG:Array<any>;
  public achievements_INFO:Array<any>;
  public achievements_PHOTO:Array<any>;
  public achievements_MINSC:Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams,  public api: Api) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AchievementsPage');

    if(this.api.user.displayName==null){
      this.username = '';
      this.email = '';
      
    }else {
        this.username = this.api.user.displayName;
        this.email = this.api.email_id; //Ricavo dall'API la mail che mi serve per identificare l'utente 
    }      

    this.showAchievements();

  } //ionViewDidLoad


  showAchievements(){

    //Inizio recupero achivements utente
    let userTagACH = []; //qui mettiamo tutti gli achievements sui tag
    let userInfoACH = []; //qui mettiamo tutti gli achievements sulle informazioni
    let userPhotoACH = []; //qui mettiamo tutti gli achievements sulle foto
    let userMinscACH = []; //qui mettiamo tutti gli achievements generali

    var ref_utente = firebase.database().ref('/users/'+ this.email+'/achievement/');
    var ref_ach = firebase.database().ref('/achievements/');

    ref_utente.orderByChild("data").once('value',function(achievement){
        achievement.forEach(function(singolo_ach){
          ref_ach.once('value',function(achievements_ar){
            achievements_ar.forEach(function(singolo_ACH){

              if((singolo_ach.key == singolo_ACH.key) && (singolo_ACH.child("tipologia").val()== "tag")){

                //Per ogni achievement memorizziamo la descrizione e quando è stato sbloccato
                var prova = {descr: singolo_ACH.child("descr").val(), data: singolo_ach.child("data").val()}
                userTagACH.push(prova);
                
              }
              if((singolo_ach.key == singolo_ACH.key) && (singolo_ACH.child("tipologia").val()== "foto")){
                
                //Per ogni achievement memorizziamo la descrizione e quando è stato sbloccato
                var prova = {descr: singolo_ACH.child("descr").val(), data: singolo_ach.child("data").val()}
                userPhotoACH.push(prova);

              }
              if((singolo_ach.key == singolo_ACH.key) && (singolo_ACH.child("tipologia").val()== "info")){
                
                //Per ogni achievement memorizziamo la descrizione e quando è stato sbloccato
                var prova = {descr: singolo_ACH.child("descr").val(), data: singolo_ach.child("data").val()}
                userInfoACH.push(prova);
                //userInfoACH.push(singolo_ACH.child("descr").val())
                //data.push(singolo_ach.child("data").val()) //devo riuscire a farla funzionare
              }
              if((singolo_ach.key == singolo_ACH.key) && (singolo_ACH.child("tipologia").val()== "misto")){

                //Per ogni achievement memorizziamo la descrizione e quando è stato sbloccato
                var prova = {descr: singolo_ACH.child("descr").val(), data: singolo_ach.child("data").val()}
                userMinscACH.push(prova);
              }
              return false;
            })
          })
          return false;
        })
       
    }).then(a=>{
    
      this.achievements_TAG = userTagACH;
      this.achievements_INFO = userInfoACH;
      this.achievements_PHOTO = userPhotoACH;
      this.achievements_MINSC = userMinscACH;
   })
  }

} //AchievementsPage
