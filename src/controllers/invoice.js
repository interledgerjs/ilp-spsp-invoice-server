const InvoiceModel = require('../models/invoice')
const Auth = require('../lib/auth')
const debug = require('debug')('ilp-spsp-invoice:invoice')

class InvoiceController {
  constructor (deps) {
    this.invoices = deps(InvoiceModel)
    this.auth = deps(Auth)
  }

  async init (router) {
    router.post('/', this.auth.getMiddleware(), async ctx => {
      debug('creating invoice')
      const { amount, reason, webhook } = ctx.request.body
      const { receiver } = await this.invoices.create({ amount, reason, webhook })
      ctx.body = { receiver }
    })
  }
}

module.exports = InvoiceController
