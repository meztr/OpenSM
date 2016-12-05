(function () {
  'use strict';

  angular
    .module('exams.admin')
    .controller('ExamsAdminController', ExamsAdminController);

  ExamsAdminController.$inject = ['$scope', '$state', '$http', 'examResolve', '$window', 'Authentication', 'Notification', '$filter'];

  function ExamsAdminController($scope, $state, $http, exam, $window, Authentication, Notification, $filter) {
    var vm = this;

    vm.exam = exam;
    vm.examtitle = exam.title;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.students = null;
    vm.rooms = null;
    vm.loadCourses = loadCourses;
    vm.loadExamSessions = loadExamSessions;
    vm.isFormReady = isFormReady;
    vm.addRoom = addRoom;

    var examId = exam._id;

    // The course and exam session must be a list for the tags-input
    if (vm.exam.course) {
      vm.exam.course = [vm.exam.course];
    }
    if (vm.exam.examsession) {
      vm.exam.examsession = [vm.exam.examsession];
    }

    var tagsInputListsLoaded = [false, false];

    // Load the list of courses for the tags-input
    var coursesList = [];
    $http.get('/api/courses').success(function(data, status, headers, config) {
      coursesList = data;
      tagsInputListsLoaded[0] = true;
    });

    // Load the list of exam sessions for the tags-input
    var examsessionsList = [];
    $http.get('/api/examsessions').success(function(data, status, headers, config) {
      examsessionsList = data;
      tagsInputListsLoaded[1] = true;
    });

    // Load the list of students for the registrations
    $http.get('/api/students').success(function(data, status, headers, config) {
      vm.students = data;
    });

    // Load the list of rooms for the rooms
    var roomsList = [];
    $http.get('/api/rooms').success(function(data, status, headers, config) {
      vm.rooms = data;
    });

    // Convert date to Date object
    vm.exam.date = vm.exam.date ? new Date(vm.exam.date) : null;

    // Remove existing exam
    function remove() {
      if ($window.confirm('Are you sure you want to delete this exam?')) {
        vm.exam.$remove({ examId: exam._id }, onSuccess, onError);
      }

      function onSuccess(examsession) {
        $state.go('admin.manage.exams.list');
        Notification.success({ message: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + $filter('translate')('EXAM.SUCCESSFUL_DELETE') });
      }

      function onError(errorResponse) {
        var error = errorResponse.data;
        Notification.error({ message: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + error.message });
      }
    }

    // Save exam
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.examForm');
        return false;
      }

      // Create a new exam, or update the current instance
      vm.exam.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        // Clear form fields
        vm.exam.title = '';
        vm.exam.course = [];
        vm.exam.examsession = [];
        vm.exam.date = null;
        vm.exam.duration = 0;

        $state.go('admin.manage.exams.view', {
          examId: res._id
        });
        Notification.success({ message: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + $filter('translate')(examId ? 'EXAM.SUCCESSFUL_UPDATE' : 'EXAMSESSION.SUCCESSFUL_EXAMADD') });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    // Generate list of courses
    function loadCourses(query) {
      return $filter('filter')(coursesList, query);
    }

    // Generate list of exam sessions
    function loadExamSessions(query) {
      return $filter('filter')(examsessionsList, query);
    }

    // Test whether the form is ready to be displayed and used
    function isFormReady() {
      return tagsInputListsLoaded.every(function(data) {return data;});
    }

    // Add a room to the exam
    function addRoom() {
      $http.post('/api/exams/' + vm.exam._id + '/addroom', { 'roomCode': vm.selectedRoom.code })
      .then(function(response) {
        vm.exam.rooms = response.data;
      });
    }
  }
}());