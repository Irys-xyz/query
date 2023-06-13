import axios from "axios";
import { queries } from "queries";
import type { TransactionVars, Transaction } from "queries/transaction";
import { Readable } from "stream";
import type { BuilderMethods, Field, GQLResponse, ReturnFields, ArrayElement, SearchOpts } from "types";

// GraphQL query builder class, uses overload signatures to modify class generics to provide concise typings for any configured query
// this approach does mean we need to explicitly coerce return types to the correct "shape", but as most of the methods are dynamic, this isn't much of an issue.
export class GraphQLQuery<TQuery extends Record<any, any> = any, TVars extends Record<string, any> = any, TReturn extends Record<string, any> = any> {
  // query variables
  protected queryVars: Record<string, any> = {};
  // query fields
  protected queryFields: Record<string, any>;
  // query metadata
  protected queryInfo: { name?: string; enumValues?: string[]; vars?: Record<string, any> } = {};
  // query string, payload sent to node
  protected query: string | undefined;
  // url of the node to query
  protected url: URL;
  // misc operational config
  protected config: { first?: boolean };

  constructor({ url }: { url: string | URL } = { url: new URL("https://node1.bundlr.network/graphql") }) {
    if (!url) throw new Error("URL is required");
    this.url = new URL(url);
    this.config = {};
  }

  /**
   * Builds a query from fields and variables, formatting it into a GQL compatible string.
   * stores built query under `this.query` (protected) - accessible via `.toQuery`
   * @returns `this` (chainable)
   */
  public buildQuery(): GraphQLQuery<TQuery, TVars, ArrayElement<TReturn>> &
    BuilderMethods<TransactionVars, GraphQLQuery<TQuery, TVars, ArrayElement<TReturn>>> {
    // builds query, reducing `this.queryFields` to a structured string with correct formatting
    const toGQLString = (s: object): string =>
      JSON.stringify(s, (_, v) => {
        if (v instanceof Array) return JSON.stringify(v);
        if (typeof v === "object") return v;
        if (v === false) return undefined;
        return "";
      })
        .replaceAll(`:`, "")
        .replaceAll(`"`, "")
        .replaceAll(",", "\n");

    const nodeQuery = toGQLString(this.queryFields);

    // reduces queryVars to inline vars, for convenience. (using seperate means we have to annotate the GQL type)
    // incorperates defaults from queryInfo
    const qVars = JSON.stringify({ ...this.queryInfo.vars, ...this.queryVars }, (k, v) => {
      // console.log(this, k, v);
      if (v === undefined) return v; // remove null keys
      if (v instanceof Array) return v; // don't break recursion
      if (typeof v === "object") return v; // ^
      if (typeof v === "number") return v; // numbers don't need string escaping
      // TODO: improve this so it's context aware and doesn't alter anything unintentional
      if (this.queryInfo?.enumValues?.includes(k)) return v; // exclude enum variants from quote addition
      return `'${v}'`; // this value needs to be quote padded
    })
      .replaceAll('"', "") // remove double quotes,
      .replaceAll("'", '"') // add needed double quotes
      .slice(1, -1); // remove leading "{" and finishing "}"

    const query = `query {
      ${this.queryInfo.name}(
        ${qVars}
      ) {
        edges {
          cursor
          node ${nodeQuery}
        }
        pageInfo {
        endCursor
        hasNextPage
        }
      }
    }`;
    this.query = query;
    // @ts-expect-error types - DO NOT SET RETURN TYPE TO `this` - TS will assume this should be an async function as `this` implements promise methods
    return this;
  }

  // TODO: add support for non-page queries

