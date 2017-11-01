import { Component } from '@angular/core';
import { NavController, MenuController,AlertController} from 'ionic-angular';
import L from "leaflet";
import { Geolocation, Geoposition, GeolocationOptions } from '@ionic-native/geolocation';
import { Api } from "../../providers/api";
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: L.Map;
  center: L.PointTuple;
  gps= false;

  constructor(public navCtrl: NavController, public menuCtrl:MenuController,public geolocation:Geolocation,
  public alertCtrl:AlertController, public api:Api) {
    this.menuCtrl.enable(true)


  }


  ionViewDidLoad() {
    //set map center
    this.center = [41.9027835,12.496365500000024]; 
    
    //setup leaflet map
    this.initMap();
    if(!this.api.getGPS){
      this.presentConfirm();
    }
    
    //this.withMapBox();
  }

  initMap() {

     this.map = L.map('map', {
      center: this.center,
      zoom: 13
    });
    L.marker(this.center).addTo(this.map)
    .bindPopup('Popup')
    .openPopup();
    this.map.panTo(this.center)
    
    //Add OSM Layer
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?access_token={accessToken}",{
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      accessToken:'pk.eyJ1IjoibWFyeWNvb3BlciIsImEiOiJjajY2bjhqMXUxYjN5MnFuenJtbWQxem8xIn0.JpH5RDkg_yOjcLrwsFA6zA'
    })
      .addTo(this.map);    
     // this.geolocate();
  }


  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Position',
      message: 'Would you let the app access your position? If you want to plan a journey, you must enable GPS and let the app knows your location.',
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
            this.geolocate()
            this.api.setGPS();
          }
        }
      ]
    });
    alert.present();
  }

  geolocate(){
    this.geolocation.getCurrentPosition().then((resp) =>{
      var positionMarker: L.Marker;
      let latlng = {lat: resp.coords.latitude, lng: resp.coords.longitude}
      positionMarker = L.marker(latlng).addTo(this.map);
      positionMarker.bindPopup("Tu sei qui");
      this.map.setView(latlng,13)
      this.map.panTo(latlng)

    })
  }

}
