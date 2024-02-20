const chalk = require('chalk')
const uuid = require('uuid')
const GameObject = require('./GameObject')

class Bullet extends GameObject {

    static update() {
        const bullets = GameObject.all['Bullet']
        const packet = []
        for (let i in bullets) {
            const bullet = bullets[i]
            bullet._update()
            if (bullet.isToDelete) {
                GameObject.delete('Bullet', bullet.id)
            } else {
                packet.push({
                    x: bullet.pos.x,
                    y: bullet.pos.y,
                    color: bullet.owner.color
                })
            }
        }
        return packet
    }

    constructor(owner, angle, socket = null) {
        super({ id: uuid.v4() }/*socket*/)

        this.owner = owner

        this.pos.x = owner.pos.x + 32 / 2
        this.pos.y = owner.pos.y + 32 / 2

        this.speed.dir.x = Math.cos(angle * Math.PI / 180)
        this.speed.dir.y = Math.sin(angle * Math.PI / 180)

        this.maxDuration = 50
        this.duration = 0
        this.isToDelete = false

        this.add(this)
    }

    _update() {
        this._updateDuration()
        this._updateSpeed()
        this._checkCollisions()
        super.update()
    }

    _updateDuration() {
        if(this.duration++ > this.maxDuration) {
            this.isToDelete = true
        }
    }

    _updateSpeed() {
        if (this.duration < this.maxDuration) {
            this.speed.rate.x = .8
            this.speed.rate.y = .8
        } else {
            this.speed.rate.x = 0
            this.speed.rate.y = 0
        }
    }

    _checkCollisions() {
        this._isCollidingWithPlayer()
    }

    _isCollidingWithPlayer() {
        const players = GameObject.all['Player']

        for (let i in players) {
            const player = players[i]
            if (player.id !== this.owner.id && this.getDistance(player) < 32 / 2) {
                // this bullet is colliding with a player
                player.hp--
                this.isToDelete = true
            }
        }
    }
}

module.exports = Bullet
