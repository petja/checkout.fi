const crypto = require('crypto')
const fetch = require('node-fetch')
const FormData = require('form-data')
const parseXML = require('xml2js').parseString

const API_URL = 'https://rpcapi.checkout.fi/poll'

function CheckoutAuth (merchantId, secretKey) {
    if(!merchantId || !secretKey) throw 'You must have merchantId and secretKey set'

    this.merchantId = merchantId
    this.secretKey = secretKey
}

function getOrder (order, auth) {
    // Validate user input
    if(!auth) throw 'You must provide authentication object'

    if(!order) throw 'You must provide order object'
    if(!order.stamp) throw 'You must define "stamp" when querying order status'
    if(!order.ref) throw 'You must define "ref" when querying order status'
    if(!order.amount) throw 'You must define "amount" when querying order status'

    // Map values
    const formData = {
        VERSION         : (order.SiS ? '0002' : '0001'),
        STAMP           : order.stamp,
        REFERENCE       : order.ref,
        MERCHANT        : order.merchant || auth.merchantId,
        AMOUNT          : order.amount,
        CURRENCY        : order.currency || 'EUR',
        ALGORITHM       : order.alg || '4',
        FORMAT          : order.format || '1',
    }

    // Calculate hash
    formData.MAC = _getPollMac(formData, auth)

    // Convert object to urlencoded form
    const form = new FormData
    Object.keys(formData).forEach(key => form.append(key, formData[key]))

    // Fetch status of order
    return fetch(API_URL, {
        method      : 'POST',
        body        : form,
        cache       : 'no-cache',
    }).then(resp => {
        return resp.text()
    }).then(xml => {
        if (xml === 'error\n') throw 'Checkout API returned error while polling. Most likely you have queried order with wrong params.'

        return new Promise((fulfill, reject) => {
            parseXML(xml, (err, result) => {
                if (err) return reject(err)
                fulfill(result.trade.status[0])
            })
        })
    })
}

function getMultipleOrders (orders = [], auth) {
    if(orders instanceof Array === false) throw 'You must provide array as the first argument when seeking for multiple orders'

    const promises = orders.map(order => {
        return getOrder(order, auth)
    })

    return Promise.all(promises)
}

// Calculate hash for the poll
function _getPollMac (formData, auth) {
    const fieldOrder = [
        'VERSION', 'STAMP', 'REFERENCE', 'MERCHANT',
        'AMOUNT', 'CURRENCY', 'FORMAT', 'ALGORITHM'
    ]

    const hashable = fieldOrder.map(field => {
        if(!formData.hasOwnProperty(field)) throw 'Cannot calculate hash as field "' + field + '" isn\'t present'
        return formData[field]
    }).join('+')

    return (
        crypto.createHmac('sha256', auth.secretKey)
        .update(hashable)
        .digest('hex')
        .toUpperCase()
    )
}

module.exports = {
    CheckoutAuth,
    getOrder,
    getMultipleOrders,
}
