var gulp = require('gulp')
var rename = require("gulp-rename")
var sourcemaps = require('gulp-sourcemaps')
var replace = require('gulp-replace')
var usemin = require('gulp-usemin')
var uglify = require('gulp-uglify')
var rev = require('gulp-rev')
var ngAnnotate = require('gulp-ng-annotate')
var rename = require("gulp-rename")
var strip = require('gulp-strip-comments')
var del = require('del')
var runSequence = require('run-sequence')

gulp.task('build', function () {
  return gulp.src('demo/index.html')
          .pipe(rename("index.min.html"))
          .pipe(usemin({
            jsLib: [strip()],
            jsApp: [],
          }))
          .pipe(gulp.dest('demo/'))
})
gulp.task('rename', ['build'], function () {
  return gulp.src('dist/mini-paint.min.js')
          .pipe(rename("mini-paint.js"))
          .pipe(gulp.dest('dist/'))
})
gulp.task('min', ['rename'], function () {
  return gulp.src('dist/mini-paint.js')
          .pipe(rename("mini-paint.min.js"))
          .pipe(uglify())
          .pipe(gulp.dest('dist/'))
})

gulp.task('default', ['min'])
