const localtunnel = require('localtunnel')
const debug = require('debug')('ilp-spsp-invoice:localtunnel')

const Config = require('../lib/config')

class Localtunnel {
  constructor (deps) {
    this.config = deps(Config)
  }

  async listen () {
    debug('creating localtunnel')
    return new Promise((resolve, reject) => {
      localtunnel(this.config.port, {
        subdomain: this.config.subdomain
      }, (err, tunnel) => {
        if (err) reject(err)
        else {
          debug('created localtunnel. url=' + tunnel.url)
          resolve()
        }
      })
    })
  }
}

module.exports = Localtunnel
