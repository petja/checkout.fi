## Checkout.fi
**[Checkout.fi](https://checkout.fi/)** makes it easy and straight-forward to accept payments directly via Finnish banks, wire transfers, or credit cards. To make it even easier, I decided to build this library for Node.js developers.

## Authentication
To authenticate yourself to Checkout API, you must pass so called _authentication object_ to every function you invoke. To create new object, you could call:
```js
const auth = new Checkout.CheckoutAuth('375917', 'SAIPPUAKAUPPIAS')
```

## Validate return signature
When customers finishes the payment and returns to your webshop, you first should validate signature before proceeding.

Basically you just pass all the GET-params you received from CO as a object into first parameter.

If the function returns `true`, you should be safe to continue. If function returns `false`, your credentials might not be correct, or customer has tampered the GET-parameters and tried to abuse your webshop.

Example with [Express.js](https://expressjs.com/):

```js
app.get('/api/payment/process', (req, res) => {
    const validPayment = Checkout.validateReturnSignature(req.query, auth)

    if (validPayment) {
        // Do magic in the database
    } else {
        // Tell the user that there has been error
    }
})
```

Please also remember to verify `STAMP` and `REFERENCE` value of the requests you receive, as your _return url_ might be called more than once. Without this check, you shop could infinitely generate new orders with only one payment.

## Poll orders
You can easily fetch statuses of orders by invoking `getOrder(Order)` or `getMultipleOrders(Array<Order>)` functions. Both will return a `Promise`. Fulfilled `Promise` returns `Number` or `Array<Number>` depending on which function you called. `Number` tells the status of the order, as explaned in the [Checkout Docs](https://checkoutfinland.github.io/#payment-statuses).

If `Promise` rejects, most likely you have used either invalid credentials, or supplied wrong information (unexistent `stamp` or `ref` for example).

```js
Checkout.getMultipleOrders([

    {SiS: true, stamp: 'Mk2eo6Bn4FsIyS2W2', ref: 'UKSSEniLvdRSb1hY', amount: 4000},
    {SiS: true, stamp: 'pbWgA8EVZ92cfo5r', ref: 'qe6kgks4JyRfmHIL', amount: 4000},

], auth).then(stuff => {

    console.log(stuff)

}).catch(err => {

    console.error(err)

})
```
