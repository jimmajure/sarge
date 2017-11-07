
/*
 * The Sarge is 
 */
var Sarge = function(questions, platoon, callback) {
	this.questions = questions;
	this._questionIndex = -1;
	this.currentStudent = null;
	this._scoresId = 'scores';
	
	this._makeWheel(callback);
	this._addPlatoon(platoon);
	this._fillSegments();
	this.spina = document.getElementById("spin");
	this.aska = document.getElementById("ask");
	this.answera = document.getElementById("answer");
	this.righta = document.getElementById("right");
	this.wronga = document.getElementById("wrong");
	
	this.spina.className = "active";
	this.aska.className = "not-active";
	this.answera.className = "not-active";
	this.righta.className = "not-active";
	this.wronga.className = "not-active";

	this.questionh = document.getElementById("question");
	this.qanswerh = document.getElementById("qanswer");
}


/*
 * Make a spin wheel for the sarge to spin...
 */
Sarge.prototype._makeWheel = function(callback) {
    this.wheel = new Winwheel({
        'numSegments'  : 0,     // Specify number of segments.
        'outerRadius'  : 212,   // Set outer radius so wheel fits inside the background.
        'textFontSize' : 28,    // Set font size as desired.
        'animation' :           // Specify the animation to use.
        {
            'type'     : 'spinToStop',
            'duration' : 3,     // Duration in seconds.
            'spins'    : 4,     // Number of complete spins.
            'callbackFinished' : callback
        }
    });
}

/*
 * Set the wheel to spinning...
 */
Sarge.prototype.spinTheWheel = function() {
	if (this.currentStudent) {
		// remove the previous student from the wheel to give everybody a chance to answer...
		var segmentsBeforeDelete = this.wheel.numSegments;
		this.wheel.deleteSegment(this.wheel.getIndicatedSegmentNumber());
		
		// if we're all done with the team, put them all back on the wheel...
		if (segmentsBeforeDelete == 1) {
			this._fillSegments();
		}
	}
    this.wheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
    this.wheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
    this.wheel.draw();                // Call draw to render changes to the wheel.
	
	// Begin the spin animation by calling startAnimation on the wheel object.
	this.wheel.startAnimation();
}

/*
 * When the spin is finished, say something insulting to the lucky winner.
 */
Sarge.prototype._spinFinished = function() {
    var winningSegment = this.wheel.getIndicatedSegment();
    this.currentStudent = winningSegment.student;
	var saying = sayings[Math.floor((Math.random() * this._sayings.length))];
	this.populateBubble(saying.replace('{name}',winningSegment.student.lastname));
	
	// disable spin and enable ask...
	this.spina.className = "not-active";
	this.aska.className = "active";
}

/*
 * Ask the next question in the list...
 */
Sarge.prototype.askTheNextQuestion = function() {
	if (this._questionIndex < this.questions.length-1) {
		this._questionIndex += 1;
		this.questionh.innerHTML = "<br/>"+this.questions[this._questionIndex].question;
		// enable answer...
		this.answera.className = "active";
	} else {
		this.questionh.innerHTML = "No More Questions!";
	}
	// disable ask...
	this.aska.className = "not-active";
	
}

/*
 * Show the answer to the question...
 */
Sarge.prototype.showTheAnswer = function() {
	this.qanswerh.innerHTML = "<br/>"+this.questions[this._questionIndex].answer;
	
	// disable answer and enable right and wrong...
	this.answera.className = "not-active";
	this.righta.className = "active";	
	this.wronga.className = "active";
}

/*
 * The quippy sayings the Sarge uses to motivate his recruits...
 */
Sarge.prototype._sayings = [
	'I want that toilet to shine, {name}!',
	'Drop and give me 50, {name}!',
	'Is it too early for you, {name}? Tough luck - ANSWER THE QUESTION!',
	'Your mama\'s not here to help you, {name}, so stop your crying!',
	'Answer this question now, {name}! Do I make myself clear?',
	'If you miss your kitty, {name}, you should\'ve joined a DIFFERENT ARMY!',
	'Do you know how to peel potatoes, {name}? You better learn!'
];

/*
 * 
 */
