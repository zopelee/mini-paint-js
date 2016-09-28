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
  return gulp.src('./demo/index.html')
          .pipe(rename("index.min.html"))
          .pipe(usemin({
            jsLib: [strip()],
            jsApp: [ngAnnotate(), uglify()],
          }))
          .pipe(gulp.dest('./demo/'))
})

gulp.task('default', ['build'])
