const macFields = [
    'VERSION', 'STAMP', 'AMOUNT', 'REFERENCE', 'MESSAGE',
    'LANGUAGE', 'MERCHANT', 'RETURN', 'CANCEL', 'REJECT',
    'DELAYED', 'COUNTRY', 'CURRENCY', 'DEVICE', 'CONTENT',
    'TYPE', 'ALGORITHM', 'DELIVERY_DATE', 'FIRSTNAME', 'FAMILYNAME',
    'ADDRESS', 'POSTCODE', 'POSTOFFICE'
]

const defaultParams = {
    'VERSION'       : '0001',
    'STAMP'         : '', // Unique value
    'AMOUNT'        : '',
    'REFERENCE'     : '',
    'MESSAGE'       : '',
    'LANGUAGE'      : 'FI',
    'RETURN'        : '',
    'CANCEL'        : '',
    'REJECT'        : '',
    'DELAYED'       : '',
    'COUNTRY'       : 'FIN',
    'CURRENCY'      : 'EUR',
    'DEVICE'        : '10', // 10 = XML
    'CONTENT'       : '1',
    'TYPE'          : '0',
    'ALGORITHM'     : '3',
    'DELIVERY_DATE' : '',
    'FIRSTNAME'     : '',
    'FAMILYNAME'    : '',
    'ADDRESS'       : '',
    'POSTCODE'      : '',
    'POSTOFFICE'    : '',
    'MAC'           : '',
    'EMAIL'         : '',
    'PHONE'         : ''
}

const API_URL = "https://payment.checkout.fi"

// MERCHANT        : public || '375917',
// SECRET_KEY      : secret || 'SAIPPUAKAUPPIAS',

const crypto = require('crypto')
const fetch = require('node-fetch')
const FormData = require('form-data')
const parseXML = require('xml2js').parseString

function initPayment (payload, merchantPublic, merchantSecret) {
    const params = {
        ...defaultParams,
        ...payload,
        MERCHANT        : merchantPublic,
    }

    params.MAC = generateHash(params, merchantSecret)

    return getPaymentButtons(params)
}

// Send payment request to CO
// Receive payment info
function getPaymentButtons(payload) {
    const formData = new FormData;
    Object.keys(payload).forEach(key => {
        formData.append(key, payload[key])
    })

    // Make the request
    return fetch(API_URL, {
        method      : 'POST',
        body        : formData,
        cache       : 'no-cache',
    }).then(resp => {
        return resp.text()
    }).then(xml => {
        return new Promise((fulfill, reject) => {
            parseXML(xml, (err, result) => {
                if (err) return reject(err)
                fulfill(result.trade.paymentURL[0])
            })
        })
    })
}

const returnFields = ['VERSION', 'STAMP', 'REFERENCE', 'PAYMENT', 'STATUS', 'ALGORITHM']

function validateReturnSignature (queryParams, secret) {
    const hashable = returnFields.map(field => {
        return queryParams[field]
    }).join('&')

    const hash = (
        crypto.createHmac('sha256', secret)
        .update(hashable)
        .digest('hex')
        .toUpperCase()
    )

    return (hash === queryParams.MAC)
}

function generateHash(form, secret) {
    // Get fields in correct order and join them together with "+"-mark
    const hashable = macFields.map(field => {
        return form[field]
    }).join('+')

    // Generate SHA-256 digest
    return (
        crypto.createHmac('sha256', secret)
        .update(hashable)
        .digest('hex')
        .toUpperCase()
    )
}

function requestSiSPayment (payload) {
    //
}

module.exports = {
    initPayment,
    getPaymentButtons,
    generateHash
}
