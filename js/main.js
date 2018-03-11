socket = io(); // This triggers the 'connection' event on the server

game = new Phaser.Game(960, 600, Phaser.AUTO, '');

game.state.add('Game', Game);
game.state.add('Menu', Menu);

game.state.start('Menu');