Sarge.prototype._addPlatoon = function(platoon) {
	this.platoon = platoon;
	this.platoon.sort(function(a,b) {
		result = 0;
		if (a.score < b.score) 
			result = -1;
		else if (a.score > b.score)
			result = 1;
		// sort largest to smallest
		return -result;
	});
	var scoresTable = document.getElementById(this._scoresId);
	scoresTable.innerHTML = '';
	var html = "";
	for (i=0; i<this.platoon.length; i++) {
		var tmp = "";
		var student = platoon[i];
		tmp += "<tr><td class=\"scorelist\">{0}</td><td class=\"scorelist\">{1}</td></tr>";
		tmp = tmp.replace("{0}", student.firstname);
		tmp = tmp.replace("{1}", student.score);
		html += tmp;
	}
	scoresTable.innerHTML = html;
}

/*
 * The student responded with the correct answer, so give him/her some points...
 */
Sarge.prototype.studentIsRight = function(){
	var mood = this.getTheSargesMood();	
	console.log(mood);
	switch (mood) {
		case "foul":
			this.populateBubble("My back hurts! No points for you, "+this.currentStudent.lastname+".");
			break;
		case "bad":
		case "normal":
			this.populateBubble("Well done, "+this.currentStudent.lastname+".");
			this.currentStudent.score += 1;
			break;
		case "good":
			this.populateBubble("Mighty fine, "+this.currentStudent.lastname+". I'm giving you an extra point.");
			this.currentStudent.score += 2;
			break;
		case "fantastic":
			this.populateBubble("It's a good day today, "+this.currentStudent.lastname +"! You get 3 points!");
			this.currentStudent.score += 3;
			break;
	}
	
	// resort the platoon on the current score
	this._addPlatoon(this.platoon);
	this.spina.className = "active";
	this.righta.className = "not-active";	
	this.wronga.className = "not-active";	
	
	this.questionh.innerHTML = "";
	this.qanswerh.innerHTML = "";
	this.evaluateLastAnswer();
	
	console.log(this.currentStudent.firstname + ": "+mood);
}

/*
 * The studentresponded with the wrong answer. Not good.
 */
Sarge.prototype.studentIsWrong = function(){
	this.populateBubble("Better shape up quick, "+this.currentStudent.lastname+".");
	this._addPlatoon(this.platoon);
	this.spina.className = "active";
	this.righta.className = "not-active";	
	this.wronga.className = "not-active";	
	
	this.questionh.innerHTML = "";
	this.qanswerh.innerHTML = "";
	this.evaluateLastAnswer();
}

/*
 * If this is the last question, then decide who won.
 */
Sarge.prototype.evaluateLastAnswer = function() {
	if (this._questionIndex >= this.questions.length-1) {
		// sort the platoon...
		this._addPlatoon(this.platoon);
		this.spina.className = "not-active";
		var highScore = platoon[0].score;
		var winners = [platoon[0]];
		for (i=1; i<this.platoon.length; i++) {
			if  (this.platoon[i].score == highScore) {
				winners.push(this.platoon[i])
			} else {
				//we're past the high score
				break;
			}
		}
		if (winners.length>1) {
			this.populateBubble("GAME OVER<br/>It's a tie! Good work people.")
		} else {
			this.populateBubble("GAME OVER<br/>Nice work, "+winners[0].lastname+", I knew you could do it!")
		}
	}
}

/*
 * Find out how the sarge is feeling today.
 */
Sarge.prototype.getTheSargesMood = function() {
	var rand = Math.floor(Math.random() * 100);
	console.log(rand);
	var result = "";
	if (rand < 10) result = "foul";
	else if (rand < 25) result = "bad";
	else if (rand < 75) result = "normal";
	else if (rand < 95) result = "good";
	else result = "fantastic";
	return result;
}

/*
 * An internal method to fill the wheel with a segment for each 
 * of the grunts in the platoon.
 */
Sarge.prototype._fillSegments = function () {
	var colors = ['#eae56f','#89f26e','#7de6ef','#e7706f'];

	for (i=0; i<this.platoon.length; i++) {
		var newSegment = {};
		newSegment.fillStyle = colors[(i)%colors.length];
		newSegment.text = this.platoon[i].firstname;
		newSegment.student = this.platoon[i];
		this.wheel.addSegment(newSegment);
	}
	this.wheel.draw();
}


Sarge.prototype.populateBubble = function(words) {
	var bubble = document.getElementById("bubble");
	bubble.innerHTML = words;
}

