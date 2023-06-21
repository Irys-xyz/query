import type { QueryInfo } from "../types";
import { arweaveBlockQuery } from "./arweave/block";
import { arweaveBlocksQuery } from "./arweave/blocks";
import { arweaveTransactionQuery } from "./arweave/transaction";
import { arweaveTransactionsQuery } from "./arweave/transactions";
import { irysTransactionsQuery } from "./irys/transactions";

// map query names to queries
export const queries: Record<string, QueryInfo> = {
  "irys:transactions": irysTransactionsQuery,
  "arweave:transactions": arweaveTransactionsQuery,
  "arweave:transaction": arweaveTransactionQuery,
  "arweave:block": arweaveBlockQuery,
  "arweave:blocks": arweaveBlocksQuery,
};
