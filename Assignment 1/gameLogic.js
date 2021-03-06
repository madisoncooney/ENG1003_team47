///////////////////////////////////////////////////
// GameLogic showFailure
///////////////////////////////////////////////////

/*
 *Created by: James Sandison, Madison Cooney, Alasdair MacKenzie and Nidhin Benny
 *Last modified on 05/04/2019
*/

"use strict";

//OUTPUT BOX
//

//Let 'outputRefArea' be the output box on the app
let outputRefArea = document.getElementById("output");

//Make the output box prettier
outputRefArea.style.width = "90%";
outputRefArea.style["padding"] = "5%";
outputRefArea.style["text-align"] = 'center';

//Default output
outputRefArea.innerHTML = "<h3 style='margin:8px'>Welcome to Simon</h3><h5 style='margin:8px'>Press the play button to begin!</h5>";

//
// END OUTPUT BOX

//DEFINE GLOBAL VARIABLES
let userInputSequence = []; // Sequence as input by the player
let failedLastSequence = false; // Check whether last sequence was failed, used for two-strikes fail system
let sequenceLength = 4; // Current sequence length
let sequence; // Tracks current sequence
let correctSequencesAtCurrent = 0; //Tracks # of correct sequences
let tiltSelected;
//
//END GLOBAL VARIABLES


///////////////////////////////////////////////////
// Code from SensorTest App
///////////////////////////////////////////////////

/*
 *
 * Sensor Test web app
 *
 * Copyright (c) 2019  Monash University
 *
 * Written by Machael Wybrow and Arvind Kaur
 *
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
*/

// Start: code for device orientation
 let deviceAbsolute = null;
 // try-catch: exception handling
 try
 {
		 // initialising object for device orientation
		 deviceAbsolute = new AbsoluteOrientationSensor({ frequency: 10 });

		 //if sensor is available but there is problem in using it
		 deviceAbsolute.addEventListener('error', event => {
		 // Handle runtime errors.
		 if (event.error.name === 'NotAllowedError')
		 {
			 outputRefArea.innerHTML += "Permission to access sensor was denied.";
		 }
		 else if (event.error.name === 'NotReadableError' )
		 {
			 outputRefArea.innerHTML += "Cannot connect to the sensor.";
		 }});
		 // when sensor has a reading, call the function
		 deviceAbsolute.addEventListener('reading', () => absoluteOrientationListener(deviceAbsolute));

		 //start the sensor
		 deviceAbsolute.start();
 }
 catch (error)
 {
 // Handle construction errors.
	 let errorText = "";
	 if (error.name === 'SecurityError')
	 {
		 errorText = "Sensor construction was blocked by the Feature Policy.";
	 }
	 else if (error.name === 'ReferenceError')
	 {
		 errorText =" Sensor is not supported by the User Agent.";
	 }
	 else
	 {
		 errorText = "Sensor not supported";
	 }
	 console.log(errorText);
 }

////////////////////////////////////////
// End code from sensor test App
////////////////////////////////////////


//
//  SEQUENCE RETURN AND USER INPUT CHECKING FUNCTIONS
//

/*
 * sequenceProgress
 *
 * This callback function handles processing user input and aborts the play state if an input is incorrect
 * It is called by UserChoiceTimeout
*/
function sequenceProgress(result)
{
	if (result === 'failed') {
		if (failedLastSequence === true) {
			sequenceLength = 4;
			correctSequencesAtCurrent = 0;
		}
		else if (sequenceLength > 4) {
			sequenceLength--;
			correctSequencesAtCurrent = 0;
		}
		else {
			sequenceLength = 4;
			correctSequencesAtCurrent = 0;
		}
		failedLastSequence = true;
	}
	else {
		if (correctSequencesAtCurrent + 1 === sequenceLength - 2) {
			sequenceLength++;
			correctSequencesAtCurrent = 0;
			failedLastSequence = false;
		}
		else {
			correctSequencesAtCurrent++;
			failedLastSequence = false;
		}
	}
	return;
}

/*
 * giveNextSequence
 *
 * This callback function will be called regularly by the main.js page.
 * It is called when it is time for a new sequence to display to the user.
 * You should return a list of strings, from the following possible strings:
 *    "blue"
 *    "green"
 *    "yellow"
 *    "red"
*/
function giveNextSequence()
{
	updateDisplay(STATE_WATCH);
	let colours = ["blue","green","yellow","red"];
	let colourIndex;
	sequence = [];
	for (let i = 0; i < sequenceLength; i++)
	{
		colourIndex = Math.ceil(Math.random()*4) - 1;
		sequence.push(colours[colourIndex]);
	}

	// return statement
	userInputSequence = [];
	updateDisplay(STATE_WATCH);
	return sequence;
}

