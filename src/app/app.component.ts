import { Component, ViewChild } from '@angular/core';
import { Nav, Platform,AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Observable } from 'rxjs/Observable';
import { Api } from '../providers/api';
import { HomePage } from '../pages/home/home';
import { CreateRoutePage } from "../pages/create-route/create-route";
import { LoginPage } from "../pages/login/login";
import { MonumentPage } from "../pages/monument/monument";
import { ProfilePage } from "../pages/profile/profile";
import { RankPage } from "../pages/rank/rank";
import { RegisterPage } from "../pages/register/register";
import { SearchPlacePage } from "../pages/search-place/search-place";
import { WelcomepagePage } from "../pages/welcomepage/welcomepage";
import { UploadPhotoPage } from "../pages/upload-photo/upload-photo";
import { EditMonumentPage } from "../pages/edit-monument/edit-monument"

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = WelcomepagePage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,public api:Api,
    public alertCtrl:AlertController) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      {title: 'Home', component: HomePage },
	    {title: 'Cerca luogo', component: SearchPlacePage},
      {title: 'Profilo', component: ProfilePage},
      {title: 'Classifica', component: RankPage},
      {title: 'Luogo di interesse', component: MonumentPage},
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.signOut();
          }
        }
      ]
    });
    alert.present();
  }
  signOut(){
      var result:any = this.api.doLogOut();
        let res = Observable.fromPromise(result);
        res.subscribe(res => {
        if (res instanceof Error){
        } else {
            this.nav.setRoot(WelcomepagePage);
  
        }
      })
    }
  
}
