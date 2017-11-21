import { Component, ViewChild } from '@angular/core';
import { NavController, MenuController, ToastController, Platform, AlertController} from 'ionic-angular';
import L from "leaflet";
import { Geolocation, Geoposition, GeolocationOptions } from '@ionic-native/geolocation';
import { Diagnostic } from "@ionic-native/diagnostic";

import { File } from '@ionic-native/file';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: L.Map;
  center: L.PointTuple;

  @ViewChild('map-container') mapContainer;

  constructor(public navCtrl: NavController, public menuCtrl:MenuController,public geolocation:Geolocation,
  public toastCtrl:ToastController, public diagnostic:Diagnostic, public platform:Platform, public alertCtrl:AlertController,
  public file:File) {
    this.menuCtrl.enable(true)
    


  }

  
  

  ionViewDidLoad() {
    //set map center
    this.center = [41.9027835,12.496365500000024]; 
    
    
    //setup leaflet map
        this.initMap();
    
      }

  ionViewCanLeave(){
    document.getElementById("map").outerHTML = "";
  }

  initMap() {

     this.map = L.map('map', {
      center: this.center,
      zoom: 13
    });
    L.marker(this.center).addTo(this.map)
    .bindPopup('Tu sei qui')
    .openPopup();
    this.map.panTo(this.center)
    
    //Add OSM Layer
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?access_token={accessToken}",{
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      accessToken:'pk.eyJ1IjoibWFyeWNvb3BlciIsImEiOiJjajY2bjhqMXUxYjN5MnFuenJtbWQxem8xIn0.JpH5RDkg_yOjcLrwsFA6zA'
    })
      .addTo(this.map);   


      
      if(this.platform.is('core')){
        this.geolocate()
      } else {
        this.diagnostic.isLocationEnabled().then((state)=>{
          if(state){
            this.geolocate();
          } else{
            this.presentConfirm();      
          }
        })

      }
      
  }

  

  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Location',
      message: 'Please enable location to start your trip and reload the page.',
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
            this.diagnostic.switchToLocationSettings();
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
      this.getFeatures()
      var self = this;
      var x = new HomePage(this.navCtrl, this.menuCtrl,this.geolocation,
        this.toastCtrl,this.diagnostic, this.platform, this.alertCtrl,
        this.file);
     this.map.addEventListener('dragend', function(e){
       self.getFeatures()
     }) 

      

      if(!this.platform.is('core')){
        let watch = this.geolocation.watchPosition();
        watch.subscribe((data)=>{
          
        }, error => {
          this.displayGPSError("Cannot read location. Turn on your GPS and reload the page.")
        })         
      }
      
    }).catch((err) =>{
      this.displayGPSError("Cannot read location")
    })
  }

  displayGPSError(messageErr: string){
    let toast = this.toastCtrl.create({
      message: messageErr,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }


  getFeatures(){
    var pointList = [];
    let bounds = this.map.getBounds();
    let bbox = bounds.getSouth()+','+bounds.getWest()+','+bounds.getNorth()+','+bounds.getEast();  
    
     let request = "";
     let overlays ={};
     let lat,lon;
     
     
     request+=`node[historic](${bbox});`
     request+=`way[historic](${bbox});`
    /*request+=`node[amenity=restaurant](${bbox});`
    request+=`way[amenity=restaurant](${bbox});`*/
    let url = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(${request});out center;`;
    fetch(url).then(response => {

      
      
      return response.json();
    }).then(results => {
      //this.file.writeFile("../","text.txt",JSON.stringify(results))
     // overlays['amenity=hospital'].clearLayers;
      let i = 0;
       results.elements.forEach(e => {
        console.log('Name '+e.tags["name"])
        
        if(e.type == "way"){
            console.log('ID: ' + e.id)
               lat = e.center["lat"]
              lon = e.center["lon"]
              pointList.push(new L.LatLng(lat,lon));
               let marker = L.marker([lat, lon])
          let content = '';
         for (let tag in  e.tags) {
          content += `<b>${tag}</b>: ${e.tags[tag]}<br/>`;
        };
        marker.bindPopup(content) 
       marker.addTo(this.map)
        marker.openPopup()
          } else {
              lat = e.lat
              lon = e.lon
              pointList.push(new L.LatLng(lat,lon));
              let marker = L.marker([lat, lon])
              let content = '';
            for (let tag in e.tags) {
              content += `<b>${tag}</b>: ${e.tags[tag]}<br/>`;
            };
           marker.bindPopup(content)
           marker.addTo(this.map)
          //marker.addTo(overlays['amenity=hospital']);
           marker.openPopup()
          }
          console.log('Latitudine: ' + lat + ' Longitudine: ' + lon)
      
      });
  
    }).catch(error => {
      console.log(''+ error)
    });  
  }

}
