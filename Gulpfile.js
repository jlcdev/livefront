var gulp    = require('gulp'),
    connect = require('gulp-connect'),
    stylus  = require('gulp-stylus'),
    nib     = require('nib'),
    jshint  = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    inject  = require('gulp-inject'),
    gulpif  = require('gulp-if'),
    useref  = require('gulp-useref'),
    uglify  = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    historyApiFallback = require('connect-history-api-fallback'),
    templateCache = require('gulp-angular-templatecache');

var wiredep = require('wiredep').stream;

//Fake server for front development
gulp.task('server', function(){
  connect.server({
    root: './app',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: true,
    middleware: function(connect, opt){
      return [ historyApiFallback() ];
    }
  });
});

//Fake server for PRODUCTION front development
gulp.task('server-dist', function(){
  connect.server({
    root: './dist',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: true,
    middleware: function(connect, opt){
      return [ historyApiFallback() ];
    }
  });
});

gulp.task('templates', function(){
  gulp.src('./app/views/**/*.tpl.html')
    .pipe(templateCache({
      root: 'views/',
      module: 'blog.templates',
      standalone: true
    }))
    .pipe(gulp.dest('./app/scripts'));
});

gulp.task('compress', function(){
  gulp.src('./app/index.html')
    .pipe(useref.assets())
    .pipe(gulpif('*.js', uglify({mangle: false})))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy', function(){
  gulp.src('./app/index.html')
    .pipe(useref())
    .pipe(gulp.dest('./dist'));
  gulp.src('./app/lib/fontawesome/fonts/**')
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('inject', function() {
  var sources = gulp.src([ './app/scripts/**/*.js', './app/stylesheets/**/*.css' ]);
  return gulp.src('index.html', { cwd: './app' })
    .pipe(inject(sources, {
      read: false,
      ignorePath: '/app'
    }))
    .pipe(gulp.dest('./app'));
});

gulp.task('wiredep', function () {
  gulp.src('./app/index.html')
    .pipe(wiredep({
      directory: './app/lib'
    }))
    .pipe(gulp.dest('./app'));
});

gulp.task('jshint', function(){
  return gulp.src('./app/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

//Stylus preprocessor to CSS & reload
gulp.task('css', function(){
  gulp.src('./app/stylesheets/main.styl')
    .pipe(stylus({ use: nib() }))
    .pipe(gulp.dest('./app/stylesheets'))
    .pipe(connect.reload());
});

//if changes -> reload server
gulp.task('html', function(){
  gulp.src('./app/**/*.html')
    .pipe(connect.reload());
});

//WATCH CHANGES
gulp.task('watch', function(){
  gulp.watch(['./app/**/*.html'], ['html']);
  gulp.watch(['./app/stylesheets/**/*.styl'],['css', 'inject']);
  gulp.watch(['./app/scripts/**/*.js', './Gulpfile.js'], ['jshint', 'inject']);
  gulp.watch(['./bower.json'], ['wiredep']);
});

gulp.task('default', ['server', 'inject', 'wiredep', 'watch']);
gulp.task('build', ['templates','compress','copy']);
