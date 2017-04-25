import { Injectable } from '@angular/core';
import { Http,Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import {ConstantsService} from "./constants-service";

/*
  Generated class for the FeedbackService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FeedbackService {

  NB_FEEDBACK_URL : String;

  constructor(public http: Http, public constantsService: ConstantsService) {
    console.log('Hello FeedbackService Provider');
    this.NB_FEEDBACK_URL = constantsService.getNbFeedbackUrl();
  }

  /**
   * Returns a promise based on the http post request
   * This is the service which will add an additional row in the training data csv file
   * @param comment
   * @param classification
   * @returns {Promise<Response>}
   */
  reportFeedback(comment, classification){

    //Adding request headers
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    //Creating the request body
    let bodyStr = "comment=" + encodeURI(comment) + "&" + "classification=" + classification;

    //Create and return a promise which will eventually resolve to the response
    return new Promise(resolve=>{
      this.http.post(this.NB_FEEDBACK_URL.toString(), bodyStr, {headers: headers})
        .map(res => res.json())
        .subscribe(data=>{
          resolve(data);
        });
    })
  }

}