/*
 * This callback function is called when the sequence to display to the user
 * has finished displaying and user is now able to click buttons again.
*/
function sequenceHasDisplayed()
{
	updateDisplay(STATE_USER); //Update game information to players
	displayToastMessage("Enter the sequence."); //Prompt the user to play
	if (controlMode === TOUCH_MODE)
	{
		allowButtonPresses(); //Enable user input
	}
}

/* 
 * This callback function will be called if the user takes too long to make
 * a choice.  You can generally treat a call to this function as meaning the
 * user has 'given up'. This should be counted as an incorrect sequence given
 * by the user.
 *
 * When the app is is "tilt" input mode (see Step 7) then you might instead
 * use this function to select the button that the phone is tilted towards,
 * by calling one of the following functions:
 *    selectYellowButton
 *    selectRedButton
 *    selectBlueButton
 *    selectGreenButton
*/
function userChoiceTimeout()
{
	// if in tilt mode
	if (controlMode === TILT_MODE)
	{
		//user hasn't selected anything and time has run out
		if (tiltSelected === undefined) 
		{
			showFailure();
			sequenceProgress('failed');
			sequenceProgress('failed');
			enterWaitState();
			usersTurn = false;
			return updateDisplay(STATE_WAIT);
		}
		
		//to temporarily allow a bug in main.js to allow button selection to complete
		allowButtonPresses(); 
		//Calls the buttonPress function with the appropriate button choice
		buttonPress(tiltSelected);
		//Ensure user can't enter more buttons while the program processes previous
		disallowButtonPresses();
		tiltSelected = undefined;

		if (userInputSequence.length !== sequenceLength)
		{
			displayToastMessage("Next button!");
		}
		userMadeChoice = true;

		return;
	}
	else
	{
		//User has not made choice, show the cross and update variables before 
		//restarting
		showFailure();
		sequenceProgress('failed');
		sequenceProgress('failed');
		disallowButtonPresses();
		updateDisplay(STATE_WAIT);
	}
	return;
}


//
//  SETTINGS AND UI-QoL FUNCTIONS
//

/*
 * This callback function will be called when the user taps the button at the
 * top-right of the title bar to toggle between touch- and tilt-based input.
 *
 * The mode parameter will be set to the newly selected mode, one of:
 *    TOUCH_MODE
 *    TILT_MODE
 *
 *The function causes the mode variable to change value, allowing the game
 *to keep track of the mode that user is currently using and enabling/disabling
 *the touch/tilt functionalities accordingly.
*/
function changeMode(mode)
{
	if (mode === TILT_MODE)
	{
		disallowButtonPresses(); //Disable touch input
		console.log("INFO: Tilt input enabled");
	}
	else if (mode === TOUCH_MODE)
	{
		allowButtonPresses(); //Enable touch input
		console.log("INFO: Touch input enabled");
	}
	else //handle exceptions
	{
		console.log("ERROR: Input mode undefined");
	}
}

/*
 * updateDisplay
 *
 * Callback function that is called whenever an input event or sequence display event is fired.
 * Gets general game information and places it nicely in the outputRefArea box as formatted text.
*/
function updateDisplay(passedState)
{
	outputRefArea.style["text-align"] = 'justify';
	//Change 'outputRefArea' to display helpful information
	outputRefArea.innerHTML = "Button Presses Remaining: <strong>" + buttonPressesRemaining + "</strong><br/>";
	outputRefArea.innerHTML += "Current Sequence Length: <strong>" + sequenceLength + "</strong><br/>";
	outputRefArea.innerHTML += "Correct Sequences at Current Level: <strong>" + correctSequencesAtCurrent + "</strong><br/>";
	outputRefArea.innerHTML += "Sequences from next level: <strong>" + (sequenceLength - correctSequencesAtCurrent - 2) + "</strong>";


	//Direct the player to which state they are currently in
	if (passedState === STATE_WATCH) //Sequence is about to display
	{
		outputRefArea.innerHTML += "<strong><h5>Watch Current Sequence!</strong></h5>";
	}

	else if (passedState === STATE_USER) //Player has watched the sequence
	{
		outputRefArea.innerHTML += "<strong><h5>Enter the Sequence!</strong><h5/>";
	}

	else if (passedState === STATE_WAIT)//Player has failed or not begun yet
	{
		outputRefArea.innerHTML += "<strong><h5>Start a New Game!</strong><h5/>";
	}
}


//
//  TILT INPUT FUNCTIONS
//

/*
 * absoluteOrientationListener
 *
 * Function fires whenever the deviceAbsolute event listener
 * recieves new data from the sensor. It takes quarternions 
 * provided by the API and converts it into the two angles 
 * beta and gamma that can be used to select approporiate 
 * buttons from the visual interface.
 */
