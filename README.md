# Irys Query package
[![Irys query package](./assets/query-package-yt-image.png?raw=true)](https://youtu.be/zD0XNzw90lc)

The Irys query package enables users to search Irys and Arweave through an intuitive JavaScript package.

It is easily implemented in a few lines of code.	

>The query package is for searching transaction metadata on Irys and Arweave and Arweave block information. Once you've found transactions, use the transaction ID to [download](http://docs.irys.xyz/developer-docs/downloading) the associated data.

## Installation

You can install via npm:

```console
npm install @irys/query
```

and yarn:

```console
yarn add @irys/query
```

## Imports

Import the Irys query package with:

```js
import Query from "@irys/query";
```

## Creating a Query object

Start by instantiating a new `Query` object, this is a shared instance you can reuse each time you want to execute a new query:

```js
const myQuery = new Query();
```

Then execute a query by chaining together a series of functions that collaboratively narrow down the results returned:

```js
const results = await myQuery
	.search("irys:transactions")
	.tags([{ name: "Content-Type", values: ["image/png", "image/gif"] }])
	.token("matic")
	.fromTimestamp(new Date("2022-07-01"))
	.toTimestamp(new Date("2023-07-03"))
	.sort("ASC")
	.limit(20);
```

## Query locations

Using the Query class users can search:

- Irys transactions
- Arweave transactions
- Arweave blocks

## Further reading

Consult our [documentation](http://docs.irys.xyz/developer-docs/querying/query-package#imports) for sample code demonstrating each query type. 

