"use strict";
const { src, dest, series, parallel, watch } = require(`gulp`);
const CSSLinter = require(`gulp-stylelint`);
const htmlValidator = require(`gulp-html-validator`);
const { deleteAsync } = require(`del`);
const babel = require(`gulp-babel`);
const htmlMin = require(`gulp-htmlmin`);
const uglify = require(`gulp-uglify`);
const eslint = require(`gulp-eslint`);
const cssnano = require(`cssnano`);
const postcss = require(`gulp-postcss`);
const browserSync = require(`browser-sync`).create();
const plumber = require(`gulp-plumber`); // to avoid pipe breaking on errors

// Clean 'dev' and 'prod' folders
const clean = async () => {
    const foldersToDelete = await deleteAsync([`./dev`, `./prod`]);
    console.log(`Deleted folders:`, foldersToDelete);
};

// Validate HTML
const validateHTML = () => {
    return src(`app/html/**/*.html`)
        .pipe(htmlValidator({ verbose: true }));
};

// Copy HTML to dev
const copyHTMLToDev = () => {
    return src(`app/html/**/*.html`)
        .pipe(dest(`dev/html`));
};

// Copy CSS to dev
const copyCSSToDev = () => {
    return src(`app/css/**/*.css`)
        .pipe(dest(`dev/css`));
};

// Transpile JS to dev (no minification)
const transpileJSToDev = () => {
    return src(`app/js/**/*.js`)
        .pipe(plumber()) // handle errors gracefully
        .pipe(babel({ presets: [`@babel/preset-env`] }))
        .pipe(dest(`dev/js`)); // Output to dev/js folder
};

// Validate CSS
const validateCSS = () => {
    return src(`app/css/**/*.css`)
        .pipe(CSSLinter({
            failAfterError: false,
            reporters: [{ formatter: `string`, console: true }]
        }));
};

// Validate JS
const validateJS = () => {
    return src(`app/js/**/*.js`)
        .pipe(eslint())
        .pipe(eslint.formatEach(`compact`));
};

// Compress HTML to prod
const compressHTML = () => {
    return src(`app/html/**/*.html`)
        .pipe(htmlMin({ collapseWhitespace: true }))
        .pipe(dest(`prod`));
};

// Compress CSS to prod
const compressCSS = () => {
    return src(`app/css/**/*.css`)
        .pipe(postcss([cssnano()]))
        .pipe(dest(`prod/css`));
};

// Transpile and Compress JS to prod
const transpileAndCompressJS = () => {
    return src(`app/js/**/*.js`)
        .pipe(plumber()) // handle errors
        .pipe(babel({ presets: [`@babel/preset-env`] }))
        .pipe(uglify())
        .pipe(dest(`prod/js`)); // Output to prod/js folder
};


const serve = () => {
    browserSync.init({
        notify: true,
        server: {
            baseDir: [
                `dev`,        // Serve from the root 'dev' folder
                `dev/html`,   // Serve HTML from 'dev/html'
                `dev/css`,    // Serve CSS from 'dev/css'
                `dev/js`      // Serve JS from 'dev/js'
            ]
        }
    });

    // Watch for changes and reload
    watch(`app/html/**/*.html`, series(copyHTMLToDev))
        .on(`change`, browserSync.reload);

    watch(`app/css/**/*.css`, series(validateCSS, copyCSSToDev))
        .on(`change`, browserSync.reload);

    watch(`app/js/**/*.js`, series(validateJS, transpileJSToDev))
        .on(`change`, browserSync.reload);
};

// Development Task
const dev = series(
    clean,
    validateCSS,
    validateHTML,
    validateJS,
    parallel(copyHTMLToDev, copyCSSToDev, transpileJSToDev),
    serve
);

// Production Build Task
const build = series(
    clean,
    validateCSS,
    validateHTML,
    validateJS,
    parallel(compressHTML, compressCSS, transpileAndCompressJS)
);

// Export Tasks
exports.default = dev;
exports.build = build;
