const Koa = require('koa')
const fetch = require('node-fetch')
const router = require('koa-router')()
const parser = require('koa-bodyparser')()
const app = new Koa()
const PSK2 = require('ilp-protocol-psk2')
const plugin = require('ilp-plugin')()
const uuid = require('uuid')
const localtunnel = require('localtunnel')
const getPort = require('get-port')
const chalk = require('chalk')

class Invoice {
  constructor ({
    reason,
    amount,
    webhook
  }) {
    this.reason = reason
    this.amount = Number(amount)
    this.webhook = webhook
    this.balance = 0
    this.id = uuid()
  }

  pointer () {
    return '$' + process.env.SUBDOMAIN + '.localtunnel.me/' + this.id
  }
}

async function run () {
  await plugin.connect()

  const invoices = new Map()
  const receiver = await PSK2.createReceiver({
    plugin,
    paymentHandler: async params => {
      const amount = params.prepare.amount
      const invoiceId = params.prepare.destination.split('.').slice(-3)[0]
      const invoice = invoices.get(invoiceId)

      console.log('got packet. amount=' + amount, 'invoice=' + invoiceId)

      if (invoice.balance >= invoice.amount) {
        return params.reject('this invoice has completed')
      }

      invoice.balance += Number(params.prepare.amount)

      if (invoice.balance >= invoice.amount && invoice.webhook) {
        fetch(invoice.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance: invoice.balance,
            amount: invoice.amount,
            pointer: invoice.pointer()
          })
        }).catch(e => {
          console.error('failed to post to webhook. error=', e)
        })
      }

      return params.acceptSingleChunk()
    }
  })

  router.get('/:invoice_id', async ctx => {
    if (ctx.get('Accept').indexOf('application/spsp+json') === -1) {
      return ctx.throw(404)
    }

    const invoice = invoices.get(ctx.params.invoice_id)
    if (!invoice) {
      return ctx.throw(404, 'invoice not found')
    }

    const { destinationAccount, sharedSecret } = receiver.generateAddressAndSecret()
    const segments = destinationAccount.split('.')
    const resultAccount = segments.slice(0, -2).join('.') + '.' + invoice.id + '.' + segments.slice(-2).join('.')

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

  router.post('/', async ctx => {
    const { amount, reason, webhook } = ctx.request.body
    const invoice = new Invoice({ amount, reason, webhook })

    invoices.set(invoice.id, invoice)
    ctx.body = {
      receiver: invoice.pointer()
    }
  })

  const port = await getPort()

  app
    .use(parser)
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port)
  
  console.log('listening on ' + port)
  localtunnel(port, { subdomain: process.env.SUBDOMAIN }, (err, tunnel) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    console.log(chalk.green('public at:', tunnel.url))
  })
}

run()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
