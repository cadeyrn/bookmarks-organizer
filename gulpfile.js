'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint-js', () => gulp.src(['**/*.js', '!node_modules/**'])
  .pipe(eslint({ configFile : '.eslintrc.json' }))
  .pipe(eslint.format()));
