export type GQLResponse<T> = {
  data:
    | Record<
        string,
        {
          edges: T;
          pageInfo: PageInfo;
        }
      >
    | T;
};

export type PageInfo = {
  endCursor: string | undefined;
  hasNextPage: boolean;
};

/** Object describing metadata about a query, including the type, enum values, vars, and other info */
export type QueryInfo = {
  /** Name of the query (GQL query name) */
  name: string;
  /** Minimal object representing the return shape of the query */
  query: Record<string, any>;
  /** Names of all enumeration values - these need special formatting */
  enumValues?: string[];
  /** variables to supply the query */
  vars: Record<string, any>;
  /** Tell the GQL compiler to remap the variable with name <key> to variable with name <value> */
  remapVars?: Record<string, string>;
  paging?: {
    /** name of the hasNextPage pageInfo var */
    hasNextPage: string;
    /** name of the cursor edge var*/
    cursor: string;
  };
};

export type SearchOpts = { skipVariableSetters?: boolean; query?: QueryInfo | false };

// forces full type resolution, aka "intellisense pretty printing"
export type Pretty<T> = T extends (...args: any[]) => any ? T : T extends abstract new (...args: any[]) => any ? T : { [K in keyof T]: T[K] };

// custom types
// F is possible fields, S is user selection
// maps user provided fields object to possible fields
export type ReturnFields<F extends S, S> =
  | {
      [K in keyof S]: F[K] extends (infer U)[] // @ts-expect-error - illegal constraints :) TODO: fix
        ? Pick<U, keyof S[K]>[]
        : S[K] extends object
        ? ReturnFields<F[K], S[K]>
        : S[K] extends true
        ? Required<F[K]>
        : undefined;
    }
  | undefined;

// maps fields into structural optional booleans for user selection
export type Field<T extends Record<string, any>> = {
  [K in keyof T]?: T[K] extends (infer U extends object)[] // note the optionality `?`
    ? Field<U> // flatten to array element type
    : T[K] extends object
    ? Field<T[K]>
    : boolean;
};

// constructs function signatures from a type for dynamic builder methods
export type BuilderMethods<T extends Record<string, any>, R = any> = {
  [K in keyof T]-?: T[K] extends object ? BuilderMethods<T[K]> : (field: T[K]) => R & BuilderMethods<T, R>;
};

// maps an array back to the type of it's element
export type ArrayElement<T> = T extends (infer U)[] ? U : T;
