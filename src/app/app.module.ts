import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AngularFireModule} from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import { Geolocation, Geoposition, GeolocationOptions } from '@ionic-native/geolocation';
import { Diagnostic } from "@ionic-native/diagnostic";
import { Camera } from '@ionic-native/camera';
import * as firebase from 'firebase/app';
import 'firebase/storage'
import { File } from '@ionic-native/file';
import { HttpModule, Http } from '@angular/http';
import { Api } from '../providers/api';
import { LocalStorage } from '../providers/localstorage';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { CreateRoutePage } from "../pages/create-route/create-route";
import { LoginPage } from "../pages/login/login";
import { MonumentPage } from "../pages/monument/monument";
import { ProfilePage } from "../pages/profile/profile";
import { RankPage } from "../pages/rank/rank";
import { RegisterPage } from "../pages/register/register";
import { SearchPlacePage } from "../pages/search-place/search-place";
import { WelcomepagePage } from "../pages/welcomepage/welcomepage";
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { UploadPhotoPage } from "../pages/upload-photo/upload-photo";
import { EditMonumentPage } from "../pages/edit-monument/edit-monument";
import { EditPreferencesPage } from "../pages/edit-preferences/edit-preferences";
import { TutorialPage } from "../pages/tutorial/tutorial";
import { CreditsPage } from "../pages/credits/credits";
import {NewtagPage} from "../pages/newtag/newtag";
import { AchievementsPage } from "../pages/achievements/achievements";
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { CallNumber } from '@ionic-native/call-number';

import { SocialSharing } from '@ionic-native/social-sharing';

/* export const firebaseConfig = {
  
    apiKey: "AIzaSyCJuctITAc5lKZzNwTosmiLzduZjQPgqUg",
    authDomain: "cesenaesploraem-f4694.firebaseapp.com",
    databaseURL: "https://cesenaesploraem-f4694.firebaseio.com",
    projectId: "cesenaesploraem-f4694",
    storageBucket: "cesenaesploraem-f4694.appspot.com",
    messagingSenderId: "942441525928"
  
}; */  

export const firebaseConfig = {
  apiKey: "AIzaSyAXB-UMg29lgzPn3ygPQGdcWydxx5_9_MA",
    authDomain: "cice-ab039.firebaseapp.com",
    databaseURL: "https://cice-ab039.firebaseio.com",
    projectId: "cice-ab039",
    storageBucket: "cice-ab039.appspot.com",
    messagingSenderId: "491654378214"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,

	CreateRoutePage,
    LoginPage,
    MonumentPage,
    ProfilePage,
    RankPage,
    RegisterPage,
    SearchPlacePage,
    WelcomepagePage,
    UploadPhotoPage,
    EditMonumentPage,
    EditPreferencesPage,
    TutorialPage,
    CreditsPage,
    NewtagPage,
    AchievementsPage,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    IonicModule.forRoot(MyApp, {
      //Serve affinchè non sballino le form che sono centrate. Senza queste tre righe quando clicchi su un campo la tastiera fa sballare tutto!
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssist: false
  })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
	CreateRoutePage,
    LoginPage,
    MonumentPage,
    ProfilePage,
    RankPage,
    RegisterPage,
    SearchPlacePage,
    WelcomepagePage,
    UploadPhotoPage,
    EditMonumentPage,
    EditPreferencesPage,
    TutorialPage,
    CreditsPage, 
    NewtagPage,
    AchievementsPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Diagnostic,
    Api,
    LocalStorage,
    CallNumber,
    Camera,
    SocialSharing,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
