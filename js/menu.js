var player_list = {};
var blue = 0;
var green = 0;
var green_old = 0;
var blue_old = 0;
var players_check = {};
var playing = false;
var gen = false;


var Menu = {

  preload: function(){     
  	game.stage.backgroundColor = "#3399DA";
  },

  create: function(){
  	gogame = game.add.text(400, 400, "Играть", { font: "18px Arial", fill: "white", align: "right" });
    gogame.inputEnabled = true; // reason why it is clickable
    gogame.events.onInputUp.add(this.play_function, this);
  	green_old = green;
	blue_old = blue;
	green_txt = game.add.text(475, 300, "Зеленых   " + green_old, { font: "20px Arial", fill: "white", align: "right" });
	blue_txt = game.add.text(475, 340, "Синих       " + blue_old, { font: "20px Arial", fill: "white", align: "right" });
  	
  	socket.on('players_info',function(players){
  		for(var id in players){
			if (player_list[id] == undefined && id != socket.id){
        		if(players[id].type === 1){
        			blue += 1;
        		}else if(players[id].type === 2){
        			green += 1;
        		}
        		player_list[id] = players[id];
        	}
        	players_check[id] = true;
    	}

    	for(var id in player_list){
	  		if(!players_check[id]){
			    if(player_list[id].type === 1){
		          blue -= 1;
		        }else if(player_list[id].type === 2){
		          green -= 1;
		        }
		        delete player_list[id];		
	        }
	  	}
  	});
  },
  play_function:function  (){
  	
  	socket.emit('want_play');
  	
  	socket.on('player_start',function(data){

  		if(!playing){
  			if(data.generale){
  				gen = true;
  			}
	  		sprite_x = data.sprite_x;
	  		sprite_y = data.sprite_y;
	  		ball_x = data.ball_x;
	  		ball_y = data.ball_y;
	  		playing = true;
	  	    game.state.start('Game');
  		}
  	});
  },
  
  update: function() {
  	socket.emit('players_get');
	if(green_old != green){
		green_txt.text = "Зеленых   " + green;
		green_old = green;
	}
	if(blue_old != blue){
		blue_txt.text = "Синих       " + blue;
		blue_old = blue;
	}
  },
   
};