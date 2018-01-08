const Poll = require('../src/Poll')

const auth = new Poll.CheckoutAuth('375917', 'SAIPPUAKAUPPIAS')

Poll.getMultipleOrders([

    {SiS: true, stamp: 'Mk2eo6Bn4FsIyS2W2', ref: 'UKSSEniLvdRSb1hY', amount: 4000},
    {SiS: true, stamp: 'pbWgA8EVZ92cfo5r', ref: 'qe6kgks4JyRfmHIL', amount: 4000},

], auth).then(stuff => {

    console.log(stuff)

}).catch(err => {

    console.error(err)

})
