var _joinCallback=null;

function sfsConnect() {
    uiTrace("Application started");
    // Create configuration object
    var config = {};
    config.host = "127.0.0.1";
    config.port = 8888;
    config.zone = "BasicExamples";
    config.debug = true;
    // Create SmartFox client instance
    sfs = new SmartFox(config);
    // Add default event listeners
    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, onConnection, this);
    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost, this);

    sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, onLoginError, this);
    sfs.addEventListener(SFS2X.SFSEvent.LOGIN, onLogin, this);

    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, onRoomJoinError, this);
    sfs.addEventListener(SFS2X.SFSEvent.ROOM_ADD, onRoomCreated, this);

    sfs.addEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, onPublicMessage, this)
    // Connect to SFS
    // As no parameters are passed, the config object is used
    sfs.connect();
} // end of sfsConnect()

//------------------------------------
// Request Wrapers
//------------------------------------

function sfsCreateAndJoinRoom(name_str, joinCallback) {
    if (_joinCallback !== null) {
        sfs.removeEventListener(SFS2X.SFSEvent.ROOM_JOIN, _joinCallback);
    }
    _joinCallback= joinCallback || onRoomJoin;
     sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, joinCallback, this);
    var settings = new  SFS2X.Requests.RoomSettings(name_str);
    settings.maxUsers = 2;
    sfs.send(new SFS2X.Requests.System.CreateRoomRequest(settings, true));
} // end of sfsCreateAndJoinRoom()

function sfsJoinRoom(roomName_str, joinCallback) {
    if (_joinCallback !== null) {
        sfs.removeEventListener(SFS2X.SFSEvent.ROOM_JOIN, _joinCallback);
    }
    _joinCallback= joinCallback || onRoomJoin;
    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, _joinCallback, this);
    if (sfs.lastJoinedRoom === null || sfs.lastJoinedRoom.name != roomName_str) {
        sfs.send(new SFS2X.Requests.System.JoinRoomRequest(roomName_str));
    }
} //end of sfsJoinRoom()

function sfsJoinLobbyRoom() {
    if (_joinCallback !== null) {
        sfs.removeEventListener(SFS2X.SFSEvent.ROOM_JOIN, _joinCallback);
    }
    _joinCallback = onRoomJoin;
    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, _joinCallback , this);
    if (sfs.lastJoinedRoom === null || sfs.lastJoinedRoom.name != LOBBY_ROOM_NAME) {
        sfs.send(new SFS2X.Requests.System.JoinRoomRequest(LOBBY_ROOM_NAME));
    }
} //end of sfsJoinRoom()


//------------------------------------
// Default SFS EVENT HANDLERS
//------------------------------------

function onConnection(event) {
    if (event.success) {
        uiTrace("Connected to SmartFoxServer 2X!");
    } else {
        var error = "Connection failed: " + (event.errorMessage ? event.errorMessage + " (code " + event.errorCode + ")" : "Check that the server is running and websockets are enabled");
        uiTrace(error);
    }
} // end of onConnection()

function onConnectionLost(event) {
    // Reset view
    uiSwitchScreen("login");
    // Show disconnection reason
    if (event.reason != SFS2X.Utils.ClientDisconnectionReason.MANUAL && event.reason != SFS2X.Utils.ClientDisconnectionReason.UNKNOWN) {
        var error = "You have been disconnected; reason is: " + event.reason;
        uiTrace(error);
    } else {
        uiTrace("You have been disconnected; reason is: " + event.reason);
    }
} // end of onConnectionLost()

function onLoginError(event) {
    // Show error
    var error = "Login error: " + event.errorMessage + " (code " + event.errorCode + ")";
    uiTrace(error);
    // re-enable the login button
    uiEnableButton("#login_btn", true);
} // end of onLoginError()

function onLogin(event) {
    uiTrace("Login successful!" +
        "\n\tZone: " + event.zone +
        "\n\tUser: " + event.user +
        "\n\tData: " + event.data);
    // Join lobby room
    sfsJoinRoom(LOBBY_ROOM_NAME);
    // Initalise the game manager
    gameManager = new GameManager(sfs, LOBBY_ROOM_NAME, event.user);
} // end of onLogin()



function onLogout(event) {
    uiTrace("Logout from zone " + event.zone + " performed!");
    // Switch to LOGIN view
    uiSwitchScreen("login-screen");
}

function onRoomJoinError(event) {
    uiTrace("Room join error: " + event.errorMessage + " (code: " + event.errorCode + ")");
}

function onRoomJoin(event) {
    uiTrace("Room joined: " + event.room);  
    // Switch view
    if (event.room.name == LOBBY_ROOM_NAME) {
        uiSwitchScreen("lobby-screen");
    } 
} // end of onRoomJoin()

function onRoomCreated(evtParams) {
    uiTrace("Room created: " + evtParams.room);
}

function onRoomCreationError(evtParams) {
    uiTrace("Room creation failed: " + evtParams.errorMessage);
}

function onPublicMessage(event) {
    var sender = (event.sender.isItMe ? "You" : event.sender.name);
    uiWriteToChat("<b>" + sender + " said:</b><br/>" + event.message);
}