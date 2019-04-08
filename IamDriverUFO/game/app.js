"use strict";

let config = {
    sound: true,
    targetWidth: 1920,
    targetHeight: 1080
};



var game = new Phaser.Game(config.targetWidth, config.targetHeight, Phaser.CANVAS);


let player;  //игрок

let cursors; //кнопки стрелок
let fireButton; //кнопка выстрела (пробел)
let actionButton;  //F

class Player extends Phaser.Sprite {

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    actionButton = game.input.keyboard.addKey(Phaser.KeyCode.F);

    //оружие
    weapon = game.add.weapon(1, 'bullet');
    patrons = 2;

    constructor(game, x, y, texture){
        super(game, x, y, texture);
        this.scale.setTo(0.5, 0.5);
        this.anchor.setTo(0.5, 0.5); //центровка якоря в игроке

        this.animations.add('player_stay', Phaser.Animation.generateFrameNames('Stay_stay_', 0, 27, '.png', 2), 25, true);  //префикс имени, номер начала, номер конца, символы после цифр, количество цифр
        this.animations.add('walk', Phaser.Animation.generateFrameNames('Armature_walk_', 0, 16, '.png', 2), 16, true);
        this.animations.add('jump', Phaser.Animation.generateFrameNames('Jump_jump_', 0, 40, '.png', 2), 24, true);
        this.animations.add('fire', Phaser.Animation.generateFrameNames('Fire_attack_', 0, 24, '.png', 2), 24, true);

        game.physics.arcade.enableBody(this);
        this.body.setSize(150, 402, 50, 0);
        this.body.collideWorldBounds = true;
        this.body.health = 100;
        this.body.speed = 100;
        this.body.bounce.y = 0.1;
        this.body.gravity.y = 800;

        game.add.existing(this); // добавляет в игру
        //настройка оружия
        this.weapon.addBulletAnimation('laser_weapon',null, 24, true);
        this.weapon.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
        this.weapon.bulletSpeed = 1000;
    }

    //система кармы
    //TODO синхронизировать логику с сюжетом
    karma = 0;
    
    //маркеры состояния (особенность движка)
    isLeft = false;
    isRight = false;
    isJump = false;
    isJumping = false;
    isFire = false;
    isShooting = false;
    isFired = true;
    isAction = false;

    //таймеры
    timer = game.time.create(false);
    timerFire = game.time.create(false);

    //звуки
    fire_sound = game.add.audio('laser', 1, false);

    update() {
        game.physics.arcade.collide(this, ground);

        this.body.velocity.x = 0;
        //cursors = game.input.keyboard.createCursorKeys();

        if ((cursors.left.isDown || this.isLeft) && !this.isShooting) {
            if (!this.isJumping || this.body.touching.down) {
                this.body.setSize(150, 402, 50, 2);
                this.animations.play('walk');
            }
            this.scale.x = -0.5;
            this.body.velocity.x = -300;
        }
        else if ((cursors.right.isDown || this.isRight) && !this.isShooting) {
            if (!this.isJumping || this.body.touching.down) {
                this.body.setSize(150, 402, 50, 2);
                this.animations.play('walk');
            } 
            this.scale.x = 0.5;
            this.body.velocity.x = 300;
        }

        if ((cursors.up.isDown || this.isJump) && this.body.touching.down && !this.isShooting) {
            this.body.velocity.y = -755;
            this.body.setSize(150, 370, 50, 100);
            this.animations.play('jump', 24, false);
            this.timer.loop(1900, () => {
                this.timer.stop();
                this.isJumping = false;
                this.animations.play('player_stay');
                this.body.setSize(150, 402, 50, 0);
            }, this);
            this.isJumping = true;
            this.timer.start();
            return;
        } 

        //выстрел
        if ((fireButton.isDown || this.isFire) && this.body.touching.down && (this.patrons > 0)) {
            this.animations.play('fire', 24, false);
            this.timerFire.loop(770, () => {
                
                if (this.isShooting) {
                    this.isShooting = false;
 
                    this.body.setSize(180, 401, 0, 0);
                    if (this.scale.x < 0) { //отражен ли спрайт по горизонтали
                        this.weapon.trackSprite(this, -70, -50);
                        this.weapon.fireAngle = 180;
                    }
                    else {
                        this.weapon.trackSprite(this, 75, -50);
                        this.weapon.fireAngle = 0;
                    }  
                    if (this.isFired) {
                        this.weapon.fire();
                        if (config.sound) this.fire_sound.play();
                        this.patrons--;
                    } 
                } 
                if (!this.isFired) {
                    this.timerFire.stop();
                    this.animations.play('player_stay');
                    this.isFired = true;
                }
                else
                    this.isFired = false;
            }, this);
            this.isShooting = true;
            this.timerFire.start();   
        }
        if (this.body.velocity.x == 0 && !this.isJumping && !this.isShooting && this.isFired)
            this.animations.play('player_stay');
    }

