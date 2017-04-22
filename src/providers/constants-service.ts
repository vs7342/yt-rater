import { Injectable } from '@angular/core';

/*
  Generated class for the ConstantsService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ConstantsService {

  private YT_API_BASE_URL : String;
  private YT_API_KEY : String;

  constructor() {
    console.log('Hello ConstantsService Provider');
    this.YT_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
    this.YT_API_KEY = "AIzaSyCvKY7j5RYBoA4JvNoGWUvuwjZI5N5BC_E";
  }

  getYTApiBaseUrl() : String{
    return this.YT_API_BASE_URL;
  }

  getYTApiKey() : String{
    return this.YT_API_KEY;
  }

}
