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
import { File, FileReader } from '@ionic-native/file';
import * as GraphHopper from 'graphhopper-js-api-client';
import { CHECKBOX_REQUIRED_VALIDATOR } from '@angular/forms/src/directives/validators';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, CameraPosition,MarkerOptions, Marker } from '@ionic-native/google-maps';
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
  

  @ViewChild('map-container') mapContainer;

  constructor(public navCtrl: NavController, public menuCtrl:MenuController,public geolocation:Geolocation,
  public toastCtrl:ToastController, public diagnostic:Diagnostic, public platform:Platform, public alertCtrl:AlertController,
  public file:File) {
    this.menuCtrl.enable(true)

    
    //Possibili template aggiunte a DB. NON CANCELLARE 


     /* PRIMO TEMPLATE - AGGIUNTA SEMPLICE
     In ordine, quello che si fa è :
     1) prendere il riferimento al nodo del DB su cui intendiamo lavorare
     2) generare la chiave (o le chiavi) per i dati da aggiungere. In questo caso, dovendo aggiungere due
     nuove città, genero le chiavi, che mi serviranno per creare i miei nuovi sottoalberi
     3) creo il vettore degli updates che pusherò al DB
     4) creo i dati che vorrò pushare. In questo caso, le città hanno come campi solo "nome" e "pois"; quest'
     ultimo verrà creato e aggiornato ogni volta che aggiungeremo punti di interesse (vedi sotto)
     5) per aggiungere la nuova città, nel vettore updates la sintassi si riferisce a:
        nodo di interesse (cities) + chiave da aggiungere = dati specificati
    6) pusho al DB. L'output è quello che si vede nel nodo "cities"!

     
    1) var ref = firebase.database().ref('/cities/');
    2)var key = firebase.database().ref().child('cities').push().key;
    var key2 = firebase.database().ref().child('cities').push().key;
    3)var updates = {};
    4) var data = {
      name: "Cesena"
    }
    var data2 = {
      name: "Bologna"

    }
    5)updates['/cities/'+key] = data;
    updates['/cities/'+key2 ] = data2;
    6)firebase.database().ref().update(updates);*/
    
    
    /*
    SECONDO TEMPLATE - AGGIUNTA SU DUE (o più) NODI
     In ordine, quello che si fa è :
     1) prendere il riferimento al nodo del DB su cui intendiamo lavorare
     2) generare la chiave (o le chiavi) per i dati da aggiungere. In questo caso stiamo aggiungendo un nuovo
     punto di interesse, quindi genererò una sola chiave. E' ovvio che se ne devo inserire 10, ne genererò
     altrettante. Questo processo va AUTOMATIZZATO, al momento sto cercando un modo per farlo costruendo
     la var "data" automaticamente prendendo le info dal file json.
     3) creo il vettore degli updates che pusherò al DB
     4) creo i dati che vorrò pushare. In questo caso la struttura è più ricca di campi, ma il senso è sempre
     lo stesso. La storia del voler automatizzare la raccolta di info è riferita al fatto che al momento 
     OpenStreetMap mi dà quelle + altre informazioni, e voglio cercare il modo per estrapolare quelle utili
     senza dover copia-incollare i dati a mano sul file JSON che si importa nel DB.... ANche perché con 20 
     punti di interesse la storia è lunga.
     5) la sintassi è uguale a quella precedente, ma qui si aggiungono due cose diverse: ,
     5a) aggiungo semplicemente i miei dati del punto di interesse al nodo corrispondente, con la chiave
     univoca generata al punto (2);
     5b) aggiungo al nodo CITIES in corrispondenza della chiave di CESENA nel suo sottoalbero POIS la chiave
     del mio punto di interesse che sto aggiungendo e gli setto il valore a TRUE (per dire che lo ha!).
     L'albero visivamente sarebbe
      - Cities
        - Cesena
          - pois
            - key punto di interesse
    6) pusho al DB. L'output è quello che si vede nel nodo "point_of_interest" e dentro "cities" 
    alla voce "poi"!
    
    
    1) var ref = firebase.database().ref('/point_of_interest/');
    2) var key = firebase.database().ref().child('point_of_interest').push().key;
    3)var updates = {}
    4)var data = {
      "description" : "",
      "informations" : "",
      "name" : "Biblioteca Malatestiana",
	    "city": "Cesena",
	    "lat": 44.1388386,
      "lon": 12.2437070,
	    "amenity": "library",
	    "tourism": "attraction"
    }
    5a)updates['/point_of_interest/'+key] = data;
    5b)updates['/cities/-KzZFy1JPWnrwTzRyS9R/pois/' + key] = "true";
    6)firebase.database().ref().update(updates);*/

  

  }

  
  

  ionViewDidLoad() {
    //set map center
    this.center = [44.13832, 12.2447 ]; 
    
    
    //setup leaflet map
        this.initMap();
        this.withGoogle();
    
      }

  ionViewCanLeave(){
    document.getElementById("map").outerHTML = "";
  }

  initMap() {

     this.map = L.map('map', {
      center: this.center,
      zoom: 16 
    });
    L.marker(this.center).addTo(this.map)
    this.map.panTo(this.center)
    
    //Add OSM Layer
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?access_token={accessToken}",{
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      accessToken:'pk.eyJ1IjoibWFyeWNvb3BlciIsImEiOiJjajY2bjhqMXUxYjN5MnFuenJtbWQxem8xIn0.JpH5RDkg_yOjcLrwsFA6zA'
    })
      .addTo(this.map);   


      
      if(this.platform.is('core')){
       this.getFeatures()
        //this.geolocate()
      } else {
        this.diagnostic.isLocationEnabled().then((state)=>{
          if(state){
            //this.geolocate();
            this.getFeatures();
          } else{
            this.presentConfirm();      
          }
        })

      }
      
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
      positionMarker = L.marker(latlng).addTo(this.map);
      positionMarker.bindPopup("Tu sei qui");
      this.map.setView(latlng,16)
      this.map.panTo(latlng)
      this.getFeatures()
      var self = this;
      var x = new HomePage(this.navCtrl, this.menuCtrl,this.geolocation,
        this.toastCtrl,this.diagnostic, this.platform, this.alertCtrl,
        this.file);
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
          
        }, error => {
          this.displayGPSError("Non è stato possibile ottenere la tua posizione. Attiva il GPS o ricarica la pagina.")
        })         
      }
      
    }).catch((err) =>{
      this.displayGPSError("Non è stato possibile ottenere la tua posizione. Attiva il GPS o ricarica la pagina.")
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

  findPoiByTag(tag){

    var self = new HomePage(this.navCtrl,this.menuCtrl,this.geolocation,
      this.toastCtrl, this.diagnostic, this.platform, this.alertCtrl,
      this.file)
      var found = false;
    var ref = firebase.database().ref('/cities/-KzZFy1JPWnrwTzRyS9R/pois') //punti di interesse di Cesena
    var ref1 = firebase.database().ref('/point_of_interest');
    ref.once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot){
        ref1.once('value',function(snapshot1){
          snapshot1.forEach(function(childSnapshot1){
            //if(childSnapshot1.child("tipologia").val() == tag){//se è taggato come sto cercando
            if(tag.indexOf(childSnapshot1.child("tipologia").val()) > -1){ //controllo per il vettore
              found = true;
              if (childSnapshot.key == childSnapshot1.key){
                console.log("Punto taggato " + childSnapshot1.child("tipologia").val() + " è " + childSnapshot1.key)
              }

            } 
            return false;
          })
        })

        return false;
      })

    })

      if (!found){
        self.displayGPSError("Ci dispiace, purtroppo non ci sono punti di interesse che rispecchiano le tue preferenze!"
        +" Prova con altre tipologie o aggiungi i tag che secondo te mancano.")
      }
      
    
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


  withGoogle(){

  

    var first = new google.maps.LatLng(44.1359114,12.2454082);
    var second = new google.maps.LatLng(44.1371501,12.24147);
    var third = new google.maps.LatLng(44.136342,12.2429801);
    

    

    var data1 = {
      location: first,
      stopover: true
    }

    var data2 = {
      location: second,
      stopover: true
    }

    var data3 = {
      location:third,
      stopover:true
    }


    var polyUtil = require('polyline-encoded')
    var latlngs;
  // should print '_p~iF~cn~U_ulLn{vA_mqNvxq`@'
  //console.log("Encoded " +polyUtil.encode(latlngs));
  var newMap = this.map;
    var waypoints= [data1,data2,data3]
    var encoded;
    this.directionsService.route({
      origin: new google.maps.LatLng(44.1388386,12.243707),
      destination: new google.maps.LatLng(44.1374648,12.2480796),
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.WALKING,
      region: "it"
    }, (response, status) => {
      if (status === 'OK') {

       // console.log("" + JSON.stringify(response))
        
        encoded = response.routes[0].overview_polyline; 

        //console.log("Istruzioni " + response.routes[0].legs[0].steps[0].html_instructions)
        latlngs = polyUtil.decode(encoded)

        var firstpolyline = new L.Polyline(latlngs, {
          color: 'red',
          weight: 3,
          opacity: 0.5,
          smoothFactor: 1
      });
      firstpolyline.addTo(newMap);

     // console.log("Ordine " +response.routes[0].waypoint_order)
     var myRoute= response.routes[0].legs[0]
     console.log("Prova mia" + JSON.stringify(myRoute.steps[0]))
     console.log("Lunghezza: " + myRoute.steps.length)
     for(var i=0; i<myRoute.steps.length; i++){ 
       console.dir("I " + myRoute.steps[i].instructions)
     }
      var myArray = []
      myArray.push([44.1359114,12.2454082,"Museo"])
      myArray.push([44.1371501,12.24147,"Cattedrale"])
      myArray.push([44.136342,12.2429801,"Ericacca"])

      var newArray =[]

      response.routes[0].waypoint_order.forEach(o=>{
        newArray.push(myArray[o])
      })
      let index = 1;
      myArray.forEach(p =>{
        let marker = L.marker([p[0],p[1]])
        let content = `<b>Nome</b>: ${p[2]}<br/>`+"Posizione " + index;
          marker.bindPopup(content) 
          marker.addTo(newMap)
         marker.openPopup() 
         index++;

      })
     

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
        window.alert('Directions request failed due to ');
      }
    })

    


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

  saveTags(){
   /*  var ref = firebase.database().ref('/tag/');
    
    var tags = ["bunker",	"Bunker",
      "chapel",	"Cappella",
      "cathedral",	"Cattedrale",
      "church",	"Chiesa",
      "mosque",	"Moschea",
      "shrine",	"Santuario",
      "synagogue",	"Sinagoga",
      "paleontological_site",	"Sito paleontologico",
      "university",	"Università",
      "attraction",	"Attrazione",
      "gallery",	"Galleria d'arte",
      "museum", "Museo",
      "artwork",	"Scultura pubblica",
      "ditch",	"Fossato",
      "city_wall",	"Mura", 
      "campanile",	"Campanile",
      "cross",	"Croce",
      "obelisk",	"Obelisco",
      "water_well", 	"Pozzo",
      "nature_reserve",	"Riserva naturale",
      "square",	"Piazza"];
      for (var i=0;i<tags.length; i+=2){
        var updates = {};
        var data = {};        
        var key = firebase.database().ref().child('tag').push().key;
        data["OSM"] = tags[i]
        data["nome"] = tags[i+1]
        updates['/tag/'+key] = data;
        firebase.database().ref().update(updates);
      } */ 
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
            console.log('ID: ' + e.id)
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
          console.log('Latitudine: ' + lat + ' Longitudine: ' + lon)
      
      });
  
    }).catch(error => {
      console.log(''+ error)
    });  
    //this.graphHopper();
    var tags = ["prova"]
    this.findPoiByTag(tags)

  }

}
