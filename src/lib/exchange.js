const fetch = require('node-fetch')
const Price = require('ilp-price')

const Config = require('./config')
const debug = require('debug')('ilp-spsp-pull:exchange')

class Exchange {
  constructor (deps) {
    this.config = deps(Config)
  }

  async fetchRate (tokenAssetCode, tokenAssetScale, serverAssetCode, serverAssetScale) {
    if (tokenAssetCode === serverAssetCode) {
      return Math.pow(10, serverAssetScale - tokenAssetScale)
    }

    const apis = this.sortedApiList()
    let rate
    let scaledRate

    for (let api in apis) {
      debug(`Trying to convert using ${String(apis[api].name)}...`)
      rate = await apis[api](tokenAssetCode, serverAssetCode)
      if (rate) {
        scaledRate = rate * Math.pow(10, serverAssetScale - tokenAssetScale)
        break
      } else {
        rate = await apis[api](serverAssetCode, tokenAssetCode)
        if (rate) {
          scaledRate = (1 / rate) * Math.pow(10, serverAssetScale - tokenAssetScale)
          break
        }
      }
    }
    if (scaledRate) {
      return scaledRate
    } else {
      return false
    }
  }

  sortedApiList () {
    const apiSet = new Set([eval(this.config.exchange), ilpprice, cryptocompare, bitstamp, bitsane])
    const apis = [...apiSet]
    if (apis.length === 4) {
      return apis
    } else {
      return [cryptocompare, bitstamp, bitsane]
    }
  }
}

module.exports = Exchange

async function ilpprice (assetCode1, assetCode2) {
  const price = new Price()
  let asset1, asset2
  try {
    asset1 = await price.fetch(assetCode1, 1)
    asset2 = await price.fetch(assetCode2, 1)
    if (asset1 && asset2) {
      return asset1 / asset2
    }
    return false
  } catch (err) {
    return false
  }
}

async function cryptocompare (assetCode1, assetCode2) {
  const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${assetCode1}&tsyms=${assetCode2}`)
  if (response.ok) {
    const json = await response.json()
    return json[assetCode2]
  }
  return false
}

async function bitstamp (assetCode1, assetCode2) {
  const response = await fetch(`https://www.bitstamp.net/api/v2/ticker/${assetCode1}${assetCode2}/`)
  if (response.ok) {
    const json = await response.json()
    return json.last
  }
  return false
}

async function bitsane (assetCode1, assetCode2) {
  const response = await fetch(`https://bitsane.com/api/public/ticker?pairs=${assetCode1}_${assetCode2}`)
  if (response.ok) {
    const json = await response.json()
    try {
      return json[`${assetCode1}_${assetCode2}`].last
    } catch (err) {
      return false
    }
  }
  return false
}
