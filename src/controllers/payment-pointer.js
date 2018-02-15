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
      if (ctx.get('Accept').indexOf('application/spsp4+json') === -1) {
        return ctx.throw(404)
      }

      const invoice = await this.invoices.get(ctx.params.invoice_id)
      if (!invoice) {
        return ctx.throw(404, 'Invoice not found')
      }

      const socket = this.receiver.getSocket(ctx.params.invoice_id)
      socket.setMinAndMaxBalance(invoice.amount - invoice.balance)

      ctx.set('Content-Type', 'application/spsp+json')
      ctx.body = {
        destination_account: socket.destinationAccount,
        shared_secret: socket.sharedSecret,
        balance: {
          current: String(invoice.balance),
        },
        receiver_info: {
          reason: invoice.reason
        }
      }

      ctx.body.balance[ invoice.amount < 0 ? 'minimum' : 'maximum' ] =
        String(invoice.amount)
    })
  }
}

module.exports = PaymentPointerController
