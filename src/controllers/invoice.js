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
      const { amount, assetCode, assetScale, webhook, ...additionalFields } = ctx.request.body
      const { invoice } = await this.invoices.create({ amount, assetCode, assetScale, webhook, additionalFields })
      ctx.body = { invoice }
    })
  }
}

module.exports = InvoiceController
