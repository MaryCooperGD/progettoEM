import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomePage } from "../home/home";
import { Observable } from 'rxjs/Observable';
import { Api } from '../../providers/api';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';


/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  buttonDisabled:boolean;
  signInForm: FormGroup;
  email: any;
  password:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public menu:MenuController,
    public formBuilder: FormBuilder, public api:Api, public toastCtrl:ToastController) {
      this.buttonDisabled = false;
    this.menu.enable(false)
    this.signInForm = formBuilder.group({
    password: ['', Validators.required],
    email:['', Validators.required]
})

  }

  ionViewDidLoad() {
  }

  doEmailPswLogin(){

    if(!this.buttonDisabled){

      if(!this.signInForm.valid){
        this.displayLoginError("Per favore, riempi tutti i campi.")
        this.buttonDisabled = false;
    }
     else {
       this.buttonDisabled = true;
       
    var result : any = this.api.doEmailPswLogin(this.email, this.password);
    let res = Observable.fromPromise(result);
    res.subscribe(res => {
      if (res instanceof Error){
        this.buttonDisabled = false;
        this.displayLoginError("Si è verificato un errore. Controlla di aver confermato il tuo indirizzo email"+
        " prima di effettuare il login.")
      } else {
          this.navCtrl.setRoot(HomePage);
          var userMail:string = this.api.replaceCharacters(firebase.auth().currentUser.email);
          
          //richiamando questo medoto prendo la userMail settata non in chiaro e la metto dentro le API
          this.api.retrieveEmail(userMail);
          
          //var updates = {};
          //updates['/users/'+userMail+'/phone'] = 123456789;
          //firebase.database().ref().update(updates);

  
      }
    })
    }

    }
    
    

  }

  displayLoginError(messageErr:string){
    let toast = this.toastCtrl.create({
      message: messageErr,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
