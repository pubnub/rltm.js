const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

// task
gulp.task('compile', function () {
    
    browserify({
        entries: 'src/index.js',
        debug: true,
        standalone: 'rltm'
    })
    .bundle()
    .pipe(source('rltm.js'))
    .pipe(gulp.dest('./web/'));

});

gulp.task('default', ['compile']);
