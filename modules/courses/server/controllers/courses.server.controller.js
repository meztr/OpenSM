'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Course = mongoose.model('Course'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

  /**
   * Create a course
   */
  exports.create = function (req, res) {
    var course = new Course(req.body);
    course.user = req.user;
    course.coordinator = req.user;

    course.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(course);
    });
  };

/**
 * List of courses
 */
exports.list = function (req, res) {
  Course.find().exec(function (err, courses) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(courses);
  });
};
