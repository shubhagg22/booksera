var config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1600,
  height: 770,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
function addPlayer(self, playerInfo) {
  if (playerInfo.team === 'blue') {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship-blue').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  } else {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship-red').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  }
  self.ship.setDrag(100);
  self.ship.setAngularDrag(100);
  self.ship.setMaxVelocity(200);
  self.ship.body.setCollideWorldBounds(true);
}

function addOtherPlayers(self, playerInfo) {
  if (playerInfo.team === 'blue') {
    otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ship-blue').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  } else {
    otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ship-red').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  }
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function preload() {
  this.load.image('bg', 'assets/purple.png');
  this.load.image('ship-red', 'assets/playerShip1_red.png');
  this.load.image('ship-blue', 'assets/playerShip1_blue.png');
  this.load.image('star', 'assets/star_gold.png');
}

function create() {
  var self = this;
  this.socket = io();
  this.physics.world.setBounds(0,0,1500,760);
  this.physics.add.image(800, 385 , 'bg').setOrigin(0.5, 0.5).setDisplaySize(1600, 770);
  this.otherPlayers = this.physics.add.group();
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on('playerMoved', function (playerInfo) {
  self.otherPlayers.getChildren().forEach(function (otherPlayer) {
    if (playerInfo.playerId === otherPlayer.playerId) {
      otherPlayer.setRotation(playerInfo.rotation);
      otherPlayer.setPosition(playerInfo.x, playerInfo.y);
    }
  });
});
  this.cursors = this.input.keyboard.createCursorKeys();
  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '48px', fill: '#0000FF' });
  this.redScoreText = this.add.text(544 , 16, '', { fontSize: '48px', fill: '#FF0000' });

  this.socket.on('scoreUpdate', function (scores) {
  self.blueScoreText.setText('Blue: ' + scores.blue);
  self.redScoreText.setText('Red: ' + scores.red);
});
  this.socket.on('starLocation', function (starLocation) {
    if (self.star) self.star.destroy();
    self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
    self.physics.add.overlap(self.ship, self.star, function () {
      this.socket.emit('starCollected');
    }, null, self);
  });
}

function update() {
  if (this.ship) {
    // emit player movement
    var x = this.ship.x;
    var y = this.ship.y;
    var r = this.ship.rotation;
    if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
    }

    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation
    };
    if (this.cursors.left.isDown) {
      this.ship.setAngularVelocity(-150);
    } else if (this.cursors.right.isDown) {
      this.ship.setAngularVelocity(150);
    } else {
      this.ship.setAngularVelocity(0);
    }
    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(this.ship.rotation + 1.5, -100, this.ship.body.acceleration);
    }else if(this.cursors.down.isDown ){
      this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
    }
    else {
      this.ship.setAcceleration(0);
    }
  }
}
