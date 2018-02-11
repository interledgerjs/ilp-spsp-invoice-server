const Config = require('../lib/config')
const debug = require('debug')('ilp-spsp-invoice:auth')

class Auth {
  constructor (deps) {
    this.config = deps(Config)
  }

  getMiddleware () {
    return async (ctx, next) => {
      const [ , token ] = ctx.get('authorization').match(/Bearer (.+)/) || []

      debug('checking auth token. given=' + token,
        'token=' + this.config.token,
        'eq=' + (token === this.config.token))

      // TODO: use something like JWT
      if (token !== this.config.token) {
        return ctx.throw(401, 'Invalid token')
      }

      return next()
    }
  }
}

module.exports = Auth
