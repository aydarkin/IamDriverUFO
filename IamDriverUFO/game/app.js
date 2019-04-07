"use strict";

let config = {
    sound: true,
    targetWidth: 1920,
    targetHeight: 1080
};



var game = new Phaser.Game(config.targetWidth, config.targetHeight, Phaser.CANVAS);
//game.dragonBonesPlugin = game.plugins.add(Rift.DragonBonesPlugin); //добавление плагина Dragon Bones

let player;  //игрок
let cursors; //кнопки стрелок



class Player extends Phaser.Sprite {

    cursors = game.input.keyboard.createCursorKeys();
    
    constructor(game, x, y, texture){
        super(game, x, y, texture);
        game.physics.arcade.enable(this);
        this.body.health = 100;
        this.body.speed = 100;
        this.body.bounce.y = 0.0;
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
            this.body.velocity.x = -300;
        }
        else if (cursors.right.isDown || this.isRight) {
            this.body.velocity.x = 300;
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
        game.load.spritesheet('newGameButton', 'assets/UI/new_game.png', 405, 178);
        game.load.spritesheet('sound', 'assets/UI/sound.png', 405, 178);
        game.load.image('logo', 'assets/logo.png', 500, 300)
        game.load.image('background', 'assets/background.jpg')
    },

    newGameButton: null,
    soundButton1: null,
    soundButton2: null,
    create: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorisontally = true;
        this.scale.pageAlignVertically = true;

        game.stage.backgroundColor = '#000000';
        game.add.image(-2, -2, 'background');
        

        //лого заглушка
        let logo = game.add.image(game.width / 2, 150, 'logo');
        logo.anchor.set(0.5, 0.5);

        //кнопка новая игра
        this.newGameButton = game.add.button(game.width / 2, game.height / 2, 'newGameButton', this.startClick, this, 0, 0, 0);
        this.newGameButton.anchor.setTo(0.5, 0.5); //якорь по центру

        this.soundButton1 = game.add.button(game.width / 2 - 220, game.height - 120, 'sound', this.soundClick, this, 0, 0, 0);
        this.soundButton2 = game.add.button(game.width / 2 + 220, game.height - 120, 'sound', this.muteClick, this, 3, 3, 3);
        this.soundButton1.anchor.setTo(0.5, 0.5);
        this.soundButton2.anchor.setTo(0.5, 0.5);

        

        //game.state.start('MainGame'); //отладка
    },

    update: function () {

    },

    startClick: function () {
        game.state.start('MainGame');
    },

    soundClick: function () {
        this.soundButton1.setFrames(0, 0, 0);
        this.soundButton2.setFrames(3, 3, 3);
        config.sound = true;

    },

    muteClick: function () {
        this.soundButton1.setFrames(1, 1, 1);
        this.soundButton2.setFrames(2, 2, 2);
        config.sound = false;
    }
}
 
