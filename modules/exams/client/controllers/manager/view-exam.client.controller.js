(function () {
  'use strict';

  angular
    .module('exams.manager')
    .controller('ViewExamManagerController', ViewExamManagerController);

  ViewExamManagerController.$inject = ['$scope', '$state', '$http', 'examResolve', '$window', 'Authentication', '$stateParams', 'Notification', '$filter', 'Upload'];

  function ViewExamManagerController($scope, $state, $http, exam, $window, Authentication, $stateParams, Notification, $filter, Upload) {
    var vm = this;

    vm.exam = exam;
    vm.examtitle = exam.title;
    vm.examsession = null;
    vm.authentication = Authentication;
    vm.remove = remove;
    vm.validate = validate;

    // Students management
    vm.students = null;
    vm.addStudent = addStudent;
    vm.removeStudent = removeStudent;

    // Rooms management
    vm.rooms = null;
    vm.addRoom = addRoom;
    vm.removeRoom = removeRoom;

    // Copies management
    vm.getLetter = getLetter;
    vm.downloadCopy = downloadCopy;

    // Load the exam session
    $http.get('/api/examsessions/' + $stateParams.examsessionCode).success(function(data, status, headers, config) {
      vm.examsession = data;
    });

    // Load the list of students for the registrations
    $http.get('/api/students').success(function(data, status, headers, config) {
      vm.students = data;

      // Remove already selected students
      vm.exam.registrations.forEach(function (element) {
        var username = element.username;
        vm.students.splice(vm.students.findIndex(function (element) {
          return element.username === username;
        }), 1);
      });
    });

    // Load the list of rooms for the rooms
    $http.get('/api/rooms').success(function(data, status, headers, config) {
      vm.rooms = data;

      // Remove already selected rooms
      vm.exam.rooms.forEach(function (element) {
        var code = element.code;
        vm.rooms.splice(vm.rooms.findIndex(function (element) {
          return element.code === code;
        }), 1);
      });
    });

    // Remove existing exam
    function remove() {
      if ($window.confirm('Are you sure you want to delete this exam?')) {
        vm.exam.$remove({ examId: exam._id }, onSuccess, onError);
      }

      function onSuccess(examsession) {
        $state.go('manage.examsessions.view', {
          examsessionCode: vm.examsession.code
        });
        Notification.success({ message: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + $filter('translate')('EXAM.SUCCESSFUL_DELETE') });
      }

      function onError(errorResponse) {
        var error = errorResponse.data;
        Notification.error({ message: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + error.message });
      }
    }

    // Validate exam
    function validate() {
      if ($window.confirm('Are you sure you want to validate this exam?')) {
        $http.post('/api/exams/' + vm.exam._id + '/validate')
        .then(function(response) {
          vm.exam.ready = response.data;
        });
      }
    }

    // Add a student to the exam
    function addStudent() {
      if (vm.selectedStudent) {
        $http.post('/api/exams/' + vm.exam._id + '/student', { 'studentUsername': vm.selectedStudent.username })
        .then(function(response) {
          vm.students.splice(vm.students.findIndex(function (element) {
            return element.username === vm.selectedStudent.username;
          }), 1);
          var username = vm.selectedStudent.username;
          vm.selectedStudent = undefined;
          vm.exam.registrations = response.data;

          Notification.success({ message: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + $filter('translate')('EXAM.STUDENT_SUCCESSFUL_ADD', { username: username }) });
        });
      }
    }

    // Remove a student of the exam
    function removeStudent(i) {
      if ($window.confirm('Are you sure you want to delete this student?')) {
        var student = vm.exam.registrations[i];

        $http.delete('/api/exams/' + vm.exam._id + '/student/' + i)
        .then(function(response) {
          vm.students.push(student);
          vm.exam.registrations = response.data;

          Notification.success({ message: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + $filter('translate')('EXAM.STUDENT_SUCCESSFUL_DELETE', { username: student.username }) });
        });
      }
    }

    // Convert an integer to a letter 1 => A, 2 => B...
    function getLetter (i) {
      return String.fromCharCode(64 + i);
    }

    // Add a room to the exam
    function addRoom() {
      if (vm.selectedRoom) {
        $http.post('/api/exams/' + vm.exam._id + '/room', { 'roomCode': vm.selectedRoom.code })
        .then(function(response) {
          vm.rooms.splice(vm.rooms.findIndex(function (element) {
            return element.code === vm.selectedRoom.code;
          }), 1);
          var code = vm.selectedRoom.code;
          vm.selectedRoom = undefined;
          vm.exam.rooms = response.data;

          Notification.success({ message: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + $filter('translate')('EXAM.ROOM_SUCCESSFUL_ADD', { code: code }) });
        });
      }
    }

    // Remove a room of the exam
    function removeRoom(i) {
      if ($window.confirm('Are you sure you want to delete this room?')) {
        var room = vm.exam.rooms[i];

        $http.delete('/api/exams/' + vm.exam._id + '/room/' + i)
        .then(function(response) {
          vm.rooms.push(room);
          vm.exam.rooms = response.data;

          Notification.success({ message: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + $filter('translate')('EXAM.ROOM_SUCCESSFUL_DELETE', { code: room.code }) });
        });
      }
    }

    // Download a copy of the exam
    function downloadCopy(i) {
      $window.open('/api/exams/' + vm.exam._id + '/copy/' + i + '/download');
    }
  }
}());