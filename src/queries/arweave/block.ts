import type { QueryInfo } from "../../types";

export const block = {
  id: "",
  timestamp: 0,
  height: "",
  previous: "",
};

export type ArweaveBlock = typeof block;

// default variables
export const blockVars: ArweaveBlockVars = {
  id: undefined,
};

export type ArweaveBlockVars = {
  id?: string;
};

export const arweaveBlockQuery: QueryInfo = {
  name: "block",
  query: block,
  vars: blockVars,
};
