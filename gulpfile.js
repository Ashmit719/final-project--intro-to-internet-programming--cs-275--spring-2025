"use strict";
const { src, dest, series, parallel, watch } = require(`gulp`);
const CSSLinter = require(`gulp-stylelint`);
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

// Copy HTML to dev
const copyHTMLToDev = () => {
    return src(`app/html/**/*.html`)
        .pipe(dest(`dev`));
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

// Lint JS
const lintJS = () => {
    return src(`app/js/**/*.js`)
        .pipe(eslint())
        .pipe(eslint.formatEach(`compact`));
};

// Minify HTML to prod
const minifyHTML = () => {
    return src(`app/html/**/*.html`)
        .pipe(htmlMin({ collapseWhitespace: true }))
        .pipe(dest(`prod`));
};

// Minify CSS to prod
const minifyCSS = () => {
    return src(`app/css/**/*.css`)
        .pipe(postcss([cssnano()]))
        .pipe(dest(`prod/css`));
};

// Transpile and Minify JS to prod
const transpileAndMinifyJS = () => {
    return src(`app/js/**/*.js`)
        .pipe(plumber()) // handle errors
        .pipe(babel({ presets: [`@babel/preset-env`] }))
        .pipe(uglify())
        .pipe(dest(`prod/js`)); // Output to prod/js folder
};

// Ensure the `js` folder is created in `dev` and `prod`
const ensureJSFolderExists = () => {
    return src(`app/js/**/*`)
        .pipe(dest(`dev/js`))  // Ensure dev/js folder is created
        .pipe(dest(`prod/js`)); // Ensure prod/js folder is created
};

// Serve from 'dev'
const serve = () => {
    browserSync.init({
        notify: true,
        server: { baseDir: `dev` }
    });

    watch(`app/html/**/*.html`, series(copyHTMLToDev))
        .on(`change`, browserSync.reload);
    watch(`app/css/**/*.css`,
        series(validateCSS, copyCSSToDev)
    ).on(`change`, browserSync.reload);
    watch(`app/js/**/*.js`,
        series(lintJS, transpileJSToDev)
    ).on(`change`, browserSync.reload);
};

// Development Task
const dev = series(
    clean,
    validateCSS,
    lintJS,
    ensureJSFolderExists, // Ensure the js folders are created
    parallel(copyHTMLToDev, copyCSSToDev, transpileJSToDev),
    serve
);

// Production Build Task
const build = series(
    clean,
    validateCSS,
    lintJS,
    ensureJSFolderExists, // Ensure the js folders are created
    parallel(minifyHTML, minifyCSS, transpileAndMinifyJS)
);

// Export Tasks
exports.default = dev;
exports.build = build;
