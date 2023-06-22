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
  owners: undefined,
  pageSize: 100,
  order: "ASC",
  hasTags: undefined,
  tags: undefined,
};

export type IrysTransactionVars = {
  ids?: string[];
  after?: string;
  currency?: string;
  owners?: string[];
  pageSize?: number;
  order?: "ASC" | "DESC";
  hasTags?: boolean;
  tags?: { name: string; values: string[] }[];
};

export const irysTransactionsQuery: QueryInfo = {
  name: "transactions",
  query: transactions,
  enumValues: ["order"],
  vars: transactionVars,
  remapVars: { pageSize: "limit" },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
  },
};
