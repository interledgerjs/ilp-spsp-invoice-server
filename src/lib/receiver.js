const STREAM = require('ilp-protocol-stream')
const debug = require('debug')('ilp-spsp-invoice:receiver')
const crypto = require('crypto')

const Config = require('../lib/config')
const Webhooks = require('../lib/webhooks')
const InvoiceModel = require('../models/invoice')

class Receiver {
  constructor (deps) {
    this.config = deps(Config)
    this.invoices = deps(InvoiceModel)
    this.webhooks = deps(Webhooks)
    this.plugin = this.config.plugin
    this.server = null
  }

  async listen () {
    await this.plugin.connect()

    this.server = new STREAM.Server({
      plugin: this.plugin,
      serverSecret: crypto.randomBytes(32)
    })

    this.server.on('connection', connection => {
      const id = connection.connectionTag

      connection.on('money_stream', async stream => {
        // const invoice = await this.invoices.get(id)
        stream.setReceiveMax(10000)

        stream.on('incoming', async amount => {
          debug('got packet. amount=' + amount, 'invoice=' + id)
          const paid = await this.invoices.pay({ id, amount })

          if (paid) {
            stream.end()
            connection.close()
            this.webhooks.call({ id })
              .catch(e => {
                debug('failed to call webhook. error=', e)
              })
          }
        })
      })
    })

    await this.server.listen()
  }

  generateAddressAndSecret (tag) {
    return this.server.generateAddressAndSecret(tag)
  }
}

module.exports = Receiver
