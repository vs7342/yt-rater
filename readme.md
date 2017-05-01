# YouTube Tutorial Rater #

----------

1. **Synopsis**: This ionic application is developed for predicting the type of comment as positive, negative and neutral for YouTube videos. Training data consists of comments which were fetched from 3 tutorial videos and thus this app outputs decent results for similar kind of videos. User can also provide feedback for a comment whether it was classified correctly or not. User can also test their own comments and provide feedback for that classification as well. Feedback functionality is important since it updates the training data set and might improve the classification accuracy over time.

2. **Tools used**: JetBrains Webstorm IDE was used for development purpose.<br/>

3. **Prerequisites**: Web Browser preferably **Google Chrome**.<br/>

4. **Installation and Execution**: Following are the steps for a PC. Steps might differ if someone wants to execute it on Mac.
	1. Install Node.js from [https://nodejs.org/en/](https://nodejs.org/en/ "https://nodejs.org/en/")
	2. Open **cmd** and enter the command `npm --version`. If a version number is displayed then node was installed correctly. *Now open **nodejs command prompt** and continue with rest of the steps in that window*.
	3. Install ionic and cordova by executing `npm install -g ionic cordova` in **node js cmd**. This step might take a while.
	3. Extract the contents of `yt-rater.zip` in a seperate folder and cd into that folder in **node js cmd**.
	4. Install npm dependencies in the project by running the command `npm install` in **node js cmd**.
	5. Finally, app can be deployed in a browser by running the command `ionic serve --lab --browser "chrome"` in **node js cmd**.</br></br>

5. **Code Details**: Most of the code resides in `src/pages` and `src/providers` directory. There are 2 main pages/screens in the app. First is the home page in which user can search for videos and the second in which comments with their predicted classification are populated for the selected video. Providers are similar to global utility functions which can be used across the app.</br>
	
	1. `src/pages/home/home.html` - The template for home screen.
	2. `src/pages/home/home.ts` - TypeScript code for home screen - handles the working of components on home screen.
	3. `src/pages/home/home.scss` - SASS for home screen.</br></br>
	4. `src/pages/comments/comments.html` - The template for comments screen.
	5. `src/pages/comments/comments.ts` - TypeScript code for comments screen - handles the working of components on comments screen.
	6. `src/pages/comments/comments.scss` - SASS for comments screen.</br></br>
	7. `src/providers/constants-service.ts` - Consists of constants which is used across the project.
	8. `src/providers/video-service.ts` - Consists of `searchVideos()` and `getComments()` methods to search a video based on search text and fetch comments for a particular video.
	9. `src/providers/nb-service.ts` - Consists of following two methods
		- `loadTrainingData()` to fetch the training data from csv file and prepare the Naive Bayes model. This is called from home page constructor thus preparing the model only once when the app is started.
		- `classify()` to classify a particular comment
	10. `src/providers/feedback-service.ts` - Consists of a `reportFeedback()` to report the feedback - basically makes a post call to the php file which in turn updates the training data csv file. </br></br>
       
6. **Usability**: 
	1. **Home Screen** - When the app is first loaded, user can search for videos on the home page. A list of videos would be displayed based on the search text. A video can then be selected and user will be redirected to comments page. There is a little info icon on top left of the screen which displays the accuracy of the classifier.
	2. **Comments Screen** - This screen consists of multiple functionality:
		- Consists of all the comments related to the selected video and its predicted classification. 
		- An overall comments classification related details along with the link to that video which opens the YouTube app if someone runs it in mobile.
		- When a comment swiped to the left, the user is asked whether the app was classified correctly. The feedback is then recorded in the training data set.
		- When clicked on the top left 'Text' icon, user is prompted with a text box using which user's own comment can be classified. Feedback functionality for this custom comment also exists.</br></br>

7. **Installing on mobile**: To access this application over iOS or Android device, Kindly install [Ionic View](http://view.ionic.io/) from the app store. After signing up/logging in, click on 'Preview App' and enter `b137c6dd` as the app ID and the user can start using *YouTube Tutorial Rater*. 