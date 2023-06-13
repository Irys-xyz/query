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

export type Transaction = typeof transactions;

// list of all variables, with defaults.
export const transactionVars = {
  ids: undefined,
  after: undefined,
  currency: undefined,
  owners: undefined,
  limit: 100,
  order: undefined,
  hasTags: undefined,
  tags: undefined,
};

export type TransactionVars = {
  ids?: string[];
  after?: string;
  currency?: string;
  owners?: string[];
  limit?: number;
  order?: "ASC" | "DESC";
  hasTags?: boolean;
  tags?: { name: string; values: string[] }[];
};
