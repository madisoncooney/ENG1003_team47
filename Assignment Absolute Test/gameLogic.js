"use strict";

// Declare and define required global variables
let userInputSequence = [];
let failedLastSequence = false;
let sequenceLength = 4;
let sequence;
let correctSequencesAtCurrent = 0;
let tiltSelected;


// Let 'outputRefArea' be the output box on the app
// Format the initial screen to give instructions
let outputRefArea = document.getElementById("output");
outputRefArea.style.width = "90%";
outputRefArea.style["padding"] = "5%";
outputRefArea.style["text-align"] = 'center';
outputRefArea.innerHTML = "<h3 style='margin:8px'>Welcome to Simon</h3><h5 style='margin:8px'>Press the play button to begin!</h5>";




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






// Function fires whenever the deviceAbsolute event listener
// recieves new data from the sensor.
// function converts quaterions to beta and gamma
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
	// Include your own code here
	let timeBetweenSequences = 1000;

	userInputSequence.push(whichButton);
	updateDisplay(STATE_USER);
	if (userInputSequence.length === sequenceLength)
	{
		for (let j = 0; j < sequenceLength; j++)
		{
			if (userInputSequence[j] !== sequence[j])
			{
				showFailure();
				sequenceProgress('failed');

				//
				setTimeout(runGame,timeBetweenSequences);
				return;
			}
		}
		showSuccess();
		sequenceProgress('success');
		updateDisplay(STATE_WATCH);
		setTimeout(runGame,timeBetweenSequences);
		return;
	}
}

function sequenceProgress(result) {
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
		if (tiltSelected === undefined)
		{
			showFailure();
			sequenceProgress('failed');
			sequenceProgress('failed');
			enterWaitState();
			usersTurn = false;
			return updateDisplay(STATE_WAIT);
		}

		// Select the stored selected value and then change it back to undefined.
		allowButtonPresses(); //to temporarily allow a bug in main.js to allow button selection to complete
		buttonPress(tiltSelected);
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
		showFailure();
		sequenceProgress('failed');
		sequenceProgress('failed');
		disallowButtonPresses();
		updateDisplay(STATE_WAIT);
	}
	return;
}

/*
* This callback function will be called when the user taps the button at the
* top-right of the title bar to toggle between touch- and tilt-based input.
*
* The mode parameter will be set to the newly selected mode, one of:
*    TOUCH_MODE
*    TILT_MODE
*/
function changeMode(mode)
{
	//Change mode
	if (mode === TILT_MODE) //touch mode
	{
		disallowButtonPresses(); //Disable touch input
		console.log("INFO: Tilt input enabled");
	}

	else if (mode === TOUCH_MODE) //tilt mode
	{
		allowButtonPresses(); //Enable touch input
		console.log("INFO: Touch input enabled");
	}

	else //handle exceptions
	{
		console.log("ERROR: Input mode undefined");
	}
}

//Handles passing game information to the player
function updateDisplay(passedState) {
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