    doAction() {

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

var MainMenu = {

    preload: function () {
        game.load.image('load', 'assets/UI/load.png');
        game.load.spritesheet('newGameButton', 'assets/UI/new_game.png', 405, 178);
        game.load.spritesheet('sound', 'assets/UI/sound.png', 405, 178);
        game.load.image('background', 'assets/background.jpg');
        game.load.audio('menu_music', 'assets/audio/(main_menu)Kevin MacLeod - Phantom from Space.mp3');
    },

    newGameButton: null,
    soundButton1: null,
    soundButton2: null,
    music_theme: null,
    create: function () {

        //масштабирование игры под экран
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorisontally = true;
        game.scale.pageAlignVertically = true;

        game.stage.backgroundColor = '#2e0648';
        let background = game.add.image(0, 0, 'background');
        background.anchor.setTo(0.5, 0.5);
        background.position.setTo(config.targetWidth / 2, config.targetHeight / 2);
        game.add.tween(background.scale).to({ x: 1.04, y: 1.04 }, 3500, Phaser.Easing.Sinusoidal.InOut, true, 2000, 20, true).loop(true);

        //кнопки
        this.newGameButton = game.add.button(game.width / 2, game.height / 2 + 100, 'newGameButton', this.startClick, this, 0, 0, 0);
        this.newGameButton.anchor.setTo(0.5, 0.5); //якорь по центру
        this.soundButton1 = game.add.button(game.width / 2 - 220, game.height - 120, 'sound', this.soundClick, this, 0, 0, 0);
        this.soundButton2 = game.add.button(game.width / 2 + 220, game.height - 120, 'sound', this.muteClick, this, 3, 3, 3);
        this.soundButton1.anchor.setTo(0.5, 0.5);
        this.soundButton2.anchor.setTo(0.5, 0.5);

        this.music_theme = game.add.audio('menu_music', 1, true); //ключ, громкость, зацикленность
        if (config.sound) this.music_theme.play()
        //game.state.start('MainGame'); //отладка
    },

    update: function () {

    },

    startClick: function () {
        this.music_theme.stop();
        game.state.start('IntroGame');
    },

    soundClick: function () {
        this.soundButton1.setFrames(0, 0, 0);
        this.soundButton2.setFrames(3, 3, 3);
        if (!config.sound) this.music_theme.play();
        config.sound = true;
    },

    muteClick: function () {
        this.soundButton1.setFrames(1, 1, 1);
        this.soundButton2.setFrames(2, 2, 2);
        config.sound = false;
        this.music_theme.stop()
    }
}
 
let houses; // группа домов
let ground; // группа поверхностей земля
let debug_home; //отлаживаемый объект
let spaceship;

let tools = {
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) //регулярное выражение
}

//фоны, для параллакса глобальные переменные
let sky; 
let rock_background;
let rocks_middle;
let rocks_foreground;


var MainGame = {

    preload: function () {
        //экран загрузки
        game.add.sprite(0, 0, 'load');

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
        game.load.image('flash', 'assets/flash.png');

        //игрок
        game.load.atlasJSONHash('player', 'assets/animation/anim1.png', 'assets/animation/anim1.json');
        game.load.spritesheet('bullet', 'assets/laser_anim.png', 153, 38);
        //game.dragonBonesPlugin = game.plugins.add(Rift.DragonBonesPlugin);  //не работает, не поддерживается движком
        //game.SpinePlugin = game.add.plugin(PhaserSpine.SpinePlugin);  ////не работает, нет поддержки физики объекта

        //музыка
        game.load.audio('game_main', 'assets/audio/game.mp3');
        game.load.audio('laser', 'assets/audio/laser1.ogg');
        
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        //наэкранные кнопки
        if (tools.isMobile()) {
            game.load.image('UI_left', 'assets/UI/UI_left.png');
            game.load.image('UI_right', 'assets/UI/UI_right.png');
            game.load.image('UI_A', 'assets/UI/UI_A.png');
            game.load.image('UI_X', 'assets/UI/UI_X.png');
        }
        game.load.image('UI_F', 'assets/UI/UI_F.png');
    },

    showDialog: function (caption, text, textButton) {

    },

    music_theme: null,

    //текстовые блоки
    patrons_text: null,
    health_text: null,

    create: function () {
        //музыка
        this.music_theme = game.add.audio('game_main', 1, true);
        if (config.sound) this.music_theme.play();

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 24000, 2300);

        //небо
        var bitmap = game.add.bitmapData(game.world.width, game.world.height);
        var gradient = bitmap.context.createLinearGradient(0, 0, game.world.width, 0);
        gradient.addColorStop(0, "#0b0540");
        gradient.addColorStop(0.5, "#99ccff");
        gradient.addColorStop(1, "#0b0540");
        bitmap.context.fillStyle = gradient;
        bitmap.context.fillRect(0, 0, game.world.width, game.world.height);
        game.add.sprite(0, 0, bitmap);

        //ground = game.add.sprite(0, game.world.height - 50, 'ground'); //временно
        ground = game.add.tileSprite(0, game.world.height - 300, 24000, 300, 'ground');

        game.physics.arcade.enable(ground); //создает тело объекту
        ground.body.setSize(24000, 0, 0, 50);
        ground.body.collideWorldBounds = true;
        ground.body.immovable = true;

        //горы
        let rocks = game.add.group(); 

        rock_background = [];
        rock_background.push(rocks.create(0, game.world.height - 742, 'rock_background'));
        rock_background.push(rocks.create(7338, game.world.height - 742, 'rock_background'));
        rock_background.push(rocks.create(14673, game.world.height - 742, 'rock_background'));
        rock_background.push(rocks.create(22010, game.world.height - 742, 'rock_background'));

        rocks_middle = [];
        rocks_middle.push(rocks.create(0, game.world.height - 714, 'rocks_middle'));
        rocks_middle.push(rocks.create(7337, game.world.height - 714, 'rocks_middle'));
        rocks_middle.push(rocks.create(14673, game.world.height - 714, 'rocks_middle'));
        rocks_middle.push(rocks.create(22010, game.world.height - 714, 'rocks_middle'));

        rocks_foreground = [];

        rocks_foreground.push(rocks.create(0, game.world.height - 657, 'rocks_foreground'));
        rocks_foreground.push(rocks.create(7337, game.world.height - 657, 'rocks_foreground'));
        rocks_foreground.push(rocks.create(14673, game.world.height - 657, 'rocks_foreground'));
        rocks_foreground.push(rocks.create(22010, game.world.height - 657, 'rocks_foreground'));

        //корабль
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

        //сломалась карта домов -> импровизация. вжух и много кода!
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


        //настройка игрока
        player = new Player(game, 8000, game.world.height - 850, 'player');
        player.body.velocity.y = 0;

        //player = game.dragonBonesPlugin.getArmature('player');
        //player.position.setTo(8000, game.world.height - 850);

        //камера
        game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.4, 0.8);
        

