## Checkout
**[Checkout.fi](http://checkout.fi/)** provides great ways to make payments on e-commerce. This is unofficial library to help Node.js developers to add Checkout.fi-functionality to their stores.

### How to get started
We're still working on with docs. Meanwhile you can try to learn syntax from [test.js](test.js)-file.

## Poll orders

You can easily checkout statuses of orders

```js`
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
```
