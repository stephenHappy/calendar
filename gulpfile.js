const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const rename = require('gulp-rename');


gulp.task('default', ['sass', 'babel']);
gulp.task('sass', function() {
	return gulp
		.src('*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(gulp.dest('./'))
})
gulp.task('babel', function() {
	return gulp
		.src('c.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(rename('c_es5.js'))
		.pipe(gulp.dest('./'))
})
gulp.task('watch', function() {
	gulp.watch('*.scss', ['sass']);
})
