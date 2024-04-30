import type { QueryInfo } from "../types";
import { arweaveBlocksQuery } from "./arweave/blocks";
import { arweaveTransactionsQuery } from "./arweave/transactions";
import { irysPaymentApprovalsQuery } from "./irys/paymentApprovals";
import { irysTransactionsQuery } from "./irys/transactions";
// import { arweaveTransactionQuery } from "./arweave/transaction";
// import { arweaveBlockQuery } from "./arweave/block";

// map query names to queries
export const queries: Record<string, QueryInfo> = {
  "irys:transactions": irysTransactionsQuery,
  "arweave:transactions": arweaveTransactionsQuery,
  "arweave:blocks": arweaveBlocksQuery,
  "irys:paymentApprovals": irysPaymentApprovalsQuery,
  // "arweave:transaction": arweaveTransactionQuery,
  // "arweave:block": arweaveBlockQuery,
};

export * from "./arweave/blocks";
export * from "./arweave/transactions";
export * from "./irys/transactions";
export * from "./irys/paymentApprovals";
