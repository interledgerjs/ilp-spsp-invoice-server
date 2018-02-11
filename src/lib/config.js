const IlpPlugin = require('ilp-plugin')

class Config {
  constructor (deps) {
    this.port = process.env.SPSP_PORT || 6000
    this.localtunnel = !!process.env.SPSP_LOCALTUNNEL
    this.subdomain = process.env.SPSP_LOCALTUNNEL_SUBDOMAIN
    this.plugin = IlpPlugin()
    this.dbPath = process.env.SPSP_DB_PATH
    this.token = process.env.SPSP_AUTH_TOKEN || 'test'
    this.host = process.env.SPSP_HOST || this.localtunnel
      ? this.subdomain + '.localtunnel.me'
      : 'localhost:' + this.port

    if (this.localtunnel && !this.subdomain) {
      throw new Error('subdomain must be specified if localtunnel is used')
    }
  }
}

module.exports = Config
