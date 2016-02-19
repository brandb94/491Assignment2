/**@author Brandon Bell @ version ???.0 */

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}


Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
        index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        locX, locY,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
};

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
};

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
};


function StateTrack(game) {

    this.name = "Stats";
    this.stats = null;
    this.selectedSide = "left";
    this.selectedType = "grunt";
    this.spawning = false;

    Entity.call(this, game, 0, 400);

}

StateTrack.prototype = new Entity();
StateTrack.prototype.constructor = StateTrack;

StateTrack.prototype.setup = function() {

};

StateTrack.prototype.update = function(ctx) {


    if (!this.game.gameState.PREGAME) this.stats = this.getSoldierStats();

    if (this.game.leftClick) {
        var coords = this.game.clickLoc;
        SPAWNER.spawnFormation(this.selectedType, coords.x, coords.y, this.selectedSide);
    }


    Entity.prototype.update.call(this);
};

StateTrack.prototype.draw = function(ctx) {

    if (!this.game.gameState.PREGAME) {
        this.displayStats(ctx);
    }

        this.updateControlBoard();


        Entity.prototype.draw.call(this);

};

StateTrack.prototype.displayStats = function(ctx) {
    var canvas = document.getElementById('gameWorld');

    var opacity = 0;


    ctx.font="15px Courier New";
    ctx.fillStyle = "white";



    ctx.fillText("Left Soldiers remaining: " + this.game.leftArmy.length, 40, 50);
    ctx.fillText("Left Soldier Hit Chance: " + (this.stats.leftHit * 10) + "%", 40, 70);
    ctx.fillText("Left Commander Alive: " + !this.stats.leftDead, 40, 90);


    ctx.fillText("Right Soldier Hit Chance: " + (this.stats.rightHit * 10) + "%", canvas.width / 2, 70);
    ctx.fillText("Right Commander Alive: " + !this.stats.rightDead, canvas.width / 2, 90);
    ctx.fillText("Right Soldiers remaining: " + this.game.rightArmy.length, canvas.width / 2, 50);
};

StateTrack.prototype.updateControlBoard = function() {
    var canvas = document.getElementById('controlBoard');
    var ctx = canvas.getContext('2d');

    console.log("updating control board");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font="14px Courier New";
    ctx.fillStyle = "white";

    ctx.fillText("" + this.selectedSide + " selected.", canvas.width / 2 - 40, 30);
    ctx.fillText("" + this.selectedType + " Soldier type selected.", canvas.width /2 - 40, 45);



};


StateTrack.prototype.getSoldierStats = function() {

    var result = {};

    result["leftHit"] = this.game.leftArmy[0].hitChance;
    result["rightHit"] = this.game.rightArmy[0].hitChance;

    var leftDead = this.commanderDead(this.game.leftArmy);
    var rightDead = this.commanderDead(this.game.rightArmy);

    result["leftDead"] = leftDead;
    result["rightDead"] = rightDead;

    return result;



};

StateTrack.prototype.commanderDead = function(arr) {
    var commandDead = true;

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].type ===  "commander" && arr[i].health > 0) {
            commandDead = false;
            break;
        }

    }
    return commandDead;
};

// GameBoard code below

