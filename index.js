const crypto = require('crypto');

class MovesTable {
  constructor(moves) {
    this.moves = moves;
    this.table = this.generateTable();
  }

  generateTable() {
    const N = this.moves.length;
    const table = new Array(N + 1).fill(null).map(() => new Array(N + 1));
    for (let i = 0; i < N; i++) {
      table[0][i + 1] = this.moves[i];
      table[i + 1][0] = this.moves[i];
    }
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const result = this.compareMoves(this.moves[i], this.moves[j]);
        table[i + 1][j + 1] =
          result === 0 ? 'Draw' : result === 1 ? 'Win' : 'Lose';
      }
    }
    return table;
  }

  compareMoves(move1, move2) {
    const N = this.moves.length;
    const halfN = Math.floor(N / 2);

    const startIndex = this.moves.indexOf(move1);
    const endIndex = (startIndex + halfN) % N;
    const clockwiseWins = new Set();

    for (let i = 0; i < halfN; i++) {
      clockwiseWins.add((startIndex + i) % N);
    }

    const move2Index = this.moves.indexOf(move2);

    if (startIndex === move2Index) {
      return 0;
    } else if (clockwiseWins.has(move2Index)) {
      return 1;
    } else {
      return -1;
    }
  }

  displayTable() {
    const header = '  ' + this.table[0].join('  ');
    const separator = '-'.repeat(header.length);
    console.log(header);
    console.log(separator);
    for (let i = 1; i <= this.moves.length; i++) {
      const row = `${this.table[i][0]} | ${this.table[i].join('  ')}`;
      console.log(row);
    }
  }
}

class Game {
  constructor(moves) {
    this.moves = moves;
    this.table = new MovesTable(this.moves);
    this.key = this.generateKey();
  }

  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  computeMove() {
    const randomIndex = Math.floor(Math.random() * this.moves.length);
    return this.moves[randomIndex];
  }

  calculateHMAC(message) {
    const hmac = crypto.createHmac('sha256', this.key);
    hmac.update(message);
    return hmac.digest('hex');
  }

  displayMovesMenu() {
    console.log('Available moves:');
    for (let i = 0; i < this.moves.length; i++) {
      console.log(`${i + 1} - ${this.moves[i]}`);
    }
    console.log('0 - exit');
    console.log('? - help');
  }

  determineWinner(player, computer) {
    if (player === computer) {
      return 'Draw!';
    } else if (computer === 'Rock') {
      const playerWins = player === 'Paper';
      return playerWins ? 'You Win!' : 'You Lose!';
    } else if (computer === 'Paper') {
      const playerWins = player === 'Scissors';
      return playerWins ? 'You Win!' : 'You Lose!';
    } else if (computer === 'Scissors') {
      const playerWins = player === 'Rock';
      return playerWins ? 'You Win!' : 'You Lose!';
    }
  }

  play() {
    console.log(`HMAC: ${this.calculateHMAC(this.computeMove())}`);
    this.displayMovesMenu();
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter your move: ', (answer) => {
      if (answer === '?') {
        this.table.displayTable();
        rl.close();
        return;
      }

      const moveIndex = parseInt(answer, 10);
      if (isNaN(moveIndex) || moveIndex < 0 || moveIndex > this.moves.length) {
        console.log('Invalid input! Please enter a valid move.');
        this.play();
      } else if (moveIndex === 0) {
        console.log('Exiting the game.');
        rl.close();
      } else {
        const userMove = this.moves[moveIndex - 1];
        const computerMove = this.computeMove();
        console.log(`Your move: ${userMove}`);
        console.log(`Computer move: ${computerMove}`);
        const result = this.determineWinner(userMove, computerMove);
        console.log(result);
        console.log(`HMAC key: ${this.key}`);
        rl.close();
      }
    });
  }
}

const moves = ['Rock', 'Paper', 'Scissors'];
const game = new Game(moves);
game.play();
