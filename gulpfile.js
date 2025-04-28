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
const plumber = require(`gulp-plumber`);

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

// Transpile JS for development (only Babel, no minification)
const transpileJSForDev = () => {
    return src(`app/js/**/*.js`)
        .pipe(plumber())
        .pipe(babel({ presets: [`@babel/preset-env`] }))
        .pipe(dest(`dev/js`));
};

// Compress HTML for production
const compressHTML = () => {
    return src(`app/html/**/*.html`)
        .pipe(htmlMin({ collapseWhitespace: true }))
        .pipe(dest(`prod`)); // direct to prod (no subfolder)
};

// Compress CSS for production
const compressCSS = () => {
    return src(`app/css/**/*.css`)
        .pipe(postcss([cssnano()]))
        .pipe(dest(`prod/css`));
};

// Transpile JS for production (Babel only, no compression yet)
const transpileJSForProd = () => {
    return src(`app/js/**/*.js`)
        .pipe(plumber())
        .pipe(babel({ presets: [`@babel/preset-env`] }))
        .pipe(dest(`prod/js`));
};

// Compress already transpiled JS for production
const compressJS = () => {
    return src(`prod/js/**/*.js`)
        .pipe(uglify())
        .pipe(dest(`prod/js`));
};

// BrowserSync development server
const serve = () => {
    browserSync.init({
        notify: true,
        server: {
            baseDir: [
                `dev`,
                `dev/html`,
                `dev/css`,
                `dev/js`
            ]
        }
    });

    watch(`app/html/**/*.html`, series(validateHTML, copyHTMLToDev))
        .on(`change`, browserSync.reload);

    watch(`app/css/**/*.css`, series(validateCSS, copyCSSToDev))
        .on(`change`, browserSync.reload);

    watch(`app/js/**/*.js`, series(validateJS, transpileJSForDev))
        .on(`change`, browserSync.reload);
};

// Development workflow (gulp)
const dev = series(
    clean,
    parallel(validateHTML, validateCSS, validateJS),
    parallel(copyHTMLToDev, copyCSSToDev, transpileJSForDev),
    serve
);

// Production workflow (gulp build)
const build = series(
    clean,
    parallel(compressHTML, compressCSS, series(transpileJSForProd, compressJS))
);

// Export tasks
exports.validateHTML = validateHTML;
exports.validateCSS = validateCSS;
exports.validateJS = validateJS;
exports.compressHTML = compressHTML;
exports.compressCSS = compressCSS;
exports.compressJS = compressJS;
exports.transpileJSForDev = transpileJSForDev;
exports.transpileJSForProd = transpileJSForProd;
exports.default = dev;
exports.build = build;
