import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { LoginPage} from "../login/login";
import { RegisterPage} from "../register/register";
import { CreditsPage } from "../credits/credits";
/**
 * Generated class for the WelcomepagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-welcomepage',
  templateUrl: 'welcomepage.html',
})
export class WelcomepagePage {


  constructor(public navCtrl: NavController, public navParams: NavParams, public menu:MenuController) {
    this.menu.enable(false)
    
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad WelcomepagePage');
  }

  openLoginPage(){
      this.navCtrl.push(LoginPage)
  }

  openRegisterPage(){
    this.navCtrl.push(RegisterPage)
  }

  openCreditsPage(){
    this.navCtrl.push(CreditsPage)
  } 
  
}
