var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // Here's where we include socket.io as a node module 

// Serve the index page 
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html'); 
});

// Serve the assets directory
app.use('/assets',express.static('assets'))
app.use('/js',express.static('js'))

// Listen on port 5000
app.set('port', (process.env.PORT || 80));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

var players = {};
var ball_x = 450;
var ball_y = 100;

io.on('connection', function(socket){
	socket.on('players_get',function(){
		io.emit('players_info', players);
	});
	
	socket.on('want_play',function(data){
		
	blue = 0;
	green = 0;

	for(var id in players){
    	if(players[id].type === 1){
    		blue += 1;
    	}else if(players[id].type === 2){
    		green += 1;
    	}
    }
    if(blue >= green){
    	player_type = 2;
    	sprite_x = 600;
    	sprite_y = 400;
    }else if(blue < green){
    	player_type = 1;
    	sprite_x = 100;
    	sprite_y = 400;
    }

    state = {type:player_type, x:sprite_x, y:sprite_y};

    players[socket.id] = state;

    if(blue == 0 && green == 0){
    	players[socket.id].generale = true;
		generale = true;
		io.emit('player_start', {type:player_type, sprite_x:sprite_x, 
    						sprite_y:sprite_y, ball_x:ball_x, ball_y:ball_y,generale:generale });
	}else{
    	io.emit('player_start', {type:player_type, sprite_x:sprite_x, 
    						sprite_y:sprite_y, ball_x:ball_x, ball_y:ball_y});
	}
    
    io.emit('update-players', players);
	});

	socket.on('disconnect',function(state){
	    delete players[socket.id];
	    io.emit('update-players',{players:players});
	    io.emit('players_info',players);
  	});

	socket.on('move-player',function(position_data){

		    if(players[socket.id] == undefined) return; // Happens if the server restarts and a client is still connected 
		    
		    if(players[socket.id].generale){
		    	ball_x = position_data.ball_x;
		    	ball_y = position_data.ball_y;
		    }
		    players[socket.id].x = position_data.x;  
		    players[socket.id].y = position_data.y;
		    players[socket.id].facing = position_data.facing;
		    io.emit('update-players',{players:players});
	});


});

function ServerGameLoop (){
	io.emit('update-ball',{ball_x:ball_x, ball_y:ball_y});
}

setInterval(ServerGameLoop, 20); 