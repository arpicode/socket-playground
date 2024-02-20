const chalk = require('chalk')
const GameObject = require('./GameObject')
const Bullet = require('./Bullet')

class Player extends GameObject {

    static onConnection(socket) {
        const player = new Player(socket)
        console.log(chalk.magenta('Client') + ` Player (${player.color}) [` + chalk.dim(socket.id) + '] ' + chalk.green('connected...'))

        socket.on('input', (data) => {
            switch (data.inputId) {
            case 'up':
                player.isPressingUp = data.state
                break
            case 'down':
                player.isPressingDown = data.state
                break
            case 'left':
                player.isPressingLeft = data.state
                break
            case 'right':
                player.isPressingRight = data.state
                break
            case 'click':
                player.isPressingLeftClick = data.state
                player.mouseClickCoords = data.mouse
                break
            }
        })
    }

    static onDisconnection(socket) {
        const player = GameObject.all['Player'][socket.id]
        GameObject.delete('Player', socket.id)
        console.log(chalk.magenta('Client') + ` Player (${player.color}) [` + chalk.dim(socket.id) + '] ' + chalk.yellow('disconnected...'))
    }

    static update() {
        const players = GameObject.all['Player']
        const packet = []
        for (let i in players) {
            const player = players[i]
            player._update()
            // player.shootRandomBullets() // For testing purposes
            packet.push({
                x: player.pos.x,
                y: player.pos.y,
                color: player.color,
                maxhp: player.maxHP,
                hp: player.hp
            })
        }
        return packet
    }

    constructor(socket) {
        super(socket)
        this.color = Player.colors[Math.floor(Math.random() * Player.colors.length)].toLowerCase()

        this.pos.x += 10 * GameObject.count('Player') // Créer un décalage provisoir pour éviter
        this.pos.y += 10 * GameObject.count('Player') // la superposition des nouveaux player

        this.maxSpeed = 10
        this.maxHP = 10
        this.hp = this.maxHP

        this.isPressingUp = false
        this.isPressingDown = false
        this.isPressingLeft = false
        this.isPressingRight = false

        this.mouseClickCoords = { x: this.pos.x, y: this.pos.y }
        this.isPressingLeftClick = false

        this.add(this)
    }

    shootRandomBullets() {
        if (Math.random() > 0.8) {
            const angle = Math.floor(Math.random() * (360 + 1))
            const bullet = new Bullet(this, angle)
        }
    }

    shootBullet() {
        const x = this.mouseClickCoords.x - this.pos.x - 32 / 2
        const y = this.mouseClickCoords.y - this.pos.y - 32 / 2
        const angle = Math.atan2(y, x) / Math.PI * 180
        const bullet = new Bullet(this, angle)
    }

    _update() {
        this._updateSpeed()
        super.update()

        if (this.isPressingLeftClick) {
            // this.shootRandomBullets()
            this.shootBullet()
        }
        if (this.hp <= 0) {
            this.maxSpeed = 0
            this.shootBullet = () => {}
        }
    }

    _updateSpeed() {
        if (this.isPressingUp) { this.speed.dir.y = -1; this.speed.rate.y = this.speedRate }
        else if (this.isPressingDown) { this.speed.dir.y = 1; this.speed.rate.y = this.speedRate }
        else this.speed.rate.y = 0

        if (this.isPressingLeft) { this.speed.dir.x = -1; this.speed.rate.x = this.speedRate }
        else if (this.isPressingRight) { this.speed.dir.x = 1; this.speed.rate.x = this.speedRate }
        else this.speed.rate.x = 0
    }
}

Player.colors = [
    'Maroon',
    'darkgoldenrod',
    'Olive',
    'Green',
    'darkcyan',
    'Teal',
    'Blue',
    'Fuchsia',
    'Purple',
    '#74C493',
    '#C94A53',
    '#E4BF80',
]

module.exports = Player
