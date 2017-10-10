(function (window, document, angular, undefined) {
  'use strict';
  var app, selected, rules, _cmpnt, vm;
      selected = [];
      app = angular.module('matchly', []);

      app.directive('gameboard', function ($rootScope, Gameboard, PlayService) {
          return {
            restrict: 'E',
            templateUrl: './app/views/partials/gameboard.htm',
            link: function ($scope) {
              $scope.Gameboard = Gameboard;
              $scope.PlayService = PlayService;
            }
          };
        }
      )
      .directive('gamepiece', function ($timeout, PlayService, Gameboard) {
          var prefix = 'cell-';
          return {
            restrict: 'EA',
            templateUrl: './app/views/partials/gamepiece.htm',
            link: function ($scope, element, attrs) {
              var id, action, current;
              id = attrs.id.replace(prefix,'');
              $scope.Gameboard = Gameboard;
              current = Gameboard.selected.indexOf(id);
              $scope.action = function() {
                return function() {
                  if (PlayService.playing) {
                    if (current > -1) {
                      element.children().children().removeClass('out');
                      if (!document.querySelectorAll('.cell.active.out').length) {
                        angular.element(document.querySelectorAll('.cell')).addClass('disabled');
                        PlayService.winner = true;
                        PlayService.playing = false;
                      }
                      Gameboard.selected.splice(current, 1);
                    } else {
                      angular.element(document.getElementById('main')).addClass('shake shake-crazy');
                      $timeout(function() {
                        angular.element(document.getElementById('main')).removeClass('shake shake-crazy');
                      }, 500);
                    }
                  }
                }
              }();
            }
          };
        });
}(window, document, angular, undefined));
