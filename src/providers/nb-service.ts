import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {ConstantsService} from "./constants-service";

//Variable which would be used as a result of external js library imported in index.html file
//This is basically for jQuery parser
declare let $ : any;

/*
  Generated class for the NbService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class NbService {

  NB_TRAINING_DATA_CSV_URL : String;
  public accuracy: number;

  constructor(public http: Http, private constantsService: ConstantsService) {
    console.log('Hello NbService Provider');
    this.NB_TRAINING_DATA_CSV_URL = constantsService.getNbTrainingDataCsvUrl();
  }

  loadTrainingData(){
    this.http.get(this.NB_TRAINING_DATA_CSV_URL.toString())
      .subscribe(data => {
        //We now have a response
        //convert the response into array of array (like in csv)
        let trainDataArray = $.csv.toArrays(data.text());

        //remove the first row with headers
        trainDataArray.shift();

        let trainDocs = [];
        let trainLabels = [];

        for (let i = 0; i < trainDataArray.length; i++) {
          //We are mainly interested in 2nd and 3rd column of our data
          //Extract that data and insert into our training data variables
          trainDocs.push(trainDataArray[i][1]);

          let label = trainDataArray[i][2].toLowerCase();
          if(label == "positive")
            trainLabels.push(2);
          else if(label == "neutral")
            trainLabels.push(1);
          else if(label == "negative")
            trainLabels.push(0);
        }

        //Calculating and setting classifier accuracy
        this.setClassificationAccuracy(trainDocs, trainLabels);

        //Training data is now ready - pass to performNB function
        this.createNBClassifier(trainDocs, trainLabels, 3);
      });
  }

  //GLOBAL VARIABLES - for Multinomial NB
  trainingDocs : any;
  trainingClasses : any;
  numClasses : any;
  classDocCounts : any;
  classStrings : any;
  classTokenCounts : any;
  condProb : any;
  vocabulary : any;

  /**
   * Creates the Multinomial Naive Bayes classifier
   * Most of the code in this function is similar to the java code shown in class
   * @param docs Training Documents
   * @param classes class labels of those Training documents
   * @param numC number of classes
   */
  createNBClassifier(docs, classes, numC){

    this.trainingDocs = docs;
    this.trainingClasses = classes;
    this.numClasses = numC;

    this.classDocCounts = new Array(this.numClasses);
    this.classDocCounts.fill(0);
    this.classStrings = new Array(this.numClasses);
    this.classTokenCounts = new Array(this.numClasses);
    this.classTokenCounts.fill(0);

    this.condProb = new Array(this.numClasses); //Array of HashMaps
    this.vocabulary = []; //HashSet

    for (let i = 0; i < this.numClasses; i++) {
      this.classStrings[i] = "";
      this.condProb[i] = {};
    }

    for (let i = 0; i < this.trainingClasses.length; i++) {
      this.classDocCounts[this.trainingClasses[i]]++;
      this.classStrings[this.trainingClasses[i]] += (this.trainingDocs[i] + " ");
    }

    for (let i = 0; i < this.numClasses; i++) {
      let tokens = this.classStrings[i].split(/\W/)
        .filter(Boolean) //Boolean is used since empty string "" was also being considered as a token
        .filter(this.numberCheck); //only non-number values will be preserved
      this.classTokenCounts[i] = tokens.length;
      for (let j = 0; j < tokens.length; j++) {
        let token = tokens[j];
        token = token.toLowerCase();
        this.addToHashSet(this.vocabulary, token);
        if(token in this.condProb[i]){
          let count = this.condProb[i][token];
          this.condProb[i][token] = count + 1;
        }else{
          this.condProb[i][token] = 1.0;
        }
      }
    }

    for (let i = 0; i < this.numClasses; i++) {
      let vSize = this.vocabulary.length;
      for (let token in this.condProb[i]) {
        if (this.condProb[i].hasOwnProperty(token)) {
          let count = this.condProb[i][token];
          this.condProb[i][token] = (count + 1) / (this.classTokenCounts[i] + vSize);
        }
      }
    }
  }

  /**
   * Classifies the given document as one of the classes
   * @param doc
   * @returns {number}
   */
  classify(doc){
    let label = 0;
    let vSize = this.vocabulary.length;

    let score = new Array(this.numClasses);
    score.fill(0.0);

    for (let i = 0; i < score.length; i++) {
      score[i] = Math.log(this.classDocCounts[i] * 1.0 / this.trainingDocs.length);
    }

    let tokens = doc.split(" ");
    for (let i = 0; i < this.numClasses; i++) {
      for (let j = 0; j < tokens.length; j++) {
        let token = tokens[j];
        token = token.toLowerCase();
        if(token in this.condProb[i])
          score[i] += Math.log(this.condProb[i][token]);
        else
          score[i] += Math.log(1.0 / (this.classTokenCounts[i] + vSize));
      }
    }

    let maxScore = score[0];
    for (let i = 0; i < score.length; i++) {
      if(score[i] > maxScore){
        label = i;
        maxScore = score[i];
      }
    }

    return label;
  }

  /**
   * Function to add the element to an array which behaves like a HashSet
   * @param {*} hashSet
   * @param {*} element
   */
  addToHashSet(hashSet, element){
    //Adding element to array only if that element is not previously present
    //THIS IS HOW HASHSET WORKS
    if(!hashSet.includes(element)){
      hashSet.push(element);
    }
  }

  /**
   * Function to help filter out the tokens which are numbers
   * @param token
   * @returns {boolean}
   */
  numberCheck(token){
    return isNaN(token);
  }

  /**
   * Sets the 'accuracy' attribute of the class based on the accuracy calculated
   * @param allDocs
   * @param allLabels
   */
  setClassificationAccuracy(allDocs, allLabels){
    //First split the entire data set into training/test
    //70% = Training, 30% = Test
    let testDataStartIndex = Math.ceil(allDocs.length * 0.7);

    //Extract (splice) 70% of data from allDocs and assign it to trainDocs
    //Remaining (allDocs) is nothing but the remaining data which can be used as test set
    let trainDocs = allDocs.splice(0, testDataStartIndex);
    let trainLabels = allLabels.splice(0, testDataStartIndex);
    let testDocs = allDocs;
    let testLabels = allLabels;

    //Create NB with this training set (i.e.70% of entire data)
    this.createNBClassifier(trainDocs,trainLabels,3);

    //Variables needed for calculating accuracy
    let correctlyClassified = 0;
    let incorrectlyClassified = 0;

    //Now start classifying the data in test set
    let testDocLen = testDocs.length;
    for(let i = 0; i < testDocLen; i++){
      //classify the document - An integer will be received
      let classifierInt = this.classify(testDocs[i]);

      //we now compare this with class label for that doc
      if(classifierInt==testLabels[i]){
        correctlyClassified++;
      }else{
        incorrectlyClassified++;
      }
    }

    //We now calculate the accuracy and set the relevant attribute
    this.accuracy = (correctlyClassified) * 100.0 / (incorrectlyClassified + correctlyClassified);
    console.log(this.accuracy);
  }
}
