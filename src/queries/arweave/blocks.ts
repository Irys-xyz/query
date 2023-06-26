import type { QueryInfo } from "src/types";
import { block } from "./block";

export type ArweaveBlocks = typeof block;

// default variables
export const blocksVars: ArweaveBlocksVars = {
  ids: undefined,
  height: undefined,
  pageSize: 10, // REMAPPED
  after: undefined,
  sort: "DESC", // REMAPPED
};

export type ArweaveBlocksVars = {
  ids?: string;
  height?: {
    min?: number;
    max?: number;
  };
  pageSize?: number; // REMAPPED
  after?: string;
  sort?: "ASC" | "DESC"; // REMAPPED
};

export const arweaveBlocksQuery: QueryInfo = {
  name: "blocks",
  query: block,
  vars: blocksVars,
  enumValues: ["sort"],
  remapVars: {
    pageSize: "first",
    // replace ASC/DESC to HEIGHT prefixed versions
    sort: (k, v) => [k, v === "ASC" ? "HEIGHT_ASC" : "HEIGHT_DESC"],
  },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
  },
};