function absoluteOrientationListener(event) {
	let radianToDegrees = 180/Math.PI;


	// normalize quaternions to ensure expected results in quaternion
	// (as from: https://www.cprogramming.com/tutorial/3d/quaternions.html)
	let magnitude = Math.sqrt((event.quaternion[0]**2)
													+ (event.quaternion[1]**2)
													+ (event.quaternion[2]**2)
													+ (event.quaternion[3]**2));

	let quat0 = event.quaternion[0]/magnitude;
	let quat1 = event.quaternion[1]/magnitude;
	let quat2 = event.quaternion[2]/magnitude;
	let quat3 = event.quaternion[3]/magnitude;


	// use DJI algorithm to convert quaternions to euler angles relative to
	// device orientation. Found derivation of equations here:
	// (https://stackoverflow.com/questions/5782658/extracting-yaw-from-a-quaternion)
	let pitch = Math.asin(2 * (quat2*quat0 - quat3 * quat1));
	let yaw = Math.atan2(2 * (quat3*quat0 + quat1*quat2), -1 + 2*(quat0*quat0 + quat1*quat1));

	let beta = checkValue(radianToDegrees*pitch); // devices took pitch as the beta angle
	let gamma = checkValue(radianToDegrees*yaw); // devices took yaw as beta angle

	// function to convert all values to lie within -90 -> 90 degrees
	function checkValue(value) {
		if (value > 90)
		{
			value -= 180;
		}
		else if (value < -90)
		{
			value += 180;
		}
		return value;
	}

	// call the tilt selection function to use gamma and beta to determine orientation
	tiltSelection(beta, gamma);
}

/*
* Given the angle parameters beta and gamma, this function determines what quadrant 
* of the UI the user is trying to select. It then calls the function tiltButtonSelect 
* to provide the user visual cues (in the form of a black outline around the button)
* which button is about to be selected.
*/
function tiltSelection(beta, gamma)
{
	let degreeThreshold = 7.5;
	// check if a valid situation for tilt selection to occur
	if (controlMode === TILT_MODE && usersTurn === true)
	{
		// check beta and gamma values and assign colours if requirements met
		if (gamma >= degreeThreshold && beta >= degreeThreshold)
		{
			tiltSelected = "blue";
		}
		else if (gamma >= degreeThreshold && beta <= -degreeThreshold)
		{
			tiltSelected = "green";
		}
		else if (gamma <= -degreeThreshold && beta <= -degreeThreshold)
		{
			tiltSelected = "red";
		}
		else if (gamma <= -degreeThreshold && beta >= degreeThreshold)
		{
			tiltSelected = "yellow";
		}

		// call function to display tilt selection
		tiltButtonSelect(tiltSelected);
		return;
	}
	else
	{	
		// if not already returned, make sure none are selected
		tiltButtonSelect(undefined);
	}
	
}

/* tiltButtonSelect
* Shows the user which button is about to be selected by adding a 
* thin black line around it, using the id of the individual buttons
*/
function tiltButtonSelect(feedbackButton)
{
	if (feedbackButton === undefined)
	{
		TLImg.style.borderStyle = "none";
		TRImg.style.borderStyle = "none";
		BRImg.style.borderStyle = "none";
		BLImg.style.borderStyle = "none";
		return;
	}
	if (feedbackButton === "blue")
	{
		TLImg.style.borderStyle="solid";
		TRImg.style.borderStyle="none";
		BRImg.style.borderStyle="none";
		BLImg.style.borderStyle="none";
	}
	else if (feedbackButton === "green")
	{
		TRImg.style.borderStyle="solid";
		TLImg.style.borderStyle="none";
		BRImg.style.borderStyle="none";
		BLImg.style.borderStyle="none";
	}
	else if (feedbackButton === "red")
	{
		BRImg.style.borderStyle="solid";
		TRImg.style.borderStyle="none";
		TLImg.style.borderStyle="none";
		BLImg.style.borderStyle="none";
	}
	else if (feedbackButton === "yellow")
	{
		BLImg.style.borderStyle="solid";
		TRImg.style.borderStyle="none";
		BRImg.style.borderStyle="none";
		TLImg.style.borderStyle="none";
	}
	return;
}

