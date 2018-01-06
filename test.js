const Checkout = require('./src/Checkout')

const A = Checkout.initPayment({
    STAMP               : Date.now(),
    REFERENCE           : '12345',
    DELIVERY_DATE       : '20180104',
    RETURN              : 'https://ilmera.net/payment',
    AMOUNT              : 1234,
}, '375917', 'SAIPPUAKAUPPIAS')
