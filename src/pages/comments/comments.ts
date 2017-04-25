import { Component } from '@angular/core';
import {AlertController, IonicPage, ItemSliding, NavController, NavParams, ToastController} from 'ionic-angular';
import {VideoService} from "../../providers/video-service";
import {NbService} from "../../providers/nb-service";
import {FeedbackService} from "../../providers/feedback-service";

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
  providers: [VideoService, NbService, FeedbackService]
})
export class Comments {
  commentItems: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public videoService: VideoService,
    public feedbackService: FeedbackService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
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

  /**
   * Function which decides whether the feedback service be called with same class value or a different one
   * If different class value, then an alert box is displayed with those values
   * @param slidingList
   * @param comment
   * @param classification
   * @param feedbackChoice
   */
  reportFeedback(slidingList: ItemSliding, comment:String, classification:String, feedbackChoice:boolean){

    if(feedbackChoice){
      //Send the feedback with the same classification
      this.callFeedbackService(comment, classification);

    }else{
      //Show the confirmation alert with other 2 classification type

      //Create an array with the remaining two classifications
      let remainingClassifications = ['negative', 'neutral', 'positive'];
      let indexToRemove = remainingClassifications.indexOf(classification.toLowerCase());
      remainingClassifications.splice(indexToRemove , 1);

      //Show the alert confirmation
      //The 2 buttons will be equal to remaining class values
      let confirm = this.alertCtrl.create({
        title: 'Select the sentiment for this comment',
        message: comment.toString(),
        buttons: [
          {
            text: remainingClassifications[0].charAt(0).toUpperCase() + remainingClassifications[0].substr(1),
            handler: () => {
              this.callFeedbackService(comment, remainingClassifications[0]);
            }
          },
          {
            text: remainingClassifications[1].charAt(0).toUpperCase() + remainingClassifications[1].substr(1),
            handler: () => {
              this.callFeedbackService(comment, remainingClassifications[1]);
            }
          }
        ]
      });
      confirm.present();
    }
    //close the sliding list
    slidingList.close()
  }

  /**
   * Actually calling the report feedback service and displaying toast message based on response
   * @param comment
   * @param classification
   */
  callFeedbackService(comment:String, classification:String){
    this.feedbackService.reportFeedback(comment,classification)
      .then(data=>{
        if(data["status"]=="success"){
          this.displayToast("Feedback recorded successfully. Thanks!");
        }else{
          this.displayToast(data["message"]);
        }
      });
  }

  /**
   * Display the message passed as a toast
   * @param msg
   */
  displayToast(msg){
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Comments');
  }

}
