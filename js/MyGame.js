function MyGame(sfs, targetDiv_str, gameManager) {
    uiTrace("into MyGame");
    var ROWS = 3;
    var COLUMNS = 3;
    var TILEWIDTH = 75;
    var _gameManager = gameManager;
    var _sfs = sfs;
    var _self = this;
    var _board;

    var _onObjectMessage = function (evt) {
        uiTrace("MyGame - into _onObjectMessage " + evt);
        var data_obj = evt.message;
        var sender = evt.sender;
        _board.updateTile(data_obj);
    }; //end of _onObjectMessage()

    this.preload = function () {
        this.game.load.tilemap('boardLevel', 'assets/board.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('gameTiles_img', 'assets/tiles.png');
        // force pahser to redraw when the browser hasnt got focus
        this.game.stage.disableVisibilityChange = true;
    }; //preload();

    this.create = function () {
        uiTrace("making a board");
        // use _self here becuase, this would refer to the phaser state objects
        _board = new Board(_self, _gameManager.getGameMaster());
    }; // create()

    /*this.update = function () {
    if (this.game.input.activePointer.isDown) {
       /_board.click();
    }
}; //end of update() */



    this.reset = function () {
        // intialise the game, required incase we
        // need to reuse this board
        uiTrace("into MyGame.reset: " + gameManager.getGameMaster());
        _board.setUp(_gameManager.getGameMaster());
    }; // create()

    this.opponentLeft = function () {
        // Deal with a player leaving
        uiTrace("into MyGame.opponentLeft");
        _board.opponentLeft();
    }; // end of  opponentLeft()

    this.sendMove = function (move_obj) {
        // Deal with a player leaving
        uiTrace("into MyGame:sendMove");
        _sfs.send(new SFS2X.Requests.System.ObjectMessageRequest(move_obj));
    }; // sendMove()

    this.getTileWidth = function () {
        return (TILEWIDTH);
    };
    
    /* CONSTRUCTOR CODE */

    // listen for smartFox object messages - these will be moves
    _sfs.addEventListener(SFS2X.SFSEvent.OBJECT_MESSAGE, _onObjectMessage, this);

    // create the phaser game object
    this.game_psr = this.game_psr || new Phaser.Game(COLUMNS * TILEWIDTH, ROWS * TILEWIDTH,                                                             Phaser.AUTO, targetDiv_str, {
        preload: this.preload,
        create: this.create
            //update:this.update
    });

} // end of MyGame Constructor()