# ILP SPSP Invoice Server
> Example of an SPSP server that supports invoices

- [Usage](#usage)

## Usage

```
PORT=8080 node index.js
http POST localhost:8080/invoices amount=10000
# --> { "receiver": "http://localhost:8080/ef6e2a39-ba3c-a5cc-0849-9730ed56d525" }
ilp-spsp query -r "http://localhost:8080/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"
ilp-spsp -r "http://localhost:8080/ef6e2a39-ba3c-a5cc-0849-9730ed56d525" -a 10000
ilp-spsp query -r "http://localhost:8080/ef6e2a39-ba3c-a5cc-0849-9730ed56d525"
```
