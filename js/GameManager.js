var GameManager = function (sfs, lobbyName_str, me_susr) {
        "use strict";
        // Private variables and methods
        var MAXPLAYERS = 2;
        var MINPLAYERS = 2;

        // Game States
        var HOLDING_STATE = 1;
        var INGAME_STATE = 2;
        var OPPONENTLEFT_STATE = 3;
        var LEAVING_STATE = 4;

        // useful stuff
        var _sfs = sfs;
        var _lobbyName_str = lobbyName_str;
        var _room;
        var _state;
        var _gameMaster_bool = false; //set to true if you are the first person into the game room
        var _me_susr = me_susr;
        var _self = this;

        var _game;

        /*
         * _onUserCountChangeEvent:  Called when a user enters or 
         * leaves the game room.  Checks and updates the current 
         * state
         */
        var _onUserCountChangeEvent = function (evt) {
            uiTrace("GameManager - Into _onUserCountChangeEvent");
            var numUsersInTheRoom = _room.getUserCount();
            uiTrace("GameManager: number of users in the room " + numUsersInTheRoom);
            // respond depending of current state
            uiTrace("GameManager - Current State: " + _state);
            switch (_state) {
            case HOLDING_STATE:
                // move to INGAME state
                if (numUsersInTheRoom == MINPLAYERS) {
                    _self.setState(INGAME_STATE);
                }
                break;
            case OPPONENTLEFT_STATE:
                // Nothing to do
                break;
            case INGAME_STATE:
                if (numUsersInTheRoom < MINPLAYERS) {
                    _self.setState(OPPONENTLEFT_STATE);
                }
                break;
            default:
                uiTrace("GameManager:_onUserCountChangeEvent  - State - Shouldn't see this");
            }
        }; //end of _onUserCountChangeEvent()

        /*
         * _onJoinGameRoom:  Called as a result of a smartFox
         * joinRoomEvent
         */
        var _onJoinGameRoom = function (evt) {
            uiTrace("GameManager - into _onJoinGameRoom " + evt.room);
            // remember which room we are in
            _room = evt.room;
            _gameMaster_bool = _room.getUserCount() == 1;
            _self.setState(HOLDING_STATE);
        }; // end of _onJoinGameRoom()


        // Public methods

        /*
         * setState: Sets the state of the game to state
         */
        this.setState = function (state) {
            _state = state;
            switch (_state) {
            case HOLDING_STATE:
                uiTrace("GameManager:setState - Hold");
                //listen for a user entering the current room
                _sfs.addEventListener(SFS2X.SFSEvent.USER_COUNT_CHANGE, _onUserCountChangeEvent, this);
                uiSwitchScreen("holding-screen");
                break;
            case INGAME_STATE:
                uiTrace("GameManager:setState - InGame");
                // if necessary create a new phaser game
                if (_game === undefined) {
                    _game = new MyGame(_sfs, "game-container", this);
                } else {
                    _game.reset();
                }
                uiSwitchScreen("game-screen");
                break;
            case OPPONENTLEFT_STATE:
                uiTrace("GameManager:setState - OPPONENT LEFT");
                // force the me to leave the current room - this doesnt affect the screen
                sfs.send(new SFS2X.Requests.System.LeaveRoomRequest());
                _game.opponentLeft();
                break;
            case LEAVING_STATE:
                uiTrace("GameManager:setState - I am LEAVING");
                // clean up
                sfs.removeEventListener(SFS2X.SFSEvent.USER_COUNT_CHANGE, _onUserCountChangeEvent);
                sfsJoinRoom(LOBBY_ROOM_NAME);;
                uiSwitchScreen("lobby-screen");
                break;
            default:
                uiTrace("GameManager:setState - Shouldn't see this");
            }
        }; //end of setState()

    this.findGameRoom = function () {
        uiTrace("GameManager - into findGameRoom ");
         // force the user to leave the current room
    sfs.send(new SFS2X.Requests.System.LeaveRoomRequest());
        // look for a room that isn't full in the current 
        // Group
        var room_ary = _sfs.getRoomList();
        var room_srm;
        // Check the number of users in each room
        var roomFound_bool = false;
        // loop through all the rooms and check 
        // whether a room can take this player
        for (var i = 0; i < room_ary.length && !roomFound_bool; ++i) {
            room_srm = room_ary[i];
            roomFound_bool = (room_srm.getUserCount() < MAXPLAYERS) && (room_srm.name !== _lobbyName_str);
        } // end of loop
        if (roomFound_bool) {
            // join the room
            sfsJoinRoom(room_srm.name, _onJoinGameRoom);
        } else {
            // Create a new room name
            // note this is a hack... could generate an exisitng room name
            var roomName_str = _me_susr.name + Math.round(Math.random() * 10000);
            // create and join the room
            sfsCreateAndJoinRoom(roomName_str, _onJoinGameRoom);
        }
    }; //end of findGameRoom()

    this.getGameMaster = function () {
        return (_gameMaster_bool);
    }; //end of getGameMaster

    this.quitGame = function () {
        uiTrace("Into GameManager:quitGame");
        this.setState(LEAVING_STATE);
    }; //end of quitGame()  

    uiTrace("GameManager - into Constructor " + _lobbyName_str);
}; // end of GameManager()