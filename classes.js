class Sprite {
    constructor({position, image, frames = {max: 1, hold: 10}, sprites, animate = false, isEnemy = false}) {
        this.position = position
        this.image = image
        this.frames = {...frames, val:0, elapsed: 0}
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.health = 100
        this.isEnemy = isEnemy
    }

    draw() {
        context.save()
        context.globalAlpha = this.opacity
        context.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height, 
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        )
        context.restore()

        if (!this.animate) {
            return
        }

        if (this.frames.max > 1) {
            this.frames.elapsed++;
        }

        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) {
                this.frames.val++
            } else {
                this.frames.val = 0
            }
        }
    }

    attack({attack, recipient, renderedSprites}) {
        let healthBar = '#enemyHealthBar'
        if (this.isEnemy) healthBar = '#playerHealthBar'

        this.health -= attack.damage

        switch (attack.name) {
            case 'Fireball':
                const fireballImage = new Image()
                fireballImage.src = './img/fireball.png'
                const fireball = new Sprite({
                    position: {
                        x: this.position.x, 
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames : {
                        max: 4,
                        hold: 5
                    },
                    animate: true
                })

                renderedSprites.push(fireball)

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        gsap.to(healthBar, {
                            width: this.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        renderedSprites.pop()
                    }
                })

                break;
            case 'Tackle':
                const tl = gsap.timeline()

                let movementDistance = 20
                console.log(this.isEnemy)
                if (this.isEnemy) movementDistance = -20

                tl.to(this.position, {
                    x:this.position.x - movementDistance
                }).to(this.position, {
                    x:this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {
                        gsap.to(healthBar, {
                            width: this.health + '%'
                        })

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x:this.position.x
                })
                break;
        }
    }
}

class Boundary {
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = 40
        this.height = 40
    }

    draw() {
        context.fillStyle = 'rgba(255, 0, 0, 0.5)'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}