import axios from "axios";
import { Readable } from "stream";
import type { ArrayElement, BuilderMethods, Field, GQLResponse, QueryInfo, ReturnFields, SearchOpts } from "./types";
import type { Options as RetryOptions } from "async-retry";
import AsyncRetry from "async-retry";

// GraphQL query builder class, uses overload signatures to modify class generics to provide concise typings for any configured query
// this approach does mean (atm anyway) we need to explicitly coerce return types to the correct "shape", but as most of the methods are dynamic, this isn't much of an issue.
// TODO: look into constructor facade pattern - https://gist.github.com/kourge/9715e0dd59c28e776fb598d407636106
// TODO: look into https://discord.com/channels/508357248330760243/1122523559097548870
/**
 * GraphQL query class - encapsulates all logic, types, and methods required to resolve queries
 */
export class GraphQLQuery<TQuery extends Record<any, any> = any, TVars extends Record<string, any> = any, TReturn extends Record<string, any> = any> {
  /* implements BuilderMethods<TVars, GraphQLQuery<TQuery, TVars, TReturn>> */
  // query variables
  protected queryVars: Record<string, any> = {};
  // query fields
  protected queryFields: Record<string, any>;
  // query metadata
  protected queryInfo: QueryInfo & { name: string };
  // query string, payload sent to node
  protected _query: string | undefined;
  // url of the node to query
  protected url: URL;
  // misc operational config
  protected config: { first: boolean; userProvided: boolean; numPages: number; numResults: number; retryOpts?: RetryOptions };
  // result tracker object, used to hold state for paging operations
  protected resultTracker: { numResults: number; numPages: number; done: boolean } = { numPages: 0, numResults: 0, done: false };

  constructor({
    url,
    retryConfig,
    query,
    queryName,
    opts,
  }: {
    url: string | URL;
    retryConfig?: RetryOptions;
    query?: QueryInfo | false;
    queryName: string;
    opts?: SearchOpts;
  }) {
    if (!url) throw new Error("URL is required");
    this.url = new URL(url);
    this.config = {
      first: false,
      userProvided: false,
      numPages: Infinity,
      numResults: 1_000,
      retryOpts: { retries: 3, maxTimeout: 2_000, minTimeout: 500, ...retryConfig },
    };

    if (query === false) return this;
    if (!query) throw new Error(`Unable to find query with name ${queryName}`);
    this.queryInfo = { ...query };
    this.queryFields = query.query;
    if (queryName.includes("arweave") && this.url.host === "node1.bundlr.network") this.url = new URL("https://arweave.net/graphql");
    if (!opts?.skipVariableSetters) {
      // generate dynamic variable setter builder methods
      for (const k of Object.keys(query.vars)) {
        if (this[k])
          throw new Error(
            `Field setter ${k} has a key conflict - disable with opts.skipVariableSetters OR change the field name and add to query.remapVars`,
          );
        this[k] = (value): this => {
          this.queryVars[k] = value;
          return this;
        };
      }
    }

    return this;
  }

