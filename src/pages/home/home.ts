import { Component, ViewChild } from '@angular/core';
import { NavController, MenuController, ToastController, Platform, AlertController, LoadingController,ModalController} from 'ionic-angular';
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
  first = true;
  loading;
  routeDisplayed = false;
  instructions: Array<any>;
  chosenWayPts = [];
  clicked = false;
  theMarker;
  user_position;
  yahIcon = L.icon({
    iconUrl: "assets/images/yah.png",

    iconSize: [30,30],
    popupAnchor:  [1, -14],
    iconAnchor: [15,30]
  })
  

  @ViewChild('map-container') mapContainer;

  constructor(public navCtrl: NavController, public menuCtrl:MenuController,public geolocation:Geolocation,
  public toastCtrl:ToastController, public diagnostic:Diagnostic, public platform:Platform, public alertCtrl:AlertController,
  public file:File, public api:Api, public navParams: NavParams, public loadingController:LoadingController,public modal: ModalController) {
    this.menuCtrl.enable(true)

    /*Metodo per prenderd l'URL delle foto caricate*/
    /* var storage = firebase.storage();
    var pathReference = storage.ref();
    pathReference.child('photos_POIS/biblioteca_malatestiana.jpg').getDownloadURL().then(function(url) {
      console.log("Url è " + url)
    }).catch(function(error){
      console.log("Errore nel retrieve")
    }) */
    var first = this.navParams.get('firstAddress')
    var second = this.navParams.get('secondAddress')
    this.waypoints = this.navParams.get('waypts')
    this.maxLength = this.navParams.get('maxLength')
    this.maxTime = this.navParams.get('maxDuration')

    this.loading = this.loadingController.create({content: "Attendi mentre calcoliamo il percorso ...", spinner:"crescent"})



    if (first !=null && second!=null && this.waypoints!=null){
      this.start = first;
      this.destination = second;
      this.canCalculate = true;
      this.routeDisplayed = true;
    }


  }

