// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos


var leyend = document.getElementById("leyend");
var newGame = document.getElementById("restart");

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function () {
	princessReady = true;
};
princessImage.src = "images/princess.png";

// Stone image
var stoneReady = false;
var stoneImage = new Image();
stoneImage.onload = function () {
   stoneReady = true;
};
stoneImage.src = "images/stone.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
   monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var princess = {};
var princessesCaught = 0;
var stones = [];
var numStones = 2;
for(var i = 0; i < numStones; i++){
	stones[i] = {};
};
var monsters = [];
var numMonsters = 1;
for(var i = 0; i < numMonsters; i++){
	monsters[i] = {
		speed: 256 // movement in pixels per second
	};
};
var lifes = 3;
var level = 1;

// Handle keyboard controls
var keysDown = {};

newGame.onclick = function (){
  princessesCaught = 0;
	numStones = 2;
  numMonsters = 1;
  lifes = 3;
  level = 1;
	//localStorage.setItem("princessesCaught", princessesCaught);
	main();
};


addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);


// Min and max values for images positions
var minTop = 32; // 32 = 0 + 32(tree)
var maxBottom = (canvas.height - 64); // 416 = 480 - 32(tree) - 32(hero)
var minLeft = 32; // 32 = 0 + 32(tree)
var maxRight = (canvas.width - 64); // 480 = 512 - 32(tree) - 32(hero)


// Checks if two objects are touching each other
var areTheyTouching = function (obj1, obj2) {
  return (obj1.x >= (obj2.x - 32)
			 && obj1.x <= (obj2.x + 32)
			 && obj1.y >= (obj2.y - 32)
		   && obj1.y <= (obj2.y + 32));
};


var setObjRandomPosition = function (gameObject) {
    // Throw the object somewhere on the screen randomly
    // una objeto ocupa 32 pixels.
    var overlap = true;
    while (overlap){
      gameObject.x = 32 + (Math.random() * (maxRight - 32));
      gameObject.y = 32 + (Math.random() * (maxBottom - 32));
      if (!areTheyTouching(gameObject,hero)) {
        overlap = false;
      }
    }
};

var avoidOverlaping = function () {
	var overlap = true;
  while (overlap) {
	  //Overlap between Princess and Stones
    while (overlap){
      overlap = false;
      for (var i = 0; i < numStones; i++){
        if(areTheyTouching(princess,stones[i])){
          overlap = true;
          setObjRandomPosition(stones[i]);
        }
    		//Overlap between Stones
    		for (var j = 0; j < numStones; j++){
    			if(i == j){
    				continue
    			}else if (areTheyTouching(stones[i],stones[j])){
          	overlap = true;
            setObjRandomPosition(stones[j]);
          }
        }
      }
    }

    //Overlap between Princess and Monsters
    overlap = true;
    while (overlap){
      overlap = false;
      for (var i = 0; i < numMonsters; i++){
        if(areTheyTouching(princess,monsters[i])){
          overlap = true;
          setObjRandomPosition(monsters[i]);
        }

  	    for (var j = 0; j < numStones; j++){
          if (areTheyTouching(stones[j],monsters[i])){
            overlap = true;
            setObjRandomPosition(monsters[i]);
          }
  	    }
		    //Overlap between monsters
		    for (var k = 0; k < numMonsters; k++){
					if(i == k){
						continue
					}else if (areTheyTouching(monsters[i],monsters[k])){
            overlap = true;
            setObjRandomPosition(monsters[i]);
          }
        }
      }
    }
  }
}

var resetStones = function(){
  stones = [];
  for(var i = 0; i < numStones; i++){
    	stones[i] = {};
    };
}

var resetMonsters = function(){
  monsters = [];
  for(var i = 0; i < numMonsters; i++){
    	monsters[i] = {
    		speed: 128 // movement in pixels per second
    	};
    };
}

// Reset the game when the player catches a princess
var reset = function () {
  hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

  // Throw the princess somewhere on the screen randomly
  setObjRandomPosition(princess);

  resetStones();
  // Throw the stones somewhere on the screen randomly
  for(var i = 0; i < numStones; i++){
      setObjRandomPosition(stones[i]);
  }

  // Throw the monsters somewhere on the screen randomly
  resetMonsters();
  for(var i = 0; i < numMonsters; i++){
      setObjRandomPosition(monsters[i]);
  }
  avoidOverlaping()
};

var areThereStones = function (gameObj){
  var stone = false;
  for (var i = 0; i < numStones; i++){
    if (areTheyTouching(gameObj,stones[i])){
      stone = true;
    }
  }
  return stone;
};

