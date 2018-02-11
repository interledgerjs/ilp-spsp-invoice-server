const fetch = require('node-fetch')

const Config = require('../lib/config')
const InvoiceModel = require('../models/invoice')

class Webhooks {
  constructor (deps) {
    this.config = deps(Config)
    this.invoices = deps(InvoiceModel)
  }

  async call (id) {
    const invoice = await this.invoices.get(id)

    if (!invoice.webhook) {
      return
    }

    return fetch(invoice.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        balance: invoice.balance,
        amount: invoice.amount,
        pointer: invoice.pointer()
      })
    })
  }
}
