"use strict";

let config = {
    sound: true,
    targetWidth: 1920,
    targetHeight: 1080
};


var game = new Phaser.Game(config.targetWidth, config.targetHeight, Phaser.CANVAS);

let player;  //игрок
let cursors; //кнопки стрелок



class Player extends Phaser.Sprite {

    cursors = game.input.keyboard.createCursorKeys();
    
    constructor(game, x, y, texture){
        super(game, x, y, texture);
        game.physics.arcade.enable(this);
        this.body.health = 100;
        this.body.speed = 100;
        this.body.bounce.y = 0.1;
        this.body.gravity.y = 800;
        this.anchor.setTo(0.5, 0.5); //центровка якоря в игроке
        //this.body.setSize(100, 270, 0, 0);
        this.body.collideWorldBounds = true;
        game.physics.arcade.enableBody(this);
        game.add.existing(this); // добавляет в игру
    }

    //система кармы
    karma = 0;
    


    //маркеры состояния (особенность движка)
    isLeft = false;
    isRight = false;
    isJump = false;

    

    update() {
        game.physics.arcade.collide(this, ground);

        this.body.velocity.x = 0;
        //cursors = game.input.keyboard.createCursorKeys();

        if (cursors.left.isDown || this.isLeft) {
            this.body.velocity.x = -150;
        }
        else if (cursors.right.isDown || this.isRight) {
            this.body.velocity.x = 150;
        }

        if ((cursors.up.isDown || this.isJump) && this.body.touching.down ) {
            this.body.velocity.y = -755;
        } 


    }
}

//класс неигрового персонажа
class NPC extends Phaser.Sprite {
    constructor(game, x, y, texture) {
        super(game, x, y, texture);
        game.physics.arcade.enable(this);
        this.body.health = 100;
        this.body.speed = 100;
        this.body.bounce.y = 0.1;
        this.body.gravity.y = 400;
        //this.body.setSize(100, 270, 0, 0);
        this.body.collideWorldBounds = true;
        game.physics.arcade.enableBody(this);
        game.add.existing(this); // добавляет в игру
    }
}

var IntroGame = {

    preload: function () {
        game.load.spritesheet('button', 'assets/UI/start.png', 108, 48);
        game.load.spritesheet('sound', 'assets/UI/sound.png', 48, 48);
    },

    startButton: null,
    soundButton: null,
    create: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorisontally = true;
        this.scale.pageAlignVertically = true;

        game.stage.backgroundColor = '#182d3b';
        this.startButton = game.add.button(game.world.centerX - 95, 400, 'button', this.startClick, this, 0, 0, 0);
        this.soundButton = game.add.button(32, 32, 'sound', this.soundClick, this, 0, 0, 0);
        this.startButton.scale.setTo(2, 2);
        this.soundButton.scale.setTo(2, 2);

        game.state.start('MainGame'); //отладка
    },

    update: function () {

    },

    startClick: function () {
        game.state.start('MainGame');
    },

    soundClick: function () {
        if (config.sound) {
            this.soundButton.setFrames(1, 1, 1); //выкл звук
            config.sound = false;
        }
        else {
            this.soundButton.setFrames(0, 0, 0); //вкл звук
            config.sound = true;
        }
    }
}
 
let house; // группа домов
let ground; // группа поверхностей земля
let debug_home; //отлаживаемый объект

