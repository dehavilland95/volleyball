var sprite_x;
var sprite_y;
var thre;
var circle;
var facing = '';
var jumpTimer = 0;
var jumpTimer2 = 0;
var w;
var a;
var d;
var other_players = {};
var ball_x;
var ball_y;


var Game = {

  preload: function(){
    game.stage.backgroundColor = "#3399DA";
    game.load.image('triangle', 'assets/triangle.png');
    game.load.image('circle', 'assets/pangball.png');
    game.load.image('one', 'assets/one.png');
    game.load.image('web', 'assets/web.png');
    game.load.spritesheet('dude', 'assets/dude.png', 46, 80);
    game.load.spritesheet('dude2', 'assets/dude.png', 46, 80);
    game.load.physics('physicsData', 'assets/circle.json');
    game.load.physics('test', 'assets/test.json');

    game.load.physics('pos_one', 'assets/pos_one.json');
    game.load.physics('left', 'assets/left.json');
    game.load.physics('right', 'assets/right.json');
  },  
  create: function(){
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 350;
    game.physics.p2.restitution = 0.8;

    circle = game.add.sprite(ball_x, ball_y, 'circle');
    circle.scale.setTo(0.1);
    web = game.add.sprite(450, 550, 'web');
    
    player = game.add.sprite(sprite_x, sprite_y, 'dude');
    player.animations.add('left', [0, 1], 10, true);
    player.animations.add('turn', [2], 20, true);
    player.animations.add('right', [3, 4], 10, true);

    // player2 = game.add.sprite(600, 400, 'dude2');
    // player2.animations.add('left', [0, 1], 10, true);
    // player2.animations.add('turn', [2], 20, true);
    // player2.animations.add('right', [3, 4], 10, true);

    game.physics.p2.enable(player);
    game.physics.p2.enable(circle);
    game.physics.p2.enable(web);

    web.body.static = true;
    circle.body.setCircle(25);
    player.body.damping = 0.8;
    player.body.fixedRotation = true;
    player.body.mass = 200;

    player.body.data.gravityScale = 2;
    circle.body.data.gravityScale = 2;
    player.body.clearShapes();
    player.body.loadPolygon('pos_one', 'dude');


    circle.body.mass = 50;
    web.body.mass = 500;

    function CreateShip(x,y, player_type){

        var sprite = game.add.sprite(x, y, 'dude2');
        sprite.animations.add('left', [0, 1], 10, true);
        sprite.animations.add('turn', [2], 20, true);
        sprite.animations.add('right', [3, 4], 10, true);    
        game.physics.p2.enable(sprite);
        sprite.body.damping = 0.8;
        sprite.body.fixedRotation = true;
        sprite.body.mass = 200;
        sprite.body.data.gravityScale = 2;
        sprite.body.clearShapes();
        sprite.body.loadPolygon('pos_one', 'dude2');
        return sprite;
    }

    socket.on('update-ball',function(data){
        circle.body.target_x = data.ball_x;
        circle.body.target_y = data.ball_y;
    });

    socket.on('update-players',function(players_data){

        var players_found = {};
        var pd = players_data.players;

        // Loop over all the player data received
        for(var id in pd){
            // If the player hasn't been created yet
            if(other_players[id] == undefined && id != socket.id){ // Make sure you don't create yourself
                var data = pd[id];
                var p = CreateShip(data.x,data.y,data.type);
                other_players[id] = p;
            }
            players_found[id] = true;

            // Update positions of other players 
            if(id != socket.id){
                other_players[id].target_x = pd[id].x;
                other_players[id].target_y  = pd[id].y;
                if(pd[id].facing === 'left'){
                  other_players[id].frame = 0;
                }else if(pd[id].facing === 'right'){
                  other_players[id].frame = 4;
                }
            }
        }

        // Check if a player is missing and delete them 
        for(var id in other_players){
            if(!players_found[id]){
                other_players[id].destroy();
                delete other_players[id];
            }
        }
       
    })

    cursors = game.input.keyboard.createCursorKeys();

    w = game.input.keyboard.addKey(Phaser.Keyboard.W);
    a = game.input.keyboard.addKey(Phaser.Keyboard.A);
    d = game.input.keyboard.addKey(Phaser.Keyboard.D);
  },

  update: function (){
      
      console.log(game.time.desiredFps);
      if (a.isDown)
      {
          player.body.moveLeft(300);

          if (facing != 'left')
          {
              player.animations.play('left');
              facing = 'left';
          }
      }
      else if (d.isDown)
      {
          player.body.moveRight(300);

          if (facing != 'right')
          {
              player.animations.play('right');
              facing = 'right';
          }
      }
      else
      {
          player.body.velocity.x = 0;

          if (facing != 'idle')
          {
              player.animations.stop();

              if (facing == 'left')
              {
                  player.frame = 0;
              }
              else
              {
                  player.frame = 4;
              }

              facing = 'idle';
          }
      }
      
      if (w.isDown && game.time.now > jumpTimer && player.body.y > 460)
      {
          player.body.moveUp(500);
          jumpTimer = game.time.now + 750;
      }

      if(circle.body.target_x != undefined){
        circle.body.x += (circle.body.target_x  - circle.body.x) * 0.16;
        circle.body.y += (circle.body.target_y  - circle.body.y) * 0.16;
      }

      for(var id in other_players){
        other_players[id];
        if(other_players[id].target_x != undefined){
            other_players[id].body.x += (other_players[id].target_x - other_players[id].x) * 0.16;
            other_players[id].body.y += (other_players[id].target_y - other_players[id].y) * 0.16;
        }
    }  
      if(gen){
        socket.emit('move-player',{x:player.x,y:player.y, facing:facing, ball_x:circle.x, ball_y:circle.y})
      }else{
        socket.emit('move-player',{x:player.x,y:player.y, facing:facing})
      }  

  // if (cursors.left.isDown)
  //   {
  //       player2.body.moveLeft(300);

  //       if (facing2 != 'left')
  //       {
  //           player2.animations.play('left');
  //           facing2 = 'left';
  //       }
  //   }
  //   else if (cursors.right.isDown)
  //   {
  //       player2.body.moveRight(300);

  //       if (facing2 != 'right')
  //       {
  //           player2.animations.play('right');
  //           facing2 = 'right';
  //       }
  //   }
  //   else
  //   {
  //       player2.body.velocity.x = 0;

  //       if (facing2 != 'idle')
  //       {
  //           player2.animations.stop();

  //           if (facing2 == 'left')
  //           {
  //               player2.frame = 0;
  //           }
  //           else
  //           {
  //               player2.frame = 4;
  //           }

  //           facing2 = 'idle';
  //       }
  //   }
    
  //   if (cursors.up.isDown && game.time.now > jumpTimer2 && player2.body.y > 460)
  //   {
  //       player2.body.moveUp(500);
  //       jumpTimer2 = game.time.now + 750;
  //   }

    // P. TWO

  }
};