/* globals window, document, io */

const socket = io()
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
const chatForm = document.getElementById('chat-form')
const chatInput = document.getElementById('chat-input')
const chatWindow = document.getElementById('chat-window')

/* ------------- Section: Game --------------*/

socket.on('draw', (data) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let player of data.players) {
        drawPlayer(ctx, player.x, player.y, player.color, player.maxhp, player.hp)
    }

    for (let bullet of data.bullets) {
        drawBullet(ctx, bullet.x, bullet.y, bullet.color)
    }
})

/* ------------- Section: Input -------------*/

document.addEventListener('keydown', (event) => {
    if (chatInput !== document.activeElement) {
        switch (event.code) {
        case 'KeyW':
            socket.emit('input', {inputId: 'up', state: true})
            break
        case 'KeyS':
            socket.emit('input', {inputId: 'down', state: true})
            break
        case 'KeyA':
            socket.emit('input', {inputId: 'left', state: true})
            break
        case 'KeyD':
            socket.emit('input', {inputId: 'right', state: true})
            break
        case 'Enter':
            chatInput.focus()
            break
        }
    }
})

document.addEventListener('keyup', (event) => {
    switch (event.code) {
    case 'KeyW':
        socket.emit('input', {inputId: 'up', state: false})
        break
    case 'KeyS':
        socket.emit('input', {inputId: 'down', state: false})
        break
    case 'KeyA':
        socket.emit('input', {inputId: 'left', state: false})
        break
    case 'KeyD':
        socket.emit('input', {inputId: 'right', state: false})
        break
    case 'Escape':
        // chatInput.blur()
        break
    }
})

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    // event.stopPropagation()
})

canvas.addEventListener('mousedown', (event) => {
    event.preventDefault() // stops text highlighting
    switch (event.button) {
    case 0:
        socket.emit('input', { inputId: 'click', mouse: { x: event.clientX, y: event.clientY }, state: true})
        break
    }
})

document.addEventListener('mouseup', (event) => {
    switch (event.button) {
    case 0:
        socket.emit('input', { inputId: 'click', state: false})
        break
    }
})

/* ------------- Section: Chat --------------*/

chatForm.addEventListener('submit', (event) => {
    event.preventDefault()
    let msg = chatInput.value.trim()

    if (msg !== '') {
        socket.emit('message', {id: socket.id, message: msg })
        chatInput.value = ''
        chatInput.blur()
    }
})

socket.on('message', (data) => {
    writeMessage(data)
})

/* ------------- Section: Helpers -----------*/

const drawPlayer = (context, x, y, color, maxhp, hp) => {
    const WIDTH = 32, HEIGHT = 32
    // context.fillStyle = 'silver'
    // context.fillRect(x, y, WIDTH, HEIGHT)
    if (hp > 0) {
        context.fillStyle = 'red'
        context.fillRect(x, y - HEIGHT / 4, WIDTH, 4)
        context.fillStyle = 'lime'
        context.fillRect(x, y - HEIGHT / 4, WIDTH * hp / maxhp, 4)
    }
    context.beginPath()
    context.moveTo(x, y + HEIGHT)
    context.bezierCurveTo(
        x + WIDTH / 4,
        y + HEIGHT / 4 + 1,
        x + WIDTH * 3 / 4,
        y + HEIGHT / 4 + 1,
        x + WIDTH,
        y + HEIGHT)
    context.fillStyle = color
    context.moveTo(x + WIDTH / 2, y)
    if (hp > 0) context.arc(x + WIDTH / 2, y + HEIGHT / 4 - 1, 7, 0, 2 * Math.PI)
    context.fill()
}

const drawBullet = (context, x, y, color) => {
    context.beginPath()
    context.fillStyle = color
    context.moveTo(x, y)
    context.arc(x, y, 5, 0, 2 * Math.PI)
    context.fill()
}

const writeMessage = (packet) => {
    const div = document.createElement('div')
    const span = document.createElement('span')
    span.textContent = 'Joueur: '
    span.style.color = packet.color
    div.appendChild(span)
    div.appendChild(document.createTextNode(packet.message))
    chatWindow.appendChild(div)
}