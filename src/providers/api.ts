import { Injectable } from '@angular/core';
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
  gpsEnabled : boolean;
  constructor(public http: Http, public afAuth: AngularFireAuth, public db: AngularFireDatabase) {
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


  setGPS(){
    !this.gpsEnabled;
  }

  getGPS(){
    return this.gpsEnabled;
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
        },
        (err) => {
          return err;
        });
     }

     doSignUp(email:string, password:string, username:string){
       return firebase.auth().createUserWithEmailAndPassword(email,password)
       .then((any) => {
         firebase.auth().currentUser.updateProfile({
           displayName : username,
           photoURL: "https://i.imgflip.com/d0tb7.jpg"
         })
         this.user = firebase.auth().currentUser;
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


  }
