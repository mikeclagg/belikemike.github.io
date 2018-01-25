(function (ng) {
  class Gameboard {
    constructor() {
      this.separator = '__';
      this.selected = [];
    }
    render(level) {
      var col, i, row, grid;

      col = 0;
      i = 0;
      row = [];
      grid = [];
      this.selected = [];
      this.currentLevel = level;

      while (i < level.rows && col < level.cols) {
        this.makeRandomCell(i, col, level.rows, level.cols);
        row.push({cell: col.toString() + i.toString()});
        i++;
        if (i === level.rows) {
          grid.push(row);
          col++;
          row = [];
          i = 0;
        }
      }

      this.gridLayout = grid;
    }
    makeRandomCell(x, y, rows, cols) {
      var cell;

      if (this.selected.length < this.currentLevel.level) {
        cell = this.randomGridId(rows-1, cols-1);
        if (this.selected.indexOf(cell) === -1) {
          this.selected.push(cell);
          return cell;
        }
      }
      return false;
    }
    randomGridId(rows, cols) {
      return this.rand(rows) + this.separator + this.rand(cols);
    }
    rand(max) {
      return Math.floor((Math.random() * max) + 1).toString();
    }
  }

  const defaults = {
    timer: 0,
    playing: false,
    levels: [
      { label: 'easy', rows: 5, cols: 5, level: 9, timeLimit: 5 },
      { label: 'normal', rows: 10, cols: 10, level: 15, timeLimit: 8 },
      { label: 'hard', rows: 15, cols: 15, level: 25, timeLimit: 8 }
    ]
  };

  class PlayService {
    constructor(Gameboard, $interval) {
      this.selector = 'active';
      Object.assign(this, defaults, { Gameboard, $interval });
      this.currentLevel = this.levels[0];
      this.changeLevel();
    }
    reset() {
      this.playing = false;
      this.winner = false;
      this.toggleHighlight(this.selector, 'removeClass', this.selector);
      this.intID && interval.cancel(self.intID);
      this.timer = this.currentLevel.timeLimit;
    }
    toggleHighlight(selector, method, className) {
      this.Gameboard.selected.forEach(k => {
        const domSelect = selector ? '.' + selector : '#cell-' + k;
        const activeSquares = document.querySelectorAll(domSelect);
        ng.element(activeSquares)[method](className);
      });
    }
    changeLevel() {
      this.reset();
      this.timer = this.currentLevel.timeLimit;
      this.Gameboard.render(this.currentLevel);
    }
    play() {
      this.reset();
      this.toggleHighlight(false, 'addClass', 'active');
      this.playing = true;
      this.countdown(this.currentLevel.timeLimit);
    }
    countdown(timeLimit) {
      const self = this;
      const base = Date.now();

      this.intID = self.$interval(() => {
        var delta;
            delta = Math.floor(Date.now() - base) / 1000;

        self.timer = timeLimit - parseInt(delta, null);
        if (delta > timeLimit) {
          self.playing = true;
          self.$interval.cancel(self.intID);
          const activeSquares = document.querySelectorAll('.'+this.selector+' .cell');
          ng.element(activeSquares).addClass('out');
        }
      }, 800);
    }
  }
  ng.module('matchly')
    .service('PlayService', PlayService)
    .service('Gameboard', Gameboard);
}(angular));