let tools = {
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

var MainGame = {

    preload: function () {
        //уровень
        game.load.image('sky', 'assets/sky.png');
        game.load.image('rock_background', 'assets/rock_background.png');   
        game.load.image('rocks_middle', 'assets/rocks_middle.png');
        game.load.image('rocks_foreground', 'assets/rocks_foreground.png');        
        game.load.image('ground', 'assets/land.png');

        game.load.image('small_house', 'assets/small_house.png');
        game.load.image('big_house', 'assets/big_house.png');

        //игрок
        game.load.image('player', 'assets/player.png');

        //наэкранные кнопки
        if (tools.isMobile()) {
            game.load.spritesheet('UI_left', 'assets/UI/UI_left.png', 80, 80);
            game.load.spritesheet('UI_right', 'assets/UI/UI_right.png', 80, 80);
            game.load.spritesheet('UI_A', 'assets/UI/UI_A.png', 80, 80);
            game.load.spritesheet('UI_X', 'assets/UI/UI_X.png', 80, 80);
        }
        
    },

    create: function () {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 24000, 2000);

        //небо
        let sky = game.add.tileSprite(0, 0, 24000, 2000, 'sky');

        //ground = game.add.sprite(0, game.world.height - 50, 'ground'); //временно
        ground = game.add.tileSprite(0, game.world.height - 150, 24000, 150, 'ground');

        game.physics.arcade.enable(ground); //создает тело объекту
        ground.body.setSize(24000, 0, 0, 50);
        ground.body.collideWorldBounds = true;
        ground.body.immovable = true;

        //горы
        let rocks = game.add.group(); 
        
        let rock_background = rocks.create(0, game.world.height - 632, 'rock_background');
        let rock_background_1 = rocks.create(10950, game.world.height - 632, 'rock_background');

        let rocks_middle = rocks.create(0, game.world.height - 603, 'rocks_middle');
        let rocks_middle1 = rocks.create(10950, game.world.height - 603, 'rocks_middle');

        let rocks_foreground = rocks.create(0, game.world.height - 541, 'rocks_foreground');
        let rocks_foreground1 = rocks.create(10950, game.world.height - 541, 'rocks_foreground');

        //дома
        house = game.add.group();
        
        let small_house = house.create(4100, game.world.height - 444, 'small_house');
        debug_home = small_house; //для отладки
        game.physics.arcade.enable(small_house); 

        small_house.body.setSize(290, 1, 0, 3);

        small_house.body.checkCollision.down = false;
        small_house.body.checkCollision.left = false;
        small_house.body.checkCollision.right = false;

        small_house.body.collideWorldBounds = true;
        small_house.body.immovable = true;

        let big_house = house.create(4500, game.world.height - 704, 'big_house');
        game.physics.arcade.enable(big_house); 
        big_house.body.setSize(388, 1, 0, 0);

        big_house.body.checkCollision.down = false;
        big_house.body.checkCollision.left = false;
        big_house.body.checkCollision.right = false;

        big_house.body.collideWorldBounds = true;
        big_house.body.immovable = true;


  
        //настройка игрока
        player = new Player(game, 4100, game.world.height - 850, 'player');
        game.camera.follow(player);

        
        cursors = game.input.keyboard.createCursorKeys();
        player.body.velocity.y = 0;

        //наэкранные кнопки (треюуется созданный игрок)
        if (tools.isMobile()) {
            console.log(1);

            let buttonLeft = game.add.button(config.targetWidth / 22, config.targetHeight - 220, 'UI_left', null, this, 0, 0, 0);
            buttonLeft.scale.setTo(2, 2);
            buttonLeft.fixedToCamera = true;  
            buttonLeft.events.onInputDown.add(() => { player.isLeft = true; });
            buttonLeft.events.onInputUp.add(() => { player.isLeft = false; });

            let buttonRight = game.add.button(config.targetWidth / 22 + 200, config.targetHeight - 220, 'UI_right', null, this, 0, 0, 0);
            buttonRight.scale.setTo(2, 2);
            buttonRight.fixedToCamera = true;
            buttonRight.events.onInputDown.add(() => { player.isRight = true; });
            buttonRight.events.onInputUp.add(() => { player.isRight = false; });

            let buttonA = game.add.button(config.targetWidth - 250, config.targetHeight - 220, 'UI_A', null, this, 0, 0, 0);
            buttonA.scale.setTo(2, 2);
            buttonA.fixedToCamera = true;
            buttonA.events.onInputDown.add(() => { player.isJump = true; });
            buttonA.events.onInputUp.add(() => { player.isJump = false; });

            

        }
    },

    update: function () {
        game.physics.arcade.collide(house, player);
    },

    render: function () {
        game.debug.body(debug_home); //посмотреть другие 
        game.debug.body(ground);
        game.debug.spriteInfo(player, 600, 32);
        game.debug.spriteInfo(ground, 32, 32);
        //game.debug.spriteBounds(player);
    }
}

var MainMenu = {

    preload: function () {

    },

    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 7000, 1500);
    },

    update: function () {

    },
}

var ConclusionGame = {

    preload: function () {

    },

    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 7000, 1500);
    },

    update: function () {

    },
}


game.state.add('IntroGame',IntroGame);
game.state.add('MainGame', MainGame);
//game.state.add('IntroGame',MainMenu);
//game.state.add('ConclusionGame',ConclusionGame);  
game.state.start('IntroGame');

