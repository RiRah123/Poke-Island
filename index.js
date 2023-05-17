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
      x: canvas.width / 2 - 192 / 4 / 2 - 40,
      y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4
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
      x: offset.x + 432,
      y: offset.y + 145
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
  

let speed = 3

function animate() {
    window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach((boundary) => {
        boundary.draw()
    })
    battleZones.forEach((battleZone) => {
      battleZone.draw()
    })
    player.draw()
    foreground.draw()

    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
      for (let i = 0; i < battleZones.length; i++) {
        const battleZone = battleZones[i];
        const overlappingArea =  (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) * (Math.max(player.position.y + player.height, battleZone.height) - Math.max(player.position.y, battleZone.position.y))
        if (rectangularCollision({
          rectangle1: player, 
          rectangle2: battleZone
          }) && overlappingArea > (player.width * player.height) / 2
        ) {
          console.log("battle zone")
          break;
        }
      }
    }

    let moving = true
    player.moving = false
    if (keys.w.pressed && lastKey === 'w') {
        player.moving = true
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
        player.moving = true
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
        player.moving = true
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
        player.moving = true
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

animate()

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