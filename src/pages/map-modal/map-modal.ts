import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import L from "leaflet";
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, CameraPosition,MarkerOptions, Marker } from '@ionic-native/google-maps';
import { CreateRoutePage } from '../create-route/create-route';
declare var google: any;
declare var require: any

/**
 * Generated class for the MapModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-map-modal',
  templateUrl: 'map-modal.html',
})
export class MapModalPage {

  map: L.Map;
  center: L.PointTuple;

  @ViewChild('map1-container') mapContainer;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapModalPage');
    this.initMap()
  }

  initMap(){
    this.center = [44.13832, 12.2447 ]; 
    this.map = L.map('map1', {
      center: this.center,
      zoom: 16 
    });
    this.map.panTo(this.center)
    
    //Add OSM Layer
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?access_token={accessToken}",{
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      accessToken:'pk.eyJ1IjoibWFyeWNvb3BlciIsImEiOiJjajY2bjhqMXUxYjN5MnFuenJtbWQxem8xIn0.JpH5RDkg_yOjcLrwsFA6zA'
    })
      .addTo(this.map);   

    var self = this;
    this.map.on('click', function(e) {        
      var popLocation= e.latlng;
      self.closeModal(popLocation)
      
  });
  }

  closeModal(latlng) {
    this.viewCtrl.dismiss(latlng);
  }

}
