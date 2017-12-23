import { Component, ViewChild } from '@angular/core';
import { NavController, MenuController, ToastController, Platform, AlertController} from 'ionic-angular';
import L from "leaflet";
import { Geolocation, Geoposition, GeolocationOptions } from '@ionic-native/geolocation';
import { Diagnostic } from "@ionic-native/diagnostic";
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import * as fs from "@ionic-native/file"
import { Api } from "../../providers/api";
import { File, FileReader } from '@ionic-native/file';
import * as GraphHopper from 'graphhopper-js-api-client';
import { CHECKBOX_REQUIRED_VALIDATOR } from '@angular/forms/src/directives/validators';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, CameraPosition,MarkerOptions, Marker } from '@ionic-native/google-maps';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { CreateRoutePage } from "../create-route/create-route";
import { getComponent } from '@angular/core/src/linker/component_factory_resolver';
declare var google: any;
declare var require: any
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: L.Map;
  center: L.PointTuple;
  public poiKeys:Array<any>;
  public GOOGLE_API_KEY = "AIzaSyDUKtnraJqbHqMP8jDHeGAZ75fUZZ9lLlw";
  public directionsService = new google.maps.DirectionsService();
  start;
  destination;
  canCalculate = false;
  public myTags:Array<any>;
  public waypoints:Array<any>
  maxLength;
  maxTime;
  time;
  both = false;
  timeDone = false;
  lengthDone = false;
  

  @ViewChild('map-container') mapContainer;

  constructor(public navCtrl: NavController, public menuCtrl:MenuController,public geolocation:Geolocation,
  public toastCtrl:ToastController, public diagnostic:Diagnostic, public platform:Platform, public alertCtrl:AlertController,
  public file:File, public api:Api, public navParams: NavParams) {
    this.menuCtrl.enable(true)
    var first = this.navParams.get('firstAddress')
    var second = this.navParams.get('secondAddress')
    this.waypoints = this.navParams.get('waypts')
    this.maxLength = this.navParams.get('maxLength')
    this.maxTime = this.navParams.get('maxDuration')


    if (first !=null && second!=null && this.waypoints!=null){
      this.start = first;
      this.destination = second;
      this.canCalculate = true;
    }


  }

  
  

  ionViewDidLoad() {

    //set map center
    this.center = [44.13832, 12.2447 ]; 
    
    
    //setup leaflet map
        this.initMap();
        if(this.canCalculate){
          this.withGoogle(this.start, this.destination, this.waypoints);
        } 
        //this.getUsersPref()
    
      }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ionViewCanLeave(){
    //document.getElementById("map").outerHTML = "";
  }

  initMap() {

     this.map = L.map('map', {
      center: this.center,
      zoom: 16 
    });
    //L.marker(this.center).addTo(this.map)
    this.map.panTo(this.center)
    
    //Add OSM Layer
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?access_token={accessToken}",{
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      accessToken:'pk.eyJ1IjoibWFyeWNvb3BlciIsImEiOiJjajY2bjhqMXUxYjN5MnFuenJtbWQxem8xIn0.JpH5RDkg_yOjcLrwsFA6zA'
    })
      .addTo(this.map);   


      if (this.canCalculate){

        var startIcon = L.icon({
          iconUrl: "assets/images/start.png",

          iconSize: [30,30],
          popupAnchor:  [1, -14],
          iconAnchor: [15,30]
        })

        var endIcon = L.icon({
          iconUrl: "assets/images/end.png",
          
          iconSize: [30,30],
          popupAnchor:  [1, -14],
          iconAnchor: [15,30]
        })


         let marker = L.marker([this.start.lat(),this.start.lng()], {icon: startIcon})
        let content = `<b>Partenza</b>`;
          marker.bindPopup(content) 
          marker.addTo(this.map)
         marker.openPopup()  
        
         let marker1 = L.marker([this.destination.lat(),this.destination.lng()], {icon: endIcon} )
         let content1 = `<b>Arrivo</b>`;
           marker1.bindPopup(content1) 
           marker1.addTo(this.map)
          marker1.openPopup()
      } else {
        if(this.platform.is('core')){
          //this.withGoogle()
         //this.getFeatures()
          this.geolocate()
        } else {
          this.diagnostic.isLocationEnabled().then((state)=>{
            if(state){
              this.geolocate(); 
              //this.getFeatures();
            } else{
              this.presentConfirm();      
            }
          })
  
        }

      }
      

      
      
  }

  planTrip(){
    this.navCtrl.push(CreateRoutePage);
  }

  

  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Posizione',
      message: 'Abilita il GPS per localizzare la tua posizione.',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Sì',
          handler: () => {
            this.diagnostic.switchToLocationSettings();
            }
        }
      ]
    });
    alert.present();
  }

  getMapZoom(){
    return this.map.getZoom();
  }

 

  geolocate(){
    this.geolocation.getCurrentPosition().then((resp) =>{
      var positionMarker: L.Marker;
      let latlng = {lat: resp.coords.latitude, lng: resp.coords.longitude}
      var request = new XMLHttpRequest();
      var method = 'GET'
      var url = `http://maps.googleapis.com/maps/api/geocode/json?latlng=${resp.coords.latitude},${resp.coords.longitude}&sensor=true`
      request.open(method,url,true);
      var self = this;
      request.onreadystatechange = function(){
        if (request.readyState == 4 && request.status == 200){
          var data = JSON.parse(request.responseText);
          var city;

          for (var i=0; i<data.results[0].address_components.length; i++) {
            for (var b=0;b<data.results[0].address_components[i].types.length;b++) {

            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                if (data.results[0].address_components[i].types[b]!=null &&  data.results[0].address_components[i].types[b]== "administrative_area_level_3") {
                    //this is the object you are looking for
                    city= data.results[0].address_components[i];
                    break;
                }
            }
        }
        self.api.setCity(city.long_name);
        } else {
          self.displayGPSError("C'è qualche difficoltà nell'individuare la tua posizione.")
        }
      }
      request.send();
      
      
      positionMarker = L.marker(latlng).addTo(this.map);
      positionMarker.bindPopup("Tu sei qui");
      this.map.setView(latlng,16)
      this.map.panTo(latlng)
      this.getFeatures()
      var self = this;
      var x = new HomePage(this.navCtrl, this.menuCtrl,this.geolocation,
        this.toastCtrl,this.diagnostic, this.platform, this.alertCtrl,
        this.file,this.api, this.navParams);
     this.map.addEventListener('dragend', function(e){
       if(self.getMapZoom()>=16){
        self.getFeatures()
       } else {
         self.displayGPSError("Diminuisci il livello di zoom per visualizzare i punti di interesse " +
        "sulla mappa");
       }
      
     }) 
     this.map.addEventListener('zoomend', function(e){
       if (self.getMapZoom()<16){
        self.displayGPSError("Diminuisci il livello di zoom per visualizzare i punti di interesse " +
        "sulla mappa");     
       }else {
         self.getFeatures();
       }
       
     })

      

      if(!this.platform.is('core')){
        let watch = this.geolocation.watchPosition();
        watch.subscribe((data)=>{
          this.displayGPSError("La posizione è cambiata")
          
        }, error => {
          this.displayGPSError("Non è stato possibile ottenere la tua posizione. Attiva il GPS o ricarica la pagina.")
        })
        
        
      }
      
    }).catch((err) =>{
      this.displayGPSError("Non è stato possibile ottenere la tua posizione. Attiva il GPS o ricarica la pagina.")
    })
  }


  geocode(address:string){
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address':address}, function(results, status){
      if (status === 'OK') {

      } else {
        console.log("Geocoding not ok")
      }
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


  updateCityPois(){
    let poisKeys = [];
    var ref = firebase.database().ref('/cities/-KzZFy1JPWnrwTzRyS9R/pois')
    var ref1 = firebase.database().ref('/point_of_interest');
    ref1.once('value', function(snapshot){ //ciclo sui punti di interesse (snapshot è la CHIAVE)
      snapshot.forEach(function(childSnapshot){ 
        if(childSnapshot.child("città").val() == "Cesena"){ //campo "città" dei tag
          poisKeys.push(childSnapshot.key);
        }       
        return false;
      })
    }).then(a=>{
      this.poiKeys = poisKeys;
      var updates = {};
      this.poiKeys.forEach(k =>{   
        updates['/cities/-KzZFy1JPWnrwTzRyS9R/pois/'+k] = "true"; //aggiorno la lista dei punti di interesse
      })
      firebase.database().ref().update(updates);

    })
  }

  googleRouting(start,arrival,waypoints, chosen){

    var myWayPts= []
    
        waypoints.forEach(w=>{
          var data = {
            location: new google.maps.LatLng(w.latlng[0],w.latlng[1]),
            stopover: true
          }
          myWayPts.push(data)
        })

    var polyUtil = require('polyline-encoded')
    var latlngs;
    var newMap = this.map;
    var encoded;
    this.directionsService.route({
      origin: start,
      destination: arrival,
      waypoints: myWayPts,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.WALKING,
      region: "it"
    }, (response, status) => {
      if (status === 'OK') {

        encoded = response.routes[0].overview_polyline; 
        
        //console.log("Istruzioni " + response.routes[0].legs[0].steps[0].html_instructions)
        latlngs = polyUtil.decode(encoded)
        
        var firstpolyline = new L.Polyline(latlngs, {
            color: 'red',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
        });

        var myArray = []
        waypoints.forEach(w=>{
          myArray.push(w)
        })
              
        var newArray =[]
        
        response.routes[0].waypoint_order.forEach(o=>{
          newArray.push(myArray[o])
        })

        var arrayTime = [];
        var arrayLength = [];

        if(this.both){
          if(chosen=="time"){
            console.log("Il tempo sta riempiendo")
            response.routes[0].waypoint_order.forEach(o=>{
              arrayTime.push(myArray[o])
            })

          }else if(chosen=="length"){
            console.log("La lunghezza sta riempiendo")
            response.routes[0].waypoint_order.forEach(o=>{
              arrayLength.push(myArray[o])
            })

          }
        }



        

        var duration = 0;
        var lunghezza = 0;
        var myLegs = response.routes[0].legs
        for(var i=0; i<myLegs.length-1; i++){ 
          duration+=myLegs[i].duration.value
          lunghezza+=myLegs[i].distance.value
        }

        /* if(this.both){ //ho chiesto per entrambi
          console.log("Ho chiesto per entrambi")
            if(duration>(this.maxTime-myLegs[myLegs.length-1].duration.value)){
            this.calculateMinimumTime(response,this.maxTime,waypoints)
          } else {
            this.timeDone = true;
          }
          if(lunghezza>(this.maxLength-myLegs[myLegs.length-1].distance.value)){         
            this.calculateMinimumLength(response,this.maxLength,waypoints)
          }else {
            this.lengthDone = true;
          }

          if(this.lengthDone && this.timeDone){//se hanno finito entrambi
            console.log("Hanno finito entrambi di calcolare")
            arrayTime.forEach(p=>{
              console.log("Nome tempo " +p.nome)
            })

            arrayLength.forEach(p=>{
              console.log("Nome lunghezza " +p.nome)
            })
          }  
          
          
        }else */ if(chosen=="time"){ // ho chiesto per il tempo
          if(duration>(this.maxTime/*-myLegs[myLegs.length-1].duration.value*/)){
            //this.calculateMinimumTime(response,this.maxTime,waypoints)
            console.log("Lunghezza waypoints " + waypoints.length)
            var random = this.getRandomNumber(0, waypoints.length-1)
            waypoints.splice(random,1) //elimino un elemento all'indice random
            console.log("Lunghezza waypoints " + waypoints.length)            
            console.log("Il tempo sta ancora calcolando")
            this.googleRouting(start,arrival,waypoints,"time")
  
          } else {
            /* if(this.both){
              console.log("Il tempo non fa niente")
              arrayTime.forEach(t=>{
                console.log("Punto scelto dal tempo " + t.nome)
              })


            } else { */
              let index = 1;
              newArray.forEach(p =>{
                let marker = L.marker([p.latlng[0],p.latlng[1]])
                let content = `<b>Nome</b>: ${p.nome}<br/>`+"Posizione " + index;
                marker.bindPopup(content) 
                marker.addTo(newMap)
                marker.openPopup() 
                index++;
              
              })
              firstpolyline.addTo(newMap); 
           // }
            
          }
        } else if(chosen=="length"){//ho chiesto per la lunghezza
          if(lunghezza>(this.maxLength-myLegs[myLegs.length-1].distance.value)){     
            this.calculateMinimumLength(response,this.maxLength,waypoints)
  
          } else {
            /* if(this.both){
              console.log("La lunghezza non fa niente")
              arrayLength.forEach(t=>{
                console.log("Punto scelto dalla lunghezza " + t.nome)
              })

            } else {
 */              let index = 1;
              newArray.forEach(p =>{
                let marker = L.marker([p.latlng[0],p.latlng[1]])
                let content = `<b>Nome</b>: ${p.nome}<br/>`+"Posizione " + index;
                marker.bindPopup(content) 
                marker.addTo(newMap)
                marker.openPopup() 
                index++;
              
              })
              firstpolyline.addTo(newMap); 
           // }
            
          }
        }
        

      }
    })
  }

  getRandomNumber(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    var random = Math.floor(Math.random()*(max-min+1)+min)
    console.log("Numero random generato " + random)
    return random
  }

  withGoogle(start, arrival,waypoints){

    var myWayPts= []

    waypoints.forEach(w=>{
      var data = {
        location: new google.maps.LatLng(w.latlng[0],w.latlng[1]),
        stopover: true
      }
      myWayPts.push(data)
    })



    var polyUtil = require('polyline-encoded')
    var latlngs;
    var newMap = this.map;
    var encoded;
    this.directionsService.route({
      origin: start,
      destination: arrival,
      waypoints: myWayPts,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.WALKING,
      region: "it"
    }, (response, status) => {
      if (status === 'OK') {

        
        encoded = response.routes[0].overview_polyline; 

        //console.log("Istruzioni " + response.routes[0].legs[0].steps[0].html_instructions)
        latlngs = polyUtil.decode(encoded)

        var firstpolyline = new L.Polyline(latlngs, {
          color: 'red',
          weight: 3,
          opacity: 0.5,
          smoothFactor: 1
      });
      


      //this.calculateMinimumLength(response, 300);


    //console.log("Ordine " +response.routes[0].waypoint_order)
     var myRoute= response.routes[0].legs[0]
    //console.dir("I " + myRoute.steps[i].instructions)
     var lunghezza = 0;
     var duration = 0;
     var myLegs = response.routes[0].legs
     for(var i=0; i<myLegs.length; i++){ 
       lunghezza+=myLegs[i].distance.value
       duration+=myLegs[i].duration.value
    }
    


    for (var i = 0; i<myLegs.length; i++){
      console.log("Leg " + i + " Start " + myLegs[i].start_address + " end " + myLegs[i].end_address)
      
    }

      var myArray = []
      waypoints.forEach(w=>{
        myArray.push(w)
      })
      
      var newArray =[]

      response.routes[0].waypoint_order.forEach(o=>{
        newArray.push(myArray[o])
      })
      



      if(this.maxLength!=null && this.maxTime!=null){
        console.log("nessuno dei due è null")
        this.both = true;
        var newL = this.maxLength - myLegs[myLegs.length-1].distance.value
        var newT = this.maxTime - myLegs[myLegs.length-1].duration.value
         //this.googleRouting(start, arrival, waypoints,"time")
        //this.googleRouting(start, arrival, waypoints,"length") 
        this.calculateMinimumLength(response,newL, newArray)
        this.calculateMinimumTime(response,newT, newArray)
      } else if (this.maxLength != null && !this.both){
        console.log("Ho scritto una max length")
        this.time = false;
        var newL = this.maxLength - myLegs[myLegs.length-1].distance.value
        this.calculateMinimumLength(response,newL, newArray)
      } else if(this.maxTime!=null && !this.both){
        console.log("Ho scritto un maxTime")
        this.time = true;
        var newT = this.maxTime - myLegs[myLegs.length-1].duration.value //ho tolto l'ultimo elemento del vettore perché
        //rappresenta l'ultimo passo. 
        this.distanceAPI(start,arrival,waypoints);
        //console.log("La distanza tra arrivo e partenza è  " + time)
       // this.googleRouting(start,arrival,waypoints,"time"); //chiamo google routing con il time
        //var timeRes = this.calculateMinimumTime(response,newT, newArray)
      } else { //non ho limiti, quindi posso calcolare il mio percorso
        console.log("Sono entrambi null")
        let index = 1;
        newArray.forEach(p =>{
          let marker = L.marker([p.latlng[0],p.latlng[1]])
          let content = `<b>Nome</b>: ${p.nome}<br/>`+"Posizione " + index;
            marker.bindPopup(content) 
            marker.addTo(newMap)
           marker.openPopup() 
           index++;
  
        })
        firstpolyline.addTo(newMap);
      }
  

      this.map.setZoom(18)
     

        /* var routingLayer = L.geoJSON().addTo(newMap) ;


        (routingLayer as any).options = {
          style: {color: "#00cc33", "weight": 5, "opacity": 0.6}
        }
    
        var prova = 5 ;
        (routingLayer as any).addData({
          "type": "Feature",
          "coordinates":latlngs
      }) */
          
        //console.log("Encoded " +encoded);
         
      } else {
        this.displayGPSError("Non è stato possibile pianificare il tuo percorso. Controlla che l'indirizzo di arrivo e partenza siano ben formattati")
      }
    })

    


  }

  distanceAPI(start,arrival,waypoints){
    var service = new google.maps.DistanceMatrixService();
    var self = this;
    service.getDistanceMatrix(
      {
        origins: [start],
        destinations: [arrival],
        travelMode: google.maps.TravelMode.WALKING,
      }, (response, status) => {
        if(status=="OK"){
          var origins = response.originAddresses;
          var destinations = response.destinationAddresses;

          console.log("Lunghezza origins " + origins.length)
          var distance = 0;
          var duration = 0;
          for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
              var element = results[j];
              distance = element.distance.value;
              duration = element.duration.value;
              var from = origins[i];
              var to = destinations[j];
            }
          }
          console.log("Durata: " + duration)
          if(duration>this.maxTime){
            self.displayGPSError("Ci dispiace, il punto di partenza e quello di arrivo sono troppo lontani per i limiti inseriti!")
          } else {
            self.googleRouting(start,arrival,waypoints,"time");
          }
        } else{
          console.log("Problems calculating distances")
        }

      })
  }

  calculateMinimumLength(response:any, maxLength, wayPts){

    var myLegs = response.routes[0].legs
    var longest = 0;
    var length = 0;
    var items = [];
    for (var i=0; i<myLegs.length-1; i++){
      items.push(myLegs[i].distance.value)
    }

    myLegs.forEach(i=>{
      console.log("Distanza " + i.distance.value + " max " + maxLength)
    })
    var newWaypts = []
    var newLengths = this.getCombinations(items,maxLength); //le nuove lunghezze

    if(newLengths.length == 0){
      this.displayGPSError("Ci dispiace, il limite di lunghezza specificato è troppo basso per creare un percorso.")
    } else {
    newLengths[0].forEach(t => {
      for(var i=0; i<items.length; i++){
        if(items[i] == t && newWaypts.indexOf(wayPts[i])<=-1){//controllo anche se non lo contiene
          newWaypts.push(wayPts[i])
        }
      }
    })
    
      this.googleRouting(this.start, this.destination,newWaypts,"length")
    
  }

  }

  calculateMinimumTime(response:any, maxTime, wayPts){
    var myLegs = response.routes[0].legs;
    var items = []
    for (var i=0; i<myLegs.length-1; i++){
      items.push(myLegs[i].duration.value)
    }

    var newWaypts = []
    var newTimes = []
     newTimes = this.getCombinations(items,maxTime); //i nuovi tempi
     if(newTimes.length == 0){
       this.displayGPSError("Ci dispiace, il limite di tempo specificato è troppo basso per creare un percorso.")
     } else {
      newTimes[0].forEach(t => {
        for(var i=0; i<items.length; i++){
          if(items[i] == t && newWaypts.indexOf(wayPts[i])<=-1){//controllo anche se non lo contiene
            newWaypts.push(wayPts[i])
          }
        }
      })  
        this.googleRouting(this.start, this.destination,newWaypts,"time")
     }
  }


  getCombinations(array, sum) {
    function add(a, b) { return a + b; }

    function fork(i, t) {
        var r = (result[0] || []).reduce(add, 0),
            s = t.reduce(add, 0);
        if (i === array.length || s > sum) {
            if (s <= sum && t.length && r <= s) {
                if (r < s) {
                    result = [];
                }
                result.push(t);
            }
            return;
        }
        fork(i + 1, t.concat([array[i]]));
        fork(i + 1, t);
    }

    var result = [];
    fork(0, []);
    return result;
}
  
  graphHopper(){
    
        var defaultKey = "2770d027-3826-4bf4-afc9-9491e75c983a";
        var profile = "foot";
        var host = "https://graphhopper.com/api/1/";
       
      require('graphhopper-js-api-client')
      var GraphHopperRouting = require('graphhopper-js-api-client/src/GraphHopperRouting');
      var GHInput = require('graphhopper-js-api-client/src/GHInput');
      var GHOptimization = require('graphhopper-js-api-client/src/GraphHopperOptimization');
      //var Routing = require('leaflet-routing-machine')
      var routingLayer = L.geoJSON().addTo(this.map) ;
      
      (routingLayer as any).options = {
        style: {color: "#00cc33", "weight": 5, "opacity": 0.6}
      }
    
      
       
        //var ghRouting = new GraphHopperRouting({key: defaultKey, host: host, vehicle:profile,elevation:false,optimize:true,calc_points:true})
        //var ghRouting = new GHOptimization({key: defaultKey, host: host, vehicle_types:profile,elevation:false,optimize:true})
        var ghRouting = new GraphHopperRouting({key: defaultKey, host: host, vehicle:profile,optimize:true, points_encoded:false})
        /* pointList.forEach(point =>{
          //ghRouting.addPoint(new GHInput(point.lat,point.lng))
        }) */
       var myArray = []
       myArray.push([44.1388386,12.243707,"Piazza"])
       myArray.push([44.1374648,12.2480796,"Fontana"])
       myArray.push([44.1359114,12.2454082,"Museo"])
       myArray.push([44.1371501,12.24147,"Cattedrale"])
       myArray.push([44.136342,12.2429801,"Ericacca"])
      
      /* myArray.forEach(i => {
         console.log("Prova " + i[0])
       })*/

        ghRouting.addPoint(new GHInput(44.1388386,12.243707));
        ghRouting.addPoint(new GHInput(44.1374648,12.2480796));
        ghRouting.addPoint(new GHInput(44.1359114,12.2454082));
        ghRouting.addPoint(new GHInput(44.1371501,12.24147));
        ghRouting.addPoint(new GHInput(44.136342,12.2429801));
     
        var newMap = this.map;
         
         ghRouting.doRequest().then(function(json){    
          /* json.paths[0].points.coordinates.forEach(c=>{
            console.log("Lon: " + c[0] + " lat " + c[1])
            let marker = L.marker([c[1], c[0]])
            let content = '';
           
           marker.bindPopup(content) 
         marker.addTo(self.map)
         marker.openPopup() 
          })     */
          // console.log("Points" + json.paths[0].points.coordinates[0])
           /* json.paths[0].instructions.forEach(t =>{
             console.log(' ' + t.text)
           }) */
            //console.log('Ordine dei punti: '+json.paths[0].points_order)

            /* console.log('Punti nel vettore: ' + json.paths[0].snapped_waypoints.coordinates[0][1].toString())
            json.paths[0].snapped_waypoints.coordinates.forEach(c=>{
              let index = 1;
                let marker = L.marker(c[1],c[0])
                let content = "Posizione " + index;
               marker.bindPopup(content) 
               marker.addTo(newMap)
               marker.openPopup() 
               index++;
            }) */

            
             var newArray = [];
            json.paths[0].points_order.forEach(o=>{
              newArray.push(myArray[o])
            })
            let index = 1;
            newArray.forEach(p=>{
              let marker = L.marker([p[0],p[1]])
              let content = `<b>Nome</b>: ${p[2]}<br/>`+"Posizione " + index;
             marker.bindPopup(content) 
           marker.addTo(newMap)
           marker.openPopup() 
           index++;

            }) 
            


           var path = json.paths[0];
           (routingLayer as any).addData({
                            "type": "Feature",
                            "geometry": path.points
                        }); 
         }).catch(function(err){
           console.log("Error "+ err.message)
         })
         

          
      }



  saveData(e){
    //if(e.tags.hasOwnProperty("tourism") && e.tags["tourism"]!="hotel"){
      
    //}
    var attrs = ["addr:city", "amenity", "addr:street", "name"];
    var labels = ["città", "tipologia", "indirizzo", "nome"]
    var data = { };

    attrs.forEach((a, i) => {
       if (e.tags[a]) { 
         data[labels[i]] = e.tags[a]; 
        }
        if (e.type=="node"){
          data["lat"] = e.lat
          data["lon"] = e.lon
        } else if (e.type=="way"){
          data["lat"] = e.center["lat"]
          data["lon"] = e.center["lon"]
        }
        
    });
    
      var ref = firebase.database().ref('/point_of_interest/');
      var key = firebase.database().ref().child('point_of_interest').push().key;   
      var updates = {};
      /*var data = {
        città: e.tags["addr:city"],
        tipologia: e.tags["amenity"],
        indirizzo: e.tags["addr:street"],
        nome: e.tags["name"],
        lat: e.lat,
        lon: e.lon

      }   */   
      updates['/point_of_interest/'+key] = data;      
      firebase.database().ref().update(updates);      
    
   }


  getFeatures(){
    var pointList = [];
    let bounds = this.map.getBounds();
    let bbox = bounds.getSouth()+','+bounds.getWest()+','+bounds.getNorth()+','+bounds.getEast();  
    console.log("bbox " + bounds.getSouth()+', '+bounds.getWest()+', '+bounds.getNorth()+', '+bounds.getEast())
     let request = "";
     let overlays ={};
     let lat,lon;
     
     
     request+=`node[~"^(tourism|historic)$"~"."](if:t["tourism"]!="hotel" %26%26 t["tourism"]!="guest_house")(${bbox});`
     request+=`way[~"^(tourism|historic)$"~"."](if:t["tourism"]!="hotel" %26%26 t["tourism"]!="guest_house")(${bbox});`
    let url = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(${request});out center;`;
    fetch(url).then(response => {
      
      return response.json();
    }).then(results => {
           
      let i = 0;
       results.elements.forEach(e => {
        //this.saveData(e)
        if(e.type == "way"){
           // console.log('ID: ' + e.id)
               lat = e.center["lat"]
              lon = e.center["lon"]
              pointList.push(new L.LatLng(lat,lon));
               let marker = L.marker([lat, lon])
          let content = '';
         for (let tag in  e.tags) {
          content += `<b>${tag}</b>: ${e.tags[tag]}<br/>`;
        };
        /* marker.bindPopup(content) 
       marker.addTo(this.map)
       marker.openPopup() */
          } else {
              lat = e.lat
              lon = e.lon
              pointList.push(new L.LatLng(lat,lon));
              let marker = L.marker([lat, lon])
              let content = '';
            for (let tag in e.tags) {
              content += `<b>${tag}</b>: ${e.tags[tag]}<br/>`;
            };
           /* marker.bindPopup(content)
           marker.addTo(this.map)
          //marker.addTo(overlays['amenity=hospital']);
           marker.openPopup() */
          }
        //  console.log('Latitudine: ' + lat + ' Longitudine: ' + lon)
      
      });
  
    }).catch(error => {
      console.log(''+ error)
    });  

    //var ref = firebase.database().ref('/users/'+ this.api.user+'/preferenze')    //this.graphHopper();
    var tags = ["prova"]
    //this.findPoiByTag(tags)

  }
}

