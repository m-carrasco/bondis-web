
var mongoose = require('mongoose');
var async = require('async');

var state = {
  conn: null
}

exports.connect = function(url, done) {
  if (state.db) return done()

  var conn = mongoose.connect(url, function(err) {
    if (err) return done(err)

    state.conn = conn
    done()
  })
}

exports.get = function() {
  return state.conn
}

exports.driver = function() {
  return mongoose;
}

exports.async = function(){
  return async;
}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}