  /**
   * Primary query execution method - builds & runs the query, returning result nodes and updating cursor info in queryVars
   * @returns query result nodes
   */
  protected async getPage(): Promise<TReturn> {
    if (!this.queryInfo.name) throw new Error(`Query name is undefined!`);
    this.buildQuery();
    if (!this.query) throw new Error(`Unable to run undefined query`);
    let res;
    try {
      res = await axios<GQLResponse<TQuery>>(this.url.toString(), {
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: { query: this.query },
      });
    } catch (e) {
      console.error(`Error running query ${this.query} - ${e}`);
      throw e;
    }
    const data = res.data.data[this.queryInfo.name];
    const nextCursor = data.pageInfo.hasNextPage ? data.pageInfo.endCursor : undefined;
    this.queryVars.after = nextCursor; // TODO: make the cursor var configurable (queryInfo)
    return data.edges.map((v) => v.node) as unknown as TReturn;
  }

  // return functions

  /**
   * Get the first result from the query
   * @returns the first result from the query - gets at maximum one page
   */
  public async first(): /*  GraphQLQuery<TQuery, TVars, ArrayElement<TReturn>> &
    BuilderMethods<TransactionVars, GraphQLQuery<TQuery, TVars, ArrayElement<TReturn>>> */ Promise<ArrayElement<TReturn>> {
    // this.config.first = true;
    // // if limit is a valid variable, set it to 1.
    // // done through Object.prototype to be safe
    // // TODO: make this configurable (queryInfo)
    // if (Object.prototype.hasOwnProperty.call(this?.queryInfo?.vars, "limit")) this.queryVars.limit = 1;
    // // @ts-expect-error types
    // return this;
    const res = await this.getPage();
    return res.at(0);
  }

  /**
   * Gets all results from the vuilt query
   * @returns array of results
   */
  public async all(): Promise<TReturn> {
    const results: any[] = [];
    do {
      // @ts-expect-error types
      results.push(...(await this.getPage()));
    } while (this.queryVars.after);

    return results as unknown as TReturn;
  }

  /**
   * Async generator, yields individual query result items
   */
  public async *generator(): AsyncGenerator<Required<ArrayElement<TReturn>>> {
    do {
      const res = await this.getPage();
      // @ts-expect-error constraints
      for (const r of res) yield r;
    } while (this.queryVars.after); // getPage sets after to undefined if there are no more pages
  }

  /**
   * Readable stream produced from `this.generator`
   * @returns a readable instance, with the "data" event yielding individual results
   */
  public stream(): { on(event: "data", listener: (res: ArrayElement<TReturn>) => any) } & Readable {
    return Readable.from(this.generator());
  }

  // parameter builder methods, for each query type you want to add support for, add an overload here. the rest of the methods will resolve without modification.
  // TODO: remove BuilderMethods if skipFieldSetters is true
  /**
   * Sets query shape (query fields & vars) as well types used to regulate future methods. \
   * Generates setter methods for variables unless opts.skipVariableSetters is truthy. \
   * If an included type is specified, the overload will automatically register the types for you. \
   * @param queryName the GraphQL name of the query
   * @param opts Options to provide your own queryInfo object, or to skip automatic field setter creation
   */
  // @ts-expect-error overload
  search(
    queryName: "transactions",
    opts?: SearchOpts,
  ): GraphQLQuery<Transaction, TransactionVars> & BuilderMethods<TransactionVars, GraphQLQuery<Transaction, TransactionVars>>;

  search<Fields extends Record<any, any> = any, Vars extends Record<string, any> = any, BuilderVars extends Record<string, any> = any>(
    queryName: string,
    opts?: SearchOpts,
  ): GraphQLQuery<Fields, Vars> & BuilderMethods<BuilderVars, GraphQLQuery<Fields, Vars>>;

  public search<Fields extends Record<any, any> = any, Vars extends Record<string, any> = any, BuilderVars extends Record<string, any> = any>(
    queryName: string,
    opts?: SearchOpts,
  ): GraphQLQuery<Fields, Vars> & BuilderMethods<BuilderVars, GraphQLQuery<Fields, Vars>> {
    const query = opts?.query ?? queries[queryName];
    if (!query) throw new Error(`Unable to find query with name ${queryName}`);
    this.queryInfo = { name: queryName, enumValues: query.enumValues, vars: query.vars };
    this.queryFields = query.query;

    // generate dynamic variable setter builder methods
    if (!opts?.skipVariableSetters) {
      for (const k of Object.keys(query.vars)) {
        if (this[k]) throw new Error(`Field setter ${k} has a key conflict - disable with opts.skipFieldSetters`);
        this[k] = (value): this => {
          this.queryVars[k] = value;
          return this;
        };
      }
    }
    // @ts-expect-error overloading
    return this;
  }

