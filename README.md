# @irys/query

@irys/query is a powerful package that simplifies querying Irys and Arweave.

## Features

- Single Main Class: Utilize the GraphQLQuery class for all your querying needs.
- Ease of Use: The package is designed to be intuitive, saving you the complexity of dealing directly with GraphQL.

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

Import the Irys Query package with the following:

```js
import GraphQLQuery from "@irys/query";
```

## Search Types

TODO
- `irys:transactions`: Searches transactions uploaded to any of Irys' nodes 
- `arweave:transactions`: Searches all transactions posted to Arweave 
- `arweave:block`: Searches inside the specified Arweave block
- `arweave:blocks`: Searches all of Arweave for a specific block


## Creating A Query Object

Query objects are constructed via chaining. Instantiate a new object, specify search location, define return fields, set search criteria, and execute the search.

To retrieve the 20 latest transaction IDs associated with uploads having `Content-Type` set to `image/png` on Irys, use the following:

```js
const queryByTags = async () => {
	const result = await new GraphQLQuery()
		.search("irys:transactions")
		.fields({
			id: true,
		})
		.tags([{ name: "Content-Type", values: ["image/png"] }])
		.order("ASC")
		.maxResults(20);
};
await queryByTags();
```

## Specifying Query Location


When querying Irys, you must connect to the node-specific endpoint where you posted your transaction, when querying Arweave a universal endpoint is used for all queries. 

When connecting to Irys, any of these values may be used:

- https://node1.bundlr.network/graphql (DEFAULT)
- https://node2.bundlr.network/graphql
- https://devnet.bundlr.network/graphql

When querying Arweave, any of these values may be used:

- https://arweave.net/graphql (DEFAULT)
- https://arweave.dev/graphql
- https://arweave-search.goldsky.com/graphql

```js
const result = await new GraphQLQuery({ url: "https://node2.bundlr.network/graphql" })
	.search("irys:transactions")
	.fields({
		id: true,
	})
	.tags([{ name: "Content-Type", values: ["image/png"] }])
	.first();
```

## `.search()` Function

The `.search()` function accepts a string parameter with one of the following four values:

- `irys:transactions`: Searches transactions uploaded to any of Irys' nodes 
- `arweave:transactions`: Searches all transactions posted to Arweave 
- `arweave:block`: Searches inside the specified Arweave block
- `arweave:blocks`: Searches all of Arweave for a specific block

## `fields()` Function

The `.fields()` function specifies the values to be returned. To limit the results, set a field's value to `false` or omit it entirely.****

The fields available for retrieval depend on the search type, when searching `irys:transactions`, the following fields are available. 

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
	tags: [{ // An array of tags associated with the upload
		name: true,
		value: true,
	}],
	signature: true, // A signed deep hash of the JSON receipt
	timestamp: true, // Timestamp, millisecond accurate, of the time the uploaded was verified
})
```

TODO, list available fields for all query types

## Search By **Tags**

The `.tags()` function enables search queries for [metadata tags](https://docs.bundlr.network/developer-docs/tags) attached to transactions during upload. As a component of establishing strong provenance, tags allow for the description of an upload's characteristics.

Search for a single tag name / value pair:

```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
	})
	.tags([{ name: "Content-Type", values: ["image/png"] }])
	.maxResults(20);

```

Search for a single tag name with a list of possible values. The search employs OR logic, returning transactions tagged with ANY provided value.

```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
	})
	.tags([{ name: "Content-Type", values: ["image/png", "image/jpg"] }])
	.maxResults(20);
```

Search for multiple tags. The search employs AND logic, returning transactions tagged with ALL provided values.

```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
	})
	.tags([
		{ name: "Content-Type", values: ["image/png"] },
		{ name: "Application-ID", values: ["myApp"] },
	])
	.maxResults(20);
```

## Search By **Transaction ID**

Search for transactions matching one or more transaction IDs.

The search employs OR logic, returning transactions tagged with ANY provided value:


```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
	})
	.ids(["xXyv3u9nHHWGiMJl_DMgLwwRdOTlIlQZyqaK_rOkNZw", "_xE7tG1kl2FgCUDgJ5jNJeVA6R5kuys7A6f1qfh9_Kw"])
	.maxResults(20);
```

## Search By **Owner**

The `.owners()` function allows for searching of transactions matching one or multiple wallet addresses linked to the wallet used when signing and funding the upload. Addresses from any of [Irys' supported chains](https://docs.bundlr.network/overview/supported-tokens) are accepted.

The search employs OR logic, returning transactions tagged with ANY provided value:

```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
		address: true,
	})
	.owners(["UsWPlOBHRyfWcbrlC5sV3-pNUjOQEI5WmDxLnypc93I", "0x4adDE0b3C686B4453e007994edE91A7832CF3c99"])
	.maxResults(20);
```

## Search By Currency

The `currency()` function allows for searching for transactions based on the token name used to pay for the upload. Any of [these values](https://docs.bundlr.network/overview/supported-tokens) are acceptable. 


```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
		currency: true,
	})
	.currency("solana")
	.maxResults(20);
```

## Order

The `order()` function allows specifying result sorting in ascending (`ASC`) 

```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
	})
	.order("ASC")
	.currency("solana")
	.maxResults(20);
```

or descending (`DESC`) order based on timestamp. 

```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
	})
	.order("DESC")
	.currency("solana")
	.maxResults(20);
```

## Obtaining Only The First Result

In cases where you only want the most recent result matching your search criteria, use the `first()` function.

```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
	})
	.tags([{ name: "Content-Type", values: ["image/png"] }])
	.first();
```

## Limiting Search Results

Use the `.maxResults()` function to limit the maximum number of results returned. This overrides the default value of 1000 results when searching Irys and 100 when searching Arweave directly.

```js
const result = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
		address: true,
	})
	.ids(["xXyv3u9nHHWGiMJl_DMgLwwRdOTlIlQZyqaK_rOkNZw", "_xE7tG1kl2FgCUDgJ5jNJeVA6R5kuys7A6f1qfh9_Kw"])
	.maxResults(20);
```

## Pagination / Streaming

When you need a large number of results or are uncertain about the quantity required, make use of the stream() function. This function returns an iterable stream, which will continuously yield results as long as your query keeps producing them.

```js
// Create the stream
const stream = await new GraphQLQuery()
	.search("irys:transactions")
	.fields({
		id: true,
	})
	.order("ASC")
	.currency("solana")
	.stream();

// Iterate over the results
for await (const result of stream) {
	console.log(result);
}
```