/* CREANO NUOVI POI NEL DB
  generateUUID(): any {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
  }

  createNewPoints(){ 
    console.log("inside")
    var ref = firebase.database().ref('/point_of_interest/'+this.generateUUID());
    var key = firebase.database().ref().child('point_of_interest').push().key; 
    
    
    var updates = {};
    var data = {
      città: "Cesena",
      descrizione: "" ,
      indirizzo: "",
      nome: "",
      lat: 0,
      lon: 0,
      numero_foto: 0,
      numero_informazioni: 0,
      numero_tag: 0,
      photo_url: "", 
    }     
    updates['/point_of_interest/'+key] = data;      
    updates['/cities/-KzZFy1JPWnrwTzRyS9R/pois/'+key] = "true";  
    firebase.database().ref().update(updates);      
  }*/

  /*Questa funzione crea un tag, la lascio che può servire nuovamente*/
  /*createTag(){
    var key = firebase.database().ref().child('tag').push().key; 
    var updates = {};
    var data = {
      nome: "Convento"
    }
    updates['/tag/'+key] = data;  
    firebase.database().ref().update(updates);  
  }*/
  
 
  onLocationFound(e) {

    if (this.theMarker != undefined) {
      this.map.removeLayer(this.theMarker);
};
    this.theMarker = L.marker(e.latlng, {icon: this.yahIcon}).addTo(this.map)
        .bindPopup(`<b>Posizione corrente</b>`);
    
}

  ionViewDidLoad() {
    //set map center
    this.center = [44.13832, 12.2447 ]; 
   // this.createNewPoints() //RICHIAMA LA FUNZIONE PER CREARE NUOVI POI
   //this.createTag(); CREARE TAG
    //setup leaflet map
  
     this.initMap();

   
        
        if(this.canCalculate){

          this.map.locate({setView: true, 
             maxZoom: 16, 
             watch:true
           });

           

          this.map.on('locationfound', this.onLocationFound,this);
           
            /* let marker1;
            let watch = this.geolocation.watchPosition();
            watch.subscribe((data)=>{
              var lat = data.coords.latitude
              var lon =  data.coords.longitude
              let latlng = {lat: lat, lng: lon}
              marker1 = L.marker(latlng)
              let content1 = `<b>Posizione corrente</b>`;
                marker1.bindPopup(content1) 
                marker1.addTo(this.map)
               //marker1.openPopup()
              //this.displayGPSError("La posizione è cambiata")
              
            }, error => {
              this.displayGPSError("Non è stato possibile ottenere la tua posizione. Attiva il GPS o ricarica la pagina.")
            }) */

          
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

     ionViewDidEnter(){
      if(!this.canCalculate){
        this.geolocate()
      }
      
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

      var self = this;
      this.map.on('click', function(e) {        
        if(self.canCalculate){
          self.clicked = !self.clicked
        }        
    });

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
          //this.geolocate()
        } else {
          this.diagnostic.isLocationEnabled().then((state)=>{
            if(state){
              //this.geolocate(); 
            } else{
              this.presentConfirm();      
            }
          })
  
        }

      }
      

      
      
  }

  planTrip(){
    this.navCtrl.push(CreateRoutePage, {
      position: this.user_position
    });
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
    console.log("Sono dentro geolocate")
    this.geolocation.getCurrentPosition().then((resp) =>{
      var positionMarker: L.Marker;
      let latlng = {lat: resp.coords.latitude, lng: resp.coords.longitude}
      var request = new XMLHttpRequest();
      var method = 'GET'
      var url = `http://maps.googleapis.com/maps/api/geocode/json?latlng=${resp.coords.latitude},${resp.coords.longitude}&sensor=true`
      request.open(method,url,true);
      var self = this;
      request.onreadystatechange = function(){
        
        if(request.status == 200){
          if (request.readyState == 4 && request.status == 200){
            if(request.responseText){
              var data = JSON.parse(request.responseText);
              var city;
  

              if(data.results[0]!=null){           
            for (var i=0; i<data.results[0].address_components.length; i++) {
              for (var b=0;b<data.results[0].address_components[i].types.length;b++) {
                
              //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                  if (data.results[0].address_components[i].types[b]!=null &&  data.results[0].address_components[i].types[b]== /*"locality"*/ "administrative_area_level_3" ) {
                      //this is the object you are looking for
                      city= data.results[0].address_components[i];
                      break;
                  }
              }
          }
          if(city.long_name!=null){
            console.log("Nome " + city.long_name)
            self.api.setCity(city.long_name);
          } else {
            self.displayGPSError("C'è qualche errore nell'individuare la tua città.")
          }
        } else {
          console.log("Risultato ancora null")
        }  
            }
            
          }
        }
         else {
          self.displayGPSError("C'è qualche difficoltà nell'individuare la tua posizione.")
        }
      }
      request.send();
      
      this.user_position = latlng;
      positionMarker = L.marker(latlng).addTo(this.map);
      positionMarker.bindPopup("Tu sei qui");
      this.map.setView(latlng,16)
      this.map.panTo(latlng)
      //if(this.getMapZoom()>=16 && !self.canCalculate){
      console.log("Sto per chiamare getFeatures")
      this.getFeatures()
      //}

      var self = this;
     /* this.map.addEventListener('dragend', function(e){
       if(self.getMapZoom()>=16 && !self.canCalculate){
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
       }else if(self.getMapZoom()>=16 && !self.canCalculate){
         self.getFeatures();
       }
       
     }) */

      
     //se NON sono su browser
      /* if(!this.platform.is('core')){
        let watch = this.geolocation.watchPosition();
        watch.subscribe((data)=>{
          var lat = data.coords.latitude
          var lon =  data.coords.longitude
          this.displayGPSError("Coordinate  " + lat + " " + lon )
          //this.displayGPSError("La posizione è cambiata")
          
        }, error => {
          this.displayGPSError("Non è stato possibile ottenere la tua posizione. Attiva il GPS o ricarica la pagina.")
        })
        
        
      } */
      
    }).catch((err) =>{
      this.displayGPSError("Non è stato possibile ottenere la tua posizione. Attiva il GPS o ricarica la pagina.")
      this.presentConfirm();
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
     
        var duration = 0;
        var lunghezza = 0;
        var myLegs = response.routes[0].legs
        for(var i=0; i<myLegs.length-1; i++){ 
          duration+=myLegs[i].duration.value
          lunghezza+=myLegs[i].distance.value
        }

        var self = this;

         if(chosen=="both"){ //ho chiesto per entrambi
          this.loading.present()
          if(duration>this.maxTime || lunghezza>this.maxLength){
            waypoints =this.deleteWaypoint(waypoints)
            this.googleRouting(start,arrival,waypoints,"both")
          } else {
            this.loading.dismiss()
            this.chosenWayPts = newArray; 
            let index = 1;
            newArray.forEach(p =>{
              /*let marker = L.marker([p.latlng[0],p.latlng[1]]).on('click', function(e){
                self.manageMarkerClick(e)
              })*/
              let marker = L.marker([p.latlng[0],p.latlng[1]]).on('click', function(e){
                self.manageMarkerClick(e)
              })
              let content = `<b>Nome</b>: ${p.nome}<br/>`+"Posizione " + index;
              marker.bindPopup(content) 
              marker.addTo(newMap)
              marker.openPopup() 
              index++;
            
            })
            firstpolyline.addTo(newMap); 
            this.instructions = [];
            var myRoute= response.routes[0].legs
            for(var j = 0; j<myRoute.length; j++){
              for(var i =0; i<myRoute[j].steps.length; i++){
                this.instructions.push(myRoute[j].steps[i].instructions)
              }
              if(j!=(myRoute.length-1)){
                this.instructions.push("Ti trovi a " + `<b>`+newArray[j].nome+`</b>`)
              }
            }
          }  
        }else  if(chosen=="time"){ // ho chiesto per il tempo
          this.loading.present()
          if(duration>(this.maxTime)){
            console.log("Lunghezza waypoints prima " + waypoints.length)
            waypoints = this.deleteWaypoint(waypoints)
            console.log("Lunghezza waypoints dopo " + waypoints.length)            
            console.log("Il tempo sta ancora calcolando")
            this.googleRouting(start,arrival,waypoints,"time")
  
          } else {
            this.loading.dismiss()
              let index = 1;
              this.chosenWayPts = newArray; 
              newArray.forEach(p =>{
                let marker = L.marker([p.latlng[0],p.latlng[1]]).on('click', function(e){
                  self.manageMarkerClick(e)
                })
                let content = `<b>Nome</b>: ${p.nome}<br/>`+"Posizione " + index;
                marker.bindPopup(content) 
                marker.addTo(newMap)
                marker.openPopup() 
                index++;
              
              })
              firstpolyline.addTo(newMap); 
              this.instructions = [];
              var myRoute= response.routes[0].legs
              for(var j = 0; j<myRoute.length; j++){
                for(var i =0; i<myRoute[j].steps.length; i++){
                  this.instructions.push(myRoute[j].steps[i].instructions)
                }
                if(j!=(myRoute.length-1)){
                  this.instructions.push("Ti trovi a " + `<b>`+newArray[j].nome+`</b>`)
                }
              }
          }
        } else if(chosen=="length"){//ho chiesto per la lunghezza
          this.loading.present()
          if(lunghezza>this.maxLength){   
            waypoints = this.deleteWaypoint(waypoints)  
            this.googleRouting(start,arrival,waypoints,"length")
  
          } else {
            this.loading.dismiss()
            this.chosenWayPts = newArray; 
               let index = 1;
              newArray.forEach(p =>{
                let marker = L.marker([p.latlng[0],p.latlng[1]]).on('click', function(e){
                  self.manageMarkerClick(e)
                  
                })
                let content = `<b>Nome</b>: ${p.nome}<br/>`+"Posizione " + index;
                marker.bindPopup(content) 
                marker.addTo(newMap)
                marker.openPopup() 
                index++;
              
              })
              firstpolyline.addTo(newMap); 
              this.instructions = [];
              var myRoute= response.routes[0].legs
              for(var j = 0; j<myRoute.length; j++){
                for(var i =0; i<myRoute[j].steps.length; i++){
                  this.instructions.push(myRoute[j].steps[i].instructions)
                }
                if(j!=(myRoute.length-1)){
                  this.instructions.push("Ti trovi a " + `<b>`+newArray[j].nome+`</b>`)
                }
              }
            }
        }
        

      }  else {
        this.displayGPSError("Non è stato possibile pianificare il tuo percorso. Controlla che l'indirizzo di arrivo e partenza siano ben formattati")
      }
    })
  }

  openModal(point){ 
    let myModal = this.modal.create('FotoMapModalPage', {
      poi: point,
    });
    myModal.present();
  }

  manageMarkerClick(e){
    var point;
    this.chosenWayPts.forEach(p=>{
      if((p.latlng[0] == e.latlng.lat) && (p.latlng[1] == e.latlng.lng)){
        point = p;
      }
    })
    this.openModal(point)

    
    //this.displayGPSError("Ho cliccato sul marker " + e.latlng + " lunghezza waypt " + this.chosenWayPts.length)

  }

  getRandomNumber(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    var random = Math.floor(Math.random()*(max-min+1)+min)
    return random
  }

  deleteWaypoint(waypoints){
    if (this.first){
      this.first = false;
      waypoints.shift()
      return waypoints
    } else {
      this.first = true;
      waypoints.pop()
      return waypoints
    }

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


    var self = this;
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
    


    /* for (var i = 0; i<myLegs.length; i++){
      console.log("Leg " + i + " Start " + myLegs[i].start_address + " end " + myLegs[i].end_address)
      
    } */

      var myArray = []
      waypoints.forEach(w=>{
        myArray.push(w)
      })
      
      var newArray =[]

      response.routes[0].waypoint_order.forEach(o=>{
        newArray.push(myArray[o])
      })
      



      if(this.maxLength!=null && this.maxTime!=null){
        this.both = true;
        this.distanceAPI(start,arrival,waypoints)
      } else if (this.maxLength != null && !this.both){
        this.time = false;
        //var newL = this.maxLength - myLegs[myLegs.length-1].distance.value
        this.distanceAPI(start,arrival,waypoints);   
      } else if(this.maxTime!=null && !this.both){
        this.time = true;
        this.distanceAPI(start,arrival,waypoints);
      } else { //non ho limiti, quindi posso calcolare il mio percorso
        let index = 1;
        this.chosenWayPts = newArray; 
        var self = this;
        newArray.forEach(p =>{
          //let marker = L.marker([p.latlng[0],p.latlng[1]]).on('click',this.markerClick).addTo(newMap)
          let marker = L.marker([p.latlng[0],p.latlng[1]]).on('click', function(e){
            self.manageMarkerClick(e)
          })
          let content = `<b>Nome</b>: ${p.nome}<br/>`+"Posizione " + index;
            marker.bindPopup(content) 
            marker.addTo(newMap)
           marker.openPopup() 
           index++;
  
        })
        firstpolyline.addTo(newMap);
        this.instructions = [];
        var myRoute= response.routes[0].legs
        for(var j = 0; j<myRoute.length; j++){
        for(var i =0; i<myRoute[j].steps.length; i++){
          this.instructions.push(myRoute[j].steps[i].instructions)
        }
        if(j!=(myRoute.length-1)){
          this.instructions.push("Ti trovi a " + `<b>`+newArray[j].nome+`</b>`)
        }
      }
        //console.dir("I " + myRoute.steps[i].instructions)
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

          if(this.both){
            if (duration>this.maxTime || distance>this.maxLength){
              self.displayGPSError("Ci dispiace, il punto di partenza e quello di arrivo sono troppo lontani per i limiti inseriti!")
            }else{
              self.googleRouting(start,arrival,waypoints,"both")
            }

          }else if(this.time &&!this.both){
            if(duration>this.maxTime){
              self.displayGPSError("Ci dispiace, il punto di partenza e quello di arrivo sono troppo lontani per i limiti inseriti!")
            } else {
              self.googleRouting(start,arrival,waypoints,"time");
            }
          } else if(!this.time && !this.both){
            if(distance>this.maxLength){
              self.displayGPSError("Ci dispiace, il punto di partenza e quello di arrivo sono troppo lontani per i limiti inseriti!")
            } else {
              self.googleRouting(start,arrival,waypoints,"length");
            }
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

    console.log("Sono dentro getFeatures")
    var self = this;

        var userTags = [];
        var user_pref = firebase.database().ref('/users/'+ self.api.email_id+'/preferenze/');
        var ref = firebase.database().ref('/tag/')


        user_pref.once('value', function(preferenze) { 
          var promises = [];
          preferenze.forEach(function(t) {
            promises.push(ref.child(t.key).once('value'));
            return false;
          });
          Promise.all(promises).then(function(snapshots) {
            snapshots.forEach(function(snapshot) {
              if (snapshot.exists()) {
                userTags.push(snapshot.key);
              }
            });
          }).then(a=>{
            self.myTags = userTags
            self.findPoiByTag(self.myTags) 
          })
          
        });


    /* var pointList = [];
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
        //open popup
          } else {
              lat = e.lat
              lon = e.lon
              pointList.push(new L.LatLng(lat,lon));
              let marker = L.marker([lat, lon])
              let content = '';
            for (let tag in e.tags) {
              content += `<b>${tag}</b>: ${e.tags[tag]}<br/>`;
            };
          //open popup
          }      
      });
  
    }).catch(error => {
      console.log(''+ error)
    }); */  

    //var ref = firebase.database().ref('/users/'+ this.api.user+'/preferenze')    //this.graphHopper();
    var tags = ["prova"]
    //this.findPoiByTag(tags)

  }

  findPoiByTag(tag){
    var self = this
      var found = false;
      var pois = [];
      var newMap = this.map;
      var ref = firebase.database().ref('/cities/-KzZFy1JPWnrwTzRyS9R/pois') //punti di interesse di Cesena
      var ref1 = firebase.database().ref('/point_of_interest/'); //punti di interesse generali
      var ref2 = firebase.database().ref('/tag/');
      ref.once('value', function(preferenze) { 
        var promises = [];
        preferenze.forEach(function(t) {
          promises.push(ref1.child(t.key).once('value'));//aggiungo il mio poi
          //ho aggiunto tutti e solo i punti di interesse di Cesena
          return false;
        });
        Promise.all(promises).then(function(snapshots) {        
          snapshots.forEach(function(snapshot) {
            if (snapshot.exists()) {
              snapshot.child('tags').forEach(function(tags){ //per ogni tag del punto di interesse
                if(tag.indexOf(tags.key)>-1){//se nei tag dell'utente esiste il tag del poi   
                  
                  found = true;
                  var exists = false;
                  for (var i = 0; i<pois.length; i++){
                    if(pois[i].nome == snapshot.child('nome').val()){
                      exists = true;
                      break;
                    }
                  }
                   if(!exists){//se il punto non era ancora stato aggiunto
                   /*  var ref2 = firebase.database().ref('/tag/'+tags.key);
                    ref2.once('value').then(function(snap){
                      console.log("Nome tag " + snap.child('nome').val())
                    }) */
                  pois.push({lat: snapshot.child('lat').val(), lon: snapshot.child('lon').val(), nome: snapshot.child('nome').val(), tag: tags/*.key*/})                           
                } 
              }
              })
              
            }
          });
        }).then(a=>{
        if (pois.length==0/*!found*/){
            self.displayGPSError("Ci dispiace, purtroppo non ci sono punti di interesse che rispecchiano le tue preferenze!"
            +" Prova con altre tipologie o aggiungi i tag che secondo te mancano.")
            //self.isEnabled = true;
          } else {    
            var layers = [];
            var tagsToUse = [];
            var isThere = false;
            var refTags = firebase.database().ref('/tag/');
            refTags.once('value', function(tags){
              pois.forEach(p=>{
                tags.forEach(function(t){
                  if(p.tag.key == t.key){//se trovo un tag corrispondente

                    //console.log("Index " + tagsToUse.indexOf(t.child('nome').val()))
                     if(tagsToUse.indexOf(t)<=-1){//se non l'ho già aggiunto
                      tagsToUse.push(t)
                      //console.log("Added "+ t.child('nome').val())
                    }  
                  }
                  return false;
                })

              })

            }).then(b=>{
             
              var layerControl = L.control.layers().addTo(self.map)
              
               tagsToUse.forEach(tg=>{
                var myLayer = L.layerGroup();
                  myLayer.id = tg.child('nome').val();
                  layers.push({
                    nomeLayer: tg.key/* tg.child('nome').val() */,
                    gruppo: myLayer
                  })
                 layerControl.addOverlay(myLayer, tg.child('nome').val())
              }) 

              pois.forEach(p=>{     
                let marker = L.marker([p.lat,p.lon])
              let content = `<b>Nome</b>: ${p.nome}<br/>`;
              marker.bindPopup(content) 
              layers.forEach(l=>{
                console.log("Nome layer " + l.nomeLayer + " tag poi " + p.tag.key)
                if(l.nomeLayer == p.tag.key){
                  l.gruppo.addLayer(marker)
                }
    
              })
              
              //marker.addTo(newMap)
             // marker.openPopup()
              })


            })
          }

        })
        
      });
      

  }
}