function distance(a, b) {
    if (a && b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

function randomInt(n) {
    return Math.random() * n;
}


function Soldier(game, startX, startY, team, type) {
    this.team = team;


    this.game = game;
    this.animations = {};
    this.type = type;
    this.animations.idle = new Animation(ASSET_MANAGER.getAsset("./img/soldiers.png"), 0, 280, 48, 35,.15, 1, true, true);

    this.target = null;

    //Movement stuff
    this.velocity = {};
    this.velocity.x = 0;
    this.velocity.y = 0;

    this.lastAttackTime = -1;
    this.attackDelay = .1; //seconds

    switch(type) {
        case "grunt":
            this.hitChance = 6;
            this.radius = 20;
            this.damageMax = 30;
            this.health = 100;
            this.moveSpeed = 30;
            break;
        case "commander":
            this.hitChance = 8;
            this.radius = 40;
            this.damageMax = 60;
            this.health = 250;
            this.moveSpeed = 50;
            break;
    }


    Entity.call(this, game, startX, startY);
}

Soldier.prototype = new Entity();
Soldier.prototype.constructor = Soldier;


Soldier.prototype.canAttack = function() {
  //  if (this.lastAttackTime) {
        var currentTime = Date.now();
        console.log("Attack Successful");
        if ((currentTime - this.lastAttackTime) / 1000 >= this.attackDelay) return true;

   // }

    return false;
};

Soldier.prototype.update = function() {


    if (!this.game.gameState.PREGAME) {

        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;


        if (!this.target) {
            var enemy = this.findClosestEnemy(this.team);
            if (enemy) this.target = enemy;
        }

        if (this.target) {


            if (distance(this, this.target) < this.radius + this.target.radius) {
                //close enough to attack
                if (this.canAttack()) this.attack(this.target);

            } else {
                //Try to close the distance
                this.moveTowards(this.target);

            }
            if (this.target.health <= 0) this.target = null;

        }

        if (this.health <= 0) this.die();

    }
    Entity.prototype.update.call(this);
};

Soldier.prototype.die = function() {

    if (this.type === "commander") {

        //My team is demoralized, lower their hit chance
        //var arr = (this.team === "left") ? this.game.leftArmy : this.game.rightArmy;
        var arr;
        if (this.team === "left") arr = this.game.leftArmy;
        else arr = this.game.rightArmy;

        console.log("Commander dead, lowering my team's hitChance");
        for (var i = 0; i < arr.length; i++ ) {
            arr[i].hitChance -= 3;
        }

    }



    this.removeFromWorld = true;
};

Soldier.prototype.draw = function(ctx) {
    ctx.beginPath();
    if (this.team === "left") ctx.fillStyle = "#E3612F";
    if (this.team === "right") ctx.fillStyle = "#d4f835";

    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillText((this.health).toFixed(2), this.x + this.radius, this.y+ this.radius);
    ctx.fill();

  //  Entity.draw.call(this);
};

Soldier.prototype.findClosestEnemy = function(team) {
    var arr = (team === "left") ? this.game.rightArmy : this.game.leftArmy;
    var closest = arr[0];
    for (var i = 1; i < arr.length; i++) {
        var current = arr[i];

        if (distance(this, current) < distance(this, closest)) {
            closest = current;
        }

    }
    return closest;
};

Soldier.prototype.attack = function(enemy) {


    var hitOrNah = randomInt(10) + 1;
    if (hitOrNah >= 10 - this.hitChance) {

        var damage = randomInt(this.damageMax) + 1;
        enemy.health -= damage;
    }
    this.lastAttackTime = Date.now();

};

Soldier.prototype.moveTowards = function(enemy) {

    var dx = enemy.x - this.x;
    var dy = enemy.y - this.y;

    var pointDistance = Math.sqrt(dx * dx + dy * dy);

    this.velocity.x = (dx / pointDistance) * this.moveSpeed;
    this.velocity.y = (dy / pointDistance) * this.moveSpeed;


};
Soldier.prototype.deepClone = function() {
    return new Soldier(this.game, 0, 0, this.team, this.type);
};


Soldier.prototype.victoryCheck = function() {
    if (this.team === "left") return this.game.isArrEmpty(this.game.rightArmy);
    else return this.game.isArrEmpty(this.game.leftArmy);
};



function createArmy(game, side) {
    var canvas = document.getElementById('gameWorld');
    var startX;
    if(side === "right") startX = canvas.width - 80; // 40 is soldier radius
    else  startX = 30;
    var startY = 30; //Top of canvas


   // spawnTriangle(startX, startY, game, side);
    SPAWNER.spawnRow(10, startX, game, side);

    var commandX = (side === "right") ? canvas.width - 160 : 80;

    SPAWNER.spawnSoldier(commandX, canvas.height / 2, side, "commander");



}
function Spawner(game) {
    this.game = game;

    this.soldierProto = new Soldier(game, 0, 0, "placeholder", "grunt");
    this.commanderProto = new Soldier(game, 0, 0, "placeholder", "commander");

}

Spawner.prototype.spawnFormation = function(formation, x, y, side) {

    switch (formation) {
        case "triangle":
            this.spawnTriangle(5, x, y, side);
            break;
        case "rectangle":
            this.spawnRect(x, y, 4, 3, side);
            break;
        case "row" :
            this.spawnRow(10, x, this.game, side);
            break;
        case "single" :
            this.spawnSoldier(x, y, side, "grunt");
            break;
        default:
            break;
    }


};

Spawner.prototype.spawnRow = function(numSoldiers, startX, game, side) {
    var startY = 10;

    for (var i = 0; i < numSoldiers; i++) {

        this.spawnSoldier(startX, startY, side, "grunt");

        startY += 80; //Soldier height;



    }
};


Spawner.prototype.spawnSoldier = function(x, y, team, type) {
    var sold;

    switch(type) {
        case "grunt":
            sold = this.soldierProto.deepClone();
            break;
        case "commander":
            sold = this.commanderProto.deepClone();
            break;
        default:
            break;
    }
    sold.x = x;
    sold.y = y;
    sold.team = team;

    this.game.addSoldier(sold);



};


/**
 * Spawns some soldiers in a triangle formation. Pointy end facing the opposing team.
 * @param baseSize - number of soldiers in largest column
 * @param startX of the top soldier in the largest column
 * @param startY of the top soldier in the largest column
 * @param game to add the soldiers to
 * @param side the soldier belongs to. Determines some of the loop functionality
 */
Spawner.prototype.spawnTriangle = function(baseSize, startX, startY, side) {
    var currY = startY;
    var currX = startX;
    var prevY = startY;

    console.log("Starting Y: " + startY);
    for (var i = baseSize; i > 0; i--) {
        prevY = currY;

        for (var j = 0; j < i; j++) {
            console.log("adding soldier in row " + i + ", soldier num: " + (j+1) + " Pos: (" + currX +"," +currY + ")");

            this.spawnSoldier(currX, currY, side, "grunt");

            currY += 2 * this.soldierProto.radius + this.soldierProto.radius;

        }

        if (side === "left") currX += this.soldierProto.radius * 2;

        if (side === "right") currX -= this.soldierProto.radius * 2;


        console.log("Current Y: " + currY + ", Pass: " + i);



        currY = prevY + this.soldierProto.radius * 1.5;

    }


};
/**
 * Spawns a rectangle formation of soldiers
 * @param startX
 * @param startY
 * @param w idth
 * @param h eight
 * @param side
 */
Spawner.prototype.spawnRect = function(startX, startY, w, h, side) {
    var currX = startX;
    var currY = startY;

    for (var i = 0; i < h; i++) {

        for (var j = 0; j < w; j++) {

            this.spawnSoldier(currX, currY, side, "grunt");
            if (side === "left") currX += this.soldierProto.radius * 2 + this.soldierProto.radius;
            if (side === "right") currX -= this.soldierProto.radius * 2 + this.soldierProto.radius;
        }
        currX = startX;
        currY += this.soldierProto.radius * 2 + this.soldierProto.radius;
    }


};


function assignButtonListeners(statTracker) {
    var leftButton = document.getElementById('leftSelector');
    var rightButton = document.getElementById('rightSelector');
    var triangle = document.getElementById('triangleSelector');
    var rectangle = document.getElementById('rectangleSelector');
    var row = document.getElementById('rowSelector');
    var single = document.getElementById('singleSelector');
    var start = document.getElementById('startButton');

    leftButton.addEventListener('click', function(e) {
       statTracker.selectedSide = "left";
    });

    rightButton.addEventListener('click', function(e) {
        statTracker.selectedSide = "right";
    });


    triangle.addEventListener('click', function(e) {
        statTracker.selectedType = "triangle";
    });

    rectangle.addEventListener('click', function(e) {
        statTracker.selectedType = "rectangle";
    });
    row.addEventListener('click', function(e) {
        statTracker.selectedType = "row";
    });
    single.addEventListener('click', function(e) {
        statTracker.selectedType = "single";
    });
    start.addEventListener('click', function(e) {
        statTracker.game.gameState.PREGAME ^= true;
    });



}


var SPAWNER;
var ASSET_MANAGER = new AssetManager();


ASSET_MANAGER.queueDownload("./img/soldiers.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("Phasers set to stun");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var pauseButton = document.getElementById('pause');
    var gameEngine = new GameEngine();
    var statTracker = new StateTrack(gameEngine);

    assignButtonListeners(statTracker);




    gameEngine.addEntity(statTracker);

    pauseButton.addEventListener('click', function(e) {
        gameEngine.gameState.PAUSED ^= true;
    });

    SPAWNER = new Spawner(gameEngine);
    //createArmy(gameEngine, "right");
   // SPAWNER.spawnTriangle(5, canvas.width - 80, 30, "right");

   // SPAWNER.spawnTriangle(5, 30, 30,"left");
   // SPAWNER.spawnRect(30, 30, 5,3, "left");
  //  SPAWNER.spawnRect(30, 360, 5,3, "left");


   // SPAWNER.spawnRect(canvas.width - 160, 360, 5,3, "right");
   // createArmy(gameEngine, "left");
   // var circle = new Circle(gameEngine);
  //  circle.setIt();
  //  gameEngine.addEntity(circle);
   /* for (var i = 0; i < 12; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }*/
    gameEngine.init(ctx);
    gameEngine.start();
});
