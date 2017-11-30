import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';

/**
 * Generated class for the EditPreferencesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-preferences',
  templateUrl: 'edit-preferences.html',
})
export class EditPreferencesPage {
  public tags: Array<any>

  number_of_preferences;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    let tagName = []
    var ref = firebase.database().ref('/tag/')
    ref.orderByChild("nome").once('value',function(snapshot){ //ciclo sui tag
      snapshot.forEach(function(childSnapshot){
        tagName.push(childSnapshot.child("nome").val())
        return false;
      })

    }).then(v => {
      this.tags = tagName;

      var j = 0;
      this.tags.forEach(i=>{
        j++;
        
          this.number_of_preferences = j;
        
      })

    })
  }

  ionViewDidLoad() {
  }

}
