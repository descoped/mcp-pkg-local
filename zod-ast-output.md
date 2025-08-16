# zod Overview

## 📦 Package Information
name: zod
version: 3.25.76
type: TypeScript-first schema declaration and validation library with static type inference
main: ./index.cjs
license: MIT
package_manager: npm
type_system: dynamically typed
type_annotations: available
type_definitions: ./index.d.cts

## 🔧 Configuration
build_system: npm

commands:
  - clean: git clean -xdf . -e node_modules
  - build: zshy --project tsconfig.build.json
  - postbuild: pnpm biome check --write .
  - test:watch: pnpm vitest
  - test: pnpm vitest run
  - bump:beta: pnpm version "v$(pnpm pkg get version | jq -r)-beta.$(date +%Y%m%dT%H%M%S)"
  - pub:beta: pnpm bump:beta && pnpm publish --tag next --publish-branch v4 --no-git-checks --dry-run

## 🏗️ Core Components

### 1. ZodError
purpose: Class implementation
extends: Error
visibility: public
methods:
  - format(_mapper): import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v3/ZodError").ZodFormattedError<T, string>
  - [static] assert(value): asserts value is ZodError
  - toString(): string
  - flatten(mapper): any
properties:
  - issues: ZodIssue[]
  - [static] create: (issues: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v3/ZodError").ZodIssue[]) => import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v3/ZodError").ZodError<any>
  - addIssue: (sub: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v3/ZodError").ZodIssue) => void
  - addIssues: (subs?: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v3/ZodError").ZodIssue[]) => void

### 2. ParseStatus
purpose: Class implementation
visibility: public
methods:
  - dirty(): void
  - abort(): void
  - [static] mergeArray(status, results): SyncParseReturnType
  - [static async] mergeObjectAsync(status, pairs): Promise<SyncParseReturnType<any>>
  - [static] mergeObjectSync(status, pairs): SyncParseReturnType
properties:
  - value: "aborted" | "dirty" | "valid"

### 3. setErrorMap()
purpose: Function implementation
parameters: map: ZodErrorMap
returns: void

### 4. getErrorMap()
purpose: Function implementation
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v3/ZodError").ZodErrorMap

### 5. addIssueToContext()
purpose: Function implementation
parameters: ctx: ParseContext, issueData: IssueData
returns: void

### 6. ZodInvalidTypeIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_type
  - expected: ZodParsedType
  - received: ZodParsedType

### 7. ZodInvalidLiteralIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_literal
  - expected: unknown
  - received: unknown

### 8. ZodUnrecognizedKeysIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.unrecognized_keys
  - keys: string[]

### 9. ZodInvalidUnionIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_union
  - unionErrors: ZodError[]

### 10. ZodInvalidUnionDiscriminatorIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_union_discriminator
  - options: Primitive[]

### 11. ZodInvalidEnumValueIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - received: string | number
  - code: typeof ZodIssueCode.invalid_enum_value
  - options: (string | number)[]

### 12. ZodInvalidArgumentsIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_arguments
  - argumentsError: ZodError

### 13. ZodInvalidReturnTypeIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_return_type
  - returnTypeError: ZodError

### 14. ZodInvalidDateIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_date

### 15. ZodInvalidStringIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_string
  - validation: StringValidation

### 16. ZodTooSmallIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.too_small
  - minimum: number | bigint
  - inclusive: boolean
  - exact: boolean
  - type: "array" | "string" | "number" | "set" | "date" | "bigint"

### 17. ZodTooBigIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.too_big
  - maximum: number | bigint
  - inclusive: boolean
  - exact: boolean
  - type: "array" | "string" | "number" | "set" | "date" | "bigint"

### 18. ZodInvalidIntersectionTypesIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_intersection_types

### 19. ZodNotMultipleOfIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.not_multiple_of
  - multipleOf: number | bigint

### 20. ZodNotFiniteIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.not_finite

### 21. ZodCustomIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.custom
  - params: { [k: string]: any }

### 22. ParseContext (interface)
purpose: Interface definition
properties:
  - common: {
    readonly issues: ZodIssue[];
    readonly contextualErrorMap?: ZodErrorMap | undefined;
    readonly async: boolean;
  }
  - path: ParsePath
  - schemaErrorMap: ZodErrorMap | undefined
  - parent: ParseContext | null
  - data: any
  - parsedType: ZodParsedType

### 23. ParseResult (interface)
purpose: Interface definition
properties:
  - status: "aborted" | "dirty" | "valid"
  - data: any

### Constants
  - ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_
  - quotelessJson = (obj: any) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$
  - makeIssue = (params: {
  data: any;
  path: (string | number)[];
  errorMaps: ZodErrorMap[];
  issueData: IssueD
  - EMPTY_PATH: ParsePath = []
  - INVALID: INVALID = Object.freeze({
  status: "aborted",
})
  - DIRTY = <T>(value: T): DIRTY<T> => ({ status: "dirty", value })
  - OK = <T>(value: T): OK<T> => ({ status: "valid", value })
  - isAborted = (x: ParseReturnType<any>): x is INVALID => (x as any).status === "aborted"
  - isDirty = <T>(x: ParseReturnType<T>): x is OK<T> | DIRTY<T> => (x as any).status === "dirty"
  - isValid = <T>(x: ParseReturnType<T>): x is OK<T> => (x as any).status === "valid"
  - isAsync = <T>(x: ParseReturnType<T>): x is AsyncParseReturnType<T> =>
  typeof Promise !== "undefined" && x in
  - ZodParsedType: {
  string: "string";
  nan: "nan";
  number: "number";
  integer: "integer";
  float: "float";
  boolean: "boolean";
  date: "date";
  bigint: "bigint";
  symbol: "symbol";
  function: "function";
  undefined: "undefined";
  null: "null";
  array: "array";
  object: "object";
  unknown: "unknown";
  promise: "promise";
  void: "void";
  never: "never";
  map: "map";
  set: "set";
} = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
 
  - getParsedType = (data: any): ZodParsedType => {
  const t = typeof data;

  switch (t) {
    case "undefined":
     

## 🔌 Exports
main_export: default
named_exports:
  - z
  - setErrorMap
  - getErrorMap
  - defaultErrorMap
  - addIssueToContext
  - makeIssue
  - ParseParams
  - ParsePathComponent
  - ParsePath
  - EMPTY_PATH
  - ParseContext
  - ParseInput
  - ObjectPair
  - ParseStatus
  - ParseResult
  - INVALID
  - DIRTY
  - OK
  - SyncParseReturnType
  - AsyncParseReturnType
  - ParseReturnType
  - isAborted
  - isDirty
  - isValid
  - isAsync
  - Primitive
  - Scalars
  - util
  - objectUtil
  - ZodParsedType
  - getParsedType
  - datetimeRegex
  - custom
  - RefinementCtx
  - ZodRawShape
  - ZodTypeAny
  - TypeOf
  - input
  - output
  - infer
  - CustomErrorParams
  - ZodTypeDef
  - RawCreateParams
  - ProcessedCreateParams
  - SafeParseSuccess
  - SafeParseError
  - SafeParseReturnType
  - ZodType
  - IpVersion
  - ZodStringCheck
  - ZodStringDef
  - ZodString
  - ZodNumberCheck
  - ZodNumberDef
  - ZodNumber
  - ZodBigIntCheck
  - ZodBigIntDef
  - ZodBigInt
  - ZodBooleanDef
  - ZodBoolean
  - ZodDateCheck
  - ZodDateDef
  - ZodDate
  - ZodSymbolDef
  - ZodSymbol
  - ZodUndefinedDef
  - ZodUndefined
  - ZodNullDef
  - ZodNull
  - ZodAnyDef
  - ZodAny
  - ZodUnknownDef
  - ZodUnknown
  - ZodNeverDef
  - ZodNever
  - ZodVoidDef
  - ZodVoid
  - ZodArrayDef
  - ArrayCardinality
  - arrayOutputType
  - ZodArray
  - ZodNonEmptyArray
  - UnknownKeysParam
  - ZodObjectDef
  - mergeTypes
  - objectOutputType
  - baseObjectOutputType
  - objectInputType
  - baseObjectInputType
  - CatchallOutput
  - CatchallInput
  - PassthroughType
  - deoptional
  - SomeZodObject
  - noUnrecognized
  - ZodObject
  - AnyZodObject
  - ZodUnionOptions
  - ZodUnionDef
  - ZodUnion
  - ZodDiscriminatedUnionOption
  - ZodDiscriminatedUnionDef
  - ZodDiscriminatedUnion
  - ZodIntersectionDef
  - ZodIntersection
  - ZodTupleItems
  - AssertArray
  - OutputTypeOfTuple
  - OutputTypeOfTupleWithRest
  - InputTypeOfTuple
  - InputTypeOfTupleWithRest
  - ZodTupleDef
  - AnyZodTuple
  - ZodTuple
  - ZodRecordDef
  - KeySchema
  - RecordType
  - ZodRecord
  - ZodMapDef
  - ZodMap
  - ZodSetDef
  - ZodSet
  - ZodFunctionDef
  - OuterTypeOfFunction
  - InnerTypeOfFunction
  - ZodFunction
  - ZodLazyDef
  - ZodLazy
  - ZodLiteralDef
  - ZodLiteral
  - ArrayKeys
  - Indices
  - EnumValues
  - Values
  - ZodEnumDef
  - Writeable
  - FilterEnum
  - typecast
  - ZodEnum
  - ZodNativeEnumDef
  - EnumLike
  - ZodNativeEnum
  - ZodPromiseDef
  - ZodPromise
  - Refinement
  - SuperRefinement
  - RefinementEffect
  - TransformEffect
  - PreprocessEffect
  - Effect
  - ZodEffectsDef
  - ZodEffects
  - ZodTransformer
  - ZodOptionalDef
  - ZodOptionalType
  - ZodOptional
  - ZodNullableDef
  - ZodNullableType
  - ZodNullable
  - ZodDefaultDef
  - ZodDefault
  - ZodCatchDef
  - ZodCatch
  - ZodNaNDef
  - ZodNaN
  - ZodBrandedDef
  - BRAND
  - ZodBranded
  - ZodPipelineDef
  - ZodPipeline
  - ZodReadonlyDef
  - ZodReadonly
  - Schema
  - ZodSchema
  - late
  - ZodFirstPartyTypeKind
  - ZodFirstPartySchemaTypes
  - coerce
  - any
  - array
  - bigint
  - boolean
  - date
  - discriminatedUnion
  - effect
  - enum
  - function
  - instanceof
  - intersection
  - lazy
  - literal
  - map
  - nan
  - nativeEnum
  - never
  - null
  - nullable
  - number
  - object
  - oboolean
  - onumber
  - optional
  - ostring
  - pipeline
  - preprocess
  - promise
  - record
  - set
  - strictObject
  - string
  - symbol
  - transformer
  - tuple
  - undefined
  - union
  - unknown
  - void
  - NEVER
  - inferFlattenedErrors
  - typeToFlattenedError
  - ZodIssueCode
  - ZodIssueBase
  - ZodInvalidTypeIssue
  - ZodInvalidLiteralIssue
  - ZodUnrecognizedKeysIssue
  - ZodInvalidUnionIssue
  - ZodInvalidUnionDiscriminatorIssue
  - ZodInvalidEnumValueIssue
  - ZodInvalidArgumentsIssue
  - ZodInvalidReturnTypeIssue
  - ZodInvalidDateIssue
  - StringValidation
  - ZodInvalidStringIssue
  - ZodTooSmallIssue
  - ZodTooBigIssue
  - ZodInvalidIntersectionTypesIssue
  - ZodNotMultipleOfIssue
  - ZodNotFiniteIssue
  - ZodCustomIssue
  - DenormalizedError
  - ZodIssueOptionalMessage
  - ZodIssue
  - quotelessJson
  - ZodFormattedError
  - inferFormattedError
  - ZodError
  - IssueData
  - ErrorMapCtx
  - ZodErrorMap
  - enumUtil
  - errorUtil
  - partialUtil
