var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');

var express = require('express');
var app = express();
var http = require('http').Server(app);


// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src(['node_modules/bootstrap/scss/*.scss', 'src/scss/*.scss'])
        .pipe(sass())
        .pipe(gulp.dest("src/css"))
        .pipe(browserSync.stream());
});

// Move the javascript files into our /src/js folder
gulp.task('js', function() {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/tether/dist/js/tether.min.js'])
        .pipe(gulp.dest("src/js"))
        .pipe(browserSync.stream());
});

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    // browserSync.init({
    //     server: "./src"  
    // });

    // gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'], ['sass']);
    // gulp.watch("src/*.html").on('change', browserSync.reload);
    app.use(express.static(__dirname + '/src'));

    app.get('/', function(req, res){
	  	res.sendFile(__dirname + '/src/index.html');
	});

	app.post('/playerConversations/', function (req, res) {
		// const body = req.body.Body
		// res.set('Content-Type', 'text/plain')
		// res.send(`You sent: ${body} to Express`)

		res.sendFile(__dirname + '/src/html/conversations.html');
	})

	app.get('/playerConversations/', function(req, res){
	  	res.sendFile(__dirname + '/src/html/conversations.html');
	});

	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
});

gulp.task('default', ['js','serve']);