import { Injectable } from '@angular/core';
import { ToastController } from "ionic-angular";
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireDatabaseModule, AngularFireDatabase} from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import {Storage} from '@ionic/storage';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';


@Injectable()
export class LocalStorage {
  
    public ss;
  constructor(private secureStorage: SecureStorage) {
      this.ss = secureStorage.create('app_storage');

  }

  setData(email, psw){
    this.ss.set(
        function (key) { console.log('Set ' + key); },
        function (error) { console.log('Error ' + error); },
        'email', email);

        this.ss.set(
            function (key) { console.log('Set ' + key); },
            function (error) { console.log('Error ' + error); },
            'psw', psw);
  }

  removeData(){
    this.ss.clear(
        function () { console.log('Cleared'); },
        function (error) { console.log('Error, ' + error); });

  }

  getEmail(){
    this.ss.get(
        function (value) { console.log('Success, got ' + value); },
        function (error) { console.log('Error ' + error); },
        'email');
  }

  getPSW(){
    this.ss.get(
        function (value) { console.log('Success, got ' + value); },
        function (error) { console.log('Error ' + error); },
        'psw');

  }

  

  }
