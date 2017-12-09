import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from "../home/home";
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, CameraPosition,MarkerOptions, Marker } from '@ionic-native/google-maps';

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
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
          secondAddress: self1.arrivalGeocoded
        })
      })

    })

  }


  getAddr = function(addr, f){

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': addr, }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            f(results);
          }
        });
}

  async geocode(address:string){

    var self = this;
    var uno, due, finished;
    var geocoded1,geocoded2;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address':address}, function(results, status){
      if (status === 'OK') {
        geocoded1 = results[0].geometry.location
        console.log("Chi sarà prima")
        return true;
        
      } else {
        console.log("Chi sarà prima")
        return false;
      }
    }).then(e =>{
      console.log("Ho finito")
    })
    this.startGecoded = geocoded1;
    
  }

}
