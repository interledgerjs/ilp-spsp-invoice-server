const InvoiceModel = require('../models/invoice')
const Auth = require('../lib/auth')

class InvoiceController {
  constructor (deps) {
    this.invoices = deps(InvoiceModel)
    this.auth = deps(Auth)
  }

  async init (router) {
    router.get('/', this.auth.getMiddleware(), async ctx => {
      const { amount, reason, webhook } = ctx.request.body
      const { receiver } = await this.invoices.create({ amount, reason, webhook })
      ctx.body = { receiver }
    })
  }
}