        //наэкранные кнопки (треюуется созданный игрок)
        if (tools.isMobile()) {

            let buttonLeft = game.add.button(70, config.targetHeight - 300, 'UI_left', null, this, 0, 0, 0);
            buttonLeft.fixedToCamera = true;  
            buttonLeft.events.onInputDown.add(() => { player.isLeft = true; });
            buttonLeft.events.onInputUp.add(() => { player.isLeft = false; });

            let buttonRight = game.add.button(70 + 250, config.targetHeight - 300, 'UI_right', null, this, 0, 0, 0);
            buttonRight.fixedToCamera = true;
            buttonRight.events.onInputDown.add(() => { player.isRight = true; });
            buttonRight.events.onInputUp.add(() => { player.isRight = false; });

            let buttonA = game.add.button(config.targetWidth - 290, config.targetHeight - 300, 'UI_A', null, this, 0, 0, 0);
            buttonA.fixedToCamera = true;
            buttonA.events.onInputDown.add(() => { player.isJump = true; });
            buttonA.events.onInputUp.add(() => { player.isJump = false; });

            let buttonX = game.add.button(config.targetWidth - 290 - 260, config.targetHeight - 300, 'UI_X', null, this, 0, 0, 0);
            buttonX.fixedToCamera = true;
            buttonX.events.onInputDown.add(() => { player.isFire = true; });
            buttonX.events.onInputUp.add(() => { player.isFire = false; });
        }

