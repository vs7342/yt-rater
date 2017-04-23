import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {VideoService} from "../../providers/video-service";

/**
 * Generated class for the Comments page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-comments',
  templateUrl: 'comments.html',
  providers: [VideoService]
})
export class Comments {
  commentItems: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public videoService: VideoService
  ) {
    //load all the comments based on the navigation parameter (videoId)
    let videoID = navParams.get("videoID");
    this.videoService.getComments(videoID)
      .then(data => {
        this.commentItems = data;
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Comments');
  }

}
