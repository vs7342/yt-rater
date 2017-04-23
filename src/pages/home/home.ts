import { Component } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';
import { VideoService } from "../../providers/video-service";
import {Comments} from "../comments/comments";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [VideoService]
})
export class HomePage {

  public videoItems : any;

  constructor(
    public navCtrl: NavController,
    public videoService: VideoService,
    public alertController: AlertController)
  {

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

  goToComments(videoID:String){
    this.navCtrl.push(Comments, {
      videoID:videoID
    })
  }

}
