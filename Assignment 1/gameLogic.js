"use strict";

//Declare and define some variables...
//Let 'outputRefArea' be the output box on the app
let outputRefArea = document.getElementById("output");
outputRefArea.style.width = "90%";
outputRefArea.style["padding"] = "5%";
outputRefArea.style["text-align"] = 'center';
let userInputSequence = [];
let failedLastSequence = false;
let timeBetweenSequences = 1000;
let sequenceLength = 4;
let sequence;
let correctSequencesAtCurrent = 0;
let beta, gamma, quat0, quat1, quat2, quat3, tiltSelected;
let degreeThreshold = 7.5;

//Code from SensorTest App
// Start: code for device orientation
outputRefArea.innerHTML = "<h3 style='margin:8px'>Welcome to Simon</h3><h5 style='margin:8px'>Press the play button to begin!</h5>";
let deviceAbsolute = null;
// try-catch: exception handling

// initialising object for device orientation
deviceAbsolute = new AbsoluteOrientationSensor({ frequency: 10 });

//if sensor is available but there is problem in using it
deviceAbsolute.addEventListener('error', event => {
	// Handle runtime errors.
	if (event.error.name === 'NotAllowedError')
	{
		outputRefArea.innerHTML += "<p>Permission to access sensor was denied.<p/>";
	}
	else if (event.error.name === 'NotReadableError' )
	{
		outputRefArea.innerHTML += "<p>Cannot connect to the sensor.<p/>";
	}});
// when sensor has a reading, call the function
deviceAbsolute.addEventListener('reading', () => absoluteOrientationListener(deviceAbsolute));

//start the sensor
deviceAbsolute.start();





//Function fires whenever eventlistener returns

function absoluteOrientationListener(event) {
  let radianToDegrees = 180/Math.PI;
  //normalize quaternion (as from: https://www.cprogramming.com/tutorial/3d/quaternions.html)
  let magnitude = Math.sqrt((event.quaternion[0]**2) + (event.quaternion[1]**2) + (event.quaternion[2]**2) + (event.quaternion[3]**2));
  quat0 = event.quaternion[0]/magnitude;
  quat1 = event.quaternion[1]/magnitude;
  quat2 = event.quaternion[2]/magnitude;
  quat3 = event.quaternion[3]/magnitude;
  // let heading = 180*Math.atan2(2*quatY*quatW - 2*quatX*quatZ, 1 - 2*(quatY**2) - 2*(quatZ**2))/Math.PI;
  // let altitude = 180*Math.asin(2*quatX*quatY + 2*quatZ*quatW)/Math.PI;
  // let bank = 180*Math.atan2(2*quatX*quatW - 2*quatY*quatZ, 1- 2*(quatX**2) - 2*(quatZ**2))/Math.PI;
  // https://stackoverflow.com/questions/5782658/extracting-yaw-from-a-quaternion
  let roll = Math.atan2(2 * (quat3*quat2 + quat0*quat1),1 - 2*(quat1*quat1 + quat2*quat2));
  let pitch = Math.asin(2 * (quat2*quat0 - quat3 * quat1));
  let yaw = Math.atan2(2 * (quat3*quat0 + quat1*quat2), -1 + 2*(quat0*quat0 + quat1*quat1));
  //
  // heading = checkValue(heading);
  // altitude = Math.PI * checkValue(altitude)/180;
  // bank = checkValue(bank);
  // alpha = heading;
  // beta = Math.sin(altitude)*bank + Math.cos(altitude)*heading;
  // gamma = Math.cos(altitude)*heading - Math.sin(altitude)*bank;
  beta = checkValue(radianToDegrees*pitch);
  gamma = checkValue(radianToDegrees*yaw);
  /*if (quatX*quatY + quatZ*quatW === 0.5)
  {
    heading = 2*Math.atan2(quatX,quatW);
    bank = 0;
  }
  else if (quatX*quatY + quatZ*quatW === -0.5)
  {
    heading = -2*Math.atan2(quatX,quatW);
    bank = 0;
  }*/
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
  //outputRefArea.innerHTML = beta + "<br/>" + gamma + "<br/>";
  tiltSelection();
}


