const builder = require('xmlbuilder')
const crypto = require('crypto')
const fetch = require('node-fetch')
const FormData = require('form-data')

const obj = {
    checkout            : [
        {
            request             : [
                {
                    '@type'             : 'aggregator',
                    '@test'             : 'false',
                    aggregator      : '375917',
                    version         : '0002',
                    stamp           : 'Mk2eo6Bn4FsIyS2W2', // Unique ID
                    reference       : 'UKSSEniLvdRSb1hY', // Reference to order
                    description     : 'Museojunalippu\nHyvinkää-Karjaa\nKarjaa-Hyvinkää\n\n13.6.2017',
                    device          : 10,
                    content         : 1,
                    type            : 0,
                    algorithm       : 3,
                    currency        : 'EUR',
                    items           : [
                        {
                            item            : [
                                {
                                    description     : 'Hyvinkää-Karjaa Menopaluu 13.8.2018 Aikuinen',
                                    merchant        : '375917',
                                    price           : 4000,
                                    //control         : '', // Stringified JSON
                                }
                            ],
                            amount          : 4000
                        },
                    ],
                    buyer           : [
                        {
                            firstName       : 'Petja',
                            familyName      : 'Touru',
                            language        : 'FI',
                            country         : 'FIN',
                        }
                    ],
                    delivery        : {
                        date            : '20180123',
                    },
                    control         : {
                        return          : 'https://ilmera.net/api/payment/process',
                        cancel          : 'https://ilmera.net/user/payment?cancel',
                        //reject          : 'URL',
                    },
                }
            ],
        }
    ],
}

const API_URL = 'https://payment.checkout.fi'

/*const xml = `<?xml version="1.0"?>
    <checkout xmlns="http://checkout.fi/request">
        <request type="aggregator" test="false">
            <aggregator>375917</aggregator>
            <token>02343287-1e1a-4b92-8008-367e6ce35221</token>
            <version>0002</version>
            <stamp>PT1</stamp>
            <reference>123456</reference>
            <device>10</device>
            <content>1</content>
            <type>0</type>
            <algorithm>3</algorithm>
            <currency>EUR</currency>
            <commit>false</commit>
            <description>SiS tokenized payment test request</description>
            <items>
                <item>
                    <code/>
                    <description>sub trade</description>
                    <price currency="EUR" vat="23">2500</price>
                    <merchant>391830</merchant>
                    <control/>
                </item>
                <amount currency="EUR">2500</amount>
            </items>
            <buyer>
                <country>FIN</country>
                <language>FI</language>
            </buyer>
            <delivery>
                <date>20170619</date>
            </delivery>
        </request>
    </checkout>
`*/

