(function (ng) {
  class Gameboard {
    constructor() {
      this.separator = '__';
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

  let gameboard, scope;
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
    constructor(Gameboard, $interval, $timeout) {
      gameboard = Gameboard;
      Object.assign(this, defaults);
      this.currentLevel = this.levels[0];
      this.changeLevel();
      this.$interval = $interval;
      this.$timeout = $timeout;
    }
    reset() {
      Object.keys.forEach(k => delete this[k]);
    }
    changeLevel() {
      this.playing = false;
      this.winner = false;
      this.timer = this.currentLevel.timeLimit;
      gameboard.render(this.currentLevel);
    }
    play() {
      this.playing = true;
      this.intID && this.$interval.cancel(self.intID);
      this.timer = this.currentLevel.timeLimit;
      this.countdown(this.currentLevel.timeLimit);
      gameboard.selected.forEach(k => {
        const el = angular.element(document.querySelector(`#cell-${k}`));
        el.addClass('active');
      });
    }
    countdown(timeLimit) {
      const self = this;
      const base = Date.now();
      this.intID = self.$interval(function () {
        var delta;
            delta = Math.floor(Date.now() - base) / 1000;

        self.timer = timeLimit - parseInt(delta, null);
        if (delta > timeLimit) {
          self.playing = true;
          self.$interval.cancel(self.intID);
          ng.element(document.querySelectorAll('.cell.active')).addClass('out');
        }
      }, 800);
    }
  }
  ng.module('matchly')
    .service('PlayService', PlayService)
    .service('Gameboard', Gameboard);
}(angular));
