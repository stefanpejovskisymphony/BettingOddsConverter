var gulp = require('gulp'),
	gutil = require('gulp-util'),
	browserify = require('gulp-browserify'),
	compass = require('gulp-compass'),
	concat = require('gulp-concat');



var jsSources = [
	'components/scripts/calculation.js',
	'components/scripts/writing-data.js'
];

var sassSources = ['components/sass/style.scss'];


gulp.task('log', function(){
	gutil.log("Testing gulp");
});

gulp.task('js', function(){
	gulp.src(jsSources)
		.pipe(concat('script.js'))
		.pipe(browserify())
		.pipe(gulp.dest('builds/development/js'))
});

gulp.task('compass', function(){
	gulp.src(sassSources)
		.pipe(compass({
			sass: 'components/sass',
			image: 'builds/development/images',
			style: 'expanded'
			})
		.on('error', gutil.log))
		.pipe(gulp.dest('builds/development/css'))
});

gulp.task('default', ['js', 'compass', 'watch']);

gulp.task('watch', function(){
	gulp.watch(jsSources, ['js'])
	gulp.watch('components/sass/*.scss', ['compass'])
});