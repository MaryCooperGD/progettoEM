import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl:ToastController) {
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

}
