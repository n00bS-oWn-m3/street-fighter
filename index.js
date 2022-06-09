const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.7;

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './img/background.png'
});

const shop = new Sprite({
    position: {
        x: 600,
        y: 128
    },
    imageSrc: './img/shop.png',
    scale: 2.75,
    framesMax: 6
});

const player = new Fighter({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    scale: 2.5,
    offset: {
        x: 215,
        y: 156
    },
    imageSrc: './img/samuraiMack/Idle.png',
    framesMax: 8,
    sprites: {
        idle: {
            imageSrc: './img/samuraiMack/Idle.png',
            framesMax: 8,
        },
        run: {
            imageSrc: './img/samuraiMack/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/samuraiMack/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/samuraiMack/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/samuraiMack/Attack1.png',
            framesMax: 6,
        },
        attack2: {
            imageSrc: './img/samuraiMack/Attack2.png',
            framesMax: 6,
        },
        death: {
            imageSrc: './img/samuraiMack/Death.png',
            framesMax: 6,
        },
        takeHit: {
            imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
            framesMax: 4,
        },
    },
    attackBox: {
        offset: {
            x: 100,
            y: 50
        },
        width: 150,
        height: 50
    },
    damage: 30
});

const enemy = new Fighter({
    position: {
        x: 400,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    scale: 2.5,
    offset: {
        x: 215,
        y: 170
    },
    imageSrc: './img/kenji/Idle.png',
    framesMax: 4,
    sprites: {
        idle: {
            imageSrc: './img/kenji/Idle.png',
            framesMax: 4,
        },
        run: {
            imageSrc: './img/kenji/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/kenji/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/kenji/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/kenji/Attack1.png',
            framesMax: 4,
        },
        attack2: {
            imageSrc: './img/kenji/Attack2.png',
            framesMax: 4,
        },
        death: {
            imageSrc: './img/kenji/Death.png',
            framesMax: 7,
        },
        takeHit: {
            imageSrc: './img/kenji/Take Hit - white silhouette.png',
            framesMax: 3,
        },
    },
    attackBox: {
        offset: {
            x: -160,
            y: 50
        },
        width: 150,
        height: 50
    },
    damage: 20
});

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

decreaseTimer(); // activate timer loop

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height); // background
    background.update();
    shop.update();

    // fade out background with white semi-opac layer
    c.fillStyle = 'rgba(255,255,255, 0.15';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;
    
    
    // player movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5;
        player.switchSprite('run');
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5;
        player.switchSprite('run');
    } else {
        player.switchSprite('idle'); // default idle animation
    }

    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall');
    }

    // enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5;
        enemy.switchSprite('run');
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5;
        enemy.switchSprite('run');
    } else {
        enemy.switchSprite('idle');
    }

    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall');
    }

    // detect for collision & enemy gets hit
    if (rectangularCollision({rect1: player, rect2: enemy}) 
    && player.isAttacking
    && player.framesCurrent === 4) { // delay a bit until the sword is out
        enemy.takeHit(player.damage);
        player.isAttacking = false;
        // document.querySelector('#enemyHealth').style.width = enemy.health + "%";
        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        });
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false;
    }

    // same for enemy & player gets hit
    if (rectangularCollision({rect1: enemy, rect2: player}) 
    && enemy.isAttacking
    && enemy.framesCurrent === 2) { // delay a bit until the sword is out
        player.takeHit(enemy.damage);
        enemy.isAttacking = false;
        // document.querySelector('#playerHealth').style.width = player.health + "%";
        gsap.to('#playerHealth', {
            width: player.health + '%'
        });
    }

    // if enemy misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false;
    }

    // end game becasue of death
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({player, enemy, timerId});
    }
}

animate();

// handle input (key pressed down)
window.addEventListener('keydown', (event) => {
    // player controls
    if (!player.dead) {
        switch (event.key) {
            case 'd':
                keys.d.pressed = true;
                player.lastKey = 'd'
                break;
            case 'a':
                keys.a.pressed = true;
                player.lastKey = 'a'
                break;
            case 'w':
                player.velocity.y = -20;
                break;
            case' ':
                player.attack();
                break;
        };
    }
    

    // enemy controls
    if (!enemy.dead) {
        switch(event.key) {
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight'
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft'
                break;
            case 'ArrowUp':
                enemy.velocity.y = -20;
                break;
            case 'ArrowDown':
                enemy.attack();
                break;
        };
    }
});

window.addEventListener('keyup', (event) => {
    // player keys
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
    }

    // enemy keys
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }

});