# @irys/query

@irys/query is a powerful package that simplifies querying Irys and Arweave.

It features:
- Single Main Class: Use the Query class as a single point of entry to query Irys and Arweave
- Ease of Use: The package is designed to be intuitive, saving you the complexity of dealing directly with GraphQL.


Irys streamlines the process of uploading to Arweave and incorporates additional features not present in direct Arweave uploads. Consequently, some data points can be accessed through Irys, while others are retrievable via Arweave.

Irys requires you to connect Irys the node-specific endpoint where you posted your transaction, while Arweave uses a universal endpoint for all queries. Irys is cross-chain, it includes the address (regardless of chain) that posted the transaction, while Arweave only includes Arweave addresses. Irys also includes the [currency](/overview/supported-tokens) used for payment, [a receipt](/learn/receipts) ([if requested when uploading](/developer-docs/sdk/api/uploadWithReceipt)), and a true timestamp accurate to the millisecond of when the transaction was posted. 

Arweave allows for querying by [block structure](https://gql-guide.vercel.app/#block-query-structures), including block ID, block range, and block height, which Irys GraphQL does not support.

|                                                         | Irys                                                                                                                                                      | Arweave                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Endpoint                                                | Node-specific. Connect to the endpoint associated with the node where you posted your transaction.                                                                 | Universal endpoint for all queries.                                                                                         |
| Cross-chain                                             | Yes. Includes the address (regardless of chain) that posted the transaction.                                                                                       | No. Includes Arweave addresses only.                                                                                        |
| Original payment [currency](/overview/supported-tokens) | Included.                                                                                                                                                          | Not included.                                                                                                               |
| Timestamp                                               | Includes a timestamp accurate to the millisecond of when the transaction was posted, along with an (optional) cryptographically signed [receipt](/learn/receipts). | Timestamp is based on block time, accurate to ~2 minutes.                                                                   |
| Blocks                                                  | Not included.                                                                                                                                                      | [Included](https://gql-guide.vercel.app/#block-query-structures). You can query by block ID, block range, and block height. |


## Installation

You can install via npm:

```console
npm install @irys/query
```

and yarn:

```console
yarn add @irys/query
```

TODO: Install instructions may change once the package is pushed

## Imports

Import the Irys Query package with:

```js
import Query from "@irys/query";
```


## Creating A Query Object

Start by instantiating a new `Query` object, this is a shared instance you can reuse each time you want to execute a new query.

```js
const myQuery = new Query();
```

Then execute a query by chaining together a series of functions that collaboratively narrow down the results returned.

To retrieve the 20 latest transactions with the tag `Content-Type` set to `image/png` on Irys, use the following:

```js
const results = await myQuery
	.search("irys:transactions")
	.tags([{ name: "Content-Type", values: ["image/png"] }])
	.sort("ASC")
	.limit(20);
```

## Changing Default Query Endpoints

The `Query` class is an abstraction built on top of Irys' and Arweave's GraphQL endpoints. For the most part, you don't need to know much about these endpoints, the class abstracts out the complexities of GraphQL and saves you from having to understand it. When executing queries, the `Query` class defaults to searching `https://node1.bundlr.network/graphql` for Irys queries and `https://arweave.net/graphql` to Arweave queries.

There are certain use cases where changing the query location is necessary. For example, if you need to search Irys' Node 2 or Devnet, or if you want to utilize a more performant Arweave endpoint. Do this by providing the URL of the desired endpoint to the constructor of the `Query` class.

When connecting to Irys, any of these values may be used:

- https://node1.irys.xyz/graphql (DEFAULT)
- https://node2.irys.xyz/graphql
- https://devnet.irys.xyz/graphql

When querying Arweave, any of these values may be used:

- https://arweave.net/graphql (DEFAULT)
- https://arweave.dev/graphql
- https://arweave-search.goldsky.com/graphql

```js
const myQuery = new Query({ url: "https://node2.bundlr.network/graphql" });
```

## Changing Between Irys and Arweave Searches

Use the `search()` function to change between searching Irys and Arweave.

- `irys:transactions`: Searches transactions uploaded to any of Irys' nodes 
- `arweave:transactions`: Searches all transactions posted to Arweave 
- `arweave:blocks`: Searches all of Arweave for a specific block

```js
const results = await myQuery
	.search("irys:transactions")
```

## Searching By **Tags**

Use the `tags()` function to search [metadata tags](https://docs.bundlr.network/developer-docs/tags) attached to transactions during upload. 

Search for a single tag name / value pair:

```js
const results = await myQuery
	.search("irys:transactions")
	.tags([{ name: "Content-Type", values: ["image/png"] }]);
```

Search for a single tag name with a list of possible values. The search employs OR logic, returning transactions tagged with ANY provided value.

```js
const results = await myQuery
	.search("irys:transactions")
	.tags([{ name: "Content-Type", values: ["image/png", "image/jpg"] }]);
```

Search for multiple tags. The search employs AND logic, returning transactions tagged with ALL provided values.

```js
const results = await myQuery
	.search("irys:transactions").tags([{ name: "Content-Type", values: ["image/png"] }, { name: "Application-ID", values: ["myApp"] },
]);
```

## Search By **Transaction ID**

Use the `ids()` to by transaction id. The search employs OR logic, returning transactions tagged with ANY provided value:

```js
const results = await myQuery
	.search("irys:transactions")
	.ids(["xXyv3u9nHHWGiMJl_DMgLwwRdOTlIlQZyqaK_rOkNZw", "_xE7tG1kl2FgCUDgJ5jNJeVA6R5kuys7A6f1qfh9_Kw"]);
```

## Search By **Transaction Sender**

Use the `from()` function to search by wallet addresses used when signing and paying for the upload. Addresses from any of [Irys' supported chains](https://docs.bundlr.network/overview/supported-tokens) are accepted.

The search employs OR logic, returning transactions tagged with ANY provided value:

```js
const results = await myQuery
	.search("irys:transactions")
	.from(["UsWPlOBHRyfWcbrlC5sV3-pNUjOQEI5WmDxLnypc93I", "0x4adDE0b3C686B4453e007994edE91A7832CF3c99"]);
```

## Search By TODO
TODO: Cover .to() function

## Search By Currency

Use the `currency()` function to search based on the token name used to pay for the upload. Any of [these values](https://docs.bundlr.network/overview/supported-tokens) are acceptable. 


```js
const results = await myQuery
	.search("irys:transactions")
	.currency("solana");
```

## Search By Block ID

Use the `ids()` function to search for Arweave blocks with the specified ID.

TODO, id / ids

## Searching By Block Height

TODO

## Sorting

Use the `sort()` function to sort results by timestamp in ascending order (`ASC`) 

```js
const results = await myQuery
	.search("irys:transactions")
	.currency("ethereum")
	.sort("ASC");

```

or descending (`DESC`) order. 

```js
const results = await myQuery
	.search("irys:transactions")
	.currency("matic")
	.sort("DESC");
```

## Obtaining Only The First Result

Use the `first()` function to return only the first result.

```js
const results = await myQuery
	.search("irys:transactions")
	.tags([{ name: "Content-Type", values: ["image/png"] }])
	.first();
```

## Limiting Search Results

Use the `.limit()` function to limit the maximum number of results returned. This overrides the default value of 1000 results when searching Irys and 100 when searching Arweave directly.

```js
const results = await myQuery
	.search("irys:transactions")
	.ids(["xXyv3u9nHHWGiMJl_DMgLwwRdOTlIlQZyqaK_rOkNZw", "_xE7tG1kl2FgCUDgJ5jNJeVA6R5kuys7A6f1qfh9_Kw"])
	.limit(20);
```

## Pagination / Streaming

Use the `stream()` function to manage large results sets. This function returns an iterable stream which will continuously yield results as long as your query keeps producing them.

```js
// Create the stream
const stream = await myQuery
	.search("irys:transactions")
	.currency("solana")
	.stream();

// Iterate over the results
for await (const result of stream) {
	console.log(result);
}
```


## Limiting Fields Returned

Use the `.fields()` function to limit the fields returned. To limit the results, set a field's value to `false` or omit it entirely.****

The fields available for retrieval depend on the search type, when searching `irys:transactions`, the following fields are available: 

```js
.fields({
	id: true, // Transaction ID
	currency: true, // Currency used for payment
	address: true, // Cross-chain address used for signing and payment
	receipt: {
		deadlineHeight: true, // The block number by which the transaction must be finalized on Arweave
		signature: true, // A signed deep hash of the JSON receipt
		timestamp: true, // Timestamp, millisecond accurate, of the time the uploaded was verified
		version: true, // The receipt version, currently 1.0.0
	},
	tags: { // An array of tags associated with the upload
		name: true,
		value: true,
	},
	signature: true, // A signed deep hash of the JSON receipt
	timestamp: true, // Timestamp, millisecond accurate, of the time the uploaded was verified
})
```

When searching by `arweave:transactions` the following fields are available:

TODO: I need to sync with JB or Jesse on these, not sure what they all are

```js
.fields({
	id: true, // Transaction ID
	tags: {
		// Tags associated with the upload
		name: true,
		value: true,
	},
	anchor: true,
	block: {
		height: true, // Block height
		id: true, // Block ID
		previous: true, // Todo
		timestamp: true, // Block timestamp
	},
	bundledIn: {
		id: true,
	},
	data: {
		size: true,
		type: true,
	},
	fee: { 
		ar: true,
		winston: true,
	},
	owner: {
		address: true,
		key: true,
	},
	quantity: {
		ar: true,
		winston: true,
	},
	recipient: true,
	signature: true,
})
```

When searching by `arweave:block` the following fields are available:

```js
.fields({
	height: true,
	id: true,
	previous: true,
	timestamp: true,
})
```

When searching by `arweave:blocks` the following fields are available:

```js
.fields({
	height: true,
	id: true,
	previous: true,
	timestamp: true,
})
```