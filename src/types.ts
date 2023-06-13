export type GQLResponse<T> = {
  data: Record<
    string,
    {
      edges: T;
      pageInfo: PageInfo;
    }
  >;
};

export type PageInfo = {
  endCursor: string | undefined;
  hasNextPage: boolean;
};

export type QueryInfo = { query: Record<string, any>; enumValues: string[]; vars: Record<string, any> };

export type SearchOpts = { skipVariableSetters?: boolean; query?: QueryInfo };

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
    ? Field<U> // flatten to array element tyoe
    : T[K] extends object
    ? Field<T[K]>
    : boolean;
};

// contructs function signatures from a type
export type BuilderMethods<T extends Record<string, any>, R = any> = {
  [K in keyof T]-?: T[K] extends object ? BuilderMethods<T[K]> : (field: T[K]) => R & BuilderMethods<T, R>;
};

// maps an array back to the type of it's element
export type ArrayElement<T> = T extends (infer U)[] ? U : T;
