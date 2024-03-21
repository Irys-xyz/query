import type { QueryInfo } from "../../types";
import { block } from "./block";

export type ArweaveBlocks = typeof block;

// default variables
export const blocksVars: ArweaveBlocksVars = {
  ids: undefined,
  // height: undefined,
  minHeight: undefined,
  maxHeight: undefined,
  pageSize: 10, // REMAPPED
  after: undefined,
  sort: "DESC", // REMAPPED
};

export type ArweaveBlocksVars = {
  ids?: string;
  // height?: {
  //   min?: number;
  //   max?: number;
  // };
  minHeight?: number;
  maxHeight?: number;
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
    minHeight: (_k, v, vars) => {
      vars.height = { ...vars.height, min: v };
      vars.minHeight = undefined;
    },
    maxHeight: (_k, v, vars) => {
      vars.height = { ...vars.height, max: v };
      vars.maxHeight = undefined;
    },
  },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
    limiterName: "pageSize",
  },
};
