import type { QueryInfo } from "src/types";

export const block = {
  id: "",
  timestamp: 0,
  height: "",
  previous: "",
};

export type ArweaveBlock = typeof block;

// default variables
export const blockVars: ArweaveBlockVars = {};

export type ArweaveBlockVars = {
  id?: string;
};

export const arweaveBlockQuery: QueryInfo = {
  name: "block",
  query: block,
  vars: blockVars,
};
