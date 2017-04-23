import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {VideoService} from "../../providers/video-service";
import {NbService} from "../../providers/nb-service";

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
  providers: [VideoService, NbService]
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
    let nbService : NbService = navParams.get("nbService");

    //Get all the comments for the video
    this.videoService.getComments(videoID)
      .then(data => {

        //Had to make this stupid declaration since ionic won't compile - says length cannot be a property of {}
        let allComments = [];
        allComments = data['items'];

        //number of comments received
        let numComments = allComments.length;
        this.commentItems = [];

        //Going through all the comments..and classifying it
        for(let i=0; i<numComments; i++){

          //Get the single comment
          let singleComment = allComments[i].snippet.topLevelComment.snippet.textOriginal;

          //do some pre-processing
          singleComment = singleComment.substr(0, 140);
          singleComment = singleComment.toLowerCase();

          //Get the classification of the comment (int) and convert it to relevant string class value
          let classifierInt = nbService.classify(singleComment);
          let classifierStr : String;
          if(classifierInt==0){
            classifierStr = "Negative";
          }
          else if(classifierInt==1){
            classifierStr = "Neutral";
          }
          else if(classifierInt==2){
            classifierStr = "Positive";
          }

          //Adding the comment to the array
          this.commentItems.push({
            text : singleComment,
            classification: classifierStr
          });
        }

      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Comments');
  }

}
