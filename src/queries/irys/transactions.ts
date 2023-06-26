import type { QueryInfo } from "src/types";

// derive type from minimal object, use this object to validate structure in code.
export const transactions = {
  id: "",
  receipt: {
    deadlineHeight: 0,
    signature: "",
    timestamp: 0,
    version: "",
  },
  tags: [{ name: "", value: "" }],
  address: "",
  currency: "",
  signature: "",
  timestamp: 0,
};

export type IrysTransactions = typeof transactions;

// default variables
export const transactionVars: IrysTransactionVars = {
  ids: undefined,
  after: undefined,
  currency: undefined,
  from: undefined, // REMAPPED
  pageSize: 100,
  sort: "ASC", // REMAPPED
  hasTags: undefined,
  tags: undefined,
};

export type IrysTransactionVars = {
  ids?: string[];
  after?: string;
  currency?: string;
  from?: string[];
  pageSize?: number;
  sort?: "ASC" | "DESC"; // REMAPPED
  hasTags?: boolean;
  tags?: { name: string; values: string[] }[];
};

export const irysTransactionsQuery: QueryInfo = {
  name: "transactions",
  query: transactions,
  enumValues: ["order"],
  vars: transactionVars,
  remapVars: { pageSize: "limit", sort: "order", from: "owners" },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
  },
};
