
var gulp     = require('gulp'),
uglify       = require('gulp-uglify'),
pump         = require('pump'),
postcss      = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
copy         = require("gulp-copy"),
jshint       = require('gulp-jshint'),
concat       = require('gulp-concat'),
rename       = require('gulp-rename'),
sass         = require('gulp-sass'),
sourcemaps   = require('gulp-sourcemaps'),
zetzer       = require('gulp-zetzer'),
clean        = require('gulp-clean'),
runSequence  = require('run-sequence'),
remarkable   = require('gulp-remarkable'),
gutil        = require('gulp-util'),
header       = require('gulp-header'),
pkg          = require('./package.json'),
changed      = require('gulp-changed'),
imagemin     = require('gulp-imagemin'),
browserSync  = require('browser-sync').create();


// Main Tasks
gulp.task('default', function(done) { runSequence('clean_build', 'serve-all', 'watch', 'copy-dev', done); });
gulp.task('build', function(done) { runSequence('copy-dev', 'js', 'zetzer', 'sass', done); });
gulp.task('clean_build', function(done) { runSequence('clean', 'build', done); });
gulp.task('prod', function(done) { runSequence('clean_build', 'serve-all', 'watch', 'copy-prod', done); });


// Serve All - Start on Public Index

// Static Server For Public Site + Reload
gulp.task('serve-all', function() {
  browserSync.init({
    server: "./build/",
    startPath: "/index.html",
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false
    }
  });
  gulp.watch("./build/**/*").on('change', browserSync.reload);
});


// Watch Tasks
gulp.task('watch', function () {

  // Watch Style and Keep 'Em In Line, but not Inline
  gulp.watch('src/sass/**/*', ['sass'] );
  
  // Watch Public + Compile Zetzer + Lint and Uglify JS
  gulp.watch('src/w3ds-code/**/*', ['copy_w3ds']);
  gulp.watch('src/images/**/*', ['copy_imagemin']);
  gulp.watch('src/zetzer/**/*', ['zetzer_public']);
  gulp.watch('src/js/**/*', ['js']);
  gulp.watch('src/media/**/*', ['copy_media']);

  // Don't forget the Readme! 
  gulp.watch('README.md', ['readme_markdown']);

});


// Copy Tasks

gulp.task('copy-dev', ['copy_images', 'copy_w3ds', 'copy_media']);
gulp.task('copy-prod', ['copy_imagemin', 'copy_w3ds', 'copy_media']);

gulp.task('copy_images', function() {
  return gulp.src([
    'src/images/**/*' ], 
    {base: 'src/images'}) 
    .pipe(gulp.dest('build/images'));
});

gulp.task('copy_imagemin', function() {
  gulp.src('src/images/**/*')
    .pipe(changed('build/images/**/*'))
    .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest('build/images/'));
});

gulp.task('copy_w3ds', function() {
  return gulp.src([
    'src/w3ds-code/**/*' ], 
    {base: 'src/w3ds-code'}) 
    .pipe(gulp.dest('build/w3ds-code'));
});

gulp.task('copy_media', function() {
  return gulp.src([
    'src/media/**/*' ], 
    {base: 'src/media'}) 
    .pipe(gulp.dest('build/media'));
});



// SASS Tasks

gulp.task('sass', function () {
  var browserlist = pkg.browserlist;
  console.log("[jazziest]" + " Autoprefixing for: " + browserlist);
  var plugins = [ autoprefixer({ browsers: browserlist }) ];
  return gulp.src('src/sass/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/css/'));
});


// Zetzer Tasks

gulp.task('zetzer_public', function() { return zetzerInOut('./src/', './build/'); });
gulp.task('zetzer', ['zetzer_public']);

function zetzerInOut(sourceFolder, buildFolder) {
  return gulp.src(sourceFolder + 'zetzer/pages/**/*.html')
    .pipe(zetzer({
      partials: sourceFolder + 'zetzer/partials',
      templates: sourceFolder + 'zetzer/templates',
      dot_template_settings: {
        strip: false
      },
      env: {
        RELPATH_WITH_SLASHES: '/',
        env_string: 'Some plain string to use with it.document.env_string'
      }
    }))
    .pipe(gulp.dest(buildFolder));
}


// Concat + Uglify + Map Tasks

gulp.task('js', function(done) { runSequence('lint_js', 'uglify_js', done); });

gulp.task('uglify_js', function (cb) {
  var version = pkg.version;
  var options = { preserveComments: 'license' };
  pump([
    gulp.src('src/js/**/*.js'),
    sourcemaps.init(),
    concat('ibmStudio_pub.js'),
    header("/**\n IBM PARTNERWORLD WATSON BUILD: " + version + "\n*/\n\n\n", {}),
    uglify(),
    rename('ibmStudio_pub.min.js'),
    sourcemaps.write('maps'),
    gulp.dest('build/js/')
  ],
  cb
  );
});


// Lint Tasks

// Given a list of Javascript files, run them through JSHINT (a linter) with SCREEN OUTPUT
// AND BUILD STOPPING FAILURE.
// @param js_files array of globs (Strings)
function lintJSWithSCREENOutput(js_files) { 
  var error = false;
  var regularOutputStreaam = gulp.src(js_files)
    .pipe(jshint().on('error', gutil.log))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('checkstyle'))
    // .pipe(jshint.reporter('jshint-stylish'));
    .pipe(jshint.reporter("fail")).on('end', function(){
      if(error) {
        gutil.log("exiting because error found.");
        process.exit();
      } 
    });
  return regularOutputStreaam;
}

gulp.task('lint_js', function() {  
  var allJsFiles = 'src/js/**.js';
  return lintJSWithSCREENOutput(allJsFiles);
});


// Process Readme Markdown 

gulp.task('readme_markdown', function () {
  return gulp.src('README.md')
        .pipe(remarkable({xhtmlOut: true }))
        .pipe(gulp.dest('./'));
});


// Clean Tasks

gulp.task('clean', function () {
  return gulp.src('./build/', {read: false})
        .pipe(clean());
});