        //индикаторы
        let style = { font: "60px Nord", fill: "white", align: "center" };
        this.patrons_text = game.add.text(config.targetWidth - 200, 100, "2", style);
        this.health_text = game.add.text(70, 100, "+100", style);
        this.patrons_text.fixedToCamera = true;
        this.health_text.fixedToCamera = true;

        //кнопка действия
        this.actionText = game.add.button(0, 0, 'UI_F', this.doAction, this);
        this.actionText.scale.setTo(0.5, 0.5);
        this.actionText.anchor.setTo(0.5, 1);
        this.actionText.visible = false;
    },

    actionText: null,

    update: function () {
        game.physics.arcade.collide(houses, player);
        //параллакс
        for (var i in rock_background) {
            rock_background[i].position.x = game.camera.position.x / 5 + i * 7337;
        }
        for (var i in rocks_middle) {
            rocks_middle[i].position.x = game.camera.position.x / 15 + i * 7337;
        }
        for (var i in rocks_foreground) {
            rocks_foreground[i].position.x = game.camera.position.x / 30 + i * 7337;
        }

        //текст
        if (player.patrons == 0) this.patrons_text.fill = 'red';
        this.patrons_text.text = '- ' + player.patrons + ' -';
        this.health_text.text = '+ ' + player.body.health;

        //кнопка действия
        if (player.isAction) {
            this.actionText.position.setTo(player.position.x, player.position.y - 130);
            this.actionText.visible = true;
        } 
        else this.actionText.visible = false;

    },

    doAction() {
        player.doAction();
    },

    render: function () {
        //game.debug.body(debug_home); //посмотреть другие 
        //game.debug.body(player);
        //game.debug.spriteInfo(player, 600, 32);
        //game.debug.spriteInfo(ground, 32, 32);
        //game.debug.spriteBounds(player);
    }
}

var IntroGame = {

    preload: function () {

    },

    create: function () {
        //let text = " текст\n текст";
        //let style = { font: "24px Nord", fill: "white", align: "center" };
        //let text_view = game.add.text(100, 400, text, style);
        //text_view.fixedToCamera = true;
        //text_view.wordWrap = true;
        //text_view.wordWrapWidth = 228; //ширина блока

        game.state.start('MainGame');
    },

    update: function () {

    },
}

var ConclusionGame = {

    preload: function () {

    },

    create: function () {
        
    },

    update: function () {

    },
}


game.state.add('IntroGame',IntroGame);
game.state.add('MainGame', MainGame);
game.state.add('MainMenu',MainMenu);
game.state.add('ConclusionGame',ConclusionGame);  
game.state.start('MainMenu');