/*
 * This callback function will be called when any of the game buttons on the
 * screen is clicked on by the user (note that the user will not be able to
 * 'double-click' buttons, they will only be clickable once a button has
 * gone dark again)
 *
 * This function has a single parameter 'whichButton' that can take the
 * following values:
 *    "blue"
 *    "green"
 *    "yellow"
 *     "red"
*/
function buttonSelected(whichButton)
{
	let timeBetweenSequences = 1000;
	//The selected button is appended to a list representing the 
	//selections that the user has made.
	userInputSequence.push(whichButton);
	updateDisplay(STATE_USER);
	if (userInputSequence.length === sequenceLength)
	{
		for (let j = 0; j < sequenceLength; j++)
		{
			//User has entered wrong sequence
			if (userInputSequence[j] !== sequence[j])
			{
				//Displaying the cross mark
				showFailure();
				//sequenceProgress is called to update 
				//variables before next round
				sequenceProgress('failed');
				//Wait for some time before restarting
				setTimeout(runGame,timeBetweenSequences);
				return;
			}
		}
		//User has entered correct sequence
		showSuccess();
		sequenceProgress('success');
		updateDisplay(STATE_WATCH);
		setTimeout(runGame,timeBetweenSequences);
		return;
	}
}

/* tiltSelection
 * This function selects the appropriate button of the visual interface according 
 * to the given values of beta and gamma (the angles derived from the sensor 
 * API). 
*/

function tiltSelection(beta, gamma)
{
	let degreeThreshold = 7.5;
	// check if a valid situation for tilt selection to occur
	if (controlMode === TILT_MODE && usersTurn === true)
	{
		// check beta and gamma values and assign colours if requirements met
		if (gamma >= degreeThreshold && beta >= degreeThreshold)
		{
			tiltSelected = "blue";
		}
		else if (gamma >= degreeThreshold && beta <= -degreeThreshold)
		{
			tiltSelected = "green";
		}
		else if (gamma <= -degreeThreshold && beta <= -degreeThreshold)
		{
			tiltSelected = "red";
		}
		else if (gamma <= -degreeThreshold && beta >= degreeThreshold)
		{
			tiltSelected = "yellow";
		}

		// call function to display tilt selection
		tiltButtonSelect(tiltSelected);
		return;
	}
	else
	{
		tiltButtonSelect(undefined);
	}
	// if not already returned, make sure none are selected
}

/* tiltButtonSelect
 * This function displays a black box around the button 
 * that is about to be selected. It is called from within
 * the tiltSelection function.
*/
function tiltButtonSelect(feedbackButton)
{
	if (feedbackButton === undefined)
	{
		TLImg.style.borderStyle = "none";
		TRImg.style.borderStyle = "none";
		BRImg.style.borderStyle = "none";
		BLImg.style.borderStyle = "none";
		return;
	}
	if (feedbackButton === "blue")
	{
		TLImg.style.borderStyle="solid";
		TRImg.style.borderStyle="none";
		BRImg.style.borderStyle="none";
		BLImg.style.borderStyle="none";
	}
	else if (feedbackButton === "green")
	{
		TRImg.style.borderStyle="solid";
		TLImg.style.borderStyle="none";
		BRImg.style.borderStyle="none";
		BLImg.style.borderStyle="none";
	}
	else if (feedbackButton === "red")
	{
		BRImg.style.borderStyle="solid";
		TRImg.style.borderStyle="none";
		TLImg.style.borderStyle="none";
		BLImg.style.borderStyle="none";
	}
	else if (feedbackButton === "yellow")
	{
		BLImg.style.borderStyle="solid";
		TRImg.style.borderStyle="none";
		BRImg.style.borderStyle="none";
		TLImg.style.borderStyle="none";
	}
	return;
}

/* buttonSelected
 * This callback function will be called when any of the game buttons on the
 * screen is clicked on by the user (note that the user will not be able to
 * 'double-click' buttons, they will only be clickable once a button has
 * gone dark again)
 *
 * This function has a single parameter 'whichButton' that can take the
 * following values:
 *    "blue"
 *    "green"
 *    "yellow"
 *     "red"
*/
function buttonSelected(whichButton)
{
	let timeBetweenSequences = 1000;
	//Below line appends the new selections to a list that keeps track of 
	//the sequence given by the user
	userInputSequence.push(whichButton);
	updateDisplay(STATE_USER);
	//Checking the sequence once a sequence of correct length has been 
	//entered
	if (userInputSequence.length === sequenceLength)
	{
		for (let j = 0; j < sequenceLength; j++)
		{
			//If the two sequences aren't identical, perform the
			//steps to show the user has failed and restart (or 
			//revert to lower level)
			if (userInputSequence[j] !== sequence[j])
			{
				showFailure();
				sequenceProgress('failed');
				setTimeout(runGame,timeBetweenSequences);
				return; 
			}
		}
		//If user has entered correct sequence, display appropriate 
		//effects and start the next sequence (after some time)
		showSuccess();
		sequenceProgress('success');
		updateDisplay(STATE_WATCH);
		setTimeout(runGame,timeBetweenSequences);
		return;
	}
}
