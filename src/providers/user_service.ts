import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Http,Response} from '@angular/http';
import * as firebase from 'firebase/app';

@Injectable()
export class UserService {

public sortedArray: {};
currentUserPosition:Number;

  //Per la Classifica (rank.ts)
 // public items: Array<any> = [];
  public map = {};
  public items: Array <{username: string,total_points: Number}>;
  public itemRef: firebase.database.Reference = firebase.database().ref('/users/');
  
    constructor(private http: Http) {

    }

getUsers(){

  // let items: Array <{username: string,total_points: Number}>;
  
  var self = this;
   this.itemRef.on('value',itemSnapshot =>{ // you need to define your item Ref as a global variable in this service
    itemSnapshot.forEach( itemSnap => {
      console.log("Username: " + itemSnap.val().username + " punti: " + itemSnap.val().total_points)
      self.map[itemSnap.val().username] = itemSnap.val().total_points;
      //self.items.push(itemSnap.val().username, itemSnap.val().total_points);
      //this.items = self.items; 
      return false;

    });
     this.sortUsers(this.map);
  });
}

sortUsers(users) {
  var array = [];
  for (var key in this.map) {
    array.push({
      username: key,
      total_points: this.map[key]
    });
  }
  
  this.sortedArray = array.sort(function(a, b) {
    return (a.total_points > b.total_points) ? 1 : ((b.total_points > a.total_points) ? -1 : 0)
  });
   /*  this.sortedArray = users.sort(function(a, b) {
      
       return b.total_points - a.total_points // descending
       //return a.total_points - b.total_points // accending
    }); */
    /*this.sortedArray.forEach(e=>{
      console.log(" " + e.username + "   " + e.total_points)

    })*/
    
}

getUserPosition(user){ 
  var j = 0;
  for (var i in this.sortedArray){
    j++;
    console.log("Nome: " +i)
    if(i == user.displayName){
      console.log("found name")
    }
  }
  return j;
 //return this.currentUserPosition = this.sortedArray.map(function (x) { return x.username}).indexOf(user.displayName);
}

}