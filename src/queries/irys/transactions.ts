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
  fromTimestamp: undefined, // REMAPPED
  toTimestamp: undefined,
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
  fromTimestamp?: Date | number;
  toTimestamp?: Date | number;
};

export const irysTransactionsQuery: QueryInfo = {
  name: "transactions",
  query: transactions,
  enumValues: ["order"],
  vars: transactionVars,
  remapVars: {
    pageSize: "limit",
    sort: "order",
    from: "owners",
    fromTimestamp: (_k, v, vars) => {
      vars.timestamp = { ...vars.timestamp, from: new Date(v).getTime() };
      vars.fromTimestamp = undefined;
    },
    toTimestamp: (_k, v, vars) => {
      vars.timestamp = { ...vars.timestamp, to: new Date(v).getTime() };
      vars.toTimestamp = undefined;
    },
  },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
  },
};
