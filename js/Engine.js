// The engine class will only be instantiated once. It contains all the logic
// of the game relating to the interactions between the player and the
// enemy and also relating to how our enemies are created and evolve over time
class Engine {
  // The constructor has one parameter. It will refer to the DOM node that we will be adding everything to.
  // You need to provide the DOM node when you create an instance of the class
  constructor(theRoot) {
    // We need the DOM element every time we create a new enemy so we
    // store a reference to it in a property of the instance.
    this.root = theRoot;
    // We create our hamburger.
    // Please refer to Player.js for more information about what happens when you create a player
    this.player = new Player(this.root);
    this.lives = 3;
    this.playerInvincible = false;
    this.invincibleCounter = 75;
    this.livesTxt = new Text(this.root, 240, 40);
    // Initially, we have no enemies in the game. The enemies property refers to an array
    // that contains instances of the Enemy class
    this.enemies = [];
    this.enemiesOriginalSpeed = [];
    // We add the background image to the game
    addBackground(this.root);
    // score counter
    this.score = 0;
    this.scoreTxt = new Text(this.root, 15, 15);
    // current level counter
    this.difficultyLevel = 0;
    this.levelCounter = new Text(this.root, 240, 15);
    // pause state
    this.gamePaused = false;
  }

  pauseAll = () => {
    this.enemies.forEach((badGuy) => {
      badGuy.speed *= 0.7;
    })
  }

  resumeAll = () => {
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].speed <= this.enemiesOriginalSpeed[i]) {
        this.enemies[i].speed = this.enemiesOriginalSpeed[i];
      }
    }
  }

  // The gameLoop will run every few milliseconds. It does several things
  //  - Updates the enemy positions
  //  - Detects a collision between the player and any enemy
  //  - Removes enemies that are too low from the enemies array
  gameLoop = () => {
    // This code is to see how much time, in milliseconds, has elapsed since the last
    // time this method was called.
    // (new Date).getTime() evaluates to the number of milliseconds since January 1st, 1970 at midnight.
    if (this.lastFrame === undefined) {
      this.lastFrame = new Date().getTime();
    }

    let timeDiff = new Date().getTime() - this.lastFrame;

    this.lastFrame = new Date().getTime();
    // We use the number of milliseconds since the last call to gameLoop to update the enemy positions.
    // Furthermore, if any enemy is below the bottom of our game, its destroyed property will be set. (See Enemy.js)
    this.enemies.forEach((enemy) => {
      enemy.update(timeDiff);
    });

    // We remove all the destroyed enemies from the array referred to by \`this.enemies\`.
    // We use filter to accomplish this.
    // Remember: this.enemies only contains instances of the Enemy class.
    this.enemies = this.enemies.filter((enemy) => {
      return !enemy.destroyed;
    });

    // We need to perform the addition of enemies until we have enough enemies.
    while (this.enemies.length < MAX_ENEMIES) {
      // We find the next available spot and, using this spot, we create an enemy.
      // We add this enemy to the enemies array
      const spot = nextEnemySpot(this.enemies);
      this.enemies.push(new Enemy(this.root, spot));
      this.enemiesOriginalSpeed.push(this.enemies[this.enemies.length - 1].speed);
      this.scoreTxt.update("Score:" + this.score);
      this.livesTxt.update("Lives: " + this.lives);
    }

    // check pause state; if true, slow everything down
    // if false, accelerate again

    if (this.gamePaused === true) {
      this.pauseAll();
    } else if (this.gamePaused === false) {
      this.resumeAll();
    }

    // We check if the player is dead. If he is, we alert the user
    // and return from the method (Why is the return statement important?)
    if (this.isPlayerDead()) {
      window.alert('Game over');
      return;
    }

    // provide difficulty level to Enemy.js

    this.difficultyLevel = 1 + Math.floor(this.score / 10);
    this.levelCounter.update("Level: " + this.difficultyLevel);

    // invincibility logic
    // if the counter has started, start decrementing the counter
    // if the counter is at zero, make player vulnerable again and reset the counter

    if (this.playerInvincible === true && this.invincibleCounter < 75 && this.invincibleCounter > 0) {
      this.invincibleCounter--;
      this.player.domElement.classList.toggle("flicker");
    } else if (this.playerInvincible === true && this.invincibleCounter === 0) {
      this.playerInvincible = false;
      this.invincibleCounter = 75;
      this.player.domElement.classList.remove("flicker");
    }

    // If the player is not dead, then we put a setTimeout to run the gameLoop in 20 milliseconds
    setTimeout(this.gameLoop, 20);

  };

  // This method is not implemented correctly, which is why
  // the burger never dies. In your exercises you will fix this method.

  // presumably this is where we'll check where a collision occurs.
  // set to invincible for, let's say, three seconds or so
  // decrement lives by one

  // on collision, trigger invincibility status and decrement lives
  // decrement invincibility by one, so that above timer logic can work properly

  isPlayerDead = () => {

    if (this.lives === 0) {
      return true;
    }

    // cat hitbox is basically the bottom two thirds of the div
    // no more loss if you hit the rainbow, much like if you taunt a real cat

    if (this.enemies.some(badGuy =>
      (badGuy.x === this.player.x && (badGuy.y + ENEMY_HEIGHT) >= (GAME_HEIGHT - PLAYER_HEIGHT) && (badGuy.y + ENEMY_HEIGHT / 3) <= (GAME_HEIGHT - PLAYER_HEIGHT))
    )) {
      if (this.playerInvincible === false && this.invincibleCounter === 75) {
        this.lives--;
        this.playerInvincible = true;
        this.invincibleCounter--;
      }
    }
  }
};
