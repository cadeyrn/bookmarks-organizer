'use strict';

const gulp = require('gulp');
const gulpEslint = require('gulp-eslint');

gulp.task('lint-js', () => gulp.src(['**/*.js', '!node_modules/**'])
  .pipe(gulpEslint({ configFile : '.eslintrc.json' }))
  .pipe(gulpEslint.format()));
