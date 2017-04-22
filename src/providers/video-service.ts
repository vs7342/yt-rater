import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {ConstantsService} from "./constants-service";

/*
  Generated class for the VideoService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class VideoService {

  data:any;

  constructor(public http: Http, private constantsService:ConstantsService) {
    console.log('Hello VideoService Provider');
  }

  searchVideo(searchText:String){

    return new Promise(resolve => {
      // We're using Angular HTTP provider to request the data,
      // then on the response, it'll map the JSON data to a parsed JS object.
      // Next, we process the data and resolve the promise with the new data.

      let YT_API_BASE_URL = this.constantsService.getYTApiBaseUrl();
      let YT_API_KEY = this.constantsService.getYTApiKey();

      let URL_PATH = YT_API_BASE_URL +
        "/search" + "?" +               //end point for search
        "part=snippet" + "&" +          //required parameter
        "q=" + searchText + "&" +       //search query text
        "type=video" + "&" +            //so that only videos are retrieved - needed since we are passing videoCategoryId as well
        "videoCategoryId=27" + "&" +    //videoCategoryId = 27 ==> Educational Videos
        "maxResults=50" + "&" +         //YouTube API only fetches 50 results per "/search" request
        "relevanceLanguage=en" + "&" +  //Only English videos will be retrieved
        "key=" + YT_API_KEY;            //Key to access the API

      //Making a get request for this URL
      this.http.get(URL_PATH)
        .map(res => res.json())
        .subscribe(data => {
          //this data is raw response
          //we are interested in it's 'items' array which is nothing but a list of video objects
          this.data = data.items;
          resolve(this.data);
        });
    });
  }

}