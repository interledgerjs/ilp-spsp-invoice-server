const { PaymentServer } = require('ilp-protocol-paystream')
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
    this.receiver = null
  }

  async listen () {
    await this.plugin.connect()

    this.receiver = new PaymentServer(this.plugin, crypto.randomBytes(32))
    await this.receiver.connect()
  }

  getSocket (id) {
    const socket = this.receiver.createSocket({
      enableRefunds: true
    })

    socket.on('incoming_chunk', async amount => {
      // this will throw if the invoice has been paid already
      debug('got packet. amount=' + amount, 'invoice=' + id)
      const paid = await this.invoices.pay({ id, amount })

      if (paid) {
        this.webhooks.call({ id })
          .catch(e => {
            debug('failed to call webhook. error=', e)
          })
      }
    })

    return socket 
  }
}

module.exports = Receiver
