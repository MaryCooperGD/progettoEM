import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ToastController } from 'ionic-angular';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomePage } from "../home/home";

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

  signUpForm: FormGroup;
  constructor(public navCtrl: NavController, public navParams: NavParams, public menu:MenuController,
  public formBuilder:FormBuilder, public toastCtrl:ToastController) {
    this.menu.enable(false)
    this.signUpForm = formBuilder.group({
    name: ['', Validators.required],
    password: ['', Validators.required],
    email:['', Validators.required]
})
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  doSignup() {
    
    this.navCtrl.setRoot(HomePage)
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
