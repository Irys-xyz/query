import type { QueryInfo } from "../types";
import { arweaveBlocksQuery } from "./arweave/blocks";
import { arweaveTransactionsQuery } from "./arweave/transactions";
import { irysTransactionsQuery } from "./irys/transactions";
// import { arweaveTransactionQuery } from "./arweave/transaction";
// import { arweaveBlockQuery } from "./arweave/block";

// map query names to queries
export const queries: Record<string, QueryInfo> = {
  "irys:transactions": irysTransactionsQuery,
  "arweave:transactions": arweaveTransactionsQuery,
  "arweave:blocks": arweaveBlocksQuery,
  // "arweave:transaction": arweaveTransactionQuery,
  // "arweave:block": arweaveBlockQuery,
};
