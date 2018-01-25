(function (ng) {
  ng.module('matchly')
    .component('uiBody', {
      require: {
        pc: '^gtComponent'
      },
      controllerAs: 'bc',
      templateUrl: './assets/js/Ui/Component/Body/Body.htm'
    });
}(angular));
