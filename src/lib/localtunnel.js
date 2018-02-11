const localtunnel = require('localtunnel')

const Config = require('../lib/config')

class Localtunnel {
  constructor (deps) {
    this.config = deps(Config)
  }

  async listen () {
    return new Promise((resolve, reject) => {
      localtunnel(this.config.port, {
        subdomain: this.config.env.SUBDOMAIN
      }, (err, tunnel) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
