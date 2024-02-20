const GAME_WIDTH = 640
const GAME_HEIGHT = 480
const MAX_SPEED = 10

class GameObject {

    static count(type) {
        return GameObject.all[type] ? Object.keys(GameObject.all[type]).length : 0
    }

    static delete(type, id) {
        delete GameObject.all[type][id]
    }

    constructor(socket) {
        this.id = socket.id
        this.socket = socket
        this.x = GAME_WIDTH / 2
        this.y = GAME_HEIGHT / 2
        this.pos = { x: this.x, y: this.y }

        this.maxSpeed = MAX_SPEED

        this.speedRate = 1

        this.speed = {
            dir: { x: 1, y: 0 },
            rate: { x: 0, y: 0 },
        }
    }

    add(gameObject) {
        if (!GameObject.all[gameObject.constructor.name]) {
            GameObject.all[gameObject.constructor.name] = { [this.id]: gameObject }
        }
        GameObject.all[gameObject.constructor.name][this.id] = gameObject
    }

    update() {
        this.pos.x += this.speed.dir.x * this.speed.rate.x * this.maxSpeed
        this.pos.y += this.speed.dir.y * this.speed.rate.y * this.maxSpeed
    }

    getDistance(obj) {
        const x = this.pos.x - (obj.pos.x + 32 / 2)
        const y = this.pos.y - (obj.pos.y + 32 / 2)

        return Math.sqrt(x * x + y * y)
    }
}

GameObject.all = {}

module.exports = GameObject