let houses; // группа домов
let ground; // группа поверхностей земля
let debug_home; //отлаживаемый объект
let spaceship;
let tools = {
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

let sky;

var MainGame = {

    preload: function () {
        //уровень
        game.load.image('rock_background', 'assets/rock_background.png');   
        game.load.image('rocks_middle', 'assets/rocks_middle.png');  
        game.load.image('rocks_foreground', 'assets/rocks_foreground.png');        
        game.load.image('ground', 'assets/land.png');
       
        //домики
        game.load.image('small_house', 'assets/small_house.png'); 
        game.load.image('small_house_mirrored', 'assets/small_house_mirrored.png');
        game.load.image('small_transparent _house', 'assets/small_transparent _house.png');
        game.load.image('transparent_house_green', 'assets/transparent_house_green.png'); 
        game.load.image('big_house', 'assets/big_house.png');
        game.load.image('house_purple_right', 'assets/house_purple_right.png');
        game.load.image('house_purple_left', 'assets/house_purple_left.png');
        game.load.image('purple_big_house_right', 'assets/purple_big_house_right.png');
        game.load.image('purple_big_house_left', 'assets/purple_big_house_left.png');
        game.load.image('transparent_big_house', 'assets/transparent_big_house.png');
        game.load.image('house_red_left', 'assets/house_red_left.png'); 
        game.load.image('house_red_right', 'assets/house_red_right.png'); 
        game.load.image('house_red', 'assets/house_red.png');
        game.load.image('transparent_house_red', 'assets/transparent_house_red.png');
        game.load.image('house_green', 'assets/house_green.png'); 
        game.load.image('house_orange1', 'assets/house_orange1.png'); 
        game.load.image('house_orange2', 'assets/house_orange2.png'); 
        game.load.image('house_orange3', 'assets/house_orange3.png'); 
        game.load.image('house_orange', 'assets/house_orange.png');
        game.load.image('big_house_orange', 'assets/big_house_orange.png');
        game.load.image('spaceship', 'assets/spaceship.png');

        //игрок
        game.load.image('player', 'assets/player.png');
        //game.load.spritesheet('player_pokoi', 'assets/animations/pokoi.png', 219, 425);
        

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
        game.world.setBounds(0, 0, 24000, 2300);

        //ground = game.add.sprite(0, game.world.height - 50, 'ground'); //временно
        ground = game.add.tileSprite(0, game.world.height - 300, 24000, 300, 'ground');

        game.physics.arcade.enable(ground); //создает тело объекту
        ground.body.setSize(24000, 0, 0, 50);
        ground.body.collideWorldBounds = true;
        ground.body.immovable = true;

        //горы
        let rocks = game.add.group(); 
        
        let rock_background = rocks.create(0, game.world.height - 742, 'rock_background');
        rock_background = rocks.create(7338, game.world.height - 742, 'rock_background');
        rock_background = rocks.create(14673, game.world.height - 742, 'rock_background');
        rock_background = rocks.create(22010, game.world.height - 742, 'rock_background');

        let rocks_middle = rocks.create(0, game.world.height - 714, 'rocks_middle');
        rocks_middle = rocks.create(7337, game.world.height - 714, 'rocks_middle');
        rocks_middle = rocks.create(14673, game.world.height - 714, 'rocks_middle');
        rocks_middle = rocks.create(22010, game.world.height - 714, 'rocks_middle');

        let rocks_foreground = rocks.create(0, game.world.height - 657, 'rocks_foreground');
        rocks_foreground = rocks.create(7337, game.world.height - 657, 'rocks_foreground');
        rocks_foreground = rocks.create(14673, game.world.height - 657, 'rocks_foreground');
        rocks_foreground = rocks.create(22010, game.world.height - 657, 'rocks_foreground');

        spaceship = game.add.tileSprite(1000, game.world.height - 1000, 1232, 899, 'spaceship');
        //дома
        houses = game.add.group();
        houses.enableBody = true;
        houses.physicsBodyType = Phaser.Physics.ARCADE;
        let small_house;
        let big_house;
        let green_house;
        let red_house;
            //конструктор домов 
        function configureHouse(house, type) {
            //1 - small, 2 -big , 3 - red, 4 - green
            switch (type) {
                case 1:
                    house.body.setSize(195, 0, 10, 3);
                break;

                case 2:
                    house.body.setSize(210, 0, 23, 2);
                break;

                case 3:
                    house.body.setSize(295, 0, 0, 2);
                break;

                case 4:
                    house.body.setSize(240, 0, 2, 2);
                break;

                default:
                break;
            }
            house.body.checkCollision.down = false;
            house.body.checkCollision.left = false;
            house.body.checkCollision.right = false;
            house.body.collideWorldBounds = true;
            house.body.immovable = true;
        }
        function home_add() {

        }
        //TODO потом оптимизировать
        ////buildings в файле houses.js
        //for (let building in buildings) {
        //    let x = buildings[building].attributes.left;
        //    let y = buildings[building].attributes.top;
        //    let height = buildings[building].attributes.height; //по высоте проверять будем
        //    //тут выбор типа
        //    let type = 'small_house';
        //    let id = 1;
        //    if (height < 50) {
        //        continue;
        //    }
        //    if (height > 60 && height < 65) {
        //        //коробка
        //        type = 'small_house';
        //        id = 1;
        //    }

        //    if (height > 365 && height < 370) {
        //        type = 'big_house';
        //        id = 2;
        //    }
        //    if (height > 205 && height < 210) {
        //        type = 'house_red';
        //        id = 3;
        //    }
        //    if (height > 235 && height < 240) {
        //        type = 'small_house';
        //        id = 1;
        //    }
        //    if (height > 500 && height < 505) {
        //        type = 'house_green';
        //        id = 4;
        //    }
            //if (height > 500 && height > 505) {
            //    type = 'house_orange';
            //    id = 4;
            //}
            //if (height > 500 && height > 505) {
            //    type = 'house_orange1';
            //    id = 4;
            //}
            //if (height > 500 && height > 505) {
            //    type = 'house_orange2';
            //    id = 4;
            //}
            //if (height > 500 && height > 505) {
            //    type = 'house_orange3';
            //    id = 4;
            //}
            //if (height > 500 && height > 505) {
            //    type = 'big_house_orange';
            //    id = 4;
            //}


        //    let _house = houses.create(x, y + 99, type);
        //    configureHouse(_house, id);
        //}

        small_house = houses.create(4109, game.world.height - 500, 'small_house');
        configureHouse(small_house, 1);
        big_house = houses.create(4316, game.world.height - 625, 'big_house');
        configureHouse(big_house, 2);
        green_house = houses.create(4723, game.world.height - 760, 'house_green');
        configureHouse(green_house, 4); 
        red_house = houses.create(4954, game.world.height - 468, 'house_red');
        configureHouse(red_house, 3);
        big_house = houses.create(5254, game.world.height - 625, 'big_house');
        configureHouse(big_house, 2);
        green_house = houses.create(5641, game.world.height - 760, 'house_orange1');
        configureHouse(green_house, 4); 
        green_house = houses.create(5830, game.world.height - 760, 'house_orange2');
        configureHouse(green_house, 4);
        green_house = houses.create(6039, game.world.height - 760, 'house_orange3');
        configureHouse(green_house, 4);
        red_house = houses.create(5700, game.world.height - 968, 'house_orange');
        configureHouse(red_house, 3);
        big_house = houses.create(6000, game.world.height - 1130, 'big_house_orange');
        configureHouse(big_house, 2);
        big_house = houses.create(6428, game.world.height - 625, 'big_house');
        configureHouse(big_house, 2);
        small_house = houses.create(6680, game.world.height - 500, 'small_house');
        configureHouse(small_house, 1);
        red_house = houses.create(6421, game.world.height - 833, 'house_red');
        configureHouse(red_house, 3);
        green_house = houses.create(7530, game.world.height - 800, 'transparent_house_green');
        configureHouse(green_house, 4); 
        big_house = houses.create(7791, game.world.height - 667, 'transparent_big_house');
        configureHouse(big_house, 2);
        small_house = houses.create(7811, game.world.height - 910, 'small_transparent _house');
        configureHouse(small_house, 1);
        big_house = houses.create(8263, game.world.height - 624, 'big_house');
        configureHouse(big_house, 2);
        small_house = houses.create(8299, game.world.height - 865, 'small_house');
        configureHouse(small_house, 1);
        red_house = houses.create(8518, game.world.height - 468, 'house_red');
        configureHouse(red_house, 3);
        green_house = houses.create(8580, game.world.height - 970, 'transparent_house_green');
        configureHouse(green_house, 4); 
        big_house = houses.create(8569, game.world.height - 1340, 'transparent_big_house');
        configureHouse(big_house, 2);
        small_house = houses.create(8855, game.world.height - 500, 'small_house');
        configureHouse(small_house, 1);
        small_house = houses.create(8933, game.world.height - 740, 'small_house_mirrored');
        configureHouse(small_house, 1);
        small_house = houses.create(8855, game.world.height - 982, 'small_house');
        configureHouse(small_house, 1); 
        big_house = houses.create(9164, game.world.height - 625, 'purple_big_house_right');
        configureHouse(big_house, 2);
        big_house = houses.create(9401, game.world.height - 625, 'purple_big_house_left');
        configureHouse(big_house, 2);
        red_house = houses.create(9254, game.world.height - 825, 'house_red');
        configureHouse(red_house, 3);
        green_house = houses.create(9848, game.world.height - 760, 'transparent_house_green');
        configureHouse(green_house, 4); 
        green_house = houses.create(9848, game.world.height - 1263, 'house_green');
        configureHouse(green_house, 4); 
        big_house = houses.create(10119, game.world.height - 625, 'big_house');
        configureHouse(big_house, 2);
        small_house = houses.create(10130, game.world.height - 868, 'small_house');
        configureHouse(small_house, 1);
        red_house = houses.create(10412, game.world.height - 468, 'house_red');
        configureHouse(red_house, 3);
        red_house = houses.create(10710, game.world.height - 488, 'transparent_house_red');
        configureHouse(red_house, 3);
        small_house = houses.create(11044, game.world.height - 535, 'small_transparent _house');
        configureHouse(small_house, 1);
        small_house = houses.create(11044, game.world.height - 775, 'small_transparent _house');
        configureHouse(small_house, 1);
        red_house = houses.create(11290, game.world.height - 488, 'transparent_house_red');
        configureHouse(red_house, 3);
        small_house = houses.create(11668, game.world.height - 500, 'small_house');
        configureHouse(small_house, 1);
        big_house = houses.create(11897, game.world.height - 770, 'house_purple_left');
        configureHouse(big_house, 2);
        big_house = houses.create(12090, game.world.height - 770, 'house_purple_right');
        configureHouse(big_house, 2);
        red_house = houses.create(12355, game.world.height - 465, 'house_red');
        configureHouse(red_house, 3);
        red_house = houses.create(12355, game.world.height - 670, 'house_orange');
        configureHouse(red_house, 3);
        red_house = houses.create(12355, game.world.height - 877, 'house_red');
        configureHouse(red_house, 3);
        green_house = houses.create(12380, game.world.height - 1380, 'house_green');
        configureHouse(green_house, 4); 
        green_house = houses.create(12669, game.world.height - 760, 'transparent_house_green');
        configureHouse(green_house, 4); 
        small_house = houses.create(12670, game.world.height - 1003, 'small_transparent _house');
        configureHouse(small_house, 1);
        green_house = houses.create(12670, game.world.height - 1505, 'house_green');
        configureHouse(green_house, 4); 
        big_house = houses.create(12921, game.world.height - 625, 'big_house');
        configureHouse(big_house, 2);
        big_house = houses.create(13351, game.world.height - 625, 'big_house');
        configureHouse(big_house, 2);
        red_house = houses.create(14178, game.world.height - 468, 'house_red_left');
        configureHouse(red_house, 3);
        red_house = houses.create(14448, game.world.height - 468, 'house_red_right');
        configureHouse(red_house, 3);
        green_house = houses.create(14242, game.world.height - 970, 'transparent_house_green');
        configureHouse(green_house, 4); 
        big_house = houses.create(14730, game.world.height - 625, 'big_house');
        configureHouse(big_house, 2);
        green_house = houses.create(14730, game.world.height - 1130, 'transparent_house_green');
        configureHouse(green_house, 4); 
        small_house = houses.create(15029, game.world.height - 500, 'small_house');
        configureHouse(small_house, 1);
        red_house = houses.create(15029, game.world.height - 704, 'house_red');
        configureHouse(red_house, 3);
        small_house = houses.create(15029, game.world.height - 946, 'small_house');
        configureHouse(small_house, 1);
        red_house = houses.create(15029, game.world.height - 1152, 'house_red');
        configureHouse(red_house, 3);
        green_house = houses.create(15350, game.world.height - 760, 'transparent_house_green');
        configureHouse(green_house, 4); 
        green_house = houses.create(15350, game.world.height - 1265, 'transparent_house_green');
        configureHouse(green_house, 4);
        green_house = houses.create(15350, game.world.height - 1763, 'transparent_house_green');
        configureHouse(green_house, 4);
        big_house = houses.create(15600, game.world.height - 625, 'transparent_big_house');
        configureHouse(big_house, 2);
        big_house = houses.create(15630, game.world.height - 996, 'big_house_orange');
        configureHouse(big_house, 2);
        small_house = houses.create(15630, game.world.height - 1238, 'small_house');
        configureHouse(small_house, 1);
        red_house = houses.create(15900, game.world.height - 468, 'transparent_house_red');
        configureHouse(red_house, 3);
        red_house = houses.create(15900, game.world.height - 676, 'house_orange');
        configureHouse(red_house, 3);
        big_house = houses.create(16296, game.world.height - 667, 'transparent_big_house');
        configureHouse(big_house, 2);
        big_house = houses.create(16619, game.world.height - 667, 'transparent_big_house');
        configureHouse(big_house, 2);
        big_house = houses.create(16455, game.world.height - 1035, 'transparent_big_house');
        configureHouse(big_house, 2);
        red_house = houses.create(17084, game.world.height - 468, 'house_orange');
        configureHouse(red_house, 3);
        red_house = houses.create(17400, game.world.height - 468, 'house_red');
        configureHouse(red_house, 3);
        red_house = houses.create(17218, game.world.height - 675, 'house_red');
        configureHouse(red_house, 3);
        red_house = houses.create(17550, game.world.height - 675, 'house_orange');
        configureHouse(red_house, 3);
        red_house = houses.create(17370, game.world.height - 882, 'house_orange');
        configureHouse(red_house, 3);
        green_house = houses.create(17497, game.world.height - 1389, 'house_green');
        configureHouse(green_house, 4);
        small_house = houses.create(17798, game.world.height - 500, 'small_house_mirrored');
        configureHouse(small_house, 1);
        small_house = houses.create(18069, game.world.height - 500, 'small_transparent _house');
        configureHouse(small_house, 1);
        small_house = houses.create(17933, game.world.height - 740, 'small_transparent _house');
        configureHouse(small_house, 1);
        small_house = houses.create(17727, game.world.height - 918, 'small_transparent _house');
        configureHouse(small_house, 1);
        green_house = houses.create(18307, game.world.height - 760, 'transparent_house_green');
        configureHouse(green_house, 4); 
        red_house = houses.create(18591, game.world.height - 676, 'house_orange');
        configureHouse(red_house, 3);
        red_house = houses.create(18591, game.world.height - 468, 'house_red');
        configureHouse(red_house, 3);
        big_house = houses.create(18942, game.world.height - 625, 'big_house');
        configureHouse(big_house, 2);
        small_house = houses.create(18880, game.world.height - 871, 'small_house_mirrored');
        configureHouse(small_house, 1);
        green_house = houses.create(19182, game.world.height - 760, 'transparent_house_green');
        configureHouse(green_house, 4);
        green_house = houses.create(19182, game.world.height - 1265, 'transparent_house_green');
        configureHouse(green_house, 4);
        red_house = houses.create(19556, game.world.height - 468, 'transparent_house_red');
        configureHouse(red_house, 3);
        green_house = houses.create(19850, game.world.height - 760, 'house_green');
        configureHouse(green_house, 4); 
        big_house = houses.create(20100, game.world.height - 625, 'transparent_big_house');
        configureHouse(big_house, 2);
        big_house = houses.create(20408, game.world.height - 625, 'big_house_orange');
        configureHouse(big_house, 2);
        red_house = houses.create(20695, game.world.height - 468, 'house_orange');
        configureHouse(red_house, 3);
        small_house = houses.create(20716, game.world.height - 712, 'small_house');
        configureHouse(small_house, 1);
        big_house = houses.create(21007, game.world.height - 770, 'house_purple_left');
        configureHouse(big_house, 2);
        big_house = houses.create(21200, game.world.height - 770, 'house_purple_right');
        configureHouse(big_house, 2);
        small_house = houses.create(21200, game.world.height - 1013, 'small_house_mirrored');
        configureHouse(small_house, 1);
        small_house = houses.create(21021, game.world.height - 1013, 'small_house');
        configureHouse(small_house, 1);
        big_house = houses.create(21114, game.world.height - 1383, 'big_house');
        configureHouse(big_house, 2);
        red_house = houses.create(21574, game.world.height - 468, 'house_red_left');
        configureHouse(red_house, 3);
        red_house = houses.create(21843, game.world.height - 468, 'house_red_right');
        configureHouse(red_house, 3);
        red_house = houses.create(21574, game.world.height - 678, 'house_orange');
        configureHouse(red_house, 3);
        red_house = houses.create(21574, game.world.height - 888, 'transparent_house_red');
        configureHouse(red_house, 3);
        red_house = houses.create(21574, game.world.height - 1998, 'transparent_house_red');
        configureHouse(red_house, 3);
        green_house = houses.create(22130, game.world.height - 760, 'transparent_house_green');
        configureHouse(green_house, 4);
        green_house = houses.create(22130, game.world.height - 1265, 'transparent_house_green');
        configureHouse(green_house, 4);
        small_house = houses.create(22150, game.world.height - 1510, 'small_house_mirrored');
        configureHouse(small_house, 1);
        big_house = houses.create(22412, game.world.height - 625, 'big_house');
        configureHouse(big_house, 2);
        small_house = houses.create(22700, game.world.height - 500, 'small_house');
        configureHouse(small_house, 1);
        green_house = houses.create(22958, game.world.height - 760, 'house_green');
        configureHouse(green_house, 4); 
        //debug_home = small_house ; //для отладки
        
        //настройка игрока
        player = new Player(game, 22052, game.world.height - 850, 'player');
        //player.animations.add('stay');
        //player.animations.play('stay', 15, true);
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
        game.physics.arcade.collide(houses, player);
    },

    render: function () {
        //game.debug.body(debug_home); //посмотреть другие 
        //game.debug.body(ground);
        //game.debug.spriteInfo(player, 600, 32);
        //game.debug.spriteInfo(ground, 32, 32);
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

