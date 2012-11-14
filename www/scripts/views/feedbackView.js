/**	THIS COMMENT MUST NOT BE REMOVED



Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file 
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0  or see LICENSE.txt

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.	

*/


/** @author Isabella Nake
 * @author Evangelia Mitsopoulou
 */

/*jslint vars: true, sloppy: true */

var MOBLERDEBUG = 0;

// View for displaying the feedback


function FeedbackView(controller) {
	var self = this;
	 self.controller = controller;

	self.tagID = 'cardFeedbackView';

	jester($('#FeedbackDoneButon')[0]).tap(function() {
		self.clickFeedbackDoneButton();
	});
	jester($('#FeedbackMore')[0]).tap(function() {
		self.clickFeedbackMore();
	});
	jester($('#CourseList_FromFeedback')[0]).tap(function() {
		controller.models["answers"].answerList = [];
		controller.models["answers"].answerScore = -1;
		self.clickCourseListButton();
	});
	
	//Handler when taping on the title of the feedbackView area of the answer view
	jester($('#cardFeedbackTitle')[0]).tap(function() {
		self.clickTitleArea();
		moblerlog("feedback title clicked");
	});
	
	
	 // center the feedback body to the middle of the screen
    function setOrientation() {
        $(".cardBody").css('height', window.innerHeight - 70);
        $(".cardBody").css('width', window.innerWidth - 100);
        if (self.widget) {
        	self.widget.setCorrectAnswerTickHeight();
        }
        
    }
    setOrientation();
    //when orientation changes, set the new width and height
    //resize event should be caught, too, because not all devices
    //send an orientation change even
    window.addEventListener("orientationchange", setOrientation, false);
    window.addEventListener("resize", setOrientation, false);
    
    
    
//
    $(document).bind("loadstatisticsfromserver", function() {
    	if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedIn"))
    	{
    		moblerlog("enters load statistics from server is done in feedback view 1");
    		self.showFeedbackBody();
    	}

    });
    $(document).bind("allstatisticcalculationsdone", function() { 
    	moblerlog("enters in calculations done in question view1 ");
    	if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedIn"))
    	{
    		moblerlog("enters in calculations done in feedback view 2 ");
    		self.showFeedbackBody();
    	}
    });

}


// tap does nothing

FeedbackView.prototype.handleTap = doNothing;


//swipe leads to new question

FeedbackView.prototype.handleSwipe = function handleSwipe() {
	$("#feedbackBody").show();
	$("#feedbackTip").hide();
	controller.models['questionpool'].nextQuestion();
	controller.transitionToQuestion();
};


// pinch leads to course list

FeedbackView.prototype.handlePinch = function() {
	controller.transitionToCourses();
};

 //closes the view
FeedbackView.prototype.closeDiv = closeView;


//deletes data from answer model
 
FeedbackView.prototype.close = function() {
	
	this.closeDiv();

};


//opens the view

FeedbackView.prototype.openDiv = openView;

// hows feedback title and body

FeedbackView.prototype.open = function() {
	// if (coming from answer view){
	//self.widget.calculateAnswerScore();
	if (controller.models["answers"].answerScore == -1){
		controller.models["answers"].calculateScore();
		this.showFeedbackBody();
		this.showFeedbackTitle();	
		}
    //}
	this.openDiv();
	this.widget.setCorrectAnswerTickHeight();
};

//click on feedback done button leads to new question

FeedbackView.prototype.clickFeedbackDoneButton = function() {
	controller.models["answers"].deleteData();
	$("#feedbackTip").empty();
	$("#feedbackTip").hide();
	$("#feedbackBody").show();
	controller.models['questionpool'].nextQuestion();
	controller.transitionToQuestion();

};

//click on feedback more button toggles the feedback body and the tip

FeedbackView.prototype.clickFeedbackMore = function() {
	$("#feedbackBody").toggle();
	$("#feedbackTip").toggle();
};


// click on the course list button leads to course list

FeedbackView.prototype.clickCourseListButton = function() {
	controller.transitionToCourses();
};


 //shows feedback title and corresponding icon
 
FeedbackView.prototype.showFeedbackTitle = function() {
	var currentFeedbackTitle = controller.models["answers"].getAnswerResults();
	
	$("#cardFeedbackTitle").text(jQuery.i18n.prop('msg_' +currentFeedbackTitle + 'Results_title'));

	$("#feedbackIcon").attr('class',jQuery.i18n.prop('msg_' + currentFeedbackTitle + '_icon'));
	
	
};


//calls the appropriate widget to show the feedback body

FeedbackView.prototype.showFeedbackBody = function() {
	
	var questionpoolModel = controller.models['questionpool'];
	var questionType = questionpoolModel.getQuestionType();
	var interactive = false;
	switch (questionType) {
		case 'assSingleChoice':
			this.widget = new SingleChoiceWidget(interactive);
			break;
		case 'assMultipleChoice':
			this.widget = new MultipleChoiceWidget(interactive);
			break;
		case 'assNumeric':
			this.widget = new NumericQuestionWidget(interactive);
			break;
		case 'assOrderingHorizontal':
			this.widget = new HorizontalTextSortWidget(interactive);
			break;
		case 'assOrderingQuestion':
			this.widget = new TextSortWidget(interactive);
			break;
		default:
			break;
	}

};


//Transition back to question view when click on the title area
FeedbackView.prototype.clickTitleArea = function() {

	controller.transitionToQuestion();

};