  /**
   * Builds a query from fields and variables, formatting it into a GQL compatible string.
   * stores built query under `this.query` (protected) - accessible via `.toQuery`
   * @returns `this` (chainable)
   */
  protected buildQuery(): BuilderMethods<TVars, GraphQLQuery<TQuery, TVars, TReturn>> {
    // @ts-expect-error overloading
    if (this.config.userProvided) return this; // don't build if it's a user provided query string
    // builds query, reducing `this.queryFields` to a structured string with correct formatting
    const toGQLString = (s: object | undefined): string =>
      JSON.stringify(s, (_, v) => {
        if (v instanceof Array) return v[0]; /* JSON.stringify(v); */
        if (typeof v === "object") return v;
        if (v === false) return undefined;
        return "";
      })
        .replaceAll(`:`, "")
        .replaceAll(`"`, "")
        .replaceAll(",", "\n");

    const nodeQuery = toGQLString(this.queryFields);
    // the hasNextPage field can vary
    const pageInfo = toGQLString({ pageInfo: { [this.queryInfo.paging?.hasNextPage ?? "hasNextPage"]: undefined } }).slice(1, -1); // remove leading "{" and finishing "}"

    const enumValues = this.queryInfo.enumValues;

    // incorporates defaults from queryInfo
    const vars = { ...this.queryInfo.vars, ...this.queryVars };
    // remap keys - primarily done to prevent conflicts with builder methods.
    // {limit: "first"} -> remaps `limit` variable to `first` variable
    // {limit: (k,v) => ["first",v]} does the same thing
    for (const [k, v] of Object.entries(this.queryInfo.remapVars ?? {})) {
      if (vars?.[k] === undefined) continue;
      if (typeof v === "function") {
        // provided mapper fn
        const m = v(k, vars[k], vars);
        if (!m) continue;
        const [nk, nv] = m;
        vars[nk] = nv;
        if (nk === k) continue; // don't null out key if it's the same key
      } else {
        vars[v] = vars[k];
      }
      vars[k] = undefined; // null keys are removed below
    }
    // reduces queryVars to inline vars, for convenience. (using separate means we have to annotate the GQL type)
    const qVars = JSON.stringify(vars, function (k, v) {
      // console.log(this, k, v);
      if (v === undefined) return v; // remove null keys
      if (v instanceof Array) return v; // don't break recursion
      if (typeof v === "object") return v; // ^
      if (typeof v === "number") return v; // numbers don't need string escaping
      // TODO: improve this so it's context aware and doesn't alter anything unintentional
      // can probably do by logging key names into array if value is an object, popping when object is a primitive
      if (enumValues?.includes(k)) return v; // exclude enum variants from quote addition
      return `'${v}'`; // this value needs to be quote padded
    })
      .replaceAll('"', "") // remove double quotes,
      .replaceAll("'", '"') // add needed double quotes
      .slice(1, -1); // remove leading "{" and finishing "}"
    if (!this?.queryInfo?.name) throw new Error(`Query name is undefined!`);

    // discriminate based on whether the query is pageable
    const query = this.queryInfo.paging
      ? `query {
      ${this.queryInfo.name}(
        ${qVars}
      ) {
        edges {
          cursor
          node ${nodeQuery}
        }
        ${pageInfo}
      }
    }`
      : `query {
    ${this.queryInfo.name}(
      ${qVars}
    ) 
    ${nodeQuery}
  }`;
    this._query = query;
    // @ts-expect-error types - DO NOT SET RETURN TYPE TO `this` - TS will assume this should be an async function as `this` implements promise methods
    return this;
  }

  /**
   * Primary query execution method - builds & runs the query, returning result nodes and updating cursor info in queryVars
   * @returns query result nodes
   */
  public async getPage(): Promise<TReturn | undefined> {
    if (this.resultTracker.done) return undefined;
    this.buildQuery();
    if (!this._query) throw new Error(`Unable to run undefined query`);
    let res;
    try {
      res = await AsyncRetry(async (_) => {
        const r = await axios<GQLResponse<TQuery>>(this.url.toString(), {
          method: "post",
          headers: { "Content-Type": "application/json" },
          data: { query: this._query },
        });
        if (r.data.errors) throw r.data;
        return r;
      }, this.config.retryOpts);
    } catch (e) {
      // console.error(`Error running query ${this._query} - ${e} - (${JSON.stringify(e?.response?.data?.errors ?? e?.errors ?? e)})`);
      throw { error: e, query: this._query };
    }

    if (this.config.userProvided) return this.trimmer([res.data.data].flat(20) as unknown as TReturn);

    const data = res.data.data[this.queryInfo.name];
    // if this is a pageable query if this is defined
    if (this.queryInfo.paging) {
      const nextCursor = data.pageInfo[this.queryInfo.paging.hasNextPage] ? data.edges.at(-1)[this.queryInfo.paging.cursor] : undefined;
      this.queryVars.after = nextCursor;
      return this.trimmer(data.edges.map((v) => v.node) as unknown as TReturn);
    }
    return this.trimmer([data].flat(20) as unknown as TReturn);
  }

  // tracks & controls output
  private trimmer(res: TReturn): TReturn {
    const numPages = ++this.resultTracker.numPages;
    const numResults = (this.resultTracker.numResults += res.length);
    if (res.length === 0) {
      this.resultTracker.done = true;
      return res;
    }
    if (numPages >= this?.config?.numPages) this.resultTracker.done = true;
    if (numResults >= this?.config?.numResults) {
      this.resultTracker.done = true;
      const delta = this.config.numResults - (numResults - res.length);
      return res.slice(0, delta);
    }
    return res;
  }

