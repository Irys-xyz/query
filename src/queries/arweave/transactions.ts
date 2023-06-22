import type { QueryInfo } from "src/types";
import { transaction } from "./transaction";

export type ArweaveTransactions = typeof transaction;

// default variables
export const transactionsVars: ArweaveTransactionsVars = {
  ids: undefined,
  owners: undefined,
  recipients: undefined,
  tags: undefined,
  bundledIn: undefined,
  block: undefined,
  limit: 10, // REMAPPED
  after: undefined,
  sort: "HEIGHT_DESC",
};

export type ArweaveTransactionsVars = {
  ids?: string[];
  owners?: string[];
  recipients?: string[];
  tags?: { name: string; values: string[] }[];
  bundledIn?: string;
  block?: { min: number; max: number };
  limit?: number;
  after?: string;
  sort?: "HEIGHT_ASC" | "HEIGHT_DESC";
};

export const arweaveTransactionsQuery: QueryInfo = {
  name: "transactions",
  query: transaction,
  enumValues: ["sort"],
  vars: transactionsVars,
  remapVars: { limit: "first" },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
  },
};