  // TODO issue: this allows for additional (top level only?!) fields that aren't part of TQuery - for now we perform JS level shape checks and throw.

  /**
   * Set the fields you want the query to return
   * @param fields - Object structured like a graphql query body, truthy values including, falsy excluding
   * @param skipFieldCheck - whether to skip JS level fields object shape validation
   * @returns `this` (chainable)
   */
  public fields<T extends Field<TQuery> = Field<TQuery>>(
    fields: T,
    skipFieldCheck = false,
  ): GraphQLQuery<TQuery, TVars, ReturnFields<TQuery, T>[]> &
    BuilderMethods<TransactionVars, GraphQLQuery<TQuery, TVars, ReturnFields<TQuery, T>[]>> {
    console.log("fields", fields);
    // validate provided fields against default fields
    // default/allowed fields is under `this.queryFields`
    // user selected fields are under `fields`
    // path, allowed, user provided - it's flat so we don't need super precise comparision
    const recursiveValidate = (p, a, b): void => {
      for (const k of Object.keys(b)) {
        const ak = a[k];
        const bk = b[k];
        if (ak === undefined) throw new Error(`Illegal field ${p}${k}`);
        if (typeof bk === "object") recursiveValidate(p + k + ".", ak, bk);
      }
    };

    if (!skipFieldCheck) recursiveValidate("", this.queryFields, fields);
    this.queryFields = fields;
    // @ts-expect-error TODO: fix this
    return this;
  }

  /**
   * Sets variables using an object
   * @param variables variable object to set
   * @returns this (chainable)
   */
  public variables(variables: TVars): GraphQLQuery<TQuery, TVars, TReturn> & BuilderMethods<TransactionVars, GraphQLQuery<TQuery, TVars, TReturn>> {
    this.queryVars = variables;
    // @ts-expect-error - dynamic builder props
    return this;
  }

  /**
   * Builds the current query and returns a ready to POST query string
   * @returns string form of the current query
   */
  public async toQuery(): Promise<string> {
    await this.buildQuery();
    return this.query!;
  }

  // instance generic type accessors

  /**
   * Dummy method to access the interal `TReturn` generic type
   * @returns "tReturn"
   */
  public tReturn(): TReturn {
    return "tReturn" as any as TReturn;
  }

  /**
   * Dummy method to access the interal `TQuery` generic type
   * @returns "tQuery"
   */
  public tQuery(): TQuery {
    return "tQuery" as any as TQuery;
  }

  /**
   * Dummy method to access the interal `TVars` generic type
   * @returns "tVars"
   */
  public tVars(): TVars {
    return "tVars" as any as TVars;
  }

  // Promise contract functions, so users can `await` a GraphQLQuery instance to resolve the built query.
  // very cool, thanks Knex.
  /**
   * Resolves `this` by getting all results for the query (including paging)
   * @param onFulfilled - optional onFufilled callback
   * @returns - all results for built query
   */
  public async then(onFulfilled?: ((value: TReturn) => any | PromiseLike<TReturn>) | undefined | null): Promise<TReturn | never> {
    const res = await this.all();
    if (onFulfilled) {
      return await onFulfilled(res);
    }
    return res;
  }

  public async catch(onReject?: ((value: TReturn) => any | PromiseLike<TReturn>) | undefined | null): Promise<null> {
    return this.then().catch(onReject);
  }

  public async finally(onFinally?: (() => void) | null | undefined): Promise<TReturn | null> {
    return this.then().finally(onFinally);
  }
}
