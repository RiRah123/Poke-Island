const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

console.log(collisions)

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, i + 70))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, i + 70))
}   

const offset = {
    x: -785,
    y: -650
}

const boundaries = []

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
    }
  )
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
    battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
    }
  )
})

console.log(battleZones)


console.log(collisionsMap)

canvas.fillStyle = 'white'

const image = new Image()
image.src = './img/pelletTown.png'

const foregroundImage = new Image()
foregroundImage.src = './img/foreground.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

const keys = {
    w : {
        pressed: false,
    },
    a: {
        preseed: false,
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    },
}

// canvas.width / 2 - (this.image.width / 4) / 2, 
// canvas.height / 2 - this.image.height / 2,

const player = new Sprite({
    position: {
      x: canvas.width / 2 - 192 / 4 / 2 - 40, // change this line for mac without - 40
      y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
  position: {
      x: offset.x + 432, // change this line for mac
      y: offset.y + 145 // change this line for mac
  },
  image: foregroundImage
})

const movables = [background, ...boundaries, foreground, ...battleZones]

function rectangularCollision({ rectangle1, rectangle2 }, sprites) {
    return (
      rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
      rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
      rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
      rectangle1.position.y <= rectangle2.position.y + rectangle2.height
    );
}

const battle = {
  intiated: false,
}
  

let speed = 3

function animate() {
    const animationId = window.requestAnimationFrame(animate)
    console.log(animationId)
    background.draw()
    boundaries.forEach((boundary) => {
        boundary.draw()
    })
    battleZones.forEach((battleZone) => {
      battleZone.draw()
    })
    player.draw()
    foreground.draw()

    if (battle.intiated) {
      return
    }

    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
      for (let i = 0; i < battleZones.length; i++) {
        const battleZone = battleZones[i];
        const overlappingArea =  (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) * (Math.max(player.position.y + player.height, battleZone.height) - Math.max(player.position.y, battleZone.position.y)) // change this line for mac maybe
        if (rectangularCollision({
          rectangle1: player, 
          rectangle2: battleZone
          }) && overlappingArea > (player.width * player.height) / 2
          && Math.random() < 0.01
        ) {
          console.log("battle zone")
          window.cancelAnimationFrame(animationId)
          battle.intiated = true
          gsap.to('#overlappingDiv', {
            opacity: 1,
            repeat: 3,
            yoyo: true,
            duration: 0.4,
            onComplete() {
              gsap.to('#overlappingDiv', {
                opacity: 1,
                duration: 0.4,
                onComplete() {
                  animateBattle()
                  gsap.to('#overlappingDiv', {
                    opacity: 0,
                    duration: 0.4
                  })
                }
              })
            }
          })
          break;
        }
      }
    }

    let moving = true
    player.animate = false
    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true
        player.image = player.sprites.up
        for (let i = 0; i < movables.length; i++) {
          const boundary = boundaries[i];
          if (boundary && rectangularCollision({
            rectangle1: player, 
            rectangle2: {
              ...boundary, 
              position: {
                x: boundary.position.x,
                y: boundary.position.y + speed
              }
            }
          })) {
            moving = false
            break;
          }
        }
          
        if (moving) {
            movables.forEach(movable => {
                if (movable.position) {
                    movable.position.y += speed;
                }
            });
        }          
    } else if (keys.a.pressed && lastKey === 'a') {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < movables.length; i++) {
            const boundary = boundaries[i];
            if (boundary && rectangularCollision({
              rectangle1: player, 
              rectangle2: {
                ...boundary, 
                position: {
                  x: boundary.position.x + speed,
                  y: boundary.position.y,
                }
              }
            })) {
              moving = false
              break;
            }
          }
          
        if (moving) {
            movables.forEach(movable => {
                if (movable.position) {
                    movable.position.x += speed;
                }
            });
        } 
    } else if (keys.s.pressed && lastKey === 's') {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < movables.length; i++) {
            const boundary = boundaries[i];
            if (boundary && rectangularCollision({
              rectangle1: player, 
              rectangle2: {
                ...boundary, 
                position: {
                  x: boundary.position.x,
                  y: boundary.position.y - speed,
                }
              }
            })) {
              moving = false
              break;
            }
          }
          
        if (moving) {
            movables.forEach(movable => {
                if (movable.position) {
                    movable.position.y -= speed;
                }
            });
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < movables.length; i++) {
            const boundary = boundaries[i];
            if (boundary && rectangularCollision({
              rectangle1: player, 
              rectangle2: {
                ...boundary, 
                position: {
                  x: boundary.position.x - speed,
                  y: boundary.position.y,
                }
              }
            })) {
              moving = false
              break;
            }
          }
          
        if (moving) {
            movables.forEach(movable => {
                if (movable.position) {
                    movable.position.x -= speed;
                }
            });
        }
    }
}

// animate()

let lastKey = ''

window.addEventListener('keydown', (event) => {
   switch(event.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
   }
})

window.addEventListener('keyup', (event) => {
    switch(event.key) {
         case 'w':
             keys.w.pressed = false
             break
         case 'a':
             keys.a.pressed = false
             break
         case 's':
             keys.s.pressed = false
             break
         case 'd':
             keys.d.pressed = false
             break
    }
 })

const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})

const draggleImage = new Image()
draggleImage.src = './img/draggleSprite.png'
const draggle = new Sprite({
  position: {
    x: 800,
    y: 100
  },
  image:draggleImage,
  frames: {
    max: 4,
    hold: 30
  },
  animate: true,
  isEnemy: true,
  name: 'Draggle'
})

const embyImage = new Image()
embyImage.src = './img/embySprite.png'
const emby = new Sprite({
  position: {
    x: 280,
    y: 325
  },
  image:embyImage,
  frames: {
    max: 4,
    hold: 30
  },
  animate: true,
  name: 'Emby'
})

const renderedSprites = [draggle, emby]
function animateBattle() {
  window.requestAnimationFrame(animateBattle);
  battleBackground.draw()
  draggle.draw()
  emby.draw()

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
 }

animateBattle()
 
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', (event) => {
    const selectedAttack = attacks[event.currentTarget.innerHTML]
    console.log(selectedAttack)
    emby.attack({
      attack: selectedAttack,
      recipient: draggle,
      renderedSprites
    })
  })
})