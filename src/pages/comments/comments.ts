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
  //array of comment objects
  commentItems: any;

  //video details - these will be retrieved as navigation params from previous page
  videoTitle: any;
  videoURL: any;
  videoThumbnail: any;

  //classification related details displayed on the page
  negativePercent: number;
  neutralPercent: number;
  positivePercent: number;
  totalComments:number;

  //NBService needed to classify a comment
  nbService: NbService;

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
    this.nbService = navParams.get("nbService");

    //getting Video details from navigation parameters
    this.videoURL = "https://www.youtube.com/watch?v=" + videoID;
    this.videoTitle = navParams.get("videoTitle");
    this.videoThumbnail = navParams.get("videoThumbnail");

    //initializing classification overview parameters
    this.negativePercent = 0;
    this.neutralPercent = 0;
    this.positivePercent = 0;
    this.totalComments = 0;

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
          //Incrementing classifier related counter as well - needed to display an overview of classification of comments
          let classifierInt = this.nbService.classify(singleComment);
          let classifierStr : String;
          if(classifierInt==0){
            classifierStr = "Negative";
            this.negativePercent++;
          }
          else if(classifierInt==1){
            classifierStr = "Neutral";
            this.neutralPercent++;
          }
          else if(classifierInt==2){
            classifierStr = "Positive";
            this.positivePercent++;
          }

          //Adding the comment to the array
          this.commentItems.push({
            text : singleComment,
            classification: classifierStr
          });
        }

        //Calculating overall details/sentiments for the video comments
        this.totalComments = this.negativePercent + this.positivePercent + this.neutralPercent;
        this.negativePercent = Number((this.negativePercent * 100 / this.totalComments).toFixed(2));
        this.positivePercent = Number((this.positivePercent * 100 / this.totalComments).toFixed(2));
        this.neutralPercent = Number((this.neutralPercent * 100 / this.totalComments).toFixed(2));
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
    //Report message is used by classifyCustomComment which does not have any slidingList - thus adding a check
    if(slidingList){
      slidingList.close()
    }
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

  /**
   * Prompts the user to enter a comment/text which needs to be classified
   * Calls classifyCustomComment when a comment is entered
   */
  promptForComment(){
    let prompt = this.alertCtrl.create({
      title: 'Classify Comment',
      message: "Kindly enter the text you want to classify",
      inputs: [
        {
          name: 'comment',
          placeholder: 'Comment'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Classify',
          handler: data => {
            this.classifyCustomComment(data.comment);
          }
        }
      ]
    });
    prompt.present();
  }

  /**
   * Classifies the custom comment based on user's input
   * Also takes necessary actions to report feedback for the comment classification
   * @param comment
   */
  classifyCustomComment(comment){
    //Get the classification of the comment (int) and convert it to relevant string class value
    let classifierInt = this.nbService.classify(comment);
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

    //Confirm with the user whether it is classified correctly or not
    //Take necessary actions
    let confirm = this.alertCtrl.create({
      title: 'Comment = '+ classifierStr,
      message: 'Do you feel that your comment was classified correctly?',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
            //Report feedback with type = false (not classified correctly)
            this.reportFeedback(null, comment, classifierStr, false);
          }
        },
        {
          text: 'Agree',
          handler: () => {
            //Report feedback with type = true (classified correctly)
            this.reportFeedback(null, comment, classifierStr, true);
          }
        }
      ]
    });
    confirm.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Comments');
  }

}
