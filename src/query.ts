import { GraphQLQuery } from "./graphql";
import { queries } from "./queries";
import type { ArweaveBlocks, ArweaveBlocksVars } from "./queries/arweave/blocks";
import type { ArweaveTransactions, ArweaveTransactionsVars } from "./queries/arweave/transactions";
import type { IrysTransactionVars, IrysTransactions } from "./queries/irys/transactions";
import type { BuilderMethods, QueryCtorOpts, SearchOpts } from "./types";
// import type { ArweaveBlock, ArweaveBlockVars } from "./queries/arweave/block";
// import type { ArweaveTransaction, ArweaveTransactionVars } from "./queries/arweave/transaction";

export class Query {
  protected opts: QueryCtorOpts;

  constructor(opts: QueryCtorOpts = { network: "mainnet" }) {
    this.opts = opts;
  }

  // parameter builder methods, for each query type you want to add support for, add an overload here. the rest of the methods will resolve without modification.
  // TODO: remove BuilderMethods if skipFieldSetters is true
  /**
   * Sets query shape (query fields & vars) as well types used to regulate future methods. \
   * Generates setter methods for variables unless opts.skipVariableSetters is truthy. \
   * If an included type is specified, the overload will automatically register the types for you. \
   * by default, all fields from the query will be selected.
   * @param queryName the GraphQL name of the query
   * @param opts Options to provide your own queryInfo object, or to skip automatic field setter creation
   */

  search(
    queryName: "irys:transactions",
    opts?: SearchOpts,
  ): BuilderMethods<IrysTransactionVars, GraphQLQuery<IrysTransactions, IrysTransactionVars, IrysTransactions[]>>;

  search(
    queryName: "arweave:transactions",
    opts?: SearchOpts,
  ): BuilderMethods<ArweaveTransactionsVars, GraphQLQuery<ArweaveTransactions, ArweaveTransactionsVars, ArweaveTransactions[]>>;

  // search(
  //   queryName: "arweave:block",
  //   opts?: SearchOpts,
  // ): BuilderMethods<ArweaveBlockVars, GraphQLQuery<ArweaveBlock, ArweaveBlockVars, ArweaveBlock[]>>;

  // search(
  //   queryName: "arweave:transaction",
  //   opts?: SearchOpts,
  // ): BuilderMethods<ArweaveTransactionVars, GraphQLQuery<ArweaveTransaction, ArweaveTransactionVars, ArweaveTransaction[]>>;

  search(
    queryName: "arweave:blocks",
    opts?: SearchOpts,
  ): BuilderMethods<ArweaveBlocksVars, GraphQLQuery<ArweaveBlocks, ArweaveBlocksVars, ArweaveBlocks[]>>;

  search<Fields extends Record<any, any> = any, Vars extends Record<string, any> = any, BuilderVars extends Record<string, any> = any>(
    queryName: string,
    opts?: SearchOpts,
  ): BuilderMethods<BuilderVars, GraphQLQuery<Fields, Vars, Fields[]>>;

  public search<Fields extends Record<any, any> = any, Vars extends Record<string, any> = any, BuilderVars extends Record<string, any> = any>(
    queryName: string,
    opts?: SearchOpts,
  ): BuilderMethods<BuilderVars, GraphQLQuery<Fields, Vars, Fields[]>> {
    // const queryInstance =
    const query = opts?.query ?? queries[queryName];
    const queryInstance = new GraphQLQuery<Fields, Vars, Fields[]>({ ...this.opts, query, queryName });
    // @ts-expect-error overloading
    return queryInstance;
  }
}

export default Query;
