(function (ng) {

  let win, scope, rootScope, timeout;

  class ComponentCtrl {
    constructor($window, $scope, $rootScope, $timeout, PlayService) {
      this.PlayService = PlayService;
    }
    $onInit() {}
  }
  ng.module('matchly')
    .component('gtComponent', {
      controller: ComponentCtrl,
      controllerAs: 'cc',
      templateUrl: './assets/js/Ui/Component/Component.htm'
    });
}(angular));
