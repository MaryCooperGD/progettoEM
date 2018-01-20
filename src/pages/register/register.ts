import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ToastController } from 'ionic-angular';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomePage } from "../home/home";
import { Api } from '../../providers/api';
import { TutorialPage } from "../tutorial/tutorial";
import { LoginPage } from "../login/login";

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
    account: { name: string, email: string, password: string } = {
    name: '',
    email: '',
    password: ''
  };

  buttonDisabled: boolean;
  signUpForm: FormGroup;
  constructor(public navCtrl: NavController, public navParams: NavParams, public menu:MenuController,
  public formBuilder:FormBuilder, public toastCtrl:ToastController, public api : Api) {
    this.buttonDisabled = false;
    this.menu.enable(false)
    this.signUpForm = formBuilder.group({
    name: ['', Validators.required],
    password: ['', Validators.required],
    email:['', Validators.required]
})
  }

  ionViewDidLoad() {
  }

  doSignup() {
    if(!this.buttonDisabled){
      if(!this.signUpForm.valid){
        this.displayLoginError("Per favore, riempi tutti i campi.")
        this.buttonDisabled = false;
      }
       else {
        this.buttonDisabled = true;
  
      var result : any = this.api.doSignUp(this.account.email, this.account.password,this.account.name);
      console.log("this.account.name"+this.account.name);
      let res = Observable.fromPromise(result);
      res.subscribe(res => {
        if (res instanceof Error){

        this.buttonDisabled = false;
          this.displayLoginError("L'indirizzo email fornito non è corretto.") 
        } else {
          this.writeUserData(this.account.email,this.account.name)
          this.displayLoginError("Ti è stata inviata una mail di conferma. Controlla la tua posta prima di effettuare il login.")
           this.navCtrl.push(TutorialPage)
  
        }
      })
  
      }
    }
  }  // FINE - doSignup()

  writeUserData(email:string, name) {
    var email_clear = email; //Memorizzo la mail prima di togliere i caratteri non ammessi. Mi serve per stamparla correttamente a video.
    email = this.api.replaceCharacters(email); 

    this.api.retrieveEmail(email); //Inserisco fin da subito nelle Api la mail altrimenti non so a che utente aggiungere le preferenze nel tutorial.ts

    firebase.database().ref('users/' + email).set({
      username: name,
      email_user: email, //mail NON in chiaro
      clear_email: email_clear, //Registro nel db anche questa mail pulita
      data_registrazione: new Date().getTime(),
     
      //Punti che mi servono per classifica e badge
      total_points: 0, //Punti totali, per classifica
      points_photos: 0, //Punti per assegnare badge foto
      points_tag: 0, //Punti per assegnare badge tag
      points_info: 0 , //Punti per assegnare badge informazioni

      //Per il numero di contributi
      num_of_tag: 0,
      num_of_photo : 0,
      num_of_info : 0,
      num_ach : 0,
      num_badge : 0,
      sum_contributi: 0,
      numb_pref: 0, 
      num_cond: 0,

      //Inserisco il placeholder dell'avatar
      avatar: "https://firebasestorage.googleapis.com/v0/b/cice-ab039.appspot.com/o/avatars%2Fuser.png?alt=media&token=f3ed1eca-3726-431c-9b7d-8cfd8e0d4f05",
    });
  }

   displayLoginError(messageErr: string){
    let toast = this.toastCtrl.create({
      message: messageErr,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

} //Fine classe RegisterPage