// Update hero position
var updateHeroPosition = function (modifier) {
  var heroAux = {
    x: hero.x,
    y: hero.y
  };

  // Player holding up
  if (38 in keysDown) {
    heroAux.y = hero.y - (hero.speed * modifier);
    if (!areThereStones(heroAux)){
      // Is the hero in the trees?
      if (heroAux.y <= minTop){
        hero.y = minTop;
      } else {
        hero.y = heroAux.y;
      }
    }
  }
  // Player holding down
  if (40 in keysDown) {
    heroAux.y = hero.y + (hero.speed * modifier);
    //Is there a stone?
    if (!areThereStones(heroAux)){
      // Is the hero in the trees?
      if (heroAux.y >= maxBottom) {
        hero.y = maxBottom;
      } else {
        hero.y = heroAux.y;
      }
    }
  }

  // Player holding left
  if (37 in keysDown) {
    heroAux.x = hero.x - (hero.speed * modifier);
    //Is there a stone?
    if (!areThereStones(heroAux)){
      // Is the hero in the trees?
      if (heroAux.x <= minLeft){
        hero.x = minLeft; //48
      } else {
        hero.x = heroAux.x;
      }
    }
  }

  // Player holding right
  if (39 in keysDown) {
    heroAux.x = hero.x + (hero.speed * modifier);
    //Is there a stone?
    if (!areThereStones(heroAux)){
      // Is the hero in the trees?
      if (heroAux.x >= maxRight){
        hero.x = maxRight; //448
      } else {
        hero.x = heroAux.x;
      }
    }
  }
}

var updateMonsterPosition = function (monster,modifier) {
  var monsterAux = {
    x: monster.x,
    y: monster.y
  };

  // Player holding down - Monster going up
  if (40 in keysDown) {
    monsterAux.y = monster.y - (monster.speed * modifier);
    if (!areThereStones(monsterAux)){
      // Is the hero in the trees?
      if (monsterAux.y <= minTop){
        monster.y = minTop;
      } else {
        monster.y = monsterAux.y;
      }
    }
  }
  // Player holding up - Monster going down
  if (38 in keysDown) {
    monsterAux.y = monster.y + (monster.speed * modifier);
    //Is there a stone?
    if (!areThereStones(monsterAux)){
      // Is the hero in the trees?
      if (monsterAux.y >= maxBottom) {
        monster.y = maxBottom;
      } else {
        monster.y = monster.y;
      }
    }
  }

  // Player holding left
  if (37 in keysDown) {
    monsterAux.x = monster.x - (monster.speed * modifier);
    //Is there a stone?
    if (!areThereStones(monsterAux)){
      // Is the hero in the trees?
      if (monsterAux.x <= minLeft){
        monster.x = minLeft; //48
      } else {
        monster.x = monsterAux.x;
      }
    }
  }

  // Player holding right
  if (39 in keysDown) {
    monsterAux.x = monster.x + (monster.speed * modifier);
    //Is there a stone?
    if (!areThereStones(monsterAux)){
      // Is the hero in the trees?
      if (monsterAux.x >= maxRight){
        monster.x = maxRight; //448
      } else {
        monster.x = monsterAux.x;
      }
    }
  }
};

var update = function (modifier) {
  updateHeroPosition(modifier);
  for (var i = 0; i < numMonsters; i++){
    updateMonsterPosition(monsters[i],modifier);
  }
	// Was the princess caught?
	if (areTheyTouching(hero,princess)) {
		++princessesCaught;
    if (princessesCaught == 10*level){
      numStones += 1;
      numMonsters += 1;
      level += 1;
    }
		reset();
	} else {
  	// Was the hero killed?
  	for(var i = 0; i < numMonsters; i++){
  		if (areTheyTouching(hero,monsters[i])) {
  			lifes -= 1;
  			if (lifes == 0) { //Game Over
  				princessesCaught = 0;
          level = 1;
          numStones = 2;
          numMonsters = 1;
  			}
  			reset();
  		}
  	}
  }
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}

	if (stoneReady) {
		for(var i = 0; i < numStones; i++){
			ctx.drawImage(stoneImage, stones[i].x, stones[i].y);
		}
	}

	if (monsterReady) {
		for(var i = 0; i < numMonsters; i++){
			ctx.drawImage(monsterImage, monsters[i].x, monsters[i].y);
		}
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
  leyend.innerHTML = "<p>Princesses caught: " + princessesCaught;
  leyend.innerHTML += "</p><p>\nLifes: " + lifes;
  leyend.innerHTML += "</p><p>\nLevel: " + level + "</p>";
	//ctx.fillText("Princesses caught: " + princessesCaught, 32, 32);
	//ctx.fillText("Lifes: " + lifes, 300, 32);
  //ctx.fillText("Level: " + level, 400, 32);
	if (lifes == 0){
		//ctx.fillText("Game over", 200 , 200);
		lifes = 3;
		reset();
	}
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
reset();
var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
