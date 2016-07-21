Board = function (myGame, isMyTurn_bool) {
    // tile indexes used to change the tile/appearance on the board
    var EMPTY = 1;
    var CROSS = 2;
    var NOUGHT = 3;

    //Constants used for status messages
    var MESSAGE_MYTURN = "Your turn";
    var MESSAGE_OPPONENTSTURN = "Opponents Turn";
    var MESSAGE_PLAYERLEFT = "The other player ran away - You Win";
    var MESSAGE_WON = "You Won!";
    var MESSAGE_LOST = "You lost, the other player won";
    var MESSAGE_DRAW = "The game is a draw";

    var _isMyTurn_bool = isMyTurn_bool;
    var _myGame = myGame;
    var _map;
    var _tileLayer;
    var _myMark;
    var _numMoves = 0;
    var _inPlay_bool = true;

    var _click = function (pointer, event) {
        
        /* pointer.y sometimes reports incorrectly on 
         * first click 
         */
        var xPos = event.layerX;
        var yPos = event.layerY;
        //console.log("click");
        //console.log(event);

        var move_obj = {
            typr_str: "Click",
            mark: _myMark,
            xPos: xPos,
            yPos: yPos
        };
        if (_map.getTileWorldXY(xPos, yPos).index === EMPTY && _isMyTurn_bool && _inPlay_bool) {
            this.updateTile(move_obj);
            _myGame.sendMove(move_obj);
        }
    }; // end of _click()

    var _checkWin = function () {
        // Check for winning combination
        var row = 0;
        var col = 0;
        var winner_bool = false;
        // check horizonal
        console.log(_tileLayer);
        while (row < _tileLayer.data.length && !winner_bool) {
            winner_bool = (_tileLayer.data[row][0].index !== EMPTY && _tileLayer.data[row][0].index === _tileLayer.data[row][1].index && _tileLayer.data[row][1].index === _tileLayer.data[row][2].index);
            row++;
        }
        //check vertical
        while (col < _tileLayer.data[0].length && !winner_bool) {
            winner_bool = (_tileLayer.data[0][col].index !== EMPTY && _tileLayer.data[0][col].index === _tileLayer.data[1][col].index && _tileLayer.data[1][col].index === _tileLayer.data[2][col].index);
            col++;
        }
        // check diagonal l to r
        if (!winner_bool) {
            winner_bool = (_tileLayer.data[0][0].index !== EMPTY && _tileLayer.data[0][0].index === _tileLayer.data[1][1].index && _tileLayer.data[1][1].index === _tileLayer.data[2][2].index);
        }
        // check diagonal r tol
        if (!winner_bool) {
            winner_bool = (_tileLayer.data[0][2].index !== EMPTY && _tileLayer.data[0][2].index === _tileLayer.data[1][1].index && _tileLayer.data[1][1].index === _tileLayer.data[2][0].index);
        }
        return (winner_bool);
    }; // end of _checkWin()

    this.updateTile = function (move_obj) {
        uiTrace("update tile, xPos, yPos: " + move_obj.xPos + " " + +move_obj.yPos);
        _map.putTileWorldXY(move_obj.mark, move_obj.xPos, move_obj.yPos, _myGame.getTileWidth(), _myGame.getTileWidth());
        _numMoves++;
        // check for win/lose/draw
        if (_checkWin()) {
            _inPlay_bool = false;
            if (_isMyTurn_bool) {
                uiStatusMsg(MESSAGE_WON);
            } else {
                uiStatusMsg(MESSAGE_LOST);
            }
        } else {
            uiTrace(" numMoves : " + _numMoves);
            if (_numMoves === 9) {
                _inPlay_bool = false;
                uiStatusMsg(MESSAGE_DRAW);
            } else {
                _isMyTurn_bool = !_isMyTurn_bool;
                _isMyTurn_bool ? uiStatusMsg(MESSAGE_MYTURN) : uiStatusMsg(MESSAGE_OPPONENTSTURN);
            }
        }
    }; // end of updateTile()

    // respond to the other player leaving ths game/room
    this.opponentLeft = function () {
        // If the game is in play, tell this player
        if (_inPlay_bool) {
            _inPlay_bool = false;
            uiStatusMsg(MESSAGE_PLAYERLEFT);
        }
    }; // end of opponentLeft()

    // setup the board ready for a new game
    this.setUp = function (isMyTurn_bool) {
        var row, col;
        uiTrace("into Board:setUp");
        _isMyTurn_bool = isMyTurn_bool;
        _myMark = _isMyTurn_bool ? CROSS : NOUGHT;
        _isMyTurn_bool ? uiStatusMsg(MESSAGE_MYTURN) : uiStatusMsg(MESSAGE_OPPONENTSTURN);
        _inPlay_bool = true;
        // Clear the board
        for (row = 0; row < _map.height; row++) {
            for (col = 0; col < _map.width; col++) {
                _map.putTile(EMPTY, col, row);
            }
        }
        _numMoves = 0;
    }; // end of setUp()

    /* MAIN CONSTRUCTOR CODE */

    // Initialise the tilemap
    _map = _myGame.game_psr.add.tilemap('boardLevel');
    _map.addTilesetImage('gameTiles', 'gameTiles_img');
    // set up the tilemap layers
    _map.createLayer('boardLayer');
    _tileLayer = _map.layers[_map.currentLayer];
    _myGame.game_psr.input.onDown.add(_click, this);
    this.setUp(_isMyTurn_bool);
}; // end of Board()