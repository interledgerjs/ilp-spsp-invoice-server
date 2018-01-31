# ILP SPSP Invoice Server
> Example of an SPSP server that supports invoices

- [Usage](#usage)

## Usage

```
SUBDOMAIN=mysubdomain node index.js
http POST mysubdomain.localtunnel.me amount=10000 reason="you bought something"
# --> { "receiver": "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525" }
ilp-spsp query -r "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"
ilp-spsp -r "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525" -a 10000
ilp-spsp query -r "$mysubdomain.localtunnel.me/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"
```
