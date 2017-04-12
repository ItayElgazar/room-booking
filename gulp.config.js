module.exports = function() {
    var app = './src/app/';
    var src = './src/';
    var config = {
        app: app,
        src: src,
        port: 7200,
        devBaseUrl: 'http://localhost',
        temp: './.tmp/',
        /** file paths */
        alljs:[
        './src/**/*.js',
        './*.js'
        ],
        paths: {
            html: './src/*.html',
            views: './src/**/**.html',
            js: './src/**/*.js',
            vendor: 'bower_components/**/**.min.js',
            css: 'bower_components/**/**.css',
            sass: './src/**/*.scss',
            dist: './dist',
            mainJS: './src/app.js',
        },
        index: './src/index.html',
        less: './src/styles/styles.less',
        bower: {
            json: require('./bower.json'),
            directory: './bower_components',
            ignorePath: '../..'

        }
    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
    };
    return config;
};