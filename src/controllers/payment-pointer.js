const InvoiceModel = require('../models/invoice')
const Receiver = require('../lib/receiver')

class PaymentPointerController {
  constructor (deps) {
    this.invoices = deps(InvoiceModel)
    this.receiver = deps(Receiver)
  }

  async init (router) {
    await this.receiver.listen()

    router.get('/:invoice_id', async ctx => {
      if (ctx.get('Accept').indexOf('application/spsp+json') === -1) {
        return ctx.throw(404)
      }

      const invoice = await this.invoices.get(ctx.params.invoice_id)
      if (!invoice) {
        return ctx.throw(404, 'Invoice not found')
      }

      const id = ctx.params.invoice_id
      const { destinationAccount, sharedSecret } =
        this.receiver.generateAddressAndSecret(id)

      ctx.set('Content-Type', 'application/spsp+json')
      ctx.body = {
        destination_account: destinationAccount,
        shared_secret: sharedSecret,
        balance: {
          current: String(invoice.balance),
          maximum: String(invoice.amount)
        },
        receiver_info: {
          reason: invoice.reason
        }
      }
    })
  }
}

module.exports = PaymentPointerController
