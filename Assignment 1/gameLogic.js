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
let userInputSequence = [];
let failedLastSequence = false;
let sequenceLength = 4;
let sequence;
let correctSequencesAtCurrent = 0;

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
      }
      else {
        correctSequencesAtCurrent++;
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
    let colours = ["blue","green","yellow","red"];
    let colourIndex;
    sequence = [];
    for (let i = 0; i < sequenceLength; i++)
    {
      colourIndex = Math.ceil(Math.random()*4) - 1;
      sequence.push(colours[colourIndex]);
    }

    // Example return statement.
    console.log(sequence);
    userInputSequence = [];
    updateDisplay();
    return sequence;
}


/*
 * This callback function is called when the sequence to display to the user
 * has finished displaying and user is now able to click buttons again.
*/
function sequenceHasDisplayed()
{
    updateDisplay();
    displayToastMessage("Enter the sequence.");
    // Include your own code here
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
    // Include your own code here
}

// You may need to write toher functions.
function updateDisplay() {
  let outputRefArea = document.getElementById("output");
  outputRefArea.innerHTML = "Button Presses Remaining: <strong>" + buttonPressesRemaining + "<strong/><br/>";
  outputRefArea.innerHTML += "Current Sequence Length: <strong>" + sequenceLength + "<strong/><br/>";
  outputRefArea.innerHTML += "Correct Sequences at Current Level: <strong>" + correctSequencesAtCurrent + "<strong/><br/>";
  outputRefArea.innerHTML += "Sequences from next level: <strong>" + (sequenceLength - correctSequencesAtCurrent - 2) + "<strong/><br/><br/>";
  if (playingState === 2) {
    outputRefArea.innerHTML += "<strong><h5>Watch Current Sequence!<strong/><h5/>";
  } else if (playingState === 3) {
    outputRefArea.innerHTML += "<strong><h5>Enter the Sequence!<strong/><h5/>"
  } else {
    outputRefArea.innerHTML += "<strong><h5>Start a New Game!<strong/><h5/>"
  }
}
