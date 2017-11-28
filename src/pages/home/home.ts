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

declare var require: any
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: L.Map;
  center: L.PointTuple;
  public poiKeys:Array<any>;
  

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
