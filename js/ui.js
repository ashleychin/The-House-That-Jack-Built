//------------------------------------
//ui Functions
//------------------------------------

function uiTrace(msg_str) {
    var newHTML = "<p>" + msg_str + "<p>" + $("#debugMessages").html();
    $("#debugMessages").html(newHTML);
} // end of uiTrace()

function uiStatusMsg(msg_str) {
    var newHTML = "<p>" + msg_str + "<p>";
    $("#statusMessage").html(newHTML);
} // end of uiTrace()


function uiClearLog() {
    $("#debugMessages").html("");
} // end of uiClearLog()

function uiEnableButton(id, doEnable) {
    $(id).prop('disabled', !doEnable);
}

function uiWriteToChat(msg_str) {
    var newHTML = "<p>" + msg_str + "<p>" + $("#chat-box").html();
    $("#chat-box").html(newHTML);
} // end of uiWriteToChat()

function uiClearChat() {
    $("#chat-box").html("");
} // end of uiClearCaht()

function uiSwitchScreen(screenId) {
    if ($("#" + screenId).length <= 0) {
        return;
    }

    $('.screen').each(function (index) {
        if ($(this).attr("id") === screenId) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
} //end of uiSwitchScreen()

//------------------------------------
// BUTTON EVENT HANDLERS
//------------------------------------
function onLoginBtClick() {
    // Perform login
    var uName = $("#login_txt").val();
    if (uName !== "") {
        var isSent = sfs.send(new SFS2X.Requests.System.LoginRequest(uName));
        if (isSent) {
            // Disable login button
            uiEnableButton("#login_btn", false);
        }
    }
} // end of onLoginBtClick()


/*
 * Public message send button click handler.
 * Send a public message, which will be displayed in the chat area (see onPublicMessage event).
 */
function onSendPublicMessageBtClick(event) {
    var msg_str = $("#msg_txt").val();
    if (msg_str !== "") {
        var isSent = sfs.send(new SFS2X.Requests.System.PublicMessageRequest(msg_str));
        if (isSent){
            $("#msg_txt").val("");
        }
    }
}

function onPlayGameBtClick(event) {
    uiTrace(" Into PlayGameBtClick");
    gameManager.findGameRoom();
} // end of onPlayGameBtClick()

function onGoBackBtClick(event) {
    uiTrace(" Into goBackBtClick");
} // end of onGoBackBtClick()

function onQuitBtClick(event) {
    uiTrace(" Into QuitBtClick");
     // force the user to leave the game room
    sfs.send(new SFS2X.Requests.System.LeaveRoomRequest());
    gameManager.quitGame();
} // end of onPlayGameBtClick()