"use strict";

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
//Declare and define some variables...
//Let 'outputRefArea' be the output box on the app
let outputRefArea = document.getElementById("output");
let userInputSequence = [];
let failedLastSequence = false;
let timeBetweenSequences = 1000;
let sequenceLength = 4;
let sequence;
let correctSequencesAtCurrent = 0;
let alpha, beta, gamma, tiltSelection;
let degreeThreshold = 5;
//let sensorAbsolute = new AbsoluteOrientationSensor({frequency:10});
let quatX, quatY, quatZ, quatW, x, y, z;

//Code from SensorTest App
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
      errorRef.innerText ="Permission to access sensor was denied.";
    }
    else if (event.error.name === 'NotReadableError' )
    {
      outputRefArea.innerText = "Cannot connect to the sensor.";
    }});
    // when sensor has a reading, call the function
    deviceAbsolute.addEventListener('reading', () => reloadOrientationValues(deviceAbsolute));

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
  outputRefArea.innerHTML = errorText;
}


//Function fires whenever eventlistener returns
function orientationListener(event) {
  beta = event.beta;
  gamma = event.gamma;
  if (controlMode === TILT_MODE && usersTurn === true)
  {
    if (gamma <= -degreeThreshold && beta <= -degreeThreshold)
    {
      tiltSelection = "Blue";
    }
    else if (gamma >= degreeThreshold && beta <= -degreeThreshold)
    {
      tiltSelection = "Green";
    }
    else if (gamma >= degreeThreshold && beta >= degreeThreshold)
    {
      tiltSelection = "Red";
    }
    else if (gamma <= -degreeThreshold && beta >= degreeThreshold)
    {
      tiltSelection = "Yellow";
    }
    else
      tiltSelection = "";
  }
  else
  {
    tiltSelection = "";
  }
  updateDisplay();
}
function absoluteOrientationListener(event) {
  quatX = event.quaternion[0];
  quatY = event.quaternion[1];
  quatZ = event.quaternion[2];
  quatW = event.quaternion[3];
  // Conversions calculated from http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToEuler/
  alpha = Math.atan2(2*quatY*quatW - 2*quatX*quatZ, 1 - 2*(quatY**2) - 2*(quatZ**2));
  beta = Math.asin(2*quatX*quatY + 2*quatZ*quatW);
  gamma = Math.atan2(2*quatX*quatW - 2*quatY*quatZ, 1- 2*(quatX**2) - 2*(quatZ**2));
  outputRefArea.innerHTML = alpha + "<br/>" + beta + "<br/>" + gamma + "<br/>";
  if (controlMode === TILT_MODE && usersTurn === true)
  {
    if (gamma <= -degreeThreshold && beta <= -degreeThreshold)
    {
      tiltSelection = "Blue";
    }
    else if (gamma >= degreeThreshold && beta <= -degreeThreshold)
    {
      tiltSelection = "Green";
    }
    else if (gamma >= degreeThreshold && beta >= degreeThreshold)
    {
      tiltSelection = "Red";
    }
    else if (gamma <= -degreeThreshold && beta >= degreeThreshold)
    {
      tiltSelection = "Yellow";
    }
    else
      tiltSelection = "";
  }
  else
  {
    tiltSelection = "";
  }
}

function reloadOrientationValues(deviceAbsolute)
{
  quatX = deviceAbsolute.quaternion[0];
  quatY = deviceAbsolute.quaternion[1];
  quatZ = deviceAbsolute.quaternion[2];
  quatW= deviceAbsolute.quaternion[3];
}


//Start event handler
//window.addEventListener("deviceorientation", orientationListener);
//sensorAbsolute.addEventListener("reading",() => absoluteOrientationListener(sensorAbsolute));
//sensorAbsolute.start();

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
      if (gamma <= -degreeThreshold && beta <= -degreeThreshold)
      {
        selectTopLeftButton();
        buttonPress("blue");
      }
      else if (gamma >= degreeThreshold && beta <= -degreeThreshold)
      {
        selectTopRightButton();
        buttonPress("green");
      }
      else if (gamma >= degreeThreshold && beta >= degreeThreshold)
      {
        selectBottomRightButton();
        buttonPress("red");
      }
      else if (gamma <= -degreeThreshold && beta >= degreeThreshold)
      {
        selectBottomLeftButton();
        buttonPress("yellow");
      }
      else
      {
        showFailure();
        sequenceProgress('failed');
        sequenceProgress('failed');
        return updateDisplay();
      }

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
      updateDisplay()
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

  //Change 'outputRefArea' to display helpful information
  outputRefArea.innerHTML = "Button Presses Remaining: <strong>" + buttonPressesRemaining + "<strong/><br/>";
  outputRefArea.innerHTML += "Current Sequence Length: <strong>" + sequenceLength + "<strong/><br/>";
  outputRefArea.innerHTML += "Correct Sequences at Current Level: <strong>" + correctSequencesAtCurrent + "<strong/><br/>";
  outputRefArea.innerHTML += "Sequences from next level: <strong>" + (sequenceLength - correctSequencesAtCurrent - 2) + "<strong/><br/><br/>";
  if (controlMode === TILT_MODE)
  {
    outputRefArea.innerHTML += "Currently Selecting = <strong>" + tiltSelection + "<strong/><br/>";

  }
  //Direct the player to which state they are currently in

  if (playingState === 2) //Sequence is about to display
  {

    outputRefArea.innerHTML += "<strong><h5>Watch Current Sequence!<strong/><h5/>";

  } else if (playingState === 3) //Player has watched the sequence
  {

    outputRefArea.innerHTML += "<strong><h5>Enter the Sequence!<strong/><h5/>";

  }
  else  //Player has failed or not begun yet
  {

    outputRefArea.innerHTML += "<strong><h5>Start a New Game!<strong/><h5/>";

  }
}
