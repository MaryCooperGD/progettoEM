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
      let res = Observable.fromPromise(result);
      res.subscribe(res => {
        if (res instanceof Error){

        this.buttonDisabled = false;
          this.displayLoginError(res.message) 
        } else {
          this.writeUserData(this.account.email,this.account.name)
           this.navCtrl.push(LoginPage)
  
        }
      })
  
      }
    }


    
    
    
  }

  writeUserData(email:string, name) {
    email = email.replace('.','%2E')
    firebase.database().ref('users/' + email).set({
      username: name,
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

}
