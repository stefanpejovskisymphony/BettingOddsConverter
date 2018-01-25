var gulp = require('gulp'),
	gutil = require('gulp-util'),
	browserify = require('gulp-browserify'),
	compass = require('gulp-compass'),
	connect = require('gulp-connect'),
	gulif = require('gulp-if'),
	uglify = require('gulp-uglify'),
	minifyHTML = require('gulp-minify-html'),
	concat = require('gulp-concat');

var env, jsSources, sassSources, htmlSourses, outputDir, sassStyle;

env = process.env.NODE_ENV || 'production';

if(env === 'development'){
	outputDir = 'builds/development/';
	sassStyle = 'expanded';
} else {
	outputDir = 'builds/production';
	sassStyle = 'compressed';
}

jsSources = [
	'components/scripts/calculation.js',
	'components/scripts/writing-data.js'
];

sassSources = ['components/sass/style.scss'];

htmlSourses = [outputDir + '/*.html'];

gulp.task('log', function(){
	gutil.log("Testing gulp");
});

gulp.task('js', function(){
	gulp.src(jsSources)
		.pipe(concat('script.js'))
		.pipe(browserify())
		.pipe(gulif(env === 'production', uglify()))
		.pipe(gulp.dest(outputDir + '/js'))
		.pipe(connect.reload())
});

gulp.task('compass', function(){
	gulp.src(sassSources)
		.pipe(compass({
			sass: 'components/sass',
			image: outputDir + '/images',
			style: sassStyle
			})
		.on('error', gutil.log))
		.pipe(gulp.dest(outputDir + '/css'))
		.pipe(connect.reload())
});

gulp.task('default', ['html', 'js', 'compass','connect', 'watch']);

gulp.task('watch', function(){
	gulp.watch(jsSources, ['js']);
	gulp.watch('components/sass/*.scss', ['compass']);
	gulp.watch('builds/development/*.html', ['html']);
});

gulp.task('connect', function(){
	connect.server({
		root: outputDir,
		livereload: true
	});
});

gulp.task('html', function(){
	gulp.src('builds/development/*.html')
	.pipe(gulif(env === 'production', minifyHTML()))
	.pipe(gulif(env === 'production', gulp.dest(outputDir)))
	.pipe(connect.reload())
});
