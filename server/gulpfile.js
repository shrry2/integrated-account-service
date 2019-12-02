const gulp = require('gulp');
const path = require('path');
const concat = require('gulp-concat');

const i18next = require('i18next-parser');

gulp.task('i18next-parse', (done) => {
  gulp.src([
    './views/**/*.ejs',
    './middlewares/**/*.js',
    './routes/**/*.js',
  ])
    .pipe(concat('translations.js'))
    .pipe(i18next({
      locales: ['en', 'ja'],
      namespace: 'master',
      output: path.join(__dirname, './locales'),
      // keepRemoved: true,
    }))
    .pipe(gulp.dest('locales'));

  done();
});
