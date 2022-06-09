class Sprite {
    constructor({
        position, 
        imageSrc, 
        scale = 1, 
        framesMax = 1, 
        offset = {x: 0, y: 0},
    }) {
        this.position = position;
        this.width = 50;
        this.height = 150;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.offset = offset;
    }

    draw() {
        c.drawImage(this.image,
            // cropped image (one frame for an animation)
            this.framesCurrent * (this.image.width / this.framesMax), 
            0,
            this.image.width / this.framesMax,
            this.image.height,

            // actual image stats
            this.position.x - this.offset.x, 
            this.position.y - this.offset.y, 
            (this.image.width / this.framesMax) * this.scale, 
            this.image.height * this.scale
        );
    }

    animateFrames() {
        this.framesElapsed++;

        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++;
            } else {
                this.framesCurrent = 0;
            }
        }
    }

    update() {
        this.draw(); 
        this.animateFrames();
    }
}

class Fighter extends Sprite {
    constructor({
        position, 
        velocity,  
        imageSrc, 
        scale = 1, 
        framesMax = 1,
        offset = {x: 0, y: 0},
        sprites,
        attackBox = {offset: {}, width: undefined, height: undefined},
        damage
    }) {
        super({position, imageSrc, scale, framesMax, offset});
        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.lastKey; // last key that was pressed
        this.attackBox = { // attack hit box
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: attackBox.offset, // same as offset: offset
            width: attackBox.width,
            height: attackBox.height
        }
        this.isAttacking;
        this.health = 100;

        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.sprites = sprites;

        for (const sprite in this.sprites) { // make all different animation images
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }

        this.damage = damage;
        this.dead = false;
    }

    update() {
        this.draw();
        if (!this.dead) this.animateFrames(); // only animate when not dead
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        // draw attack box
        /*c.fillRect(
            this.attackBox.position.x, 
            this.attackBox.position.y,
            this.attackBox.width,
            this.attackBox.height);
        */

        this.position.x += this.velocity.x; // move sideways
        this.position.y += this.velocity.y; // move downward (gravity)
        
        // gravity
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 95) {
            this.velocity.y = 0; // stop falling when the bottom is hit
            this.position.y = 331; // fix small gap that appears when jumping
        } else {
            this.velocity.y += gravity; // increase velocity the longer we fall
        }
    }

    attack() {
        this.switchSprite('attack1'); // switch to attack animation
        this.isAttacking = true;
    }

    takeHit(damage) {
        
        this.health -= damage;
        // die if no health left
        if (this.health <= 0) {
            this.health = 0;
            this.switchSprite('death');
        } else { // otherwise take a hit
            this.switchSprite('takeHit');
        }

    }

    switchSprite(sprite) {
        // no more animation switches allowed when dead
        if (this.image === this.sprites.death.image) {
            if (this.framesCurrent === this.sprites.death.framesMax - 1) {
                this.dead = true;
            }
            return;
        }
        
        // don't allow other animations while attacking
        if (this.image === this.sprites.attack1.image 
            && this.framesCurrent < this.sprites.attack1.framesMax - 1) return; 

        // don't allow other animations while getting hit
        if (this.image === this.sprites.takeHit.image
            && this.framesCurrent < this.sprites.takeHit.framesMax - 1) return;

        // switch animation
        if (this.image !== this.sprites[sprite].image) {
                this.image = this.sprites[sprite].image;
                this.framesMax = this.sprites[sprite].framesMax;
                this.framesCurrent = 0;
        }
    }
}