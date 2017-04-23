import { Component } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';
import { VideoService } from "../../providers/video-service";
import {Comments} from "../comments/comments";
import {NbService} from "../../providers/nb-service";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [VideoService, NbService]
})
export class HomePage {

  public videoItems : any;

  constructor(
    public navCtrl: NavController,
    public videoService: VideoService,
    public alertController: AlertController,
    public nbService:NbService
  )
  {
    //Loading training data and initializing the nb classifier when the app firsts load (Actually when home page is loaded for the first time)
    nbService.loadTrainingData();
  }

  /**
   * Load the videos based on the search text
   * @param videoSearchText
   */
  loadVideos(videoSearchText:String){
    //load videos only if user has entered some text
    //else display an alert message
    if(videoSearchText.length>0){
      this.videoService.searchVideo(videoSearchText)
        .then(data => {
          this.videoItems = data;
        });
    } else{
      this.noTextAlert();
      this.videoItems = null;
    }
  }

  /**
   * Creates and presents the 'No Search Text' warning to the user
   */
  noTextAlert(){
    let alert = this.alertController.create({
      title: 'Warning',
      subTitle: 'Kindly enter some search text',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  //Navigating to comments page
  //Pass the videoId as a parameter so that relevant comments can be loaded
  //Pass the same instance of NbService to comments page so that comments can be classified
  goToComments(videoID:String){
    this.navCtrl.push(Comments, {
      videoID:videoID,
      nbService: this.nbService
    })
  }

  /**
   * An alert box to display classifier info
   */
  displayInfo(){
    let alert = this.alertController.create({
      title: 'App Info',
      subTitle:
        "Classifier Used: <br/> Naive Bayes Multinomial"+
        "<br/><br/>"+
        "Classifier Accuracy: <br/>"+
        this.nbService.accuracy.toString(),
      buttons: ['Dismiss']
    });
    alert.present();
  }
}
