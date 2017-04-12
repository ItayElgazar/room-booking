'use strict';
//Some dependencies
var gulp = require('gulp');
var args = require('yargs').argv;
var sass = require('gulp-sass');
var config = require('./gulp.config')();
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});

gulp.task('vet',function() {
	return gulp
	.src([        './src/**/*.js',
        './*.js'])
	.pipe($.if(args.verbose, $.print()))
	.pipe($.jscs())
	.pipe($.jshint())
	.pipe($.jshint.reporter('jshint-stylish',{verbose: true}))
    .on('error', function(event) {
    console.log(event);
    })
    .on('crash', function(event) {
        console.log(event);
    })
    .on('exit', function(event) {
        console.log(event);
    });

});

//A Config to point directories, port, the url of the web server w'ere about to use
var config = {
    port: 8080,
    devBaseUrl: 'http://localhost',
    paths: {
        html: './src/*.html',
        views: './src/**/**.html',
        js: [
            './src/**/*.js',
            '!'+'./src/**/*.module.js'
        ],
        modules: './src/**/*.module.js',
        vendor: ['bower_components/**/**.min.js','bower_components/**/**/**.min.js'],
        css: 'bower_components/**/**.css',
        sass: './src/**/*.scss',
        dist: './dist',
        mainJS: './src/app.js'
    }
};
//Start a server
gulp.task('connect', function () {
   $.connect.server({
       root: ['dist'],
       port: config.port,
       base: config.devBaseUrl,
       livereload: true
   });
});

//Open up a browser window
gulp.task('open', ['connect'], function () {
    gulp.src('dist/index.html')
        .pipe($.open({ uri: config.devBaseUrl + ':' + config.port + '/'}));
});

//Load up the index.html file for the app
gulp.task('html', function () {
    gulp.src(config.paths.html)
        .pipe(gulp.dest(config.paths.dist))
        .pipe($.connect.reload());
});

//Load up the index.html file for the app
gulp.task('views', function () {
    gulp.src(config.paths.views)
        .pipe($.rename({dirname: ''}))
        .pipe(gulp.dest(config.paths.dist+'/views'))
        .pipe($.connect.reload());
});

gulp.task('sass', function () {
   gulp.src(config.paths.sass)
       .pipe($.sass())
       .pipe($.concat('bundle.css'))
       .pipe(gulp.dest(config.paths.dist + '/css'))
       .pipe($.connect.reload());
});

//Concat any css into 1 file called bundle.css
gulp.task('style_vendor', function () {
    return gulp
    .src(config.paths.css)
       .pipe($.concat('vendor.css'))
       .pipe(gulp.dest(config.paths.dist + '/css'));
});

gulp.task('vendor', function () {
    return gulp
        .src(config.paths.vendor)
        .pipe($.concat('vendor.min.js'))
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
        .pipe($.connect.reload());
});

gulp.task('js', function () {
    return gulp
        .src(config.paths.js)
        .pipe($.babel({presets: ['es2015']}))
        .pipe($.concat('bundle.js'))
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
        .pipe($.connect.reload());
});

gulp.task('js-modules', function() {
    return gulp
        .src(config.paths.modules)
        .pipe($.babel({presets: ['es2015']}))
        .pipe($.concat('modules-bundle.js'))
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
        .pipe($.connect.reload());
});

//Watches the html and JS files for a change
gulp.task('watch', function () {
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.views, ['views']);
    gulp.watch(config.paths.sass, ['sass']);
    gulp.watch(config.paths.js, ['js']);
    
});


gulp.task('default', ['html', 'views', 'style_vendor', 'sass', 'vendor', 'js-modules','js', 'open', 'watch']);

/////////////////
