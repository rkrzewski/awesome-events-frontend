var gulp = require("gulp"),
  plumber = require("gulp-plumber"),
  flatten = require("gulp-flatten"),
  sass = require("gulp-sass"),
  sassResolver = require("gulp-systemjs-resolver"),
  jspm = require("gulp-jspm"),
  rename = require("gulp-rename"),
  cached = require("gulp-cached"),
  scssLint = require("gulp-scss-lint"),
  scssLintStylish = require("gulp-scss-lint-stylish"),
  jshint = require("gulp-jshint"),
  stylish = require("jshint-stylish"),
  Q = require("q");

var env = process.env.NODE_ENV || 'dev';

var srcDir = "src/main/assets",
  destDir = "target/assets-" + env,
  workDir = "target/assets-tmp";

function passThrough() {
  return require("stream").PassThrough({
    objectMode: true
  });
}

function revAssets(kind, compress, cb) {
  var rev = require("gulp-rev"),
    revReplace = require("gulp-rev-replace"),
    revDel = require('rev-del'),
    clone = require("gulp-clone"),
    gzip = require("gulp-gzip");
  var promises = [];
  var revStream = passThrough()
    .pipe(rev());
  if (compress) {
    var deferred = Q.defer();
    revStream
      .pipe(clone())
      .pipe(gzip())
      .pipe(gulp.dest(destDir))
      .on("finish", deferred.resolve);
    promises.push(deferred.promise);
  }
  var deferred = Q.defer();
  revStream
    .pipe(gulp.dest(destDir))
    .pipe(rev.manifest(kind + "-rev-manifest.json"))
    .pipe(revDel({
      oldManifest: workDir + "/" + kind + "-rev-manifest.json",
      dest: destDir
    }))
    .pipe(gulp.dest(workDir))
    .on("finish", deferred.resolve);
  promises.push(deferred.promise);
  Q.all(promises).then(cb);
  return revStream;
}

gulp.task("scssLint", function() {
  return gulp.src(srcDir + "/*.scss")
    .pipe(cached("scss"))
    .pipe(scssLint({
      bundleExec: true,
      config: ".scsslint.yml",
      customReport: scssLintStylish
    }));
});

gulp.task("fonts", function() {
  var fonts = ["Roboto-Medium", "Roboto-Regular", "glyphicons-halflings-regular"];

  function src(suffixGlob) {
    var globs = fonts.map(function(font) {
      return "jspm_modules/**/" + font + suffixGlob;
    });
    return gulp.src(globs)
      .pipe(flatten({
        newPath: "fonts"
      }));
  }

  if (env === "dev") {
    return src(".*")
      .pipe(gulp.dest(destDir));
  } else {
    var compressed = Q.defer();
    src(".@(svg|ttf)")
      .pipe(revAssets("fonts-gz", true, compressed.resolve));
    var uncompressed = Q.defer();
    src(".!(svg|ttf)")
      .pipe(revAssets("fonts", false, uncompressed.resolve));
    return Q.all([compressed.promise, uncompressed.promise]);
  }
});

gulp.task("scss", ["fonts"], function() {
  if (env === "dev") {
    var sourcemaps = require("gulp-sourcemaps");
    return gulp.src(srcDir + "/style.scss")
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sassResolver({
        systemConfig: "jspm.js"
      }))
      .pipe(sass())
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(destDir));
  } else {
    var cssNano = require("gulp-cssnano"),
      revReplace = require("gulp-rev-replace"),
      manifest = gulp.src(workDir + "/fonts*-rev-manifest.json");
    return gulp.src(srcDir + "/style.scss")
      .pipe(plumber())
      .pipe(sassResolver({
        systemConfig: "jspm.js"
      }))
      .pipe(sass())
      .pipe(cssNano())
      .pipe(revReplace({
        manifest: manifest
      }))
      .pipe(revAssets("css", true));
  }
});

gulp.task("jshint", function() {
  return gulp.src(srcDir + "/**/*.js")
    .pipe(cached("js"))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task("js", function() {
  if (env === "dev") {
    var sourcemaps = require("gulp-sourcemaps");
    return gulp.src(srcDir + "/main.js")
      .pipe(sourcemaps.init())
      .pipe(jspm({
        selfExecutingBundle: true
      }))
      .pipe(rename("app.js"))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(destDir));
  } else {
    var uglify = require('gulp-uglify');
    return gulp.src(srcDir + "/main.js")
      .pipe(jspm({
        selfExecutingBundle: true
      }))
      .pipe(rename("app.js"))
      .pipe(uglify())
      .pipe(revAssets("js", true));
  }
});

gulp.task("html", ["scss", "js"], function() {
  if (env === "dev") {
    return gulp.src(srcDir + "/index.html")
      .pipe(gulp.dest(destDir));
  } else {
    var revReplace = require("gulp-rev-replace"),
      manifest = gulp.src(workDir + "/*-rev-manifest.json");
    return gulp.src(srcDir + "/index.html")
      .pipe(revReplace({
        manifest: manifest
      }))
      .pipe(gulp.dest(destDir));
  }
});

var browserSync;

function reload() {
  browserSync && browserSync.reload();
}

gulp.task("html+reload", ["html"], reload);
gulp.task("scss+reload", ["scss"], reload);
gulp.task("js+reload", ["js"], reload);

gulp.task("watch", function() {
  gulp.watch(srcDir + "/index.html", ["html+reload"]);
  gulp.watch(srcDir + "/style.scss", ["scssLint", "scss+reload"]);
  gulp.watch(srcDir + "/**/*.js", ["jshint"]);
  gulp.watch([srcDir + "/**/*.js", srcDir + "/**/*.html",
    "!" + srcDir + "/index.html"
  ], ["js+reload"]);
});

gulp.task("webserver", function() {
  browserSync = require("browser-sync").create();
  var proxyMiddleware = require('http-proxy-middleware');
  var proxy = proxyMiddleware('/api', {
    target: 'http://localhost:9000',
    ws: true
  });
  browserSync.init({
    port: 8080,
    open: false,
    server: {
      baseDir: destDir,
      middleware: [proxy]
    }
  });
});

gulp.task("build", ["scssLint", "scss", "jshint", "js", "fonts", "html"]);

gulp.task("default", ["build", "watch", "webserver"]);
