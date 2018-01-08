# Checkout.fi
**[Checkout.fi](https://checkout.fi/)** makes it easy and straight-forward to accept payments directly via :bank: Finnish banks, :euro: wire transfers, and :credit_card: credit cards. To make it even easier, I decided to build this library for Node.js developers :muscle:

## Usage

### Authentication
To authenticate yourself to Checkout API, you must pass so called _authentication object_ to every function you invoke. To create new object, you could call:
```js
const auth = new Checkout.CheckoutAuth('375917', 'SAIPPUAKAUPPIAS')
```

### Create new payment
This is the root of the whole library and pretty self-explanotary

```js
const payment = Checkout.initPayment({
    stamp               : 'gUQ5e1wtYrFUxHMk',
    ref                 : 'pXTac1vOPMHkXuFC',
    deliveryDate        : new Date(2018, 0, 23),
    amount              : 1234,
    urls                : {
        return              : 'https://hostname/payment',
    }
}, auth)
```

#### Required fields

| fieldName             | type          | description                                                              |
|:----------------------|:--------------|:-------------------------------------------------------------------------|
| stamp                 | `String`      | Unique ID for this transaction                                           |
| ref                   | `String`      | Another identifier, which doesn't have to be unique                      |
| delivery              | `Object`      | Information about delivery. See more info [here](#data-types).           |
| amount                | `Number`      | Payment amount in cents (1€ = 100). Must be integer.                     |
| urls                  | `Object`      | URL where client will be redirected after successful / cancelled payment |

#### Optional fields

| fieldName             | type          | description                                                              | defaultValue        |
|:----------------------|:--------------|:-------------------------------------------------------------------------|:--------------------|
| message               | `String`      | Freeform message shown to user                                           |                     |
| adultContent          | `Boolean`     | Set this value `true` if you're selling adult content. Default `false`.  | `false`             |

Remember to save all this information also to your own database, so you can [validate return signature](#validate-return-signature) later.

### Validate return signature
When customer finishes his/her payment and returns to your webshop, before proceeding, you should first validate the _return signature_.

Pass all the GET-params you received from Checkout as a `Object` into first parameter.

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

**Please also remember** to verify `STAMP` and `REFERENCE` values of the requests you receive, as your _return url_ might be called more than once. This prevents your shop to process the request infinitely, even there has only been one payment.

### Polling order status
In some cases, order won't become marked as paid instantly. For example if customer pays with wire transfer, it could take up to 4 days to complete transaction. To handle these cases, you have to frequently (at least once a day) poll for updates of orders.

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

## Data types

### Delivery

| fieldName             | type          | description                                                                |
|:----------------------|:--------------|:---------------------------------------------------------------------------|
| deliveryDate          | `Date`        | Delivery date. If not set, defaults to current date.                       |
| firstName             | `String`      | First name of of the recipient. Required when using loaning services.      |
| lastName              | `String`      | Last name of of the recipient. Required when using loaning services.       |
| address               | `String`      | Delivery address of recipient. Required when using loaning services.       |
| zipCode               | `String`      | Zip code / postal code of recipient. Required when using loaning services. |
| language              | `String`      | Either `FI`, `SE` or `EN`. If not set, defaults to `"FI"`.                 |
| country               | `String`      | ISO-3166-1 alpha-3 formatted country. If not set, defaults to `"FIN"`.     |
