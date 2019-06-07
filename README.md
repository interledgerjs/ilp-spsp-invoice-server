# ILP SPSP Invoice Server
> SPSP server that supports invoices

- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [API](#api)
  - [Create an Invoice](#create-an-invoice)
  - [Query an Invoice](#query-an-invoice)
  - [Webhooks](#webhooks)

## Usage

Make sure you have [moneyd](https://github.com/interledgerjs/moneyd) running. Then start the SPSP Invoice Server:

```sh
SPSP_LOCALTUNNEL=true SPSP_LOCALTUNNEL_SUBDOMAIN=mysubdomain npm start
```
Create an invoice with an amount due of 10 XRP. `amount`, `assetCode`, and `assetScale` are mandatory, you may add additional fields. See [Create an Invoice](#create-an-invoice) for more information. Here, we add a reason for the invoice.

```sh
http POST mysubdomain.localtunnel.me amount=10000000 assetCode=XRP assetScale=6 reason=lunch Authorization:"Bearer test"

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 73
Content-Type: application/json; charset=utf-8
Date: Thu, 16 May 2019 16:37:52 GMT
Server: nginx/1.10.1

{
    "invoice": "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"
}
```
Query the invoice:

```sh
ilp-spsp query -p '$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525'

{
  "destinationAccount": "private.moneyd.local.QGF2HflZ81d1uF1qXW9s-AjWtC23XY4tF-jZHhBdF_I.4eRM1t--cUUQqV5v8tsB0H9S~ef6e2a39-ba3c-a5cc-0849-9730ed56d525",
  "sharedSecret": "4v82v2ho4b3DYxqhBKRWncQdIRePcB6/s8Gksc6EH/4=",
  "push": {
    "balance": "0",
    "invoice": {
      "amount": "10000000",
      "asset": {
        "code": "XRP",
        "scale": "6"
      },
      "additionalFields": {
        "reason": "lunch"
      }
    }
  },
  "contentType": "application/spsp4+json"
}
```

Pay the invoice. Note that the amount depends on moneyd's uplink. Here, we assume XRP with a scale of 9:
```sh
ilp-spsp send -a 10000000000 -p '$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525'

paying 10000000000 to "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"...
sent 10000000000 units!
```

Query again:
```sh
ilp-spsp query -p '$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525'

{
  "destinationAccount": "private.moneyd.local.QGF2HflZ81d1uF1qXW9s-AjWtC23XY4tF-jZHhBdF_I.4eRM1t--cUUQqV5v8tsB0H9S~ef6e2a39-ba3c-a5cc-0849-9730ed56d525",
  "sharedSecret": "4v82v2ho4b3DYxqhBKRWncQdIRePcB6/s8Gksc6EH/4=",
  "push": {
    "balance": "10000000",
    "invoice": {
      "amount": "10000000",
      "asset": {
        "code": "XRP",
        "scale": "6"
      },
      "additionalFields": {
        "reason": "lunch"
      }
    }
  },
  "contentType": "application/spsp4+json"
}
```

## Environment Variables

| Name | Default | Description |
|:---|:---|:---|
| `SPSP_PORT` | `6000` | port to listen on locally. |
| `SPSP_LOCALTUNNEL` | | If this variable is defined, `SPSP_PORT` will be proxied by localtunnel under `SPSP_LOCALTUNNEL_SUBDOMAIN`. |
| `SPSP_LOCALTUNNEL_SUBDOMAIN` | | Subdomain to forward `SPSP_PORT` to. Must be defined if you set `SPSP_LOCALTUNNEL` |
| `SPSP_DB_PATH` | | Path for leveldb database. Uses in-memory database if unspecified. |
| `SPSP_AUTH_TOKEN` | `test` | Bearer token for creating invoices and receiving webhooks. |
| `SPSP_HOST` | localhost or localtunnel | Host to include in payment pointers |

## API

### Create an Invoice

```http
POST /
```

Create an invoice.

#### Request

- `amount` - Invoice amount in units of `assetCode` and `assetScale`.
- `assetCode` - Asset code to identify the invoice's currency. Currencies that have [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) codes should use those.
- `assetScale` - Scale of `amount` denoted in `assetCode` (e.g. an `amount` of "1000" with an `assetScale` of 2 translates to 10.00 units of `assetCode`).
- `webhook` - (Optional) Webhook to `POST` to after the invoice is fully paid. See [Webhooks](#webhooks)
- `"anything"` - (Optional) Any additional fields can just be passed as named values, e.g. `reason=lunch`.

#### Response

- `invoice` - Payment pointer created for this invoice.

### Query an Invoice

```http
GET /:invoice_id
```

SPSP endpoint for the invoice with `:invoice_id`. The payment pointer
returned by [Create an Invoice](#create-an-invoice) resolves to this endpoint.

### Webhooks

When you [Create an Invoice](#create-an-invoice) and specify a webhook, it will
call the specified webhook when the invoice is paid. The request is a `POST` with

```http
Authorization: Bearer <SPSP_AUTH_TOKEN>

{
  "balance": 1000000,
  "amount": 1000000,
  "pointer": "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525",
}
```
