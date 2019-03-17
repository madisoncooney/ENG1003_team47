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
function buttonSelected(whichButton)
{
    // Include your own code here
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
    // Include your own code here

    // Example return statement.
    return ["blue","blue","blue"];
}


/*
 * This callback function is called when the sequence to display to the user
 * has finished displaying and user is now able to click buttons again.
*/
function sequenceHasDisplayed()
{
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
