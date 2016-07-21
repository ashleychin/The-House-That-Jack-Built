// JavaScript Document
var sfs = null;
var LOBBY_ROOM_NAME = "The Lobby";
var gameManager;
var me_susr;

function init() {
    //Display the correct screen
    uiSwitchScreen("login_screen");
    // enable UI buttons
    $("#login_btn").click(onLoginBtClick);
    $("#clearDebug_btn").click(uiClearLog);
    $("#send_btn").click(onSendPublicMessageBtClick);
    $("#playGame_btn").click(onPlayGameBtClick);
    $("#goBack_btn").click(onGoBackBtClick);
    $("#quit_btn").click(onQuitBtClick);
    sfsConnect();   
} // end of init()


