const gulp = require('gulp');
const concat = require("gulp-concat");
 
// task
gulp.task('minify-js', function () {
    gulp
    .src(['./bower_components/pubnub/dist/web/pubnub.js', './src/index.js'])
    .pipe(concat('realtime.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['minify-js']);
