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
let userInputSequence = [];
let failedLastSequence = false;
let sequenceLength = 4;
let sequence;
let correctSequencesAtCurrent = 0;
let beta, gamma;
let degreeThreshold = 10;

//Function fires whenever eventlistener returns
function orientationListener(event) {
  beta     = event.beta;
  gamma    = event.gamma;
  if (controlMode === TILT_MODE && usersTurn === true)
  {
    if (gamma <= -degreeThreshold && beta <= -degreeThreshold)
    {
      selectBlueButton();
    }
    else if (gamma >= degreeThreshold && beta <= -degreeThreshold)
    {
      selectGreenButton();
    }
    else if (gamma >= degreeThreshold && beta >= degreeThreshold)
    {
      selectRedButton();
    }
    else if (gamma <= -degreeThreshold && beta >= degreeThreshold)
    {
      selectYellowButton();
    }
  }
}

//Start event handler
window.addEventListener("deviceorientation", orientationListener);


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

          return runGameWithWait();;
        }
      }
      showSuccess();
      sequenceProgress('success');
      return runGameWithWait();
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
    allowButtonPresses(); //Enable user input

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
    showFailure();
    disallowButtonPresses();
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

  //Let 'outputRefArea' be the output box on the app
  let outputRefArea = document.getElementById("output");

  //Change 'outputRefArea' to display helpful information
  outputRefArea.innerHTML = "Button Presses Remaining: <strong>" + buttonPressesRemaining + "<strong/><br/>";
  outputRefArea.innerHTML += "Current Sequence Length: <strong>" + sequenceLength + "<strong/><br/>";
  outputRefArea.innerHTML += "Correct Sequences at Current Level: <strong>" + correctSequencesAtCurrent + "<strong/><br/>";
  outputRefArea.innerHTML += "Sequences from next level: <strong>" + (sequenceLength - correctSequencesAtCurrent - 2) + "<strong/><br/><br/>";
  outputRefArea.innerHTML += "beta = " + beta + "<br/>"
  outputRefArea.innerHTML += "gamma = " + gamma + "<br/>"
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
