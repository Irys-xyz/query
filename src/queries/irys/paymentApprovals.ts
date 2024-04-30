import type { QueryInfo } from "../../types";

// derive type from minimal object, use this object to validate structure in code.
export const paymentApprovals = {
  amount: "",
  payingAddress: "",
  approvedAddress: "",
  expiresBy: 0,
  timestamp: 0,
  token: "",
};

export type IrysPaymentApprovals = typeof paymentApprovals;

// default variables
export const paymentApprovalVars: IrysPaymentApprovalVars = {
  tokens: undefined,
  payingAddresses: undefined,
  approvedAddresses: undefined,
  pageSize: 100,
  order: "ASC",
  after: undefined,
};

export type IrysPaymentApprovalVars = {
  tokens?: string[];
  payingAddresses?: string[];
  approvedAddresses?: string[];
  pageSize?: number;
  order?: "ASC" | "DESC";
  after?: string;
};

export const irysPaymentApprovalsQuery: QueryInfo = {
  name: "paymentApprovals",
  query: paymentApprovals,
  enumValues: ["order"],
  vars: paymentApprovalVars,
  remapVars: {
    pageSize: "limit",
  },
  paging: {
    hasNextPage: "hasNextPage",
    cursor: "cursor",
    limiterName: "pageSize",
  },
};
