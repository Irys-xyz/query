import type { Options as RetryOptions } from "async-retry";

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
  errors?: { message: string }[];
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
  remapVars?: Record<string, string | ((key: string, value: string, vars) => undefined | void | [newKey: string, newValue: string])>;
  paging?: {
    /** name of the hasNextPage pageInfo var */
    hasNextPage: string;
    /** name of the cursor edge var*/
    cursor: string;
    /** name of the limiter */
    limiterName: string;
  };
};
export type Network = "mainnet" | "devnet";

export type SearchOpts = { skipVariableSetters?: boolean; query?: QueryInfo | false };
export type QueryCtorOpts = { url?: URL | string; network?: Network; retryConfig?: RetryOptions };

// forces full type resolution, aka "intellisense pretty printing"
export type Pretty<T> = T extends (...args: any[]) => any ? T : T extends abstract new (...args: any[]) => any ? T : { [K in keyof T]: T[K] };

// https://twitter.com/mattpocockuk/status/1622730173446557697?s=20
export type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

export type Prettify2<T> = {
  [K in keyof T]: Prettify<T[K]>;
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

// custom types
// F is possible fields, S is user selection
// maps user provided fields object to possible fields
export type ReturnFields<F extends S, S extends UserField> =
  | {
      [K in keyof S]: F[K] extends (infer U)[] // if this is an array
        ? Pick<U, keyof S[K]>[] // flatten
        : S[K] extends object
        ? ReturnFields<F[K], S[K]> // recurse
        : S[K] extends true
        ? Required<F[K]> // "show" this field in the output type
        : undefined;
    }
  | undefined;

// @ts-expect-error doesn't like circular references TODO: fix
type UserField = Record<string, true | (string | UserField)[] | UserField>;
/* {
  [key: string]: true | (UserField | string)[] | UserField;
}; */

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
  [K in keyof T]-?: T[K] extends object ? BuilderMethods<T[K]> : (field: T[K]) => BuilderMethods<T, R>;
} & R;

// maps an array back to the type of it's element
export type ArrayElement<T> = T extends (infer U)[] ? U : T;

export declare function assertIs<T>(value: unknown): asserts value is T;

export type HasBuilderMethods<T extends Record<string, any>, R = any> = {
  [K in keyof T]-?: T[K] extends object ? BuilderMethods<T[K]> : (field: T[K]) => R & BuilderMethods<T, R>;
};
