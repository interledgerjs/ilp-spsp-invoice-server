const assert = require('chai').assert
const reduct = require('reduct')
const levelup = require('levelup')
const memdown = require('memdown')
const Invoice = require('../src/models/invoice')

var deps
var invoice

var amount = 100
var assetCode = 'USD'
var assetScale = 2
var webhook = 'http://example.com'
var additionalFields = {
  test: 'test'
}

describe('Invoice', function () {
  beforeEach(function () {
    deps = reduct()
    invoice = deps(Invoice)
    invoice.db = levelup(memdown())
  })
  describe('.create()', function () {
    it('should create an invoice', async function () {
      let expectedOutput = {
        balance: '0',
        amount: String(amount),
        assetCode,
        assetScale,
        webhook,
        additionalFields
      }
      let output = await invoice.create({ amount, assetCode, assetScale, webhook, additionalFields })
      let retrieval = JSON.parse(await invoice.db.get(output.id))
      assert(JSON.stringify(retrieval) === JSON.stringify(expectedOutput))
    })
  })
  describe('.pay()', function () {
    var id
    beforeEach(async function () {
      let output = await invoice.create({ amount, assetCode, assetScale, webhook, additionalFields })
      id = output.id
    })
    it('should adjust the balance', async function () {
      let amount = 50
      let expectedOutput = {
        balance: '50',
        amount: '100',
        assetCode,
        assetScale,
        webhook,
        additionalFields
      }
      await invoice.pay({ id, amount })
      await invoice.writeQueue
      let retrieval = JSON.parse(await invoice.db.get(id))
      assert(JSON.stringify(retrieval) === JSON.stringify(expectedOutput))
    })
    it('should not be paid', async function () {
      let amount = 50
      let output = await invoice.pay({ id, amount })
      assert(output === false)
    })
    it('should be paid', async function () {
      let amount = 100
      let output = await invoice.pay({ id, amount })
      assert(output === true)
    })
    it('should not be overpaid', async function () {
      let amount = 110
      let expectedOutput = {
        balance: '100',
        amount: '100',
        assetCode,
        assetScale,
        webhook,
        additionalFields
      }
      await invoice.pay({ id, amount })
      await invoice.writeQueue
      let retrieval = JSON.parse(await invoice.db.get(id))
      assert(JSON.stringify(retrieval) === JSON.stringify(expectedOutput))
    })
  })
})
