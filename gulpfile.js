var gulp = require('gulp'),
	gutil = require('gulp-util'),
	concat = require('gulp-concat');



var jsSources = [
	'components/scripts/calculation.js',
	'components/scripts/writing-data.js'
];


gulp.task('log', function(){
	gutil.log("Testing gulp");
});

gulp.task('js', function(){
	gulp.src(jsSources)
		.pipe(concat('script.js'))
		.pipe(gulp.dest('builds/development/js'))
});