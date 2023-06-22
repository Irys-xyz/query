import type { QueryInfo } from "src/types";

// derive type from minimal object, use this object to validate structure in code.
export const transaction = {
  id: "",
  anchor: "",
  signature: "",
  recipient: "",
  owner: {
    address: "",
    key: "",
  },
  fee: {
    winston: "",
    ar: "",
  },
  quantity: {
    winston: "",
    ar: "",
  },
  data: {
    size: "",
    type: "",
  },
  tags: [{ name: "", value: "" }],
  block: {
    id: "",
    timestamp: 0,
    height: 0,
    previous: "",
  },
  bundledIn: {
    id: "",
  },
};

export type ArweaveTransaction = typeof transaction;

// default variables
export const transactionVars: ArweaveTransactionVars = {
  id: undefined,
};

export type ArweaveTransactionVars = {
  id?: string;
};

export const arweaveTransactionQuery: QueryInfo = {
  name: "transaction",
  query: transaction,
  vars: transactionVars,
};
