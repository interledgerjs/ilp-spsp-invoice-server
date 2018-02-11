const Config = require('../lib/config')

class Auth {
  constructor (deps) {
    this.config = deps(Config)
  }

  getMiddleware () {
    return async ctx => {
      const [ , token ] = ctx.get('authorization').match(/Bearer (.+?)/) || []  

      // TODO: use something like JWT 
      if (token !== this.config.token) {
        return ctx.throw(403, 'Invalid token')
      }
    }
  }
}
