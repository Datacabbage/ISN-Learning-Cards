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


/*jslint vars: true, sloppy: true */

var MOBLERDEBUG = 0;

function AverageScoreModel(statisticsModel){
    this.modelName = " avg score";
    this.superModel = statisticsModel;
    this.averageScore = -1;
    this.improvementAverageScore = 0;
    this.initQuery();
    
	
}

AverageScoreModel.prototype.initQuery = function(){
	   
	this.query = 'SELECT sum(score) as score, count(id) as num FROM statistics WHERE course_id=? AND duration!=-100'
		+ ' AND day>=? AND day<=?' + ' GROUP BY course_id';

};

AverageScoreModel.prototype.queryDB = queryDatabase;


AverageScoreModel.prototype.calculateValue = function(){
	var self = this;
	self.values= self.superModel.getCurrentValues(SUBMODEL_QUERY_THREE);
	self.queryDB( 
			function cbAS(t,r) {self.calculateAverageScore(t,r);});

};


//calculates the average score the was achieved

AverageScoreModel.prototype.calculateAverageScore = function(transaction, results) {
	
	var self = this;
	moblerlog("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		moblerlog("row: " + JSON.stringify(row));
		if (row['num'] === 0) {
			this.averageScore = 0;
		} else {
			this.averageScore =  Math.round((row['score'] / row['num']) * 100);
		}
		moblerlog("AVERAGE SCORE: " + this.averageScore);
	} else {
		this.averageScore = 0;
	}
	
	// calculate improvement
		
	
	self.values = self.superModel.getLastActiveValues();
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementAverageScore(t,r);
	});
	
};

//calculates the improvement of the average score in comparison to the last active day

AverageScoreModel.prototype.calculateImprovementAverageScore = function (transaction,results){
	
	var self = this;
	moblerlog("rows in calculate improvement average score: "+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		moblerlog("row: " + JSON.stringify(row));
		var oldAverageScore = 0;
		if (row['num'] !== 0) {
			oldAverageScore = Math.round((row['score'] / row['num']) * 100);
		}
		newAverageScore = this.averageScore;
		this.improvementAverageScore = newAverageScore - oldAverageScore;
		$(document).trigger("statisticcalculationsdone");
		
	} else {
	  this.improvementAverageScore = this.averageScore;
	}
	moblerlog("improvement average score: "+ this.improvementAverageScore);
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();
		
};





