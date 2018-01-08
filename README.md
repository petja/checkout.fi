## Checkout.fi
**[Checkout.fi](https://checkout.fi/)** makes accepting payments easy and straigt-forward. With this Node.js library you can make it even easier.

## Authentication
To authenticate yourself to Checkout API, you must pass so called __authentication object__ to every function you invoke. To create new object, you could call:
```js
const auth = new Checkout.CheckoutAuth('375917', 'SAIPPUAKAUPPIAS')
```

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
