import type { QueryInfo } from "src/types";
import { transaction } from "./transaction";

export type ArweaveTransactions = typeof transaction;

// default variables
export const transactionsVars: ArweaveTransactionsVars = {
  ids: undefined,
  from: undefined, // REMAPPED
  recipients: undefined,
  tags: undefined,
  bundledIn: undefined,
  block: undefined,
  pageSize: 10, // REMAPPED
  after: undefined,
  sort: "DESC", // REMAPPED
};

export type ArweaveTransactionsVars = {
  ids?: string[];
  from?: string[];
  recipients?: string[];
  tags?: { name: string; values: string[] }[];
  bundledIn?: string;
  block?: { min: number; max: number };
  pageSize?: number;
  after?: string;
  sort?: "ASC" | "DESC";
};

export const arweaveTransactionsQuery: QueryInfo = {
  name: "transactions",
  query: transaction,
  enumValues: ["sort"],
  vars: transactionsVars,
  remapVars: {
    pageSize: "first",
    from: "owners",
    // replace ASC/DESC to HEIGHT prefixed versions
    sort: (k, v) => [k, v === "ASC" ? "HEIGHT_ASC" : "HEIGHT_DESC"],
  },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
  },
};
