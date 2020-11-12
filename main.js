const gameBoard = (() => {
  const board = [
    [[''], [''], ['']],
    [[''], [''], ['']],
    [[''], [''], ['']]
  ];

  const domElements = {
    controls: document.querySelector('.controls'),
    board: document.querySelector('#board'),
  }

  const resetBoard = () => {
    board[0] = [[''], [''], ['']];
    board[1] = [[''], [''], ['']];
    board[2] = [[''], [''], ['']];
    _clearCells();
  }

  const _clearCells = () => {
    let cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.childNodes.length > 0 ? cell.firstChild.remove() : null;
    });
  }

  const _createCell = (target, index) => {
    let cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.xy = `${index}`;
    target.appendChild(cell);
  }

  const getXY = (target) => {
    let dataIndex = target.dataset.xy.split(',');
    return dataIndex.map(num => parseInt(num));
  }

  const _renderMarker = (xy) => {
    let marker = document.createElement('div');
    marker.classList.add('marker');
    marker.textContent = board[xy[0]][xy[1]];
    //marker.style.transform = 'scale(32)';
    //marker.style.textShadow = '0px -11px 2px #000';
    _scaleEffect(marker);
    return marker;
  }

  const _scaleEffect = (target) => {
    setTimeout(() => {
      target.style.transform = 'scale(2)';
      target.style.textShadow = '0px 0px 0px #000';
    }, 0);
  }

  const displayCells = () => {
    board.forEach((row, indexX) => {
      row.forEach((cell, indexY) => {
        _createCell(domElements.board, [indexX, indexY]);
      })
    })
  }

  const updateCell = (target, playersMarker) => {
    let xy = getXY(target);

    if (board[xy[0]][xy[1]] == '') {
      board[xy[0]][xy[1]] = playersMarker;
    }
    return _renderMarker(xy);
  }

  return {
    board,
    domElements,
    getXY,
    displayCells,
    updateCell,
    resetBoard,
  }
})();


const PopupFactory = () => {

  const _createOverlay = () => {
    let overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.id = 'overlay';
    return overlay;
  }

  const _createPopup = () => {
    let popup = document.createElement('div');
    popup.classList.add('popup');
    popup.id = 'popup';
    return popup;
  }

  const _fadeCells = () => {
    gameBoard.domElements.board.childNodes.forEach(cell => {
      cell.style.transition = "opacity 3.3s";
      cell.classList.add('fade');
    });
  }

  const _unfadeCells = () => {
    gameBoard.domElements.board.childNodes.forEach(cell => {
      cell.style.transition = "background-color 0.5s ease-in-out";
      cell.classList.remove('fade');
    });
  }

  const displayPopup = (message) => {
    let overlay = _createOverlay();
    let popup = _createPopup();
    popup.textContent = message;
    overlay.appendChild(popup);
    gameBoard.domElements.board.appendChild(overlay);
    _fadeCells();
    overlay.classList.add('display');
    popup.classList.add('display');
  }

  const hidePopup = () => {
    gameBoard.domElements.board.lastChild.id == 'overlay'
      ? gameBoard.domElements.board.lastChild.remove() : null;
    _unfadeCells();
  }

  return {
    displayPopup,
    hidePopup
  }
}

const ButtonFactory = (id, text, actions) => {
  let state = true;

  const createButton = () => {
    let newButton = document.createElement('div');
    newButton.id = id;
    newButton.classList.add('btn');
    newButton.textContent = text;
    newButton.addEventListener('click', _toggleState);
    actions.forEach(action => newButton.addEventListener('click', action));
    return newButton;
  }

  const _toggleState = (e) => {
    state = !state;
    e.target.classList.toggle('on');
  }

  return {
    createButton,
  }
}

const PlayerFactory = (name, marker) => {

  const takeTurn = () => {
    //Pick random cell
    let x;
    let y;

    do {
      x = _getRandomNum(0, 2);
      y = _getRandomNum(0, 2);
    }
    // check if cell is legal
    while (gameBoard.board[x][y] != '');

    let cell = {
      target: document.querySelector(`[data-xy='${x},${y}']`)
    }

    return cell;
  }

  const _getRandomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  return { name, marker, takeTurn };
}

// Game Controller
const Game = (() => {
  const board = gameBoard.domElements.board;

  const players = {
    playerOne: PlayerFactory('Player One', 'x'),
    playerTwo: PlayerFactory('Player Two', 'o'),
    ai: true
  }

  let currentPlayer = players.playerOne;
  let popup = PopupFactory();

  const _makeMove = (e) => {
    if (e.target.childNodes.length == 0) {
      // Place marker on board
      e.target.appendChild(gameBoard.updateCell(e.target, currentPlayer.marker));
    }
    if (_checkForWin(e)) {
      popup.displayPopup(`${currentPlayer.name} wins!`);
    } else if (_gameDraw()) {
      popup.displayPopup("It's a draw!")
    } else {
      _changePlayer();
    }
  }

  const _checkForWin = (e) => {
    return _rowWin() || _columnWin(e) || _diagonalWin(e) ? true : false;
  }

  const _changePlayer = () => {
    if (currentPlayer === players.playerOne) {
      currentPlayer = players.playerTwo;
      if (players.ai) {
        setTimeout(() => {
          _makeMove(currentPlayer.takeTurn())
        }, 500);
      }
    } else {
      currentPlayer = players.playerOne;
    }

  }

  const _toggleAi = () => {
    players.ai = !players.ai;
  }

  const _rowWin = () => {
    let win = gameBoard.board.map(row => {
      return row.every(cell => cell == currentPlayer.marker) ? true : false;
    }).find(row => row == true);
    return win;
  }

  const _columnWin = (e) => {
    xy = gameBoard.getXY(e.target);
    let win = gameBoard.board.every(row => row[xy[1]] == currentPlayer.marker);
    return win ? true : null;
  }


  const _diagonalWin = (e) => {
    xy = gameBoard.getXY(e.target);

    if (xy[0] == 0 && xy[1] == 0 || xy[0] == 2 && xy[1] == 2 || xy[0] == 1 && xy[1] == 1) {
      let leftToRight = [
        gameBoard.board[0][0],
        gameBoard.board[1][1],
        gameBoard.board[2][2]
      ];
      return leftToRight.every(cell => cell == currentPlayer.marker);

    } else if (xy[0] == 0 && xy[1] == 2 || xy[0] == 2 && xy[1] == 0 || xy[0] == 1 && xy[1] == 1) {
      let rightToLeft = [
        gameBoard.board[0][2],
        gameBoard.board[1][1],
        gameBoard.board[2][0]
      ];
      return rightToLeft.every(cell => cell == currentPlayer.marker);
    }
  }


  const _gameDraw = () => {
    let draw = gameBoard.board.every(row => row.every(cell => {
      return cell == 'x' || cell == 'o';
    }))
    return draw;
  }

  const _init = (() => {
    let newGameBtn = ButtonFactory('new-game-btn', 'New Game', [gameBoard.resetBoard, popup.hidePopup]);
    let aiBtn = ButtonFactory('ai-btn', 'A.I', [_toggleAi, gameBoard.resetBoard, popup.hidePopup]);
    gameBoard.domElements.controls.appendChild(newGameBtn.createButton());
    gameBoard.domElements.controls.appendChild(aiBtn.createButton());
    board.addEventListener('click', _makeMove);
    gameBoard.displayCells();
  })();

  return {}
})();