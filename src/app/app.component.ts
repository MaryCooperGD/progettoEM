import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { CreateRoutePage } from "../pages/create-route/create-route";
import { LoginPage } from "../pages/login/login";
import { MonumentPage } from "../pages/monument/monument";
import { ProfilePage } from "../pages/profile/profile";
import { RankPage } from "../pages/rank/rank";
import { RegisterPage } from "../pages/register/register";
import { SearchPlacePage } from "../pages/search-place/search-place";
import { WelcomepagePage } from "../pages/welcomepage/welcomepage";


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = WelcomepagePage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
	  { title: 'Cerca luogo', component: SearchPlacePage},
      {title: 'Profilo', component: ProfilePage},
      {title: 'Classifica', component: RankPage},
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

  signOut(){
    this.nav.setRoot(WelcomepagePage)
  }
}
