import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,Slides } from 'ionic-angular';
import { HomePage } from "../home/home";
/**
 * Generated class for the TutorialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


export interface Slide {
  title: string;
  description: string;
  image: string;
}
 
@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html',
})

export class TutorialPage {


  @ViewChild(Slides) slides: Slides;
  slidess: Slide[];
  showSkip = true;
  second =false;
  

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.second = false;
     this.slidess = [
      {
        title: "Benvenuto su CesenaEsplora!",
        description: "CesenaEsplora ti permette di organizzare il tuo viaggio culturale in giro per la città",
        image: '',
        
      },
      {
        title: "Organizza il tuo viaggio",
        description: "Scegli i tag che ti interessano e inizia ad esplorare",
        image: '', 
      },
      {
        title: "Contribuisci alla conoscenza",
        description: "Aggiungi foto e aneddoti dei luoghi visitati, ottieni punti e scala la classifica",
        image: '',
      }
    ]; 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TutorialPage');
  }

  startApp() {
    this.navCtrl.setRoot(HomePage, {}, {
      animate: true,
      direction: 'forward'
    });
  }

  slideChanged(){
    let currentIndex = this.slides.getActiveIndex();
    if (currentIndex == 1){
        this.second = true;
    } else {
      this.second = false;
    }
  }
  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd;
  }

}
