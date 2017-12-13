import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { HomePage } from "../home/home";
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, CameraPosition,MarkerOptions, Marker } from '@ionic-native/google-maps';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Api } from "../../providers/api";
declare var google: any;

/**
 * Generated class for the CreateRoutePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-route',
  templateUrl: 'create-route.html',
})
export class CreateRoutePage {

  myInputPartenza: string;
  myInputArrivo: string;
  startGecoded;
  arrivalGeocoded;
  waypoints =[];
  public myTags:Array<any>;
  city;
  city_key;
  

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl:ToastController, public api:Api) {
      this.city = this.api.getCity();
      var ref = firebase.database().ref('/cities/')
      var self = this;
      if (this.city != null){
        ref.once('value', function(snapshot){
          snapshot.forEach(function(childSnapshot){
            if(childSnapshot.child("name") == self.city){
              self.city_key = childSnapshot.key;
            }
            return false;
  
          })
        })
      }
      

  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateRoutePage');
  }


  calculateRoute(){
    var self = this;
    this.getAddr(this.myInputPartenza, function(res){
      self.startGecoded =  res[0].geometry.location
      var self1 = self;
      self.getAddr(self.myInputArrivo, function(res){
        self1.arrivalGeocoded = res[0].geometry.location
        self1.navCtrl.setRoot(HomePage, {
          firstAddress: self1.startGecoded,
          secondAddress: self1.arrivalGeocoded,
          waypts: self1.waypoints
        })
      })

    })

  }


  getAddr = function(addr, f){

        var self = this;
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': addr, }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            f(results);
          } else {
            self.displayError("Routing non corretto. Controlla di aver scritto bene gli indirizzi, nella forma Via/Piazza/Strada/Luogo, Città")
          }
        });
}


displayError(messageErr: string){
  let toast = this.toastCtrl.create({
    message: messageErr,
    duration: 2000,
    position: 'top'
  });
  toast.present();
}


async findPoiByTag(tag){
  //in tag ho le preferenze dell'utente
      var self = new CreateRoutePage(this.navCtrl, this.navParams,
        this.toastCtrl, this.api)
        var found = false;
        var pois = [];
      var ref = firebase.database().ref('/cities/'+ this.city_key+'/pois') //punti di interesse di Cesena
      var ref1 = firebase.database().ref('/point_of_interest/'); //punti di interesse generali
      ref.once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
          ref1.once('value',function(snapshot1){
            snapshot1.forEach(function(childSnapshot1){//ciclo sui singoli punti di interesse
              childSnapshot1.child('tags').forEach(function(prova){//ciclo sui tag del punto di interesse
                if(tag.indexOf(prova.key)> -1){//se ce l'ho nell'array
                found = true;
                if(childSnapshot.key == childSnapshot1.key){
                  pois.push({lat: childSnapshot1.child('lat').val(), lon: childSnapshot1.child('lon').val(), nome: childSnapshot1.child('nome').val()})
                }
                }
                return false;
              })
              return false;
            })
          })
  
          return false;
        })
  
      })
  
      await this.sleep(2000)
        if (!found){
          this.displayError("Ci dispiace, purtroppo non ci sono punti di interesse che rispecchiano le tue preferenze!"
          +" Prova con altre tipologie o aggiungi i tag che secondo te mancano.")
        } else {
          
          pois.forEach(p=>{
            var data = {
              latlng: [p.lat,p.lon],
              nome: p.nome
            }
            this.waypoints.push(data)


          })
          this.calculateRoute();


        }         
      
    }
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getUsersPref(){
      
      if(this.city_key!=null){
        var self = this;
        
            
            var user_pref = firebase.database().ref('/users/'+ self.api.email_id+'/preferenze/');
            var ref = firebase.database().ref('/tag/')
            var username;
            if(self.api.user.displayName==null){
              username = '';
          }else {
              username = self.api.user.displayName
          }
        
          var userTags = [];
          var self1 = self;
          user_pref.once('value', function(preferenze){ 
          preferenze.forEach(function(t){
            ref.once('value', function(tags){ 
              tags.forEach(function (t1){
                if(t.key == t1.key){ 
                console.log("Found " + t1.key)
                  userTags.push(t1.key)
                }
                return false;
               
              });
            })
            return false;
          });
        })
            await this.sleep(1000)
            //console.log("Prova " + userTags.length)
            this.myTags = userTags
            this.findPoiByTag(this.myTags)
        /* .then(function(success){
            self.myTags = userTags;
            self.findPoiByTag(self.myTags);
            console.log("Added all tags " + userTags.length)
            
          }) 
          Promise.all(arrayPromises).then(() =>
            console.log("Added all tags " + userTags.length)
        
        
        ) */

      } else {
        this.displayError("Ci dispiace, non ci sono punti di interesse registrati per la tua città. Contattaci per aggiungerli!")
      }
          
        }

}
