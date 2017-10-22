import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AngularFireModule} from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { HttpModule, Http } from '@angular/http';
import { Api } from '../providers/api';
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

export const firebaseConfig = {
  
    apiKey: "AIzaSyCJuctITAc5lKZzNwTosmiLzduZjQPgqUg",
    authDomain: "cesenaesploraem-f4694.firebaseapp.com",
    databaseURL: "https://cesenaesploraem-f4694.firebaseio.com",
    projectId: "cesenaesploraem-f4694",
    storageBucket: "cesenaesploraem-f4694.appspot.com",
    messagingSenderId: "942441525928"
  
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
    EditMonumentPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    IonicModule.forRoot(MyApp),
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
    EditMonumentPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Api,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