  // return modifier functions

  /**
   * Get the first result from the query
   * @returns the first result from the query - gets at maximum one page
   */
  public async first(): Promise<ArrayElement<TReturn>> {
    const res = await this.getPage();
    return res?.at(0) ?? undefined;
  }

  /**
   * Limiter on the number of pages a given query should resolve to
   * @param numPages Maximum number of pages to return
   * @returns this (chainable)
   */
  protected maxPages(numPages: number): BuilderMethods<TVars, GraphQLQuery<TQuery, TVars, TReturn>> {
    this.config.numPages = numPages;
    // @ts-expect-error types
    return this;
  }

  /**
   * Limiter on the maximum number of results a given query should resolve to
   * @param numResults Maximum number of results to return
   * @returns this (chainable)
   */
  public limit(numResults: number): BuilderMethods<TVars, GraphQLQuery<TQuery, TVars, TReturn>> {
    this.config.numResults = numResults;
    // @ts-expect-error types
    return this;
  }

  // return functions

  /**
   * Gets all results from the built query
   * @returns array of results
   */
  protected async all(): Promise<TReturn> {
    const results: any[] = [];
    do {
      const page = await this.getPage();
      if (!page) break;
      // @ts-expect-error types
      results.push(...page);
    } while (this.queryVars.after);

    return results as unknown as TReturn;
  }

  /**
   * Async generator, yields individual query result items
   */
  protected async *generator(): AsyncGenerator<Required<ArrayElement<TReturn>>> {
    do {
      const res = await this.getPage();
      if (!res) return;
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

  /**
   * Provide a custom query string to resolve
   * @param query Query string to use
   * @returns result of the query - this method does not support paging or extraction
   */
  public query<T extends TReturn = TReturn>(
    query: string,
    // eslint-disable-next-line @typescript-eslint/prefer-return-this-type
  ): GraphQLQuery<TQuery, TVars, T> /* & BuilderMethods<TVars, GraphQLQuery<TQuery, TVars, T[]>> */ {
    this._query = query;
    this.config.userProvided = true;
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
  ): BuilderMethods<TVars, GraphQLQuery<TQuery, TVars, ReturnFields<TQuery, T>[]>> {
    // console.log("fields", fields);
    // validate provided fields against default fields
    // default/allowed fields is under `this.queryFields`
    // user selected fields are under `fields`
    // path, allowed, user provided - it's flat so we don't need super precise comparision
    const recursiveValidate = (p, a, b): void => {
      for (const k of Object.keys(b)) {
        let ak = a[k];
        if (Array.isArray(ak)) ak = ak[0];
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
  public variables(variables: TVars): BuilderMethods<TVars, GraphQLQuery<TQuery, TVars, TReturn>> {
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
    return this._query!;
  }

  // instance generic type accessors

  /**
   * Dummy method to access the internal `TReturn` generic type
   * @returns "tReturn"
   */
  protected tReturn(): TReturn {
    return "tReturn" as any as TReturn;
  }

  /**
   * Dummy method to access the internal `TQuery` generic type
   * @returns "tQuery"
   */
  protected tQuery(): TQuery {
    return "tQuery" as any as TQuery;
  }

  /**
   * Dummy method to access the internal `TVars` generic type
   * @returns "tVars"
   */
  protected tVars(): TVars {
    return "tVars" as any as TVars;
  }

  // Promise contract functions, so users can `await` a GraphQLQuery instance to resolve the built query.
  // very cool, thanks Knex.
  /**
   * Resolves `this` by getting all results for the query (including paging)
   * @param onFulfilled - optional onFulfilled callback
   * @returns - all results for built query
   */
  public async then(
    onFulfilled?: ((value: TReturn) => any | PromiseLike<TReturn>) | undefined | null,
    onRejected?: (value: Error) => any | PromiseLike<Error> | undefined | null,
  ): Promise<TReturn | never> {
    const res = this.all();
    return res.then(onFulfilled, onRejected);
  }

  public async catch(onReject?: ((value: TReturn) => any | PromiseLike<TReturn>) | undefined | null): Promise<null> {
    return this.then().catch(onReject);
  }

  public async finally(onFinally?: (() => void) | null | undefined): Promise<TReturn | null> {
    return this.then().finally(onFinally);
  }
}
// this was definitely not over engineered 👀
