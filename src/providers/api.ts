import { Injectable } from '@angular/core';
import { ToastController } from "ionic-angular";
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireDatabaseModule, AngularFireDatabase} from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  url: string = 'https://example.com/api/v1';
  public user : firebase.User;
  city: string ;
  
  email_id: string; //Sarà l'identificatore dell'utente (perchè le mail all'interno del db non possono essere ripetute)

  gpsEnabled : boolean;
  constructor(public http: Http, public afAuth: AngularFireAuth, public db: AngularFireDatabase,
              public toastCtrl:ToastController) {
    this.gpsEnabled = false;
  }

  get(endpoint: string, params?: any, options?: RequestOptions) {
    if (!options) {
      options = new RequestOptions();
    }

    // Support easy query params for GET requests
    if (params) {
      let p = new URLSearchParams();
      for (let k in params) {
        p.set(k, params[k]);
      }
      // Set the search field if we have params and don't already have
      // a search field set in options.
      options.search = !options.search && p || options.search;
    }

    return this.http.get(this.url + '/' + endpoint, options);
  }

  post(endpoint: string, body: any, options?: RequestOptions) {
    return this.http.post(this.url + '/' + endpoint, body, options);
  }

  put(endpoint: string, body: any, options?: RequestOptions) {
    return this.http.put(this.url + '/' + endpoint, body, options);
  }

  delete(endpoint: string, options?: RequestOptions) {
    return this.http.delete(this.url + '/' + endpoint, options);
  }

  patch(endpoint: string, body: any, options?: RequestOptions) {
    return this.http.put(this.url + '/' + endpoint, body, options);
  }


  /**
   * A method that sets the city where the user is currently in. 
   */
  setCity(city){
    this.city = city;
    console.log("La città inserita è " + this.city)
  }


  /** 
   * A method that returns the city where the user is currently in
   */
  getCity(){
    if (this.city!=null){
      return this.city;
    } else {
      return null;
    }
  }

  retrieveEmail(email){
    this.email_id = email;
  }


  //User management methods
  //Api from firebase are used, which automatically handle login
  //logout and other useful features
  doLogin() {
  return  this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((any) => {
        this.user = firebase.auth().currentUser;
      },
      (err) => {
        return err;
      });
   }

   

    doEmailPswLogin(email: string, password : string){
       return firebase.auth().signInWithEmailAndPassword(email,password)
        .then((any) => {
          this.user = firebase.auth().currentUser;
          if(this.user.emailVerified){
            
          } else {
            return new Error;
          }
        },
        (err) => {
          return err;
        });
     }

     doSignUp(email:string, password:string, username:string){
       return firebase.auth().createUserWithEmailAndPassword(email,password)
       .then((any) => {
        this.user = firebase.auth().currentUser;
        firebase.auth().currentUser.updateProfile({
          displayName : username,
          photoURL: "https://i.imgflip.com/d0tb7.jpg"
        })
         firebase.auth().currentUser.sendEmailVerification().then(function(){
           
         })
          
         
       },
        (err) => {
          return err;
        })
     }

     doLogOut(){
       return firebase.auth().signOut().then(function() {
      
      }).catch(function(error) {
      });
    }

    displayError(messageErr:string){
      let toast = this.toastCtrl.create({
        message: messageErr,
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }

    replaceCharacters(strng : string){

     var str:string= strng.replace(/\./g,'%2E').replace(/\#/g,'%23').replace(/\$/g,'%24').replace(/\[/g,'%5B').replace(/\]/g,'%5D');
      return str;
    }


  }
