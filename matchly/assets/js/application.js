(function (window, document, angular, undefined) {
  'use strict';
  var app, separator, selected, rules;
      separator = '__';
      selected = [];
      app = angular.module('matchly', ['ngAnimate', 'ui.bootstrap']);
      app.directive('widget', ['$rootScope',
        function ($rootScope) {
          return {
            restrict: 'E',
            replace: true,
            controller: 'GameCtrl',
            templateUrl: './app/views/widget.htm'
          };
        }
      ])
      app.directive('widgetHeader', ['$rootScope',
        function ($rootScope) {
          return {
            restrict: 'E',
            replace: true,
            templateUrl: './app/views/partials/header.htm'
          };
        }
      ])
      app.directive('widgetContent', ['$rootScope',
        function ($rootScope) {
          return {
            restrict: 'E',
            replace: true,
            templateUrl: './app/views/partials/content.htm',
          };
        }
      ])
      app.directive('widgetFooter', ['$rootScope',
        function ($rootScope) {
          return {
            restrict: 'E',
            replace: true,
            templateUrl: './app/views/partials/footer.htm'
          };
        }
      ])
      app.directive('gameboard', ['$rootScope',
        function ($rootScope) {
          return {
            restrict: 'E',
            replace: true,
            templateUrl: './app/views/partials/gameboard.htm'
          };
        }
      ])
      .directive('gamepiece', ['$rootScope', '$timeout',
        function ($rootScope, $timeout) {
          var prefix;
              prefix = 'cell-';
          return {
            restrict: 'EA',
            replace: true,
            templateUrl: './app/views/partials/gamepiece.htm',
            link: function ($scope, element, attrs) {
              var id, action;
              id = attrs.id.replace(prefix,'');
              if (selected.indexOf(id) !== -1) {
                element.children().addClass('active');
                action = function() {
                  var el = element;
                  return function() {
                    if ($rootScope.playing) {
                      el.children().removeClass('out');
                      if (!document.querySelectorAll('.cell.active.out').length) {
                        $rootScope.modal('winner!!!');
                        angular.element(document.querySelectorAll('.cell')).addClass('disabled');
                      }
                    }
                  }
                }();
              } else {
                action = function() {
                  return function() {
                    var el = element;
                    if ($rootScope.playing) {
                      angular.element(document.getElementById('main')).addClass('shake shake-crazy');
                      $timeout(function() {
                        $rootScope.modal('boohoo');
                        angular.element(document.getElementById('main')).removeClass('shake shake-crazy');
                      }, 500);
                    }
                  }
                }();
              }
              $scope.action = action;
            }
          };
        }
      ])
      .controller('ModalInstanceCtrl', function($scope, $modalInstance) {
        $scope.ok = $modalInstance.close;
      })
      .controller('GameCtrl', ['$window', '$scope', '$rootScope','$timeout', '$modal',
        function($window, $scope, $rootScope, $timeout, $modal) {
          var ang, ele;
              ang = $window.angular;
              ele = $window.angular.element;

          $rootScope.playing = false;

          $scope.levels = [
            {
              label: 'easy',
              rows: 5,
              cols: 5,
              level: 9,
              timeLimit: 5
            },
            {
              label: 'normal',
              rows: 10,
              cols: 10,
              level: 15,
              timeLimit: 8
            },
            {
              label: 'hard',
              rows: 15,
              cols: 15,
              level: 25,
              timeLimit: 8
            }
          ];

          $scope.reset = function() {

            $rootScope.winner = false;
            $rootScope.loser = false;
            $rootScope.playing = false;
            ele(document.querySelectorAll('.cell.active')).removeClass('active');
            ele(document.querySelector('.coverall')).addClass('out');
          };

          $scope.makeGameBoard = function() {
            var grid, row, col, i, timeLimit, level;
                  grid = [];
                  col = 0;
                  selected = [];
                  level = $scope.currentLevel;
                  timeLimit = level.timeLimit;

            $scope.reset();
            while (col < level.cols) {
              i = 0;
              row = [];
              while (i < level.rows) {
                makeRandomCell(i, col, level.rows, level.cols);
                row.push({cell: col.toString() + i.toString()});
                i++;
              }
              grid.push(row);
              col++;
            }

            $rootScope.grid = grid;
            $rootScope.play();
          };

          $rootScope.play = function() {
            $scope.reset();
            $scope.intID && $window.clearInterval($scope.intID);
            $rootScope.timer = $scope.currentLevel.timeLimit;
            timer($scope.currentLevel.timeLimit);
          };

          function timer(timeLimit) {
            var base;
                base = Date.now();
                $scope.intID = setInterval(function() {
                  var delta;
                      delta = Math.floor(Date.now() - base) / 1000;

                  $rootScope.timer = timeLimit - parseInt(delta, null);
                  $scope.$apply();
                  if (delta > timeLimit) {
                    $scope.playing = true;
                    $window.clearInterval($scope.intID);
                    $timeout(function () {
                      return ele(document.querySelectorAll('.cell.active')).addClass('out');
                    });
                  }
                }, 800);
          }

          $scope.changeLevel = function($index) {
            $rootScope.playing = false;
            $scope.currentLevel = $index ? $scope.levels[$index] : $scope.levels[0];
            $rootScope.timer = $scope.currentLevel.timeLimit;
          };

          $scope.$watch('currentLevel', function() {
            $scope.makeGameBoard();
          });

          $scope.currentLevel = $scope.levels[0];
          $rootScope.timer = $scope.currentLevel.timeLimit;

          function makeRandomCell(x, y, rows, cols) {
              var cell;

              if (selected.length < $scope.currentLevel.level) {
                cell = randomGridId(rows-1, cols-1);
                if (selected.indexOf(cell) === -1) {
                  selected.push(cell);
                  return cell;
                }
              }
              return false;
            }
            function randomGridId(rows, cols) {
              return rand(rows) + separator + rand(cols);
            }
            function rand(max) {
              return Math.floor((Math.random() * max) + 1).toString();
            }

            $rootScope.modal = function (state) {
              var modalInstance;

                  modalInstance = $modal.open({
                    animation: false,
                    templateUrl: './app/views/partials/modal.htm',
                    controller: 'ModalInstanceCtrl',
                    resolve: {
                      state: function () {
                        $scope.state = state;
                        return;
                      }
                    }
                  });

              modalInstance.result.then(function () {
                $scope.reset();
                $scope.makeGameBoard();
                $rootScope.play();
              }, function () {

              });
            };
          }
      ]);
}(window, document, angular, undefined))