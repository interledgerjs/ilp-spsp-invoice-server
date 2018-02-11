# ILP SPSP Invoice Server
> Example of an SPSP server that supports invoices

- [Usage](#usage)
- [Environment Variables](#environment-variables)

## Usage

```sh
SPSP_LOCALTUNNEL=true SPSP_LOCALTUNNEL_SUBDOMAIN=mysubdomain node index.js

# creates an invoice for 10 XRP; the sender will use a chunked payment
http POST mysubdomain.localtunnel.me amount=10000000 reason="you bought something" \
  Authorization:"Bearer test"
# {
#  "receiver": "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"
# }

ilp-spsp query -r "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"
# {
#   "destinationAccount": "g.scylla.client.sharafian-lm.local.abhnViXADp0lCl7urVp18n5OLmOke57RN0ABbW2jliA.f036d74f-da5e-4b38-aca1-bd3cdd12461c.9B47_eWU76I.7tNCY0ytiCulOG4eIQSUiTxk",
#   "sharedSecret": "CFiJIvw1rwcqYnxtWuKZ+Fq2UoR1KwMh4S4sHKVaj1U=",
#   "balance": {
#     "current": "0",
#     "maximum": "10000000"
#   },
#   "receiverInfo": {
#     "reason": "you bought something"
#   }
# } 

ilp-spsp invoice -r "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"
# paying invoice at "$invoices.localtunnel.me/84e17e20-0391-4c00-8af7-b0d91c2aaa07"...
# WARNING: PSK2 Chunked Payments are experimental. Money can be lost if an error occurs mid-payment or if the exchange rate changes dramatically! This should not be used for payments that are significantly larger than the path's Maximum Payment Size.
# paid!

ilp-spsp query -r "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"
# {
#   "destinationAccount": "g.scylla.client.sharafian-lm.local.abhnViXADp0lCl7urVp18n5OLmOke57RN0ABbW2jliA.f036d74f-da5e-4b38-aca1-bd3cdd12461c.9B47_eWU76I.7tNCY0ytiCulOG4eIQSUiTxk",
#   "sharedSecret": "CFiJIvw1rwcqYnxtWuKZ+Fq2UoR1KwMh4S4sHKVaj1U=",
#   "balance": {
#     "current": "10000000",
#     "maximum": "10000000"
#   },
#   "receiverInfo": {
#     "reason": "you bought something"
#   }
# } 
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
