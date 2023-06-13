import type { QueryInfo } from "types";
import { transactionVars, transactions } from "./transaction";

// map queries to query names
export const queries: Record<string, QueryInfo> = {
  transactions: {
    query: transactions,
    enumValues: ["order"],
    vars: transactionVars,
  },
};
