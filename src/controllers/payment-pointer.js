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

      const { destinationAccount, sharedSecret } = receiver.generateAddressAndSecret()
      const segments = destinationAccount.split('.')
      const resultAccount = segments.slice(0, -2).join('.') +
        '.' + invoice.id +
        '.' + segments.slice(-2).join('.')

      ctx.set('Content-Type', 'application/spsp+json')
      ctx.body = {
        destination_account: resultAccount,
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
