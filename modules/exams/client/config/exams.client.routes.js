(function () {
  'use strict';

  angular
    .module('exams.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.manage.exams', {
        abstract: true,
        url: '/exams',
        template: '<ui-view/>'
      })
      .state('admin.manage.exams.list', {
        url: '',
        templateUrl: 'modules/exams/client/views/list-exams.client.view.html',
        controller: 'ExamsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Exams'
        }
      })
      .state('admin.manage.exams.create', {
        url: '/create',
        templateUrl: 'modules/exams/client/views/form-exam.client.view.html',
        controller: 'ExamsController',
        controllerAs: 'vm',
        resolve: {
          examResolve: newExam
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Create an exam'
        }
      })
      .state('admin.manage.exams.view', {
        url: '/:examId',
        templateUrl: 'modules/exams/client/views/view-exam.client.view.html',
        controller: 'ExamsController',
        controllerAs: 'vm',
        resolve: {
          examResolve: getExam
        },
        data: {
          pageTitle: '{{examResolve.title}}'
        }
      })
      .state('admin.manage.exams.edit', {
        url: '/:examId/edit',
        templateUrl: 'modules/exams/client/views/form-exam.client.view.html',
        controller: 'ExamsController',
        controllerAs: 'vm',
        resolve: {
          examResolve: getExam
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Edit an exam'
        }
      });
  }

  getExam.$inject = ['$stateParams', 'ExamsService'];

  function getExam($stateParams, ExamsService) {
    return ExamsService.get({
      examId: $stateParams.examId
    }).$promise;
  }

  newExam.$inject = ['ExamsService'];

  function newExam(ExamsService) {
    return new ExamsService();
  }
}());