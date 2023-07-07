import type { QueryInfo } from "src/types";
import { transaction } from "./transaction";

export type ArweaveTransactions = typeof transaction;

// default variables
export const transactionsVars: ArweaveTransactionsVars = {
  ids: undefined,
  from: undefined, // REMAPPED
  to: undefined, // REMAPPED
  tags: undefined,
  bundledIn: undefined,
  // block: undefined,
  minHeight: undefined,
  maxHeight: undefined,
  pageSize: 10, // REMAPPED
  after: undefined,
  sort: "DESC", // REMAPPED
};

export type ArweaveTransactionsVars = {
  ids?: string[];
  from?: string[];
  to?: string[];
  tags?: { name: string; values: string[] }[];
  bundledIn?: string;
  // block?: { min: number; max: number };
  minHeight?: number;
  maxHeight?: number;
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
    to: "recipients",
    // replace ASC/DESC to HEIGHT prefixed versions
    sort: (k, v) => [k, v === "ASC" ? "HEIGHT_ASC" : "HEIGHT_DESC"],
    minHeight: (_k, v, vars) => {
      vars.block = { ...vars.block, min: v };
      vars.minHeight = undefined;
    },
    maxHeight: (_k, v, vars) => {
      vars.block = { ...vars.block, max: v };
      vars.maxHeight = undefined;
    },
  },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
  },
};
