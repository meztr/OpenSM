(function () {
  'use strict';

  angular
    .module('examsessions.admin')
    .controller('ExamSessionsListAdminController', ExamSessionsListAdminController);

  ExamSessionsListAdminController.$inject = ['ExamSessionsService'];

  function ExamSessionsListAdminController(ExamSessionsService) {
    var vm = this;

    vm.examsessions = {
      loaded: false,
      past: [],
      current: [],
      future: []
    };

    var examsessions = ExamSessionsService.query(function() {
      var now = moment();
      examsessions.forEach(function(examsession) {
        if (moment(examsession.start).isAfter(now)) {
          vm.examsessions.future.push(examsession);
        } else if (now.isAfter(moment(examsession.end))) {
          vm.examsessions.past.push(examsession);
        } else {
          vm.examsessions.current.push(examsession);
        }
      });

      vm.examsessions.loaded = true;
    });
  }
}());
