const path = require('path')
const chalk = require('chalk')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const GameObject = require('./game/GameObject')
const Player = require('./game/Player')
const Bullet = require('./game/Bullet')

const PORT = process.env.PORT || 8080

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'), err => {
        if (err) res.status(err.status).end()
    })
})

app.use('/client', express.static(path.join(__dirname, 'client')))

http.listen(PORT, () => console.log(chalk.blue('Server listening on port: ') + PORT))

// network events
io.on('connection', (socket) => {

    // Game events
    Player.onConnection(socket) // create a new player

    socket.on('disconnect', () => {
        Player.onDisconnection(socket) // remove player
    })

    // Chat events
    socket.on('message', (data) => {
        // console.log(data.message)
        const players = GameObject.all['Player']
        console.log(chalk.magenta('Chat   ') + `Player (${players[data.id].color}) [`  + chalk.dim(data.id) + '] ' + `"${chalk.gray(data.message)}"`)
        for (let i in players) {
            const packet = {
                color: players[data.id].color,
                message: data.message
            }
            players[i].socket.emit('message', packet)
        }
    })
})

// game loop
setInterval(() => {
    const players = GameObject.all['Player']

    // get all player's pos to be drawn
    const packets = {
        players: Player.update(), //Player.getPackets()
        bullets: Bullet.update()
    }

    for (let i in players) {
        players[i].socket.emit('draw', packets)
    }
}, 1000/25)
