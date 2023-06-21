import type { QueryInfo } from "src/types";
import { block } from "./block";

export type ArweaveBlocks = typeof block;

// default variables
export const blocksVars: ArweaveBlocksVars = {
  limit: 10, // REMAPPED
  sort: "HEIGHT_DESC",
};

export type ArweaveBlocksVars = {
  ids?: string;
  height?: {
    min?: number;
    max?: number;
  };
  limit?: number; // REMAPPED
  after?: string;
  sort?: "HEIGHT_ASC" | "HEIGHT_DESC";
};

export const arweaveBlocksQuery: QueryInfo = {
  name: "blocks",
  query: block,
  vars: blocksVars,
  enumValues: ["sort"],
  remapVars: { limit: "first" },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
  },
};