function sendTransaction () {
    const xml = builder.create(obj).end({pretty: true})
    const xmlBase64 = new Buffer(xml).toString('base64')
    //const xmlBase64 = 'PD94bWwgdmVyc2lvbj0iMS4wIj8+CiAgICA8Y2hlY2tvdXQgeG1sbnM9Imh0dHA6Ly9jaGVja291dC5maS9yZXF1ZXN0Ij4KICAgICAgICA8cmVxdWVzdCB0eXBlPSJhZ2dyZWdhdG9yIiB0ZXN0PSJmYWxzZSI+CiAgICAgICAgICAgIDxhZ2dyZWdhdG9yPjM3NTkxNzwvYWdncmVnYXRvcj4KICAgICAgICAgICAgPHRva2VuPjAyMzQzMjg3LTFlMWEtNGI5Mi04MDA4LTM2N2U2Y2UzNTIyMTwvdG9rZW4+CiAgICAgICAgICAgIDx2ZXJzaW9uPjAwMDI8L3ZlcnNpb24+CiAgICAgICAgICAgIDxzdGFtcD4xMjM0NTY3ODk8L3N0YW1wPgogICAgICAgICAgICA8cmVmZXJlbmNlPjEyMzQ1NjwvcmVmZXJlbmNlPgogICAgICAgICAgICA8ZGV2aWNlPjEwPC9kZXZpY2U+CiAgICAgICAgICAgIDxjb250ZW50PjE8L2NvbnRlbnQ+CiAgICAgICAgICAgIDx0eXBlPjA8L3R5cGU+CiAgICAgICAgICAgIDxhbGdvcml0aG0+MzwvYWxnb3JpdGhtPgogICAgICAgICAgICA8Y3VycmVuY3k+RVVSPC9jdXJyZW5jeT4KICAgICAgICAgICAgPGNvbW1pdD5mYWxzZTwvY29tbWl0PgogICAgICAgICAgICA8ZGVzY3JpcHRpb24+U2lTIHRva2VuaXplZCBwYXltZW50IHRlc3QgcmVxdWVzdDwvZGVzY3JpcHRpb24+CiAgICAgICAgICAgIDxpdGVtcz4KICAgICAgICAgICAgICAgIDxpdGVtPgogICAgICAgICAgICAgICAgICAgIDxjb2RlLz4KICAgICAgICAgICAgICAgICAgICA8ZGVzY3JpcHRpb24+c3ViIHRyYWRlPC9kZXNjcmlwdGlvbj4KICAgICAgICAgICAgICAgICAgICA8cHJpY2UgY3VycmVuY3k9IkVVUiIgdmF0PSIyMyI+MjUwMDwvcHJpY2U+CiAgICAgICAgICAgICAgICAgICAgPG1lcmNoYW50PjM5MTgzMDwvbWVyY2hhbnQ+CiAgICAgICAgICAgICAgICAgICAgPGNvbnRyb2wvPgogICAgICAgICAgICAgICAgPC9pdGVtPgogICAgICAgICAgICAgICAgPGFtb3VudCBjdXJyZW5jeT0iRVVSIj4yNTAwPC9hbW91bnQ+CiAgICAgICAgICAgIDwvaXRlbXM+CiAgICAgICAgICAgIDxidXllcj4KICAgICAgICAgICAgICAgIDxjb3VudHJ5PkZJTjwvY291bnRyeT4KICAgICAgICAgICAgICAgIDxsYW5ndWFnZT5GSTwvbGFuZ3VhZ2U+CiAgICAgICAgICAgIDwvYnV5ZXI+CiAgICAgICAgICAgIDxkZWxpdmVyeT4KICAgICAgICAgICAgICAgIDxkYXRlPjIwMTcwNjE5PC9kYXRlPgogICAgICAgICAgICA8L2RlbGl2ZXJ5PgogICAgICAgIDwvcmVxdWVzdD4KICAgIDwvY2hlY2tvdXQ+Cg=='

    const secret = 'SAIPPUAKAUPPIAS'

    const mac = (
        crypto.createHmac('sha256', secret)
        .update(xmlBase64)
        .digest('hex')
        .toUpperCase()
    )

    console.log({mac, xmlBase64})

    const formData = new FormData;
    formData.append('CHECKOUT_XML', xmlBase64)
    formData.append('CHECKOUT_MAC', mac)

    return fetch(API_URL, {
        method      : 'POST',
        body        : formData,
        cache       : 'no-cache',
    }).then(resp => {
        return resp.text()
    }).then(xml => {
        console.log(xml)
    })
}

function requestPayment (payload) {
    if(!payload.aggregator) throw 'Payment aggregator must be defined'
    if(!payload.stamp) throw 'Stamp must be defined'
    if(!payload.reference) throw 'Reference must be defined'
}

class CheckoutCart {

    constructor (payload = {}) {
        if(!payload.merchant) throw 'Merchant ID must be defined'
        if(!payload.stamp) throw 'Payment Stamp must be defined'
        if(!payload.reference) throw 'Payment Reference must be defined'

        this.aggregator     = payload.merchant
        this.stamp          = payload.stamp
        this.reference      = payload.reference

        this.items          = []
    }

    addItem (description, price, sku, merchantId = this.aggregator) {
        const item = new CheckoutItem(merchantId, description, price, sku)
        this.items.push(item)
        return item
    }

}

class CheckoutItem {

    constructor (merchantId, description, price, sku) {
        this.merchantId     = merchantId
        this.description    = description
        this.price          = Math.round(price * 100)
        this._commLeft      = Math.round(price * 100)
        this.sku            = sku
        this.commissions    = []
    }

    addCommission (percent, amount, description, merchantId = this.merchantId) {
        const commission = Math.round(this.price * percent + amount * 100)

        if(this._commLeft - commission < 0) throw 'No commission left'
        this._commLeft -= commission

        this.commissions.push({
            a       : commission,
            m       : merchantId,
            d       : description,
        })

        return commission
    }

}


sendTransaction()

const cart = new CheckoutCart({
    merchant        : '230197',
    stamp           : Math.random().toString(),
    reference       : Math.random().toString(),
})
cart.addItem('Museojunalippu Kr-Hy Aikuinen', 25.00, 'TICKET').addCommission(0.95, -1.00)
cart.addItem('Museojunalippu Kr-Hy Lapsi', 13.00, 'TICKET').addCommission(0.95, -1.00)
console.log(require('util').inspect(cart, {depth: null, colors: true}))


