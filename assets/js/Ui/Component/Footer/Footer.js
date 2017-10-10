(function (ng) {
  ng.module('matchly')
    .component('uiFooter', {
      require: {
        pc: '^gtComponent'
      },
      controllerAs: 'fc',
      templateUrl: './assets/js/Ui/Component/Header/Footer.htm'
    });
}(angular));
