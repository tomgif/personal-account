'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    pug = require('gulp-pug'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    plumber = require("gulp-plumber"),
    connect = require('gulp-connect'),
    svgSprite = require('gulp-svg-sprites'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');

var path = {
    build: {
        pug: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: {
        pug: 'src/*.pug',
        js: 'src/js/main.js',
        style: 'src/css/main.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        pug: 'src/**/*.pug',
        js: 'src/js/**/*.js',
        style: 'src/css/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        sprite: 'src/include/icons/*.svg',
        spriteSvg: 'src/include/sprite.svg'
    },
    clean: './dist',
    assetsDir: 'src/include/'
};

gulp.task('sprite:build', function () {
    return gulp.src(path.assetsDir + 'icons/*.svg')
        .pipe(svgmin({ // minify svg
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({ // remove all fill and style declarations in out shapes
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[style]').removeAttr('style');
            },
/*            parserOptions: {
                xmlMode: true
            }*/
        }))
        .pipe(replace('&gt;', '>')) // cheerio plugin create unnecessary string '>', so replace it.
        .pipe(svgSprite({ // build svg sprite
                mode: "symbols",
                preview: false,
                selector: "icon-%f",
                svg: {
                    symbols: 'sprite.svg'
                }
            }
        ))
        .pipe(gulp.dest(path.assetsDir));
});

gulp.task('pug:build', function () {
    gulp.src(path.src.pug)
        .pipe(rigger())
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(path.build.pug))
        .pipe(connect.reload());
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        //.pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(connect.reload());
});

gulp.task('css:build', function () {
    gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sass())
        .pipe(prefixer())
        //.pipe(cssmin())
        .pipe(gulp.dest(path.build.css))
        .pipe(connect.reload());
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(connect.reload());
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'pug:build',
    'js:build',
    'css:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function(){
    watch([path.watch.pug, path.watch.spriteSvg], function(event, cb) {
        gulp.start('pug:build');
    }, ['pug']);
    watch([path.watch.style], function(event, cb) {
        gulp.start('css:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.sprite], function(event, cb) {
        gulp.start('sprite:build');
    });
});

gulp.task('webserver', function () {
    connect.server({
        root: [path.clean],
        port: 9000,
        livereload: true
    });
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);