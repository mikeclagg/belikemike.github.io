(function (ng) {
  ng.module('matchly')
    .component('uiHeader', {
      require: {
        pc: '^gtComponent'
      },
      controllerAs: 'hc',
      templateUrl: './assets/js/Ui/Component/Header/Header.htm'
    });
}(angular));