function tiltSelection()
{
  if (true)//controlMode === TILT_MODE && usersTurn === true)
  {
    if (gamma >= degreeThreshold && beta >= degreeThreshold)
    {
    	tiltSelected = "blue";
			tiltButtonSelect(TLImg);
      return;
    }
    else if (gamma >= degreeThreshold && beta <= -degreeThreshold)
    {
			tiltSelected = "green";
			tiltButtonSelect(TRImg);
      return;
    }
    else if (gamma <= -degreeThreshold && beta <= -degreeThreshold)
    {
			tiltSelected = "red";
			tiltButtonSelect(BRImg);
      return;
    }
    else if (gamma <= -degreeThreshold && beta >= degreeThreshold)
    {
			tiltSelected = "yellow";
			tiltButtonSelect(BLImg);
      return;
    }
  }
	else
	{
		tiltButtonSelect();
	}
  // if not already returned, make sure none are selected
}


function tiltButtonSelect(feedbackButton)
{
	let buttons = [TLImg,TRImg,BRImg,BLImg];
	for (let selection in buttons)
	{
		if (selection === feedbackButton)
		{
			solid.style.borderStyle = "solid";
		}
		else
		{
			selection.style.borderStyle = "none";
		}
	}
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
    userInputSequence.push(whichButton);
    updateDisplay();
    if (userInputSequence.length === sequenceLength)
    {
      console.log(userInputSequence);
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
    return
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
    updateDisplay();
    let colours = ["blue","green","yellow","red"];
    let colourIndex;
    sequence = [];
    for (let i = 0; i < sequenceLength; i++)
    {
      colourIndex = Math.ceil(Math.random()*4) - 1;
      sequence.push(colours[colourIndex]);
    }

    // return statemen
    console.log(sequence); //log
    userInputSequence = [];
    return sequence;
}


/*
 * This callback function is called when the sequence to display to the user
 * has finished displaying and user is now able to click buttons again.
*/
function sequenceHasDisplayed()
{
    updateDisplay(); //Update game information to players
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
    // Include your own code here
    if (controlMode === TILT_MODE)
    {
			if (tiltSelected === undefined)
			{
				showFailure();
        sequenceProgress('failed');
        sequenceProgress('failed');
        return updateDisplay();
			}

			// Select the stored selected value and then change it back to undefined.
			buttonPress(tiltSelected);
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
      updateDisplay();
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
function updateDisplay() {
	outputRefArea.style["text-align"] = 'justify';
  //Change 'outputRefArea' to display helpful information
  outputRefArea.innerHTML = "Button Presses Remaining: <strong>" + buttonPressesRemaining + "<strong/><br/>";
  outputRefArea.innerHTML += "Current Sequence Length: <strong>" + sequenceLength + "<strong/><br/>";
  outputRefArea.innerHTML += "Correct Sequences at Current Level: <strong>" + correctSequencesAtCurrent + "<strong/><br/>";
  outputRefArea.innerHTML += "Sequences from next level: <strong>" + (sequenceLength - correctSequencesAtCurrent - 2) + "<strong/><br/>";


	//Direct the player to which state they are currently in

  if (playingState === 2) //Sequence is about to display
  {

    outputRefArea.innerHTML += "<strong><h5>Watch Current Sequence!<strong/><h5/>";

  } else if (playingState === 3) //Player has watched the sequence
  {

    outputRefArea.innerHTML += "<strong><h5>Enter the Sequence!<strong/><h5/>";

  }
  else //Player has failed or not begun yet
  {

    outputRefArea.innerHTML += "<strong><h5>Start a New Game!<strong/><h5/>";

  }
}
