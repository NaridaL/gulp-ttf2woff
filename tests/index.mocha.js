'use strict';

var gulp = require('gulp');
var Vinyl = require('vinyl');
var Cloneable = require('cloneable-readable');
var Stream = require('stream');
var fs = require('fs');

var assert = require('assert');
var StreamTest = require('streamtest');

var ttf2woff = require(__dirname + '/../src/index.js');

describe('gulp-ttf2woff conversion', function() {
  var filename = __dirname + '/fixtures/iconsfont';
  var woff = fs.readFileSync(filename + '.woff');

  // Iterating through versions
  StreamTest.versions.forEach(function(version) {

    describe('for ' + version + ' streams', function() {

      describe('with null contents', function() {

        it('should let null files pass through', function(done) {

            StreamTest[version].fromObjects([new Vinyl({
              path: 'bibabelula.foo',
              contents: null
            })])
            .pipe(ttf2woff())
            .pipe(StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                done(err);
              }
              assert.equal(objs.length, 1);
              assert.equal(objs[0].path, 'bibabelula.foo');
              assert.equal(objs[0].contents, null);
              done();
            }));

        });

      });

      describe('in buffer mode', function() {

        it('should work', function(done) {

          gulp.src(filename + '.ttf', {buffer: true})
            .pipe(ttf2woff())
            // Uncomment to regenerate the test files if changes in the ttf2woff lib
            // .pipe(gulp.dest(__dirname + '/fixtures/'))
            .pipe(StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                done(err);
              }
              assert.equal(objs.length, 1);
              assert.equal(objs[0].path, filename + '.woff');
              assert.equal(objs[0].contents.toString('utf-8'), woff.toString('utf-8'));
              done();
            }));

        });

        it('should work with the clone option', function(done) {

          gulp.src(filename + '.ttf', {buffer: true})
            .pipe(ttf2woff({clone: true}))
            .pipe(StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                done(err);
              }
              assert.equal(objs.length, 2);
              assert.equal(objs[0].path, filename + '.ttf');
              assert.equal(objs[0].contents.toString('utf-8'), fs.readFileSync(filename + '.ttf','utf-8'));
              assert.equal(objs[1].path, filename + '.woff');
              assert.equal(objs[1].contents.toString('utf-8'), woff.toString('utf-8'));
              done();
            }));

        });

        it('should let non-ttf files pass through', function(done) {

            StreamTest[version].fromObjects([new Vinyl({
              path: 'bibabelula.foo',
              contents: new Buffer('ohyeah')
            })])
            .pipe(ttf2woff())
            .pipe(StreamTest[version].toObjects(function(err, objs) {
                assert.equal(objs.length, 1);
                assert.equal(objs[0].path, 'bibabelula.foo');
                assert.equal(objs[0].contents.toString('utf-8'), 'ohyeah');
                done();
            }));

        });
      });


      describe('in stream mode', function() {
        it('should work', function(done) {

          gulp.src(filename + '.ttf', {buffer: false})
            .pipe(ttf2woff())
            .pipe(StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                done(err);
              }
              assert.equal(objs.length, 1);
              assert.equal(objs[0].path, filename + '.woff');
              objs[0].contents.pipe(StreamTest[version].toText(function(err, text) {
                assert.equal(text, woff.toString('utf-8'));
                done();
              }));
            }));

        });

        it('should work with the clone option', function(done) {

          gulp.src(filename + '.ttf', {buffer: false})
            .pipe(ttf2woff({clone: true}))
            .pipe(StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                done(err);
              }
              assert.equal(objs.length, 2);
              assert.equal(objs[0].path, filename + '.ttf');
              assert.equal(objs[1].path, filename + '.woff');
              objs[0].contents.pipe(StreamTest[version].toText(function(err, text) {
                assert.equal(text, fs.readFileSync(filename + '.ttf','utf-8'));
                objs[1].contents.pipe(StreamTest[version].toText(function(err, text) {
                  assert.equal(text, woff.toString('utf-8'));
                  done();
                }));
              }));
            }));

        });

        it('should let non-ttf files pass through', function(done) {

          StreamTest[version].fromObjects([new Vinyl({
            path: 'bibabelula.foo',
            contents: new Stream.PassThrough()
          })])
          .pipe(ttf2woff())
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
            assert.equal(objs.length, 1);
            assert.equal(objs[0].path, 'bibabelula.foo');
            assert(Cloneable.isCloneable(objs[0].contents));
            assert(objs[0].contents._original instanceof Stream.PassThrough);
            done();
          }));

        });
      });

    });

  });

});
