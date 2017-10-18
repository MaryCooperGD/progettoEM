import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomePage } from "../home/home";

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

  signInForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, public menu:MenuController,
    public formBuilder: FormBuilder) {
    this.menu.enable(false)
    this.signInForm = formBuilder.group({
    password: ['', Validators.required],
    email:['', Validators.required]
})

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  doEmailPswLogin(){
    this.navCtrl.setRoot(HomePage)
  }

}
