const InvoiceModel = require('../models/invoice')
const Server = require('../lib/server')

class PaymentPointerController {
  constructor (deps) {
    this.invoices = deps(InvoiceModel)
    this.server = deps(Server)
  }

  async init (router) {
    await this.server.listen()

    router.get('/:invoice_id', async ctx => {
      if (ctx.get('Accept').indexOf('application/spsp4+json') === -1) {
        return ctx.throw(404)
      }

      const invoice = await this.invoices.get(ctx.params.invoice_id)
      if (!invoice) {
        return ctx.throw(404, 'Invoice not found')
      }

      const { destinationAccount, sharedSecret } =
        this.server.generateAddressAndSecret(ctx.params.invoice_id)

      ctx.body = {
        destination_account: destinationAccount,
        shared_secret: sharedSecret.toString('base64'),
        push: {
          balance: String(invoice.balance),
          invoice: {
            amount: String(invoice.amount),
            asset: {
              code: invoice.assetCode,
              scale: invoice.assetScale
            },
            additional_fields: invoice.additionalFields
          }
        }
      }
      ctx.set('Content-Type', 'application/spsp4+json')
    })
  }
}

module.exports = PaymentPointerController
