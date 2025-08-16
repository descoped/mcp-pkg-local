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

### 3. Mocker
purpose: Class implementation
visibility: public
properties:
  - pick: (...args: any[]) => any

### 4. $ZodAsyncError
purpose: Class implementation
extends: Error
visibility: public

### 5. Doc
purpose: Class implementation
visibility: public
methods:
  - indented(fn): void
  - write(arg): void
  - compile(): Function
properties:
  - args: string[]
  - content: string[]
  - indent: number

### 6. $ZodFunction
purpose: Class implementation
visibility: public
methods:
  - implement(func): (
    ...args: Parameters<this["_output"]>
  ) => ReturnType<F> extends ReturnType<this["_output"]> ? ReturnType<F> : ReturnType<this["_output"]>
  - implementAsync(func): F extends $InferOuterFunctionTypeAsync<Args, Returns> ? F : $InferOuterFunctionTypeAsync<Args, Returns>
  - input(args): $ZodFunction<any, Returns>
  - output(output): $ZodFunction<Args, NewReturns>
properties:
  - def: $ZodFunctionDef<Args, Returns>
  - _def: $ZodFunctionDef<Args, Returns>
  - _input: $InferInnerFunctionType<Args, Returns>
  - _output: $InferOuterFunctionType<Args, Returns>

### 7. $ZodRegistry
purpose: Class implementation
visibility: public
methods:
  - add(schema, _meta): this
  - clear(): this
  - remove(schema): this
  - get(schema): $replace<Meta, S> | undefined
  - has(schema): boolean
properties:
  - _meta: Meta
  - _schema: Schema
  - _map: Map<Schema, $replace<Meta, Schema>>
  - _idmap: Map<string, Schema>

### 8. JSONSchemaGenerator
purpose: Class implementation
visibility: public
methods:
  - process(schema, _params): JSONSchema.BaseSchema
  - emit(schema, _params): JSONSchema.BaseSchema
properties:
  - metadataRegistry: $ZodRegistry<Record<string, any>>
  - target: "draft-7" | "draft-2020-12"
  - unrepresentable: "throw" | "any"
  - override: (ctx: {
    zodSchema: schemas.$ZodTypes;
    jsonSchema: JSONSchema.BaseSchema;
    path: (string | number)[];
  }) => void
  - io: "input" | "output"
  - counter: number
  - seen: Map<schemas.$ZodType, Seen>

### 9. Class
purpose: Class implementation
visibility: public
abstract: true

### 10. Class
purpose: Class implementation
visibility: private
abstract: true

### 11. setErrorMap()
purpose: Function implementation
parameters: map: ZodErrorMap
returns: void

### 12. getErrorMap()
purpose: Function implementation
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v3/ZodError").ZodErrorMap

### 13. addIssueToContext()
purpose: Function implementation
parameters: ctx: ParseContext, issueData: IssueData
returns: void

### 14. string()
purpose: Function implementation
parameters: params?: string | core.$ZodStringParams
returns: ZodCoercedString<T>

### 15. number()
purpose: Function implementation
parameters: params?: string | core.$ZodNumberParams
returns: ZodCoercedNumber<T>

### 16. boolean()
purpose: Function implementation
parameters: params?: string | core.$ZodBooleanParams
returns: ZodCoercedBoolean<T>

### 17. bigint()
purpose: Function implementation
parameters: params?: string | core.$ZodBigIntParams
returns: ZodCoercedBigInt<T>

### 18. date()
purpose: Function implementation
parameters: params?: string | core.$ZodDateParams
returns: ZodCoercedDate<T>

### 19. setErrorMap()
purpose: Function implementation
parameters: map: core.$ZodErrorMap
returns: void

### 20. getErrorMap()
purpose: Function implementation
returns: core.$ZodErrorMap<core.$ZodIssue> | undefined

### 21. datetime()
purpose: Function implementation
parameters: params?: string | core.$ZodISODateTimeParams
returns: ZodISODateTime

### 22. date()
purpose: Function implementation
parameters: params?: string | core.$ZodISODateParams
returns: ZodISODate

### 23. time()
purpose: Function implementation
parameters: params?: string | core.$ZodISOTimeParams
returns: ZodISOTime

### 24. duration()
purpose: Function implementation
parameters: params?: string | core.$ZodISODurationParams
returns: ZodISODuration

### 25. string()
purpose: Function implementation
parameters: params?: string | core.$ZodStringParams
returns: ZodString

### 26. email()
purpose: Function implementation
parameters: params?: string | core.$ZodEmailParams
returns: ZodEmail

### 27. guid()
purpose: Function implementation
parameters: params?: string | core.$ZodGUIDParams
returns: ZodGUID

### 28. uuid()
purpose: Function implementation
parameters: params?: string | core.$ZodUUIDParams
returns: ZodUUID

### 29. uuidv4()
purpose: Function implementation
parameters: params?: string | core.$ZodUUIDv4Params
returns: ZodUUID

### 30. uuidv6()
purpose: Function implementation
parameters: params?: string | core.$ZodUUIDv6Params
returns: ZodUUID

### 31. uuidv7()
purpose: Function implementation
parameters: params?: string | core.$ZodUUIDv7Params
returns: ZodUUID

### 32. url()
purpose: Function implementation
parameters: params?: string | core.$ZodURLParams
returns: ZodURL

### 33. emoji()
purpose: Function implementation
parameters: params?: string | core.$ZodEmojiParams
returns: ZodEmoji

### 34. nanoid()
purpose: Function implementation
parameters: params?: string | core.$ZodNanoIDParams
returns: ZodNanoID

### 35. cuid()
purpose: Function implementation
parameters: params?: string | core.$ZodCUIDParams
returns: ZodCUID

### 36. cuid2()
purpose: Function implementation
parameters: params?: string | core.$ZodCUID2Params
returns: ZodCUID2

### 37. ulid()
purpose: Function implementation
parameters: params?: string | core.$ZodULIDParams
returns: ZodULID

### 38. xid()
purpose: Function implementation
parameters: params?: string | core.$ZodXIDParams
returns: ZodXID

### 39. ksuid()
purpose: Function implementation
parameters: params?: string | core.$ZodKSUIDParams
returns: ZodKSUID

### 40. ipv4()
purpose: Function implementation
parameters: params?: string | core.$ZodIPv4Params
returns: ZodIPv4

### 41. ipv6()
purpose: Function implementation
parameters: params?: string | core.$ZodIPv6Params
returns: ZodIPv6

### 42. cidrv4()
purpose: Function implementation
parameters: params?: string | core.$ZodCIDRv4Params
returns: ZodCIDRv4

### 43. cidrv6()
purpose: Function implementation
parameters: params?: string | core.$ZodCIDRv6Params
returns: ZodCIDRv6

### 44. base64()
purpose: Function implementation
parameters: params?: string | core.$ZodBase64Params
returns: ZodBase64

### 45. base64url()
purpose: Function implementation
parameters: params?: string | core.$ZodBase64URLParams
returns: ZodBase64URL

### 46. e164()
purpose: Function implementation
parameters: params?: string | core.$ZodE164Params
returns: ZodE164

### 47. jwt()
purpose: Function implementation
parameters: params?: string | core.$ZodJWTParams
returns: ZodJWT

### 48. stringFormat()
purpose: Function implementation
parameters: format: Format, fnOrRegex: ((arg: string) => util.MaybeAsync<unknown>) | RegExp, _params?: string | core.$ZodStringFormatParams
returns: ZodCustomStringFormat<Format>

### 49. number()
purpose: Function implementation
parameters: params?: string | core.$ZodNumberParams
returns: ZodNumber

### 50. int()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodInt

### 51. float32()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodFloat32

### 52. float64()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodFloat64

### 53. int32()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodInt32

### 54. uint32()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodUInt32

### 55. boolean()
purpose: Function implementation
parameters: params?: string | core.$ZodBooleanParams
returns: ZodBoolean

### 56. bigint()
purpose: Function implementation
parameters: params?: string | core.$ZodBigIntParams
returns: ZodBigInt

### 57. int64()
purpose: Function implementation
parameters: params?: string | core.$ZodBigIntFormatParams
returns: ZodBigIntFormat

### 58. uint64()
purpose: Function implementation
parameters: params?: string | core.$ZodBigIntFormatParams
returns: ZodBigIntFormat

### 59. symbol()
purpose: Function implementation
parameters: params?: string | core.$ZodSymbolParams
returns: ZodSymbol

### 60. _undefined()
purpose: Function implementation
parameters: params?: string | core.$ZodUndefinedParams
returns: ZodUndefined

### 61. _null()
purpose: Function implementation
parameters: params?: string | core.$ZodNullParams
returns: ZodNull

### 62. any()
purpose: Function implementation
returns: ZodAny

### 63. unknown()
purpose: Function implementation
returns: ZodUnknown

### 64. never()
purpose: Function implementation
parameters: params?: string | core.$ZodNeverParams
returns: ZodNever

### 65. _void()
purpose: Function implementation
parameters: params?: string | core.$ZodVoidParams
returns: ZodVoid

### 66. date()
purpose: Function implementation
parameters: params?: string | core.$ZodDateParams
returns: ZodDate

### 67. array()
purpose: Function implementation
parameters: element: T, params?: string | core.$ZodArrayParams
returns: ZodArray<T>

### 68. keyof()
purpose: Function implementation
parameters: schema: T
returns: ZodLiteral<Exclude<keyof T["_zod"]["output"], symbol>>

### 69. object()
purpose: Function implementation
parameters: shape?: T, params?: string | core.$ZodObjectParams
returns: ZodObject<util.Writeable<T>, core.$strip>

### 70. strictObject()
purpose: Function implementation
parameters: shape: T, params?: string | core.$ZodObjectParams
returns: ZodObject<T, core.$strict>

### 71. looseObject()
purpose: Function implementation
parameters: shape: T, params?: string | core.$ZodObjectParams
returns: ZodObject<T, core.$loose>

### 72. union()
purpose: Function implementation
parameters: options: T, params?: string | core.$ZodUnionParams
returns: ZodUnion<T>

### 73. discriminatedUnion()
purpose: Function implementation
parameters: discriminator: string, options: Types, params?: string | core.$ZodDiscriminatedUnionParams
returns: ZodDiscriminatedUnion<Types>

### 74. intersection()
purpose: Function implementation
parameters: left: T, right: U
returns: ZodIntersection<T, U>

### 75. tuple()
purpose: Function implementation
parameters: items: core.SomeType[], _paramsOrRest?: string | core.$ZodTupleParams | core.SomeType, _params?: string | core.$ZodTupleParams
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/classic/schemas").ZodTuple<readonly import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodType<unknown, unknown, import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodTypeInternals<unknown, unknown>>[], import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodType<unknown, unknown, import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodTypeInternals<unknown, unknown>>>

### 76. record()
purpose: Function implementation
parameters: keyType: Key, valueType: Value, params?: string | core.$ZodRecordParams
returns: ZodRecord<Key, Value>

### 77. partialRecord()
purpose: Function implementation
parameters: keyType: Key, valueType: Value, params?: string | core.$ZodRecordParams
returns: ZodRecord<Key & core.$partial, Value>

### 78. map()
purpose: Function implementation
parameters: keyType: Key, valueType: Value, params?: string | core.$ZodMapParams
returns: ZodMap<Key, Value>

### 79. set()
purpose: Function implementation
parameters: valueType: Value, params?: string | core.$ZodSetParams
returns: ZodSet<Value>

### 80. _enum()
purpose: Function implementation
parameters: values: any, params?: string | core.$ZodEnumParams
returns: any

### 81. nativeEnum()
purpose: Function implementation
parameters: entries: T, params?: string | core.$ZodEnumParams
returns: ZodEnum<T>

### 82. literal()
purpose: Function implementation
parameters: value: any, params: any
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/classic/schemas").ZodLiteral<import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/util").Literal>

### 83. file()
purpose: Function implementation
parameters: params?: string | core.$ZodFileParams
returns: ZodFile

### 84. transform()
purpose: Function implementation
parameters: fn: (input: I, ctx: core.ParsePayload) => O
returns: ZodTransform<Awaited<O>, I>

### 85. optional()
purpose: Function implementation
parameters: innerType: T
returns: ZodOptional<T>

### 86. nullable()
purpose: Function implementation
parameters: innerType: T
returns: ZodNullable<T>

### 87. nullish()
purpose: Function implementation
parameters: innerType: T
returns: ZodOptional<ZodNullable<T>>

### 88. _default()
purpose: Function implementation
parameters: innerType: T, defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>)
returns: ZodDefault<T>

### 89. prefault()
purpose: Function implementation
parameters: innerType: T, defaultValue: core.input<T> | (() => core.input<T>)
returns: ZodPrefault<T>

### 90. nonoptional()
purpose: Function implementation
parameters: innerType: T, params?: string | core.$ZodNonOptionalParams
returns: ZodNonOptional<T>

### 91. success()
purpose: Function implementation
parameters: innerType: T
returns: ZodSuccess<T>

### 92. _catch()
purpose: Function implementation
parameters: innerType: T, catchValue: core.output<T> | ((ctx: core.$ZodCatchCtx) => core.output<T>)
returns: ZodCatch<T>

### 93. nan()
purpose: Function implementation
parameters: params?: string | core.$ZodNaNParams
returns: ZodNaN

### 94. pipe()
purpose: Function implementation
parameters: in_: core.SomeType, out: core.SomeType
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/classic/schemas").ZodPipe<import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodType<unknown, unknown, import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodTypeInternals<unknown, unknown>>, import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodType<unknown, unknown, import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodTypeInternals<unknown, unknown>>>

### 95. readonly()
purpose: Function implementation
parameters: innerType: T
returns: ZodReadonly<T>

### 96. templateLiteral()
purpose: Function implementation
parameters: parts: Parts, params?: string | core.$ZodTemplateLiteralParams
returns: ZodTemplateLiteral<core.$PartsToTemplateLiteral<Parts>>

### 97. lazy()
purpose: Function implementation
parameters: getter: () => T
returns: ZodLazy<T>

### 98. promise()
purpose: Function implementation
parameters: innerType: T
returns: ZodPromise<T>

### 99. check()
purpose: Function implementation
parameters: fn: core.CheckFn<O>
returns: core.$ZodCheck<O>

### 100. custom()
purpose: Function implementation
parameters: fn?: (data: unknown) => unknown, _params?: string | core.$ZodCustomParams | undefined
returns: ZodCustom<O, O>

### 101. refine()
purpose: Function implementation
parameters: fn: (arg: NoInfer<T>) => util.MaybeAsync<unknown>, _params?: string | core.$ZodCustomParams
returns: core.$ZodCheck<T>

### 102. superRefine()
purpose: Function implementation
parameters: fn: (arg: T, payload: RefinementCtx<T>) => void | Promise<void>
returns: core.$ZodCheck<T>

### 103. _instanceof()
purpose: Function implementation
parameters: cls: T, params?: ZodInstanceOfParams
returns: ZodCustom<InstanceType<T>, InstanceType<T>>

### 104. json()
purpose: Function implementation
parameters: params?: string | core.$ZodCustomParams
returns: ZodJSONSchema

### 105. preprocess()
purpose: Function implementation
parameters: fn: (arg: B, ctx: RefinementCtx) => A, schema: U
returns: ZodPipe<ZodTransform<A, B>, U>

### 106. _string()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodStringParams
returns: T

### 107. _coercedString()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodStringParams
returns: T

### 108. _email()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodEmailParams | $ZodCheckEmailParams
returns: T

### 109. _guid()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodGUIDParams | $ZodCheckGUIDParams
returns: T

### 110. _uuid()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodUUIDParams | $ZodCheckUUIDParams
returns: T

### 111. _uuidv4()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodUUIDv4Params | $ZodCheckUUIDv4Params
returns: T

### 112. _uuidv6()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodUUIDv6Params | $ZodCheckUUIDv6Params
returns: T

### 113. _uuidv7()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodUUIDv7Params | $ZodCheckUUIDv7Params
returns: T

### 114. _url()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodURLParams | $ZodCheckURLParams
returns: T

### 115. _emoji()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodEmojiParams | $ZodCheckEmojiParams
returns: T

### 116. _nanoid()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodNanoIDParams | $ZodCheckNanoIDParams
returns: T

### 117. _cuid()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodCUIDParams | $ZodCheckCUIDParams
returns: T

### 118. _cuid2()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodCUID2Params | $ZodCheckCUID2Params
returns: T

### 119. _ulid()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodULIDParams | $ZodCheckULIDParams
returns: T

### 120. _xid()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodXIDParams | $ZodCheckXIDParams
returns: T

### 121. _ksuid()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodKSUIDParams | $ZodCheckKSUIDParams
returns: T

### 122. _ipv4()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodIPv4Params | $ZodCheckIPv4Params
returns: T

### 123. _ipv6()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodIPv6Params | $ZodCheckIPv6Params
returns: T

### 124. _cidrv4()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodCIDRv4Params | $ZodCheckCIDRv4Params
returns: T

### 125. _cidrv6()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodCIDRv6Params | $ZodCheckCIDRv6Params
returns: T

### 126. _base64()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodBase64Params | $ZodCheckBase64Params
returns: T

### 127. _base64url()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodBase64URLParams | $ZodCheckBase64URLParams
returns: T

### 128. _e164()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodE164Params | $ZodCheckE164Params
returns: T

### 129. _jwt()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodJWTParams | $ZodCheckJWTParams
returns: T

### 130. _isoDateTime()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodISODateTimeParams | $ZodCheckISODateTimeParams
returns: T

### 131. _isoDate()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodISODateParams | $ZodCheckISODateParams
returns: T

### 132. _isoTime()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodISOTimeParams | $ZodCheckISOTimeParams
returns: T

### 133. _isoDuration()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodISODurationParams | $ZodCheckISODurationParams
returns: T

### 134. _number()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodNumberParams
returns: T

### 135. _coercedNumber()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodNumberParams
returns: T

### 136. _int()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodCheckNumberFormatParams
returns: T

### 137. _float32()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodCheckNumberFormatParams
returns: T

### 138. _float64()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodCheckNumberFormatParams
returns: T

### 139. _int32()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodCheckNumberFormatParams
returns: T

### 140. _uint32()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodCheckNumberFormatParams
returns: T

### 141. _boolean()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodBooleanParams
returns: T

### 142. _coercedBoolean()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodBooleanParams
returns: T

### 143. _bigint()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodBigIntParams
returns: T

### 144. _coercedBigint()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodBigIntParams
returns: T

### 145. _int64()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodBigIntFormatParams
returns: T

### 146. _uint64()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodBigIntFormatParams
returns: T

### 147. _symbol()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodSymbolParams
returns: T

### 148. _undefined()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodUndefinedParams
returns: T

### 149. _null()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodNullParams
returns: T

### 150. _any()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>
returns: T

### 151. _unknown()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>
returns: T

### 152. _never()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodNeverParams
returns: T

### 153. _void()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodVoidParams
returns: T

### 154. _date()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodDateParams
returns: T

### 155. _coercedDate()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodDateParams
returns: T

### 156. _nan()
purpose: Function implementation
parameters: Class: util.SchemaClass<T>, params?: string | $ZodNaNParams
returns: T

### 157. _lt()
purpose: Function implementation
parameters: value: util.Numeric, params?: string | $ZodCheckLessThanParams
returns: checks.$ZodCheckLessThan<util.Numeric>

### 158. _lte()
purpose: Function implementation
parameters: value: util.Numeric, params?: string | $ZodCheckLessThanParams
returns: checks.$ZodCheckLessThan<util.Numeric>

### 159. _gt()
purpose: Function implementation
parameters: value: util.Numeric, params?: string | $ZodCheckGreaterThanParams
returns: checks.$ZodCheckGreaterThan

### 160. _gte()
purpose: Function implementation
parameters: value: util.Numeric, params?: string | $ZodCheckGreaterThanParams
returns: checks.$ZodCheckGreaterThan

### 161. _positive()
purpose: Function implementation
parameters: params?: string | $ZodCheckGreaterThanParams
returns: checks.$ZodCheckGreaterThan

### 162. _negative()
purpose: Function implementation
parameters: params?: string | $ZodCheckLessThanParams
returns: checks.$ZodCheckLessThan

### 163. _nonpositive()
purpose: Function implementation
parameters: params?: string | $ZodCheckLessThanParams
returns: checks.$ZodCheckLessThan

### 164. _nonnegative()
purpose: Function implementation
parameters: params?: string | $ZodCheckGreaterThanParams
returns: checks.$ZodCheckGreaterThan

### 165. _multipleOf()
purpose: Function implementation
parameters: value: number | bigint, params?: string | $ZodCheckMultipleOfParams
returns: checks.$ZodCheckMultipleOf

### 166. _maxSize()
purpose: Function implementation
parameters: maximum: number, params?: string | $ZodCheckMaxSizeParams
returns: checks.$ZodCheckMaxSize<util.HasSize>

### 167. _minSize()
purpose: Function implementation
parameters: minimum: number, params?: string | $ZodCheckMinSizeParams
returns: checks.$ZodCheckMinSize<util.HasSize>

### 168. _size()
purpose: Function implementation
parameters: size: number, params?: string | $ZodCheckSizeEqualsParams
returns: checks.$ZodCheckSizeEquals<util.HasSize>

### 169. _maxLength()
purpose: Function implementation
parameters: maximum: number, params?: string | $ZodCheckMaxLengthParams
returns: checks.$ZodCheckMaxLength<util.HasLength>

### 170. _minLength()
purpose: Function implementation
parameters: minimum: number, params?: string | $ZodCheckMinLengthParams
returns: checks.$ZodCheckMinLength<util.HasLength>

### 171. _length()
purpose: Function implementation
parameters: length: number, params?: string | $ZodCheckLengthEqualsParams
returns: checks.$ZodCheckLengthEquals<util.HasLength>

### 172. _regex()
purpose: Function implementation
parameters: pattern: RegExp, params?: string | $ZodCheckRegexParams
returns: checks.$ZodCheckRegex

### 173. _lowercase()
purpose: Function implementation
parameters: params?: string | $ZodCheckLowerCaseParams
returns: checks.$ZodCheckLowerCase

### 174. _uppercase()
purpose: Function implementation
parameters: params?: string | $ZodCheckUpperCaseParams
returns: checks.$ZodCheckUpperCase

### 175. _includes()
purpose: Function implementation
parameters: includes: string, params?: string | $ZodCheckIncludesParams
returns: checks.$ZodCheckIncludes

### 176. _startsWith()
purpose: Function implementation
parameters: prefix: string, params?: string | $ZodCheckStartsWithParams
returns: checks.$ZodCheckStartsWith

### 177. _endsWith()
purpose: Function implementation
parameters: suffix: string, params?: string | $ZodCheckEndsWithParams
returns: checks.$ZodCheckEndsWith

### 178. _property()
purpose: Function implementation
parameters: property: K, schema: T, params?: string | $ZodCheckPropertyParams
returns: checks.$ZodCheckProperty<{ [k in K]: core.output<T> }>

### 179. _mime()
purpose: Function implementation
parameters: types: util.MimeTypes[], params?: string | $ZodCheckMimeTypeParams
returns: checks.$ZodCheckMimeType

### 180. _overwrite()
purpose: Function implementation
parameters: tx: (input: T) => T
returns: checks.$ZodCheckOverwrite<T>

### 181. _normalize()
purpose: Function implementation
parameters: form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})
returns: checks.$ZodCheckOverwrite<string>

### 182. _trim()
purpose: Function implementation
returns: checks.$ZodCheckOverwrite<string>

### 183. _toLowerCase()
purpose: Function implementation
returns: checks.$ZodCheckOverwrite<string>

### 184. _toUpperCase()
purpose: Function implementation
returns: checks.$ZodCheckOverwrite<string>

### 185. _array()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodArray>, element: T, params?: string | $ZodArrayParams
returns: schemas.$ZodArray<T>

### 186. _union()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodUnion>, options: T, params?: string | $ZodUnionParams
returns: schemas.$ZodUnion<T>

### 187. _discriminatedUnion()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodDiscriminatedUnion>, discriminator: string, options: Types, params?: string | $ZodDiscriminatedUnionParams
returns: schemas.$ZodDiscriminatedUnion<Types>

### 188. _intersection()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodIntersection>, left: T, right: U
returns: schemas.$ZodIntersection<T, U>

### 189. _tuple()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodTuple>, items: schemas.$ZodType[], _paramsOrRest?: string | $ZodTupleParams | schemas.$ZodType, _params?: string | $ZodTupleParams
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodTuple<readonly import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodType<unknown, unknown, import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodTypeInternals<unknown, unknown>>[], import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodType<unknown, unknown, import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodTypeInternals<unknown, unknown>>>

### 190. _record()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodRecord>, keyType: Key, valueType: Value, params?: string | $ZodRecordParams
returns: schemas.$ZodRecord<Key, Value>

### 191. _map()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodMap>, keyType: Key, valueType: Value, params?: string | $ZodMapParams
returns: schemas.$ZodMap<Key, Value>

### 192. _set()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodSet>, valueType: Value, params?: string | $ZodSetParams
returns: schemas.$ZodSet<Value>

### 193. _enum()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodEnum>, values: any, params?: string | $ZodEnumParams
returns: any

### 194. _nativeEnum()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodEnum>, entries: T, params?: string | $ZodEnumParams
returns: schemas.$ZodEnum<T>

### 195. _literal()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodLiteral>, value: any, params: any
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodLiteral<import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/util").Literal>

### 196. _file()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodFile>, params?: string | $ZodFileParams
returns: schemas.$ZodFile

### 197. _transform()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodTransform>, fn: (input: I, ctx?: schemas.ParsePayload) => O
returns: schemas.$ZodTransform<Awaited<O>, I>

### 198. _optional()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodOptional>, innerType: T
returns: schemas.$ZodOptional<T>

### 199. _nullable()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodNullable>, innerType: T
returns: schemas.$ZodNullable<T>

### 200. _default()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodDefault>, innerType: T, defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>)
returns: schemas.$ZodDefault<T>

### 201. _nonoptional()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodNonOptional>, innerType: T, params?: string | $ZodNonOptionalParams
returns: schemas.$ZodNonOptional<T>

### 202. _success()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodSuccess>, innerType: T
returns: schemas.$ZodSuccess<T>

### 203. _catch()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodCatch>, innerType: T, catchValue: core.output<T> | ((ctx: schemas.$ZodCatchCtx) => core.output<T>)
returns: schemas.$ZodCatch<T>

### 204. _pipe()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodPipe>, in_: A, out: B | schemas.$ZodType<unknown, core.output<A>>
returns: schemas.$ZodPipe<A, B>

### 205. _readonly()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodReadonly>, innerType: T
returns: schemas.$ZodReadonly<T>

### 206. _templateLiteral()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodTemplateLiteral>, parts: Parts, params?: string | $ZodTemplateLiteralParams
returns: schemas.$ZodTemplateLiteral<schemas.$PartsToTemplateLiteral<Parts>>

### 207. _lazy()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodLazy>, getter: () => T
returns: schemas.$ZodLazy<T>

### 208. _promise()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodPromise>, innerType: T
returns: schemas.$ZodPromise<T>

### 209. _custom()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodCustom>, fn: (data: O) => unknown, _params: string | $ZodCustomParams | undefined
returns: schemas.$ZodCustom<O, I>

### 210. _refine()
purpose: Function implementation
parameters: Class: util.SchemaClass<schemas.$ZodCustom>, fn: (data: O) => unknown, _params: string | $ZodCustomParams | undefined
returns: schemas.$ZodCustom<O, I>

### 211. _stringbool()
purpose: Function implementation
parameters: Classes: {
    Pipe?: typeof schemas.$ZodPipe;
    Boolean?: typeof schemas.$ZodBoolean;
    Transform?: typeof schemas.$ZodTransform;
    String?: typeof schemas.$ZodString;
  }, _params?: string | $ZodStringBoolParams
returns: schemas.$ZodPipe<
  schemas.$ZodPipe<schemas.$ZodString, schemas.$ZodTransform<boolean, string>>,
  schemas.$ZodBoolean<boolean>
>

### 212. _stringFormat()
purpose: Function implementation
parameters: Class: typeof schemas.$ZodCustomStringFormat, format: Format, fnOrRegex: ((arg: string) => util.MaybeAsync<unknown>) | RegExp, _params?: string | $ZodStringFormatParams
returns: schemas.$ZodCustomStringFormat<Format>

### 213. config()
purpose: Function implementation
parameters: config?: Partial<$ZodConfig>
returns: $ZodConfig

### 214. $constructor()
purpose: Function implementation
parameters: name: string, initializer: (inst: T, def: D) => void, params?: { Parent?: typeof Class }
returns: $constructor<T, D>

### 215. config()
purpose: Function implementation
parameters: newConfig?: Partial<$ZodConfig>
returns: $ZodConfig

### 216. flattenError()
purpose: Function implementation
parameters: error: $ZodError, mapper?: (issue: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/errors").$ZodIssue) => string
returns: any

### 217. formatError()
purpose: Function implementation
parameters: error: $ZodError, _mapper?: any
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/errors").$ZodFormattedError<T, string>

### 218. treeifyError()
purpose: Function implementation
parameters: error: $ZodError, _mapper?: any
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/errors").$ZodErrorTree<T, string>

### 219. toDotPath()
purpose: Format a ZodError as a human-readable string in the following form.

From

```ts
ZodError {
  issues: [
    {
      expected: 'string',
      code: 'invalid_type',
      path: [ 'username' ],
      message: 'Invalid input: expected string'
    },
    {
      expected: 'number',
      code: 'invalid_type',
      path: [ 'favoriteNumbers', 1 ],
      message: 'Invalid input: expected number'
    }
  ];
}
```

to

```
username
  ✖ Expected number, received string at "username
favoriteNumbers[0]
  ✖ Invalid input: expected number
```
parameters: path: (string | number | symbol)[]
returns: string

### 220. prettifyError()
purpose: Function implementation
parameters: error: BaseError
returns: string

### 221. _function()
purpose: Function implementation
parameters: params?: {
  output?: schemas.$ZodType;
  input?: $ZodFunctionArgs | Array<schemas.$ZodType>;
}
returns: any

### 222. emoji()
purpose: Function implementation
returns: RegExp

### 223. time()
purpose: Function implementation
parameters: args: {
  precision?: number | null;
  // local?: boolean;
}
returns: RegExp

### 224. datetime()
purpose: Function implementation
parameters: args: {
  precision?: number | null;
  offset?: boolean;
  local?: boolean;
}
returns: RegExp

### 225. registry()
purpose: Function implementation
returns: $ZodRegistry<T, S>

### 226. isValidBase64()
purpose: Function implementation
parameters: data: string
returns: boolean

### 227. isValidBase64URL()
purpose: Function implementation
parameters: data: string
returns: boolean

### 228. isValidJWT()
purpose: Function implementation
parameters: token: string, algorithm?: util.JWTAlgorithm | null
returns: boolean

### 229. toJSONSchema()
purpose: Function implementation
parameters: input: schemas.$ZodType | $ZodRegistry<{ id?: string | undefined }>, _params?: ToJSONSchemaParams
returns: any

### 230. assertEqual()
purpose: Function implementation
parameters: val: AssertEqual<A, B>
returns: AssertEqual<A, B>

### 231. assertNotEqual()
purpose: Function implementation
parameters: val: AssertNotEqual<A, B>
returns: AssertNotEqual<A, B>

### 232. assertIs()
purpose: Function implementation
parameters: _arg: T
returns: void

### 233. assertNever()
purpose: Function implementation
parameters: _x: never
returns: never

### 234. assert()
purpose: Function implementation
parameters: _: any
returns: asserts _ is T

### 235. getEnumValues()
purpose: Function implementation
parameters: entries: EnumLike
returns: EnumValue[]

### 236. joinValues()
purpose: Function implementation
parameters: array: T, separator?: string
returns: string

### 237. jsonStringifyReplacer()
purpose: Function implementation
parameters: _: string, value: any
returns: any

### 238. cached()
purpose: Function implementation
parameters: getter: () => T
returns: { value: T }

### 239. nullish()
purpose: Function implementation
parameters: input: any
returns: boolean

### 240. cleanRegex()
purpose: Function implementation
parameters: source: string
returns: string

### 241. floatSafeRemainder()
purpose: Function implementation
parameters: val: number, step: number
returns: number

### 242. defineLazy()
purpose: Function implementation
parameters: object: T, key: K, getter: () => T[K]
returns: void

### 243. assignProp()
purpose: Function implementation
parameters: target: T, prop: K, value: K extends keyof T ? T[K] : any
returns: void

### 244. getElementAtPath()
purpose: Function implementation
parameters: obj: any, path: (string | number)[] | null | undefined
returns: any

### 245. promiseAllObject()
purpose: Function implementation
parameters: promisesObj: T
returns: Promise<{ [k in keyof T]: Awaited<T[k]> }>

### 246. randomString()
purpose: Function implementation
parameters: length?: number
returns: string

### 247. esc()
purpose: Function implementation
parameters: str: string
returns: string

### 248. isObject()
purpose: Function implementation
parameters: data: any
returns: data is Record<PropertyKey, unknown>

### 249. isPlainObject()
purpose: Function implementation
parameters: o: any
returns: o is Record<PropertyKey, unknown>

### 250. numKeys()
purpose: Function implementation
parameters: data: any
returns: number

### 251. escapeRegex()
purpose: Function implementation
parameters: str: string
returns: string

### 252. clone()
purpose: Function implementation
parameters: inst: T, def?: T["_zod"]["def"], params?: { parent: boolean }
returns: T

### 253. normalizeParams()
purpose: Function implementation
parameters: _params: T
returns: Normalize<T>

### 254. createTransparentProxy()
purpose: Function implementation
parameters: getter: () => T
returns: T

### 255. stringifyPrimitive()
purpose: Function implementation
parameters: value: any
returns: string

### 256. optionalKeys()
purpose: Function implementation
parameters: shape: schemas.$ZodShape
returns: string[]

### 257. pick()
purpose: Function implementation
parameters: schema: schemas.$ZodObject, mask: Record<string, unknown>
returns: any

### 258. omit()
purpose: Function implementation
parameters: schema: schemas.$ZodObject, mask: object
returns: any

### 259. extend()
purpose: Function implementation
parameters: schema: schemas.$ZodObject, shape: schemas.$ZodShape
returns: any

### 260. merge()
purpose: Function implementation
parameters: a: schemas.$ZodObject, b: schemas.$ZodObject
returns: any

### 261. partial()
purpose: Function implementation
parameters: Class: SchemaClass<schemas.$ZodOptional> | null, schema: schemas.$ZodObject, mask: object | undefined
returns: any

### 262. required()
purpose: Function implementation
parameters: Class: SchemaClass<schemas.$ZodNonOptional>, schema: schemas.$ZodObject, mask: object | undefined
returns: any

### 263. aborted()
purpose: Function implementation
parameters: x: schemas.ParsePayload, startIndex?: number
returns: boolean

### 264. prefixIssues()
purpose: Function implementation
parameters: path: PropertyKey, issues: errors.$ZodRawIssue[]
returns: errors.$ZodRawIssue[]

### 265. unwrapMessage()
purpose: Function implementation
parameters: message: string | { message: string } | undefined | null
returns: string | undefined

### 266. finalizeIssue()
purpose: Function implementation
parameters: iss: errors.$ZodRawIssue, ctx: schemas.ParseContextInternal | undefined, config: $ZodConfig
returns: errors.$ZodIssue

### 267. getSizableOrigin()
purpose: Function implementation
parameters: input: any
returns: "set" | "map" | "file" | "unknown"

### 268. getLengthableOrigin()
purpose: Function implementation
parameters: input: any
returns: "array" | "string" | "unknown"

### 269. issue()
purpose: Function implementation
parameters: ...args?: [string | errors.$ZodRawIssue, any?, any?]
returns: errors.$ZodRawIssue

### 270. cleanEnum()
purpose: Function implementation
parameters: obj: Record<string, EnumValue>
returns: EnumValue[]

### 271. string()
purpose: Function implementation
parameters: params?: string | core.$ZodStringParams
returns: schemas.ZodMiniString<T>

### 272. number()
purpose: Function implementation
parameters: params?: string | core.$ZodNumberParams
returns: schemas.ZodMiniNumber<T>

### 273. boolean()
purpose: Function implementation
parameters: params?: string | core.$ZodBooleanParams
returns: schemas.ZodMiniBoolean<T>

### 274. bigint()
purpose: Function implementation
parameters: params?: string | core.$ZodBigIntParams
returns: schemas.ZodMiniBigInt<T>

### 275. date()
purpose: Function implementation
parameters: params?: string | core.$ZodDateParams
returns: schemas.ZodMiniDate<T>

### 276. datetime()
purpose: Function implementation
parameters: params?: string | core.$ZodISODateTimeParams
returns: ZodMiniISODateTime

### 277. date()
purpose: Function implementation
parameters: params?: string | core.$ZodISODateParams
returns: ZodMiniISODate

### 278. time()
purpose: Function implementation
parameters: params?: string | core.$ZodISOTimeParams
returns: ZodMiniISOTime

### 279. duration()
purpose: Function implementation
parameters: params?: string | core.$ZodISODurationParams
returns: ZodMiniISODuration

### 280. string()
purpose: Function implementation
parameters: params?: string | core.$ZodStringParams
returns: ZodMiniString<string>

### 281. email()
purpose: Function implementation
parameters: params?: string | core.$ZodEmailParams
returns: ZodMiniEmail

### 282. guid()
purpose: Function implementation
parameters: params?: string | core.$ZodGUIDParams
returns: ZodMiniGUID

### 283. uuid()
purpose: Function implementation
parameters: params?: string | core.$ZodUUIDParams
returns: ZodMiniUUID

### 284. uuidv4()
purpose: Function implementation
parameters: params?: string | core.$ZodUUIDv4Params
returns: ZodMiniUUID

### 285. uuidv6()
purpose: Function implementation
parameters: params?: string | core.$ZodUUIDv6Params
returns: ZodMiniUUID

### 286. uuidv7()
purpose: Function implementation
parameters: params?: string | core.$ZodUUIDv7Params
returns: ZodMiniUUID

### 287. url()
purpose: Function implementation
parameters: params?: string | core.$ZodURLParams
returns: ZodMiniURL

### 288. emoji()
purpose: Function implementation
parameters: params?: string | core.$ZodEmojiParams
returns: ZodMiniEmoji

### 289. nanoid()
purpose: Function implementation
parameters: params?: string | core.$ZodNanoIDParams
returns: ZodMiniNanoID

### 290. cuid()
purpose: Function implementation
parameters: params?: string | core.$ZodCUIDParams
returns: ZodMiniCUID

### 291. cuid2()
purpose: Function implementation
parameters: params?: string | core.$ZodCUID2Params
returns: ZodMiniCUID2

### 292. ulid()
purpose: Function implementation
parameters: params?: string | core.$ZodULIDParams
returns: ZodMiniULID

### 293. xid()
purpose: Function implementation
parameters: params?: string | core.$ZodXIDParams
returns: ZodMiniXID

### 294. ksuid()
purpose: Function implementation
parameters: params?: string | core.$ZodKSUIDParams
returns: ZodMiniKSUID

### 295. ipv4()
purpose: Function implementation
parameters: params?: string | core.$ZodIPv4Params
returns: ZodMiniIPv4

### 296. ipv6()
purpose: Function implementation
parameters: params?: string | core.$ZodIPv6Params
returns: ZodMiniIPv6

### 297. cidrv4()
purpose: Function implementation
parameters: params?: string | core.$ZodCIDRv4Params
returns: ZodMiniCIDRv4

### 298. cidrv6()
purpose: Function implementation
parameters: params?: string | core.$ZodCIDRv6Params
returns: ZodMiniCIDRv6

### 299. base64()
purpose: Function implementation
parameters: params?: string | core.$ZodBase64Params
returns: ZodMiniBase64

### 300. base64url()
purpose: Function implementation
parameters: params?: string | core.$ZodBase64URLParams
returns: ZodMiniBase64URL

### 301. e164()
purpose: Function implementation
parameters: params?: string | core.$ZodE164Params
returns: ZodMiniE164

### 302. jwt()
purpose: Function implementation
parameters: params?: string | core.$ZodJWTParams
returns: ZodMiniJWT

### 303. stringFormat()
purpose: Function implementation
parameters: format: Format, fnOrRegex: ((arg: string) => util.MaybeAsync<unknown>) | RegExp, _params?: string | core.$ZodStringFormatParams
returns: ZodMiniCustomStringFormat<Format>

### 304. number()
purpose: Function implementation
parameters: params?: string | core.$ZodNumberParams
returns: ZodMiniNumber<number>

### 305. int()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodMiniNumberFormat

### 306. float32()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodMiniNumberFormat

### 307. float64()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodMiniNumberFormat

### 308. int32()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodMiniNumberFormat

### 309. uint32()
purpose: Function implementation
parameters: params?: string | core.$ZodCheckNumberFormatParams
returns: ZodMiniNumberFormat

### 310. boolean()
purpose: Function implementation
parameters: params?: string | core.$ZodBooleanParams
returns: ZodMiniBoolean<boolean>

### 311. bigint()
purpose: Function implementation
parameters: params?: string | core.$ZodBigIntParams
returns: ZodMiniBigInt<bigint>

### 312. int64()
purpose: Function implementation
parameters: params?: string | core.$ZodBigIntFormatParams
returns: ZodMiniBigIntFormat

### 313. uint64()
purpose: Function implementation
parameters: params?: string | core.$ZodBigIntFormatParams
returns: ZodMiniBigIntFormat

### 314. symbol()
purpose: Function implementation
parameters: params?: string | core.$ZodSymbolParams
returns: ZodMiniSymbol

### 315. _undefined()
purpose: Function implementation
parameters: params?: string | core.$ZodUndefinedParams
returns: ZodMiniUndefined

### 316. _null()
purpose: Function implementation
parameters: params?: string | core.$ZodNullParams
returns: ZodMiniNull

### 317. any()
purpose: Function implementation
returns: ZodMiniAny

### 318. unknown()
purpose: Function implementation
returns: ZodMiniUnknown

### 319. never()
purpose: Function implementation
parameters: params?: string | core.$ZodNeverParams
returns: ZodMiniNever

### 320. _void()
purpose: Function implementation
parameters: params?: string | core.$ZodVoidParams
returns: ZodMiniVoid

### 321. date()
purpose: Function implementation
parameters: params?: string | core.$ZodDateParams
returns: ZodMiniDate<Date>

### 322. array()
purpose: Function implementation
parameters: element: SomeType, params?: any
returns: ZodMiniArray<T>

### 323. keyof()
purpose: Function implementation
parameters: schema: T
returns: ZodMiniLiteral<Exclude<keyof T["shape"], symbol>>

### 324. object()
purpose: Function implementation
parameters: shape?: T, params?: string | core.$ZodObjectParams
returns: ZodMiniObject<T, core.$strip>

### 325. strictObject()
purpose: Function implementation
parameters: shape: T, params?: string | core.$ZodObjectParams
returns: ZodMiniObject<T, core.$strict>

### 326. looseObject()
purpose: Function implementation
parameters: shape: T, params?: string | core.$ZodObjectParams
returns: ZodMiniObject<T, core.$loose>

### 327. extend()
purpose: Function implementation
parameters: schema: T, shape: U
returns: ZodMiniObject<util.Extend<T["shape"], U>, T["_zod"]["config"]>

### 328. merge()
purpose: Function implementation
parameters: schema: ZodMiniObject, shape: any
returns: ZodMiniObject

### 329. pick()
purpose: Function implementation
parameters: schema: T, mask: M
returns: ZodMiniObject<util.Flatten<Pick<T["shape"], keyof T["shape"] & keyof M>>, T["_zod"]["config"]>

### 330. omit()
purpose: Function implementation
parameters: schema: T, mask: M
returns: ZodMiniObject<util.Flatten<Omit<T["shape"], keyof M>>, T["_zod"]["config"]>

### 331. partial()
purpose: Function implementation
parameters: schema: ZodMiniObject, mask?: object
returns: any

### 332. required()
purpose: Function implementation
parameters: schema: ZodMiniObject, mask?: object
returns: any

### 333. catchall()
purpose: Function implementation
parameters: inst: T, catchall: U
returns: ZodMiniObject<T["shape"], core.$catchall<U>>

### 334. union()
purpose: Function implementation
parameters: options: T, params?: string | core.$ZodUnionParams
returns: ZodMiniUnion<T>

### 335. discriminatedUnion()
purpose: Function implementation
parameters: discriminator: string, options: Types, params?: string | core.$ZodDiscriminatedUnionParams
returns: ZodMiniDiscriminatedUnion<Types>

### 336. intersection()
purpose: Function implementation
parameters: left: T, right: U
returns: ZodMiniIntersection<T, U>

### 337. tuple()
purpose: Function implementation
parameters: items: SomeType[], _paramsOrRest?: string | core.$ZodTupleParams | SomeType, _params?: string | core.$ZodTupleParams
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/mini/schemas").ZodMiniTuple<readonly import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodType<unknown, unknown, import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodTypeInternals<unknown, unknown>>[], import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodType<unknown, unknown, import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/schemas").$ZodTypeInternals<unknown, unknown>>>

### 338. record()
purpose: Function implementation
parameters: keyType: Key, valueType: Value, params?: string | core.$ZodRecordParams
returns: ZodMiniRecord<Key, Value>

### 339. partialRecord()
purpose: Function implementation
parameters: keyType: Key, valueType: Value, params?: string | core.$ZodRecordParams
returns: ZodMiniRecord<Key & core.$partial, Value>

### 340. map()
purpose: Function implementation
parameters: keyType: Key, valueType: Value, params?: string | core.$ZodMapParams
returns: ZodMiniMap<Key, Value>

### 341. set()
purpose: Function implementation
parameters: valueType: Value, params?: string | core.$ZodSetParams
returns: ZodMiniSet<Value>

### 342. _enum()
purpose: Function implementation
parameters: values: any, params?: string | core.$ZodEnumParams
returns: any

### 343. nativeEnum()
purpose: Function implementation
parameters: entries: T, params?: string | core.$ZodEnumParams
returns: ZodMiniEnum<T>

### 344. literal()
purpose: Function implementation
parameters: value: any, params: any
returns: import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/mini/schemas").ZodMiniLiteral<import("/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/zod/src/v4/core/util").Literal>

### 345. file()
purpose: Function implementation
parameters: params?: string | core.$ZodFileParams
returns: ZodMiniFile

### 346. transform()
purpose: Function implementation
parameters: fn: (input: I, ctx: core.ParsePayload) => O
returns: ZodMiniTransform<Awaited<O>, I>

### 347. optional()
purpose: Function implementation
parameters: innerType: T
returns: ZodMiniOptional<T>

### 348. nullable()
purpose: Function implementation
parameters: innerType: T
returns: ZodMiniNullable<T>

### 349. nullish()
purpose: Function implementation
parameters: innerType: T
returns: ZodMiniOptional<ZodMiniNullable<T>>

### 350. _default()
purpose: Function implementation
parameters: innerType: T, defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>)
returns: ZodMiniDefault<T>

### 351. prefault()
purpose: Function implementation
parameters: innerType: T, defaultValue: util.NoUndefined<core.input<T>> | (() => util.NoUndefined<core.input<T>>)
returns: ZodMiniPrefault<T>

### 352. nonoptional()
purpose: Function implementation
parameters: innerType: T, params?: string | core.$ZodNonOptionalParams
returns: ZodMiniNonOptional<T>

### 353. success()
purpose: Function implementation
parameters: innerType: T
returns: ZodMiniSuccess<T>

### 354. _catch()
purpose: Function implementation
parameters: innerType: T, catchValue: core.output<T> | ((ctx: core.$ZodCatchCtx) => core.output<T>)
returns: ZodMiniCatch<T>

### 355. nan()
purpose: Function implementation
parameters: params?: string | core.$ZodNaNParams
returns: ZodMiniNaN

### 356. pipe()
purpose: Function implementation
parameters: in_: A, out: B | core.$ZodType<unknown, core.output<A>>
returns: ZodMiniPipe<A, B>

### 357. readonly()
purpose: Function implementation
parameters: innerType: T
returns: ZodMiniReadonly<T>

### 358. templateLiteral()
purpose: Function implementation
parameters: parts: Parts, params?: string | core.$ZodTemplateLiteralParams
returns: ZodMiniTemplateLiteral<core.$PartsToTemplateLiteral<Parts>>

### 359. _lazy()
purpose: Function implementation
parameters: getter: () => T
returns: ZodMiniLazy<T>

### 360. promise()
purpose: Function implementation
parameters: innerType: T
returns: ZodMiniPromise<T>

### 361. check()
purpose: Function implementation
parameters: fn: core.CheckFn<O>, params?: string | core.$ZodCustomParams
returns: core.$ZodCheck<O>

### 362. custom()
purpose: Function implementation
parameters: fn?: (data: O) => unknown, _params?: string | core.$ZodCustomParams | undefined
returns: ZodMiniCustom<O, I>

### 363. refine()
purpose: Function implementation
parameters: fn: (arg: NoInfer<T>) => util.MaybeAsync<unknown>, _params?: string | core.$ZodCustomParams
returns: core.$ZodCheck<T>

### 364. _instanceof()
purpose: Function implementation
parameters: cls: T, params?: core.$ZodCustomParams
returns: ZodMiniCustom<InstanceType<T>, InstanceType<T>>

### 365. json()
purpose: Function implementation
returns: ZodMiniJSONSchema

### 366. ZodInvalidTypeIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_type
  - expected: ZodParsedType
  - received: ZodParsedType

### 367. ZodInvalidLiteralIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_literal
  - expected: unknown
  - received: unknown

### 368. ZodUnrecognizedKeysIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.unrecognized_keys
  - keys: string[]

### 369. ZodInvalidUnionIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_union
  - unionErrors: ZodError[]

### 370. ZodInvalidUnionDiscriminatorIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_union_discriminator
  - options: Primitive[]

### 371. ZodInvalidEnumValueIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - received: string | number
  - code: typeof ZodIssueCode.invalid_enum_value
  - options: (string | number)[]

### 372. ZodInvalidArgumentsIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_arguments
  - argumentsError: ZodError

### 373. ZodInvalidReturnTypeIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_return_type
  - returnTypeError: ZodError

### 374. ZodInvalidDateIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_date

### 375. ZodInvalidStringIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_string
  - validation: StringValidation

### 376. ZodTooSmallIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.too_small
  - minimum: number | bigint
  - inclusive: boolean
  - exact: boolean
  - type: "array" | "string" | "number" | "set" | "date" | "bigint"

### 377. ZodTooBigIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.too_big
  - maximum: number | bigint
  - inclusive: boolean
  - exact: boolean
  - type: "array" | "string" | "number" | "set" | "date" | "bigint"

### 378. ZodInvalidIntersectionTypesIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.invalid_intersection_types

### 379. ZodNotMultipleOfIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.not_multiple_of
  - multipleOf: number | bigint

### 380. ZodNotFiniteIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.not_finite

### 381. ZodCustomIssue (interface)
purpose: Interface definition
extends: ZodIssueBase
properties:
  - code: typeof ZodIssueCode.custom
  - params: { [k: string]: any }

### 382. ParseContext (interface)
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

### 383. ParseResult (interface)
purpose: Interface definition
properties:
  - status: "aborted" | "dirty" | "valid"
  - data: any

### 384. Category (interface)
purpose: Interface definition
properties:
  - name: string
  - subcategories: Category[]

### 385. ZodCoercedString (interface)
purpose: Interface definition
extends: schemas._ZodString<core.$ZodStringInternals<T>>

### 386. ZodCoercedNumber (interface)
purpose: Interface definition
extends: schemas._ZodNumber<core.$ZodNumberInternals<T>>

### 387. ZodCoercedBoolean (interface)
purpose: Interface definition
extends: schemas._ZodBoolean<core.$ZodBooleanInternals<T>>

### 388. ZodCoercedBigInt (interface)
purpose: Interface definition
extends: schemas._ZodBigInt<core.$ZodBigIntInternals<T>>

### 389. ZodCoercedDate (interface)
purpose: Interface definition
extends: schemas._ZodDate<core.$ZodDateInternals<T>>

### 390. ZodError (interface)
purpose: Interface definition
extends: $ZodError<T>
methods:
  - format(): core.$ZodFormattedError<T>
  - format(mapper): core.$ZodFormattedError<T, U>
  - flatten(): core.$ZodFlattenedError<T>
  - flatten(mapper): core.$ZodFlattenedError<T, U>
  - addIssue(issue): void
  - addIssues(issues): void
properties:
  - isEmpty: boolean

### 391. ZodISODateTime (interface)
purpose: Interface definition
extends: schemas.ZodStringFormat
properties:
  - _zod: core.$ZodISODateTimeInternals

### 392. ZodISODate (interface)
purpose: Interface definition
extends: schemas.ZodStringFormat
properties:
  - _zod: core.$ZodISODateInternals

### 393. ZodISOTime (interface)
purpose: Interface definition
extends: schemas.ZodStringFormat
properties:
  - _zod: core.$ZodISOTimeInternals

### 394. ZodISODuration (interface)
purpose: Interface definition
extends: schemas.ZodStringFormat
properties:
  - _zod: core.$ZodISODurationInternals

### 395. RefinementCtx (interface)
purpose: Interface definition
extends: core.ParsePayload<T>
methods:
  - addIssue(arg): void

### 396. ZodType (interface)
purpose: Interface definition
extends: core.$ZodType<Output, Input, Internals>
methods:
  - check(checks): this
  - clone(def, params): this
  - register(registry, meta): this
  - brand(value): PropertyKey extends T ? this : core.$ZodBranded<this, T>
  - parse(data, params): core.output<this>
  - safeParse(data, params): parse.ZodSafeParseResult<core.output<this>>
  - parseAsync(data, params): Promise<core.output<this>>
  - safeParseAsync(data, params): Promise<parse.ZodSafeParseResult<core.output<this>>>
  - refine(check, params): this
  - superRefine(refinement): this
  - overwrite(fn): this
  - optional(): ZodOptional<this>
  - nonoptional(params): ZodNonOptional<this>
  - nullable(): ZodNullable<this>
  - nullish(): ZodOptional<ZodNullable<this>>
  - default(def): ZodDefault<this>
  - default(def): ZodDefault<this>
  - prefault(def): ZodPrefault<this>
  - prefault(def): ZodPrefault<this>
  - array(): ZodArray<this>
  - or(option): ZodUnion<[this, T]>
  - and(incoming): ZodIntersection<this, T>
  - transform(transform): ZodPipe<this, ZodTransform<Awaited<NewOut>, core.output<this>>>
  - catch(def): ZodCatch<this>
  - catch(def): ZodCatch<this>
  - pipe(target): ZodPipe<this, T>
  - readonly(): ZodReadonly<this>
  - describe(description): this
  - meta(): core.$replace<core.GlobalMeta, this> | undefined
  - meta(data): this
  - isOptional(): boolean
  - isNullable(): boolean
properties:
  - def: Internals["def"]
  - type: Internals["def"]["type"]
  - _def: Internals["def"]
  - _output: Internals["output"]
  - _input: Internals["input"]
  - spa: (
    data: unknown,
    params?: core.ParseContext<core.$ZodIssue>
  ) => Promise<parse.ZodSafeParseResult<core.output<this>>>
  - description: string

### 397. _ZodType (interface)
purpose: Interface definition
extends: ZodType<any, any, Internals>

### 398. _ZodString (interface)
purpose: Interface definition
extends: _ZodType<T>
methods:
  - regex(regex, params): this
  - includes(value, params): this
  - startsWith(value, params): this
  - endsWith(value, params): this
  - min(minLength, params): this
  - max(maxLength, params): this
  - length(len, params): this
  - nonempty(params): this
  - lowercase(params): this
  - uppercase(params): this
  - trim(): this
  - normalize(form): this
  - toLowerCase(): this
  - toUpperCase(): this
properties:
  - format: string | null
  - minLength: number | null
  - maxLength: number | null

### 399. ZodString (interface)
purpose: Interface definition
extends: _ZodString<core.$ZodStringInternals<string>>
methods:
  - email(params): this
  - url(params): this
  - jwt(params): this
  - emoji(params): this
  - guid(params): this
  - uuid(params): this
  - uuidv4(params): this
  - uuidv6(params): this
  - uuidv7(params): this
  - nanoid(params): this
  - guid(params): this
  - cuid(params): this
  - cuid2(params): this
  - ulid(params): this
  - base64(params): this
  - base64url(params): this
  - xid(params): this
  - ksuid(params): this
  - ipv4(params): this
  - ipv6(params): this
  - cidrv4(params): this
  - cidrv6(params): this
  - e164(params): this
  - datetime(params): this
  - date(params): this
  - time(params): this
  - duration(params): this

### 400. ZodStringFormat (interface)
purpose: Interface definition
extends: _ZodString<core.$ZodStringFormatInternals<Format>>

### 401. ZodEmail (interface)
purpose: Interface definition
extends: ZodStringFormat<"email">
properties:
  - _zod: core.$ZodEmailInternals

### 402. ZodGUID (interface)
purpose: Interface definition
extends: ZodStringFormat<"guid">
properties:
  - _zod: core.$ZodGUIDInternals

### 403. ZodUUID (interface)
purpose: Interface definition
extends: ZodStringFormat<"uuid">
properties:
  - _zod: core.$ZodUUIDInternals

### 404. ZodURL (interface)
purpose: Interface definition
extends: ZodStringFormat<"url">
properties:
  - _zod: core.$ZodURLInternals

### 405. ZodEmoji (interface)
purpose: Interface definition
extends: ZodStringFormat<"emoji">
properties:
  - _zod: core.$ZodEmojiInternals

### 406. ZodNanoID (interface)
purpose: Interface definition
extends: ZodStringFormat<"nanoid">
properties:
  - _zod: core.$ZodNanoIDInternals

### 407. ZodCUID (interface)
purpose: Interface definition
extends: ZodStringFormat<"cuid">
properties:
  - _zod: core.$ZodCUIDInternals

### 408. ZodCUID2 (interface)
purpose: Interface definition
extends: ZodStringFormat<"cuid2">
properties:
  - _zod: core.$ZodCUID2Internals

### 409. ZodULID (interface)
purpose: Interface definition
extends: ZodStringFormat<"ulid">
properties:
  - _zod: core.$ZodULIDInternals

### 410. ZodXID (interface)
purpose: Interface definition
extends: ZodStringFormat<"xid">
properties:
  - _zod: core.$ZodXIDInternals

### 411. ZodKSUID (interface)
purpose: Interface definition
extends: ZodStringFormat<"ksuid">
properties:
  - _zod: core.$ZodKSUIDInternals

### 412. ZodIPv4 (interface)
purpose: Interface definition
extends: ZodStringFormat<"ipv4">
properties:
  - _zod: core.$ZodIPv4Internals

### 413. ZodIPv6 (interface)
purpose: Interface definition
extends: ZodStringFormat<"ipv6">
properties:
  - _zod: core.$ZodIPv6Internals

### 414. ZodCIDRv4 (interface)
purpose: Interface definition
extends: ZodStringFormat<"cidrv4">
properties:
  - _zod: core.$ZodCIDRv4Internals

### 415. ZodCIDRv6 (interface)
purpose: Interface definition
extends: ZodStringFormat<"cidrv6">
properties:
  - _zod: core.$ZodCIDRv6Internals

### 416. ZodBase64 (interface)
purpose: Interface definition
extends: ZodStringFormat<"base64">
properties:
  - _zod: core.$ZodBase64Internals

### 417. ZodBase64URL (interface)
purpose: Interface definition
extends: ZodStringFormat<"base64url">
properties:
  - _zod: core.$ZodBase64URLInternals

### 418. ZodE164 (interface)
purpose: Interface definition
extends: ZodStringFormat<"e164">
properties:
  - _zod: core.$ZodE164Internals

### 419. ZodJWT (interface)
purpose: Interface definition
extends: ZodStringFormat<"jwt">
properties:
  - _zod: core.$ZodJWTInternals

### 420. ZodCustomStringFormat (interface)
purpose: Interface definition
extends: ZodStringFormat<Format>, core.$ZodCustomStringFormat<Format>
properties:
  - _zod: core.$ZodCustomStringFormatInternals<Format>

### 421. _ZodNumber (interface)
purpose: Interface definition
extends: _ZodType<Internals>
methods:
  - gt(value, params): this
  - gte(value, params): this
  - min(value, params): this
  - lt(value, params): this
  - lte(value, params): this
  - max(value, params): this
  - int(params): this
  - safe(params): this
  - positive(params): this
  - nonnegative(params): this
  - negative(params): this
  - nonpositive(params): this
  - multipleOf(value, params): this
  - step(value, params): this
  - finite(params): this
properties:
  - minValue: number | null
  - maxValue: number | null
  - isInt: boolean
  - isFinite: boolean
  - format: string | null

### 422. ZodNumber (interface)
purpose: Interface definition
extends: _ZodNumber<core.$ZodNumberInternals<number>>

### 423. ZodNumberFormat (interface)
purpose: Interface definition
extends: ZodNumber
properties:
  - _zod: core.$ZodNumberFormatInternals

### 424. ZodInt (interface)
purpose: Interface definition
extends: ZodNumberFormat

### 425. ZodFloat32 (interface)
purpose: Interface definition
extends: ZodNumberFormat

### 426. ZodFloat64 (interface)
purpose: Interface definition
extends: ZodNumberFormat

### 427. ZodInt32 (interface)
purpose: Interface definition
extends: ZodNumberFormat

### 428. ZodUInt32 (interface)
purpose: Interface definition
extends: ZodNumberFormat

### 429. _ZodBoolean (interface)
purpose: Interface definition
extends: _ZodType<T>

### 430. ZodBoolean (interface)
purpose: Interface definition
extends: _ZodBoolean<core.$ZodBooleanInternals<boolean>>

### 431. _ZodBigInt (interface)
purpose: Interface definition
extends: _ZodType<T>
methods:
  - gte(value, params): this
  - min(value, params): this
  - gt(value, params): this
  - lte(value, params): this
  - max(value, params): this
  - lt(value, params): this
  - positive(params): this
  - negative(params): this
  - nonpositive(params): this
  - nonnegative(params): this
  - multipleOf(value, params): this
properties:
  - minValue: bigint | null
  - maxValue: bigint | null
  - format: string | null

### 432. ZodBigInt (interface)
purpose: Interface definition
extends: _ZodBigInt<core.$ZodBigIntInternals<bigint>>

### 433. ZodBigIntFormat (interface)
purpose: Interface definition
extends: ZodBigInt
properties:
  - _zod: core.$ZodBigIntFormatInternals

### 434. ZodSymbol (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodSymbolInternals>

### 435. ZodUndefined (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodUndefinedInternals>

### 436. ZodNull (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodNullInternals>

### 437. ZodAny (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodAnyInternals>

### 438. ZodUnknown (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodUnknownInternals>

### 439. ZodNever (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodNeverInternals>

### 440. ZodVoid (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodVoidInternals>

### 441. _ZodDate (interface)
purpose: Interface definition
extends: _ZodType<T>
methods:
  - min(value, params): this
  - max(value, params): this
properties:
  - minDate: Date | null
  - maxDate: Date | null

### 442. ZodDate (interface)
purpose: Interface definition
extends: _ZodDate<core.$ZodDateInternals<Date>>

### 443. ZodArray (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodArrayInternals<T>>, core.$ZodArray<T>
methods:
  - min(minLength, params): this
  - nonempty(params): this
  - max(maxLength, params): this
  - length(len, params): this
  - unwrap(): T
properties:
  - element: T

### 444. ZodObject (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodObjectInternals<Shape, Config>>, core.$ZodObject<Shape, Config>
methods:
  - keyof(): ZodEnum<util.ToEnum<keyof Shape & string>>
  - catchall(schema): ZodObject<Shape, core.$catchall<T>>
  - passthrough(): ZodObject<Shape, core.$loose>
  - loose(): ZodObject<Shape, core.$loose>
  - strict(): ZodObject<Shape, core.$strict>
  - strip(): ZodObject<Shape, core.$strip>
  - extend(shape): ZodObject<util.Extend<Shape, U>, Config>
  - merge(other): ZodObject<util.Extend<Shape, U["shape"]>, U["_zod"]["config"]>
  - pick(mask): ZodObject<util.Flatten<Pick<Shape, Extract<keyof Shape, keyof M>>>, Config>
  - omit(mask): ZodObject<util.Flatten<Omit<Shape, Extract<keyof Shape, keyof M>>>, Config>
  - partial(): ZodObject<
    {
      [k in keyof Shape]: ZodOptional<Shape[k]>;
    },
    Config
  >
  - partial(mask): ZodObject<
    {
      [k in keyof Shape]: k extends keyof M
        ? // Shape[k] extends OptionalInSchema
          //   ? Shape[k]
          //   :
          ZodOptional<Shape[k]>
        : Shape[k];
    },
    Config
  >
  - required(): ZodObject<
    {
      [k in keyof Shape]: ZodNonOptional<Shape[k]>;
    },
    Config
  >
  - required(mask): ZodObject<
    {
      [k in keyof Shape]: k extends keyof M ? ZodNonOptional<Shape[k]> : Shape[k];
    },
    Config
  >
properties:
  - shape: Shape

### 445. ZodUnion (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodUnionInternals<T>>, core.$ZodUnion<T>
properties:
  - options: T

### 446. ZodDiscriminatedUnion (interface)
purpose: Interface definition
extends: ZodUnion<Options>, core.$ZodDiscriminatedUnion<Options>
properties:
  - _zod: core.$ZodDiscriminatedUnionInternals<Options>

### 447. ZodIntersection (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodIntersectionInternals<A, B>>, core.$ZodIntersection<A, B>

### 448. ZodTuple (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodTupleInternals<T, Rest>>, core.$ZodTuple<T, Rest>
methods:
  - rest(rest): ZodTuple<T, Rest>

### 449. ZodRecord (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodRecordInternals<Key, Value>>, core.$ZodRecord<Key, Value>
properties:
  - keyType: Key
  - valueType: Value

### 450. ZodMap (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodMapInternals<Key, Value>>, core.$ZodMap<Key, Value>
properties:
  - keyType: Key
  - valueType: Value

### 451. ZodSet (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodSetInternals<T>>, core.$ZodSet<T>
methods:
  - min(minSize, params): this
  - nonempty(params): this
  - max(maxSize, params): this
  - size(size, params): this

### 452. ZodEnum (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodEnumInternals<T>>, core.$ZodEnum<T>
methods:
  - extract(values, params): ZodEnum<util.Flatten<Pick<T, U[number]>>>
  - exclude(values, params): ZodEnum<util.Flatten<Omit<T, U[number]>>>
properties:
  - enum: T
  - options: Array<T[keyof T]>

### 453. ZodLiteral (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodLiteralInternals<T>>, core.$ZodLiteral<T>
properties:
  - values: Set<T>
  - value: T

### 454. ZodFile (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodFileInternals>, core.$ZodFile
methods:
  - min(size, params): this
  - max(size, params): this
  - mime(types, params): this

### 455. ZodTransform (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodTransformInternals<O, I>>, core.$ZodTransform<O, I>

### 456. ZodOptional (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodOptionalInternals<T>>, core.$ZodOptional<T>
methods:
  - unwrap(): T

### 457. ZodNullable (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodNullableInternals<T>>, core.$ZodNullable<T>
methods:
  - unwrap(): T

### 458. ZodDefault (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodDefaultInternals<T>>, core.$ZodDefault<T>
methods:
  - unwrap(): T
  - removeDefault(): T

### 459. ZodPrefault (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodPrefaultInternals<T>>, core.$ZodPrefault<T>
methods:
  - unwrap(): T

### 460. ZodNonOptional (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodNonOptionalInternals<T>>, core.$ZodNonOptional<T>
methods:
  - unwrap(): T

### 461. ZodSuccess (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodSuccessInternals<T>>, core.$ZodSuccess<T>
methods:
  - unwrap(): T

### 462. ZodCatch (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodCatchInternals<T>>, core.$ZodCatch<T>
methods:
  - unwrap(): T
  - removeCatch(): T

### 463. ZodNaN (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodNaNInternals>, core.$ZodNaN

### 464. ZodPipe (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodPipeInternals<A, B>>, core.$ZodPipe<A, B>
properties:
  - in: A
  - out: B

### 465. ZodReadonly (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodReadonlyInternals<T>>, core.$ZodReadonly<T>

### 466. ZodTemplateLiteral (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodTemplateLiteralInternals<Template>>, core.$ZodTemplateLiteral<Template>

### 467. ZodLazy (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodLazyInternals<T>>, core.$ZodLazy<T>
methods:
  - unwrap(): T

### 468. ZodPromise (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodPromiseInternals<T>>, core.$ZodPromise<T>
methods:
  - unwrap(): T

### 469. ZodCustom (interface)
purpose: Interface definition
extends: _ZodType<core.$ZodCustomInternals<O, I>>, core.$ZodCustom<O, I>

### 470. ZodJSONSchemaInternals (interface)
purpose: Interface definition
extends: _ZodJSONSchemaInternals
properties:
  - output: util.JSONType
  - input: util.JSONType

### 471. ZodJSONSchema (interface)
purpose: Interface definition
extends: _ZodJSONSchema
properties:
  - _zod: ZodJSONSchemaInternals

### 472. $ZodTypeDiscriminableInternals (interface)
purpose: Interface definition
extends: schemas.$ZodTypeInternals
properties:
  - propValues: util.PropValues

### 473. $ZodTypeDiscriminable (interface)
purpose: Interface definition
extends: schemas.$ZodType
properties:
  - _zod: $ZodTypeDiscriminableInternals

### 474. $ZodStringBoolParams (interface)
purpose: Interface definition
extends: TypeParams
properties:
  - truthy: string[]
  - falsy: string[]
  - case: "sensitive" | "insensitive" | undefined

### 475. $ZodCheckDef (interface)
purpose: Interface definition
properties:
  - check: string
  - error: errors.$ZodErrorMap<never> | undefined
  - abort: boolean | undefined
  - when: ((payload: schemas.ParsePayload) => boolean) | undefined

### 476. $ZodCheckInternals (interface)
purpose: Interface definition
methods:
  - check(payload): util.MaybeAsync<void>
properties:
  - def: $ZodCheckDef
  - issc: errors.$ZodIssueBase
  - onattach: ((schema: schemas.$ZodType) => void)[]

### 477. $ZodCheck (interface)
purpose: Interface definition
properties:
  - _zod: $ZodCheckInternals<T>

### 478. $ZodCheckLessThanDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "less_than"
  - value: util.Numeric
  - inclusive: boolean

### 479. $ZodCheckLessThanInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckLessThanDef
  - issc: errors.$ZodIssueTooBig<T>

### 480. $ZodCheckLessThan (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckLessThanInternals<T>

### 481. $ZodCheckGreaterThanDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "greater_than"
  - value: util.Numeric
  - inclusive: boolean

### 482. $ZodCheckGreaterThanInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckGreaterThanDef
  - issc: errors.$ZodIssueTooSmall<T>

### 483. $ZodCheckGreaterThan (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckGreaterThanInternals<T>

### 484. $ZodCheckMultipleOfDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "multiple_of"
  - value: T

### 485. $ZodCheckMultipleOfInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckMultipleOfDef<T>
  - issc: errors.$ZodIssueNotMultipleOf

### 486. $ZodCheckMultipleOf (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckMultipleOfInternals<T>

### 487. $ZodCheckNumberFormatDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "number_format"
  - format: $ZodNumberFormats

### 488. $ZodCheckNumberFormatInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<number>
properties:
  - def: $ZodCheckNumberFormatDef
  - issc: errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig<"number"> | errors.$ZodIssueTooSmall<"number">

### 489. $ZodCheckNumberFormat (interface)
purpose: Interface definition
extends: $ZodCheck<number>
properties:
  - _zod: $ZodCheckNumberFormatInternals

### 490. $ZodCheckBigIntFormatDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "bigint_format"
  - format: $ZodBigIntFormats | undefined

### 491. $ZodCheckBigIntFormatInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<bigint>
properties:
  - def: $ZodCheckBigIntFormatDef
  - issc: errors.$ZodIssueTooBig<"bigint"> | errors.$ZodIssueTooSmall<"bigint">

### 492. $ZodCheckBigIntFormat (interface)
purpose: Interface definition
extends: $ZodCheck<bigint>
properties:
  - _zod: $ZodCheckBigIntFormatInternals

### 493. $ZodCheckMaxSizeDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "max_size"
  - maximum: number

### 494. $ZodCheckMaxSizeInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckMaxSizeDef
  - issc: errors.$ZodIssueTooBig<T>

### 495. $ZodCheckMaxSize (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckMaxSizeInternals<T>

### 496. $ZodCheckMinSizeDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "min_size"
  - minimum: number

### 497. $ZodCheckMinSizeInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckMinSizeDef
  - issc: errors.$ZodIssueTooSmall<T>

### 498. $ZodCheckMinSize (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckMinSizeInternals<T>

### 499. $ZodCheckSizeEqualsDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "size_equals"
  - size: number

### 500. $ZodCheckSizeEqualsInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckSizeEqualsDef
  - issc: errors.$ZodIssueTooBig<T> | errors.$ZodIssueTooSmall<T>

### 501. $ZodCheckSizeEquals (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckSizeEqualsInternals<T>

### 502. $ZodCheckMaxLengthDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "max_length"
  - maximum: number

### 503. $ZodCheckMaxLengthInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckMaxLengthDef
  - issc: errors.$ZodIssueTooBig<T>

### 504. $ZodCheckMaxLength (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckMaxLengthInternals<T>

### 505. $ZodCheckMinLengthDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "min_length"
  - minimum: number

### 506. $ZodCheckMinLengthInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckMinLengthDef
  - issc: errors.$ZodIssueTooSmall<T>

### 507. $ZodCheckMinLength (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckMinLengthInternals<T>

### 508. $ZodCheckLengthEqualsDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "length_equals"
  - length: number

### 509. $ZodCheckLengthEqualsInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckLengthEqualsDef
  - issc: errors.$ZodIssueTooBig<T> | errors.$ZodIssueTooSmall<T>

### 510. $ZodCheckLengthEquals (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckLengthEqualsInternals<T>

### 511. $ZodCheckStringFormatDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "string_format"
  - format: Format
  - pattern: RegExp | undefined

### 512. $ZodCheckStringFormatInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<string>
properties:
  - def: $ZodCheckStringFormatDef
  - issc: errors.$ZodIssueInvalidStringFormat

### 513. $ZodCheckStringFormat (interface)
purpose: Interface definition
extends: $ZodCheck<string>
properties:
  - _zod: $ZodCheckStringFormatInternals

### 514. $ZodCheckRegexDef (interface)
purpose: Interface definition
extends: $ZodCheckStringFormatDef
properties:
  - format: "regex"
  - pattern: RegExp

### 515. $ZodCheckRegexInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<string>
properties:
  - def: $ZodCheckRegexDef
  - issc: errors.$ZodIssueInvalidStringFormat

### 516. $ZodCheckRegex (interface)
purpose: Interface definition
extends: $ZodCheck<string>
properties:
  - _zod: $ZodCheckRegexInternals

### 517. $ZodCheckLowerCaseDef (interface)
purpose: Interface definition
extends: $ZodCheckStringFormatDef<"lowercase">

### 518. $ZodCheckLowerCaseInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<string>
properties:
  - def: $ZodCheckLowerCaseDef
  - issc: errors.$ZodIssueInvalidStringFormat

### 519. $ZodCheckLowerCase (interface)
purpose: Interface definition
extends: $ZodCheck<string>
properties:
  - _zod: $ZodCheckLowerCaseInternals

### 520. $ZodCheckUpperCaseDef (interface)
purpose: Interface definition
extends: $ZodCheckStringFormatDef<"uppercase">

### 521. $ZodCheckUpperCaseInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<string>
properties:
  - def: $ZodCheckUpperCaseDef
  - issc: errors.$ZodIssueInvalidStringFormat

### 522. $ZodCheckUpperCase (interface)
purpose: Interface definition
extends: $ZodCheck<string>
properties:
  - _zod: $ZodCheckUpperCaseInternals

### 523. $ZodCheckIncludesDef (interface)
purpose: Interface definition
extends: $ZodCheckStringFormatDef<"includes">
properties:
  - includes: string
  - position: number | undefined

### 524. $ZodCheckIncludesInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<string>
properties:
  - def: $ZodCheckIncludesDef
  - issc: errors.$ZodIssueInvalidStringFormat

### 525. $ZodCheckIncludes (interface)
purpose: Interface definition
extends: $ZodCheck<string>
properties:
  - _zod: $ZodCheckIncludesInternals

### 526. $ZodCheckStartsWithDef (interface)
purpose: Interface definition
extends: $ZodCheckStringFormatDef<"starts_with">
properties:
  - prefix: string

### 527. $ZodCheckStartsWithInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<string>
properties:
  - def: $ZodCheckStartsWithDef
  - issc: errors.$ZodIssueInvalidStringFormat

### 528. $ZodCheckStartsWith (interface)
purpose: Interface definition
extends: $ZodCheck<string>
properties:
  - _zod: $ZodCheckStartsWithInternals

### 529. $ZodCheckEndsWithDef (interface)
purpose: Interface definition
extends: $ZodCheckStringFormatDef<"ends_with">
properties:
  - suffix: string

### 530. $ZodCheckEndsWithInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<string>
properties:
  - def: $ZodCheckEndsWithDef
  - issc: errors.$ZodIssueInvalidStringFormat

### 531. $ZodCheckEndsWith (interface)
purpose: Interface definition
extends: $ZodCheckInternals<string>
properties:
  - _zod: $ZodCheckEndsWithInternals

### 532. $ZodCheckPropertyDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "property"
  - property: string
  - schema: schemas.$ZodType

### 533. $ZodCheckPropertyInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckPropertyDef
  - issc: errors.$ZodIssue

### 534. $ZodCheckProperty (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckPropertyInternals<T>

### 535. $ZodCheckMimeTypeDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
properties:
  - check: "mime_type"
  - mime: util.MimeTypes[]

### 536. $ZodCheckMimeTypeInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckMimeTypeDef
  - issc: errors.$ZodIssueInvalidValue

### 537. $ZodCheckMimeType (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckMimeTypeInternals<T>

### 538. $ZodCheckOverwriteDef (interface)
purpose: Interface definition
extends: $ZodCheckDef
methods:
  - tx(value): T
properties:
  - check: "overwrite"

### 539. $ZodCheckOverwriteInternals (interface)
purpose: Interface definition
extends: $ZodCheckInternals<T>
properties:
  - def: $ZodCheckOverwriteDef<T>
  - issc: never

### 540. $ZodCheckOverwrite (interface)
purpose: Interface definition
extends: $ZodCheck<T>
properties:
  - _zod: $ZodCheckOverwriteInternals<T>

### 541. $ZodConfig (interface)
purpose: Interface definition
properties:
  - customError: errors.$ZodErrorMap | undefined
  - localeError: errors.$ZodErrorMap | undefined

### 542. $constructor (interface)
purpose: Interface definition
methods:
  - init(inst, def): asserts inst is T

### 543. $ZodConfig (interface)
purpose: Interface definition
properties:
  - customError: errors.$ZodErrorMap | undefined
  - localeError: errors.$ZodErrorMap | undefined
  - jitless: boolean | undefined

### 544. $ZodIssueBase (interface)
purpose: Interface definition
properties:
  - code: string
  - input: unknown
  - path: PropertyKey[]
  - message: string

### 545. $ZodIssueInvalidType (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "invalid_type"
  - expected: $ZodType["_zod"]["def"]["type"]
  - input: Input

### 546. $ZodIssueTooBig (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "too_big"
  - origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {})
  - maximum: number | bigint
  - inclusive: boolean
  - exact: boolean
  - input: Input

### 547. $ZodIssueTooSmall (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "too_small"
  - origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {})
  - minimum: number | bigint
  - inclusive: boolean
  - exact: boolean
  - input: Input

### 548. $ZodIssueInvalidStringFormat (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "invalid_format"
  - format: $ZodStringFormats | (string & {})
  - pattern: string
  - input: string

### 549. $ZodIssueNotMultipleOf (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "not_multiple_of"
  - divisor: number
  - input: Input

### 550. $ZodIssueUnrecognizedKeys (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "unrecognized_keys"
  - keys: string[]
  - input: Record<string, unknown>

### 551. $ZodIssueInvalidUnion (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "invalid_union"
  - errors: $ZodIssue[][]
  - input: unknown

### 552. $ZodIssueInvalidKey (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "invalid_key"
  - origin: "map" | "record"
  - issues: $ZodIssue[]
  - input: Input

### 553. $ZodIssueInvalidElement (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "invalid_element"
  - origin: "map" | "set"
  - key: unknown
  - issues: $ZodIssue[]
  - input: Input

### 554. $ZodIssueInvalidValue (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "invalid_value"
  - values: util.Primitive[]
  - input: Input

### 555. $ZodIssueCustom (interface)
purpose: Interface definition
extends: $ZodIssueBase
properties:
  - code: "custom"
  - params: Record<string, any> | undefined
  - input: unknown

### 556. $ZodIssueStringCommonFormats (interface)
purpose: Interface definition
extends: $ZodIssueInvalidStringFormat
properties:
  - format: Exclude<$ZodStringFormats, "regex" | "jwt" | "starts_with" | "ends_with" | "includes">

### 557. $ZodIssueStringInvalidRegex (interface)
purpose: Interface definition
extends: $ZodIssueInvalidStringFormat
properties:
  - format: "regex"
  - pattern: string

### 558. $ZodIssueStringInvalidJWT (interface)
purpose: Interface definition
extends: $ZodIssueInvalidStringFormat
properties:
  - format: "jwt"
  - algorithm: string

### 559. $ZodIssueStringStartsWith (interface)
purpose: Interface definition
extends: $ZodIssueInvalidStringFormat
properties:
  - format: "starts_with"
  - prefix: string

### 560. $ZodIssueStringEndsWith (interface)
purpose: Interface definition
extends: $ZodIssueInvalidStringFormat
properties:
  - format: "ends_with"
  - suffix: string

### 561. $ZodIssueStringIncludes (interface)
purpose: Interface definition
extends: $ZodIssueInvalidStringFormat
properties:
  - format: "includes"
  - includes: string

### 562. $ZodErrorMap (interface)
purpose: Interface definition

### 563. $ZodError (interface)
purpose: Interface definition
extends: Error
properties:
  - type: T
  - issues: $ZodIssue[]
  - _zod: {
    output: T;
    def: $ZodIssue[];
  }
  - stack: string
  - name: string

### 564. $ZodRealError (interface)
purpose: Interface definition
extends: $ZodError<T>

### 565. BaseError (interface)
purpose: Interface definition
properties:
  - issues: $ZodIssueBase[]

### 566. $ZodFunctionDef (interface)
purpose: Interface definition
properties:
  - type: "function"
  - input: In
  - output: Out

### 567. $ZodFunctionParams (interface)
purpose: Interface definition
properties:
  - input: I
  - output: O

### 568. ObjectSchema (interface)
purpose: Interface definition
extends: JSONSchema
properties:
  - type: "object"

### 569. ArraySchema (interface)
purpose: Interface definition
extends: JSONSchema
properties:
  - type: "array"

### 570. StringSchema (interface)
purpose: Interface definition
extends: JSONSchema
properties:
  - type: "string"

### 571. NumberSchema (interface)
purpose: Interface definition
extends: JSONSchema
properties:
  - type: "number"

### 572. IntegerSchema (interface)
purpose: Interface definition
extends: JSONSchema
properties:
  - type: "integer"

### 573. BooleanSchema (interface)
purpose: Interface definition
extends: JSONSchema
properties:
  - type: "boolean"

### 574. NullSchema (interface)
purpose: Interface definition
extends: JSONSchema
properties:
  - type: "null"

### 575. JSONSchemaMeta (interface)
purpose: Interface definition
properties:
  - id: string | undefined
  - title: string | undefined
  - description: string | undefined
  - deprecated: boolean | undefined

### 576. GlobalMeta (interface)
purpose: Interface definition
extends: JSONSchemaMeta

### 577. ParseContext (interface)
purpose: Interface definition
properties:
  - error: errors.$ZodErrorMap<T>
  - reportInput: boolean
  - jitless: boolean

### 578. ParseContextInternal (interface)
purpose: Interface definition
extends: ParseContext<T>
properties:
  - async: boolean | undefined

### 579. ParsePayload (interface)
purpose: Interface definition
properties:
  - value: T
  - issues: errors.$ZodRawIssue[]

### 580. $ZodTypeDef (interface)
purpose: Interface definition
properties:
  - type: | "string"
    | "number"
    | "int"
    | "boolean"
    | "bigint"
    | "symbol"
    | "null"
    | "undefined"
    | "void" // merge with undefined?
    | "never"
    | "any"
    | "unknown"
    | "date"
    | "object"
    | "record"
    | "file"
    | "array"
    | "tuple"
    | "union"
    | "intersection"
    | "map"
    | "set"
    | "enum"
    | "literal"
    | "nullable"
    | "optional"
    | "nonoptional"
    | "success"
    | "transform"
    | "default"
    | "prefault"
    | "catch"
    | "nan"
    | "pipe"
    | "readonly"
    | "template_literal"
    | "promise"
    | "lazy"
    | "custom"
  - error: errors.$ZodErrorMap<never> | undefined
  - checks: checks.$ZodCheck<never>[]

### 581. _$ZodTypeInternals (interface)
purpose: Interface definition
methods:
  - run(payload, ctx): util.MaybeAsync<ParsePayload>
  - parse(payload, ctx): util.MaybeAsync<ParsePayload>
properties:
  - version: typeof version
  - def: $ZodTypeDef
  - deferred: util.AnyFunc[] | undefined
  - traits: Set<string>
  - optin: "optional" | undefined
  - optout: "optional" | undefined
  - values: util.PrimitiveSet | undefined
  - propValues: util.PropValues | undefined
  - pattern: RegExp | undefined
  - constr: new (
    def: any
  ) => $ZodType
  - bag: Record<string, unknown>
  - isst: errors.$ZodIssueBase
  - toJSONSchema: () => unknown
  - parent: $ZodType | undefined

### 582. $ZodTypeInternals (interface)
purpose: Interface definition
extends: _$ZodTypeInternals
properties:
  - output: O
  - input: I

### 583. $ZodType (interface)
purpose: Interface definition
properties:
  - _zod: Internals
  - "~standard": $ZodStandardSchema<this>

### 584. _$ZodType (interface)
purpose: Interface definition
extends: $ZodType<T["output"], T["input"], T>

### 585. $ZodStringDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "string"
  - coerce: boolean
  - checks: checks.$ZodCheck<string>[]

### 586. $ZodStringInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<string, Input>
properties:
  - def: $ZodStringDef
  - pattern: RegExp
  - isst: errors.$ZodIssueInvalidType
  - bag: util.LoosePartial<{
    minimum: number;
    maximum: number;
    patterns: Set<RegExp>;
    format: string;
    contentEncoding: string;
  }>

### 587. $ZodString (interface)
purpose: Interface definition
extends: _$ZodType<$ZodStringInternals<Input>>

### 588. $ZodStringFormatDef (interface)
purpose: Interface definition
extends: $ZodStringDef, checks.$ZodCheckStringFormatDef<Format>

### 589. $ZodStringFormatInternals (interface)
purpose: Interface definition
extends: $ZodStringInternals<string>, checks.$ZodCheckStringFormatInternals
properties:
  - def: $ZodStringFormatDef<Format>

### 590. $ZodStringFormat (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodStringFormatInternals<Format>

### 591. $ZodGUIDDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"guid">

### 592. $ZodGUIDInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"guid">

### 593. $ZodGUID (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodGUIDInternals

### 594. $ZodUUIDDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"uuid">
properties:
  - version: "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7" | "v8"

### 595. $ZodUUIDInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"uuid">
properties:
  - def: $ZodUUIDDef

### 596. $ZodUUID (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodUUIDInternals

### 597. $ZodEmailDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"email">

### 598. $ZodEmailInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"email">

### 599. $ZodEmail (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodEmailInternals

### 600. $ZodURLDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"url">
properties:
  - hostname: RegExp | undefined
  - protocol: RegExp | undefined

### 601. $ZodURLInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"url">
properties:
  - def: $ZodURLDef

### 602. $ZodURL (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodURLInternals

### 603. $ZodEmojiDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"emoji">

### 604. $ZodEmojiInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"emoji">

### 605. $ZodEmoji (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodEmojiInternals

### 606. $ZodNanoIDDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"nanoid">

### 607. $ZodNanoIDInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"nanoid">

### 608. $ZodNanoID (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodNanoIDInternals

### 609. $ZodCUIDDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"cuid">

### 610. $ZodCUIDInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"cuid">

### 611. $ZodCUID (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodCUIDInternals

### 612. $ZodCUID2Def (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"cuid2">

### 613. $ZodCUID2Internals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"cuid2">

### 614. $ZodCUID2 (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodCUID2Internals

### 615. $ZodULIDDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"ulid">

### 616. $ZodULIDInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"ulid">

### 617. $ZodULID (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodULIDInternals

### 618. $ZodXIDDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"xid">

### 619. $ZodXIDInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"xid">

### 620. $ZodXID (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodXIDInternals

### 621. $ZodKSUIDDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"ksuid">

### 622. $ZodKSUIDInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"ksuid">

### 623. $ZodKSUID (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodKSUIDInternals

### 624. $ZodISODateTimeDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"datetime">
properties:
  - precision: number | null
  - offset: boolean
  - local: boolean

### 625. $ZodISODateTimeInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals
properties:
  - def: $ZodISODateTimeDef

### 626. $ZodISODateTime (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodISODateTimeInternals

### 627. $ZodISODateDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"date">

### 628. $ZodISODateInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"date">

### 629. $ZodISODate (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodISODateInternals

### 630. $ZodISOTimeDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"time">
properties:
  - precision: number | null

### 631. $ZodISOTimeInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"time">
properties:
  - def: $ZodISOTimeDef

### 632. $ZodISOTime (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodISOTimeInternals

### 633. $ZodISODurationDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"duration">

### 634. $ZodISODurationInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"duration">

### 635. $ZodISODuration (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodISODurationInternals

### 636. $ZodIPv4Def (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"ipv4">
properties:
  - version: "v4"

### 637. $ZodIPv4Internals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"ipv4">
properties:
  - def: $ZodIPv4Def

### 638. $ZodIPv4 (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodIPv4Internals

### 639. $ZodIPv6Def (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"ipv6">
properties:
  - version: "v6"

### 640. $ZodIPv6Internals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"ipv6">
properties:
  - def: $ZodIPv6Def

### 641. $ZodIPv6 (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodIPv6Internals

### 642. $ZodCIDRv4Def (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"cidrv4">
properties:
  - version: "v4"

### 643. $ZodCIDRv4Internals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"cidrv4">
properties:
  - def: $ZodCIDRv4Def

### 644. $ZodCIDRv4 (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodCIDRv4Internals

### 645. $ZodCIDRv6Def (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"cidrv6">
properties:
  - version: "v6"

### 646. $ZodCIDRv6Internals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"cidrv6">
properties:
  - def: $ZodCIDRv6Def

### 647. $ZodCIDRv6 (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodCIDRv6Internals

### 648. $ZodBase64Def (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"base64">

### 649. $ZodBase64Internals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"base64">

### 650. $ZodBase64 (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodBase64Internals

### 651. $ZodBase64URLDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"base64url">

### 652. $ZodBase64URLInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"base64url">

### 653. $ZodBase64URL (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodBase64URLInternals

### 654. $ZodE164Def (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"e164">

### 655. $ZodE164Internals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"e164">

### 656. $ZodE164 (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodE164Internals

### 657. $ZodJWTDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<"jwt">
properties:
  - alg: util.JWTAlgorithm | undefined

### 658. $ZodJWTInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<"jwt">
properties:
  - def: $ZodJWTDef

### 659. $ZodJWT (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodJWTInternals

### 660. $ZodCustomStringFormatDef (interface)
purpose: Interface definition
extends: $ZodStringFormatDef<Format>
properties:
  - fn: (val: string) => unknown

### 661. $ZodCustomStringFormatInternals (interface)
purpose: Interface definition
extends: $ZodStringFormatInternals<Format>
properties:
  - def: $ZodCustomStringFormatDef<Format>

### 662. $ZodCustomStringFormat (interface)
purpose: Interface definition
extends: $ZodStringFormat<Format>
properties:
  - _zod: $ZodCustomStringFormatInternals<Format>

### 663. $ZodNumberDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "number"
  - coerce: boolean

### 664. $ZodNumberInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<number, Input>
properties:
  - def: $ZodNumberDef
  - pattern: RegExp
  - isst: errors.$ZodIssueInvalidType
  - bag: util.LoosePartial<{
    minimum: number;
    maximum: number;
    exclusiveMinimum: number;
    exclusiveMaximum: number;
    format: string;
    pattern: RegExp;
  }>

### 665. $ZodNumber (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodNumberInternals<Input>

### 666. $ZodNumberFormatDef (interface)
purpose: Interface definition
extends: $ZodNumberDef, checks.$ZodCheckNumberFormatDef

### 667. $ZodNumberFormatInternals (interface)
purpose: Interface definition
extends: $ZodNumberInternals<number>, checks.$ZodCheckNumberFormatInternals
properties:
  - def: $ZodNumberFormatDef
  - isst: errors.$ZodIssueInvalidType

### 668. $ZodNumberFormat (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodNumberFormatInternals

### 669. $ZodBooleanDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "boolean"
  - coerce: boolean
  - checks: checks.$ZodCheck<boolean>[]

### 670. $ZodBooleanInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<boolean, T>
properties:
  - pattern: RegExp
  - def: $ZodBooleanDef
  - isst: errors.$ZodIssueInvalidType

### 671. $ZodBoolean (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodBooleanInternals<T>

### 672. $ZodBigIntDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "bigint"
  - coerce: boolean

### 673. $ZodBigIntInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<bigint, T>
properties:
  - pattern: RegExp
  - def: $ZodBigIntDef
  - isst: errors.$ZodIssueInvalidType
  - bag: util.LoosePartial<{
    minimum: bigint;
    maximum: bigint;
    format: string;
  }>

### 674. $ZodBigInt (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodBigIntInternals<T>

### 675. $ZodBigIntFormatDef (interface)
purpose: Interface definition
extends: $ZodBigIntDef, checks.$ZodCheckBigIntFormatDef
properties:
  - check: "bigint_format"

### 676. $ZodBigIntFormatInternals (interface)
purpose: Interface definition
extends: $ZodBigIntInternals<bigint>, checks.$ZodCheckBigIntFormatInternals
properties:
  - def: $ZodBigIntFormatDef

### 677. $ZodBigIntFormat (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodBigIntFormatInternals

### 678. $ZodSymbolDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "symbol"

### 679. $ZodSymbolInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<symbol, symbol>
properties:
  - def: $ZodSymbolDef
  - isst: errors.$ZodIssueInvalidType

### 680. $ZodSymbol (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodSymbolInternals

### 681. $ZodUndefinedDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "undefined"

### 682. $ZodUndefinedInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<undefined, undefined>
properties:
  - pattern: RegExp
  - def: $ZodUndefinedDef
  - values: util.PrimitiveSet
  - isst: errors.$ZodIssueInvalidType

### 683. $ZodUndefined (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodUndefinedInternals

### 684. $ZodNullDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "null"

### 685. $ZodNullInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<null, null>
properties:
  - pattern: RegExp
  - def: $ZodNullDef
  - values: util.PrimitiveSet
  - isst: errors.$ZodIssueInvalidType

### 686. $ZodNull (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodNullInternals

### 687. $ZodAnyDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "any"

### 688. $ZodAnyInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<any, any>
properties:
  - def: $ZodAnyDef
  - isst: never

### 689. $ZodAny (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodAnyInternals

### 690. $ZodUnknownDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "unknown"

### 691. $ZodUnknownInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<unknown, unknown>
properties:
  - def: $ZodUnknownDef
  - isst: never

### 692. $ZodUnknown (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodUnknownInternals

### 693. $ZodNeverDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "never"

### 694. $ZodNeverInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<never, never>
properties:
  - def: $ZodNeverDef
  - isst: errors.$ZodIssueInvalidType

### 695. $ZodNever (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodNeverInternals

### 696. $ZodVoidDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "void"

### 697. $ZodVoidInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<void, void>
properties:
  - def: $ZodVoidDef
  - isst: errors.$ZodIssueInvalidType

### 698. $ZodVoid (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodVoidInternals

### 699. $ZodDateDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "date"
  - coerce: boolean

### 700. $ZodDateInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<Date, T>
properties:
  - def: $ZodDateDef
  - isst: errors.$ZodIssueInvalidType
  - bag: util.LoosePartial<{
    minimum: Date;
    maximum: Date;
    format: string;
  }>

### 701. $ZodDate (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodDateInternals<T>

### 702. $ZodArrayDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "array"
  - element: T

### 703. $ZodArrayInternals (interface)
purpose: Interface definition
extends: _$ZodTypeInternals
properties:
  - def: $ZodArrayDef<T>
  - isst: errors.$ZodIssueInvalidType
  - output: core.output<T>[]
  - input: core.input<T>[]

### 704. $ZodArray (interface)
purpose: Interface definition
extends: $ZodType<any, any, $ZodArrayInternals<T>>

### 705. $ZodObjectDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "object"
  - shape: Shape
  - catchall: $ZodType | undefined

### 706. $ZodObjectInternals (interface)
purpose: Interface definition
extends: _$ZodTypeInternals
properties:
  - def: $ZodObjectDef<Shape>
  - config: Config
  - isst: errors.$ZodIssueInvalidType | errors.$ZodIssueUnrecognizedKeys
  - propValues: util.PropValues
  - output: $InferObjectOutput<Shape, Config["out"]>
  - input: $InferObjectInput<Shape, Config["in"]>

### 707. $ZodObject (interface)
purpose: Interface definition
extends: $ZodType<any, any, $ZodObjectInternals<Shape, Params>>
properties:
  - "~standard": $ZodStandardSchema<this>

### 708. $ZodUnionDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "union"
  - options: Options

### 709. $ZodUnionInternals (interface)
purpose: Interface definition
extends: _$ZodTypeInternals
properties:
  - def: $ZodUnionDef<T>
  - isst: errors.$ZodIssueInvalidUnion
  - pattern: T[number]["_zod"]["pattern"]
  - values: T[number]["_zod"]["values"]
  - output: $InferUnionOutput<T[number]>
  - input: $InferUnionInput<T[number]>
  - optin: IsOptionalIn<T[number]> extends false ? "optional" | undefined : "optional"
  - optout: IsOptionalOut<T[number]> extends false ? "optional" | undefined : "optional"

### 710. $ZodUnion (interface)
purpose: Interface definition
extends: $ZodType<any, any, $ZodUnionInternals<T>>
properties:
  - _zod: $ZodUnionInternals<T>

### 711. $ZodDiscriminatedUnionDef (interface)
purpose: Interface definition
extends: $ZodUnionDef<Options>
properties:
  - discriminator: string
  - unionFallback: boolean

### 712. $ZodDiscriminatedUnionInternals (interface)
purpose: Interface definition
extends: $ZodUnionInternals<Options>
properties:
  - def: $ZodDiscriminatedUnionDef<Options>
  - propValues: util.PropValues

### 713. $ZodDiscriminatedUnion (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodDiscriminatedUnionInternals<T>

### 714. $ZodIntersectionDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "intersection"
  - left: Left
  - right: Right

### 715. $ZodIntersectionInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<core.output<A> & core.output<B>, core.input<A> & core.input<B>>
properties:
  - def: $ZodIntersectionDef<A, B>
  - isst: never
  - optin: A["_zod"]["optin"] | B["_zod"]["optin"]
  - optout: A["_zod"]["optout"] | B["_zod"]["optout"]

### 716. $ZodIntersection (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodIntersectionInternals<A, B>

### 717. $ZodTupleDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "tuple"
  - items: T
  - rest: Rest

### 718. $ZodTupleInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<$InferTupleOutputType<T, Rest>, $InferTupleInputType<T, Rest>>
properties:
  - def: $ZodTupleDef<T, Rest>
  - isst: errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig<unknown[]> | errors.$ZodIssueTooSmall<unknown[]>

### 719. $ZodTuple (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodTupleInternals<T, Rest>

### 720. $ZodRecordDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "record"
  - keyType: Key
  - valueType: Value

### 721. $ZodRecordInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<$InferZodRecordOutput<Key, Value>, $InferZodRecordInput<Key, Value>>
properties:
  - def: $ZodRecordDef<Key, Value>
  - isst: errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey<Record<PropertyKey, unknown>>
  - optin: "optional" | undefined
  - optout: "optional" | undefined

### 722. $ZodRecord (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodRecordInternals<Key, Value>

### 723. $ZodMapDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "map"
  - keyType: Key
  - valueType: Value

### 724. $ZodMapInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<Map<core.output<Key>, core.output<Value>>, Map<core.input<Key>, core.input<Value>>>
properties:
  - def: $ZodMapDef<Key, Value>
  - isst: errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey | errors.$ZodIssueInvalidElement<unknown>
  - optin: "optional" | undefined
  - optout: "optional" | undefined

### 725. $ZodMap (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodMapInternals<Key, Value>

### 726. $ZodSetDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "set"
  - valueType: T

### 727. $ZodSetInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<Set<core.output<T>>, Set<core.input<T>>>
properties:
  - def: $ZodSetDef<T>
  - isst: errors.$ZodIssueInvalidType
  - optin: "optional" | undefined
  - optout: "optional" | undefined

### 728. $ZodSet (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodSetInternals<T>

### 729. $ZodEnumDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "enum"
  - entries: T

### 730. $ZodEnumInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<$InferEnumOutput<T>, $InferEnumInput<T>>
properties:
  - def: $ZodEnumDef<T>
  - values: util.PrimitiveSet
  - pattern: RegExp
  - isst: errors.$ZodIssueInvalidValue

### 731. $ZodEnum (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodEnumInternals<T>

### 732. $ZodLiteralDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "literal"
  - values: T[]

### 733. $ZodLiteralInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<T, T>
properties:
  - def: $ZodLiteralDef<T>
  - values: Set<T>
  - pattern: RegExp
  - isst: errors.$ZodIssueInvalidValue

### 734. $ZodLiteral (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodLiteralInternals<T>

### 735. $ZodFileDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "file"

### 736. $ZodFileInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<File, File>
properties:
  - def: $ZodFileDef
  - isst: errors.$ZodIssueInvalidType
  - bag: util.LoosePartial<{
    minimum: number;
    maximum: number;
    mime: util.MimeTypes[];
  }>

### 737. $ZodFile (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodFileInternals

### 738. $ZodTransformDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "transform"
  - transform: (input: unknown, payload: ParsePayload<unknown>) => util.MaybeAsync<unknown>

### 739. $ZodTransformInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<O, I>
properties:
  - def: $ZodTransformDef
  - isst: never

### 740. $ZodTransform (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodTransformInternals<O, I>

### 741. $ZodOptionalDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "optional"
  - innerType: T

### 742. $ZodOptionalInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<core.output<T> | undefined, core.input<T> | undefined>
properties:
  - def: $ZodOptionalDef<T>
  - optin: "optional"
  - optout: "optional"
  - isst: never
  - values: T["_zod"]["values"]
  - pattern: T["_zod"]["pattern"]

### 743. $ZodOptional (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodOptionalInternals<T>

### 744. $ZodNullableDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "nullable"
  - innerType: T

### 745. $ZodNullableInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<core.output<T> | null, core.input<T> | null>
properties:
  - def: $ZodNullableDef<T>
  - optin: T["_zod"]["optin"]
  - optout: T["_zod"]["optout"]
  - isst: never
  - values: T["_zod"]["values"]
  - pattern: T["_zod"]["pattern"]

### 746. $ZodNullable (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodNullableInternals<T>

### 747. $ZodDefaultDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "default"
  - innerType: T
  - defaultValue: util.NoUndefined<core.output<T>>

### 748. $ZodDefaultInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<util.NoUndefined<core.output<T>>, core.input<T> | undefined>
properties:
  - def: $ZodDefaultDef<T>
  - optin: "optional"
  - optout: "optional" | undefined
  - isst: never
  - values: T["_zod"]["values"]

### 749. $ZodDefault (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodDefaultInternals<T>

### 750. $ZodPrefaultDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "prefault"
  - innerType: T
  - defaultValue: core.input<T>

### 751. $ZodPrefaultInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<util.NoUndefined<core.output<T>>, core.input<T> | undefined>
properties:
  - def: $ZodPrefaultDef<T>
  - optin: "optional"
  - optout: "optional" | undefined
  - isst: never
  - values: T["_zod"]["values"]

### 752. $ZodPrefault (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodPrefaultInternals<T>

### 753. $ZodNonOptionalDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "nonoptional"
  - innerType: T

### 754. $ZodNonOptionalInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<util.NoUndefined<core.output<T>>, util.NoUndefined<core.input<T>>>
properties:
  - def: $ZodNonOptionalDef<T>
  - isst: errors.$ZodIssueInvalidType
  - values: T["_zod"]["values"]
  - optin: "optional" | undefined
  - optout: "optional" | undefined

### 755. $ZodNonOptional (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodNonOptionalInternals<T>

### 756. $ZodSuccessDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "success"
  - innerType: T

### 757. $ZodSuccessInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<boolean, core.input<T>>
properties:
  - def: $ZodSuccessDef<T>
  - isst: never
  - optin: T["_zod"]["optin"]
  - optout: "optional" | undefined

### 758. $ZodSuccess (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodSuccessInternals<T>

### 759. $ZodCatchCtx (interface)
purpose: Interface definition
extends: ParsePayload
properties:
  - error: { issues: errors.$ZodIssue[] }
  - input: unknown

### 760. $ZodCatchDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "catch"
  - innerType: T
  - catchValue: (ctx: $ZodCatchCtx) => unknown

### 761. $ZodCatchInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<core.output<T>, core.input<T> | util.Whatever>
properties:
  - def: $ZodCatchDef<T>
  - optin: T["_zod"]["optin"]
  - optout: T["_zod"]["optout"]
  - isst: never
  - values: T["_zod"]["values"]

### 762. $ZodCatch (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodCatchInternals<T>

### 763. $ZodNaNDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "nan"

### 764. $ZodNaNInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<number, number>
properties:
  - def: $ZodNaNDef
  - isst: errors.$ZodIssueInvalidType

### 765. $ZodNaN (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodNaNInternals

### 766. $ZodPipeDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "pipe"
  - in: A
  - out: B

### 767. $ZodPipeInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<core.output<B>, core.input<A>>
properties:
  - def: $ZodPipeDef<A, B>
  - isst: never
  - values: A["_zod"]["values"]
  - optin: A["_zod"]["optin"]
  - optout: B["_zod"]["optout"]

### 768. $ZodPipe (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodPipeInternals<A, B>

### 769. $ZodReadonlyDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "readonly"
  - innerType: T

### 770. $ZodReadonlyInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<util.MakeReadonly<core.output<T>>, util.MakeReadonly<core.input<T>>>
properties:
  - def: $ZodReadonlyDef<T>
  - optin: T["_zod"]["optin"]
  - optout: T["_zod"]["optout"]
  - isst: never
  - propValues: T["_zod"]["propValues"]
  - values: T["_zod"]["values"]

### 771. $ZodReadonly (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodReadonlyInternals<T>

### 772. $ZodTemplateLiteralDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "template_literal"
  - parts: $ZodTemplateLiteralPart[]

### 773. $ZodTemplateLiteralInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<Template, Template>
properties:
  - pattern: RegExp
  - def: $ZodTemplateLiteralDef
  - isst: errors.$ZodIssueInvalidType

### 774. $ZodTemplateLiteral (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodTemplateLiteralInternals<Template>

### 775. SchemaPartInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<LiteralPart, LiteralPart>
properties:
  - pattern: RegExp

### 776. SchemaPart (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: SchemaPartInternals

### 777. $ZodPromiseDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "promise"
  - innerType: T

### 778. $ZodPromiseInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<core.output<T>, util.MaybeAsync<core.input<T>>>
properties:
  - def: $ZodPromiseDef<T>
  - isst: never

### 779. $ZodPromise (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodPromiseInternals<T>

### 780. $ZodLazyDef (interface)
purpose: Interface definition
extends: $ZodTypeDef
properties:
  - type: "lazy"
  - getter: () => T

### 781. $ZodLazyInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<core.output<T>, core.input<T>>
properties:
  - def: $ZodLazyDef<T>
  - isst: never
  - innerType: T
  - pattern: T["_zod"]["pattern"]
  - propValues: T["_zod"]["propValues"]
  - optin: T["_zod"]["optin"]
  - optout: T["_zod"]["optout"]

### 782. $ZodLazy (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodLazyInternals<T>

### 783. $ZodCustomDef (interface)
purpose: Interface definition
extends: $ZodTypeDef, checks.$ZodCheckDef
properties:
  - type: "custom"
  - check: "custom"
  - path: PropertyKey[] | undefined
  - error: errors.$ZodErrorMap | undefined
  - params: Record<string, any> | undefined
  - fn: (arg: O) => unknown

### 784. $ZodCustomInternals (interface)
purpose: Interface definition
extends: $ZodTypeInternals<O, I>, checks.$ZodCheckInternals<O>
properties:
  - def: $ZodCustomDef
  - issc: errors.$ZodIssue
  - isst: never
  - bag: util.LoosePartial<{
    Class: typeof util.Class;
  }>

### 785. $ZodCustom (interface)
purpose: Interface definition
extends: $ZodType
properties:
  - _zod: $ZodCustomInternals<O, I>

### 786. StandardSchemaV1 (interface)
purpose: Interface definition
properties:
  - "~standard": StandardSchemaV1.Props<Input, Output>

### 787. JSONSchemaGeneratorParams (interface)
purpose: Interface definition
properties:
  - metadata: $ZodRegistry<Record<string, any>>
  - target: "draft-7" | "draft-2020-12"
  - unrepresentable: "throw" | "any"
  - override: (ctx: {
    zodSchema: schemas.$ZodTypes;
    jsonSchema: JSONSchema.BaseSchema;
    path: (string | number)[];
  }) => void
  - io: "input" | "output"

### 788. ProcessParams (interface)
purpose: Interface definition
properties:
  - schemaPath: schemas.$ZodType[]
  - path: (string | number)[]

### 789. EmitParams (interface)
purpose: Interface definition
properties:
  - cycles: "ref" | "throw"
  - reused: "ref" | "inline"
  - external: | {
        /**  */
        registry: $ZodRegistry<{ id?: string | undefined }>;
        uri?: ((id: string) => string) | undefined;
        defs: Record<string, JSONSchema.BaseSchema>;
      }
    | undefined

### 790. Seen (interface)
purpose: Interface definition
properties:
  - schema: JSONSchema.BaseSchema
  - def: JSONSchema.BaseSchema
  - defId: string | undefined
  - count: number
  - cycle: (string | number)[] | undefined
  - isParent: boolean | undefined
  - ref: schemas.$ZodType | undefined | null
  - path: (string | number)[] | undefined

### 791. ToJSONSchemaParams (interface)
purpose: Interface definition
extends: Omit<JSONSchemaGeneratorParams & EmitParams, "external">

### 792. RegistryToJSONSchemaParams (interface)
purpose: Interface definition
extends: Omit<JSONSchemaGeneratorParams & EmitParams, "external">
properties:
  - uri: (id: string) => string

### 793. $ZSF (interface)
purpose: Interface definition
properties:
  - $zsf: { version: number }
  - type: string
  - default: unknown
  - fallback: unknown

### 794. $ZSFString (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "string"
  - min_length: number
  - max_length: number
  - pattern: string

### 795. $ZSFNumber (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "number"
  - format: NumberTypes
  - minimum: number
  - maximum: number
  - multiple_of: number

### 796. $ZSFBoolean (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "boolean"

### 797. $ZSFNull (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "null"

### 798. $ZSFUndefined (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "undefined"

### 799. $ZSFOptional (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "optional"
  - inner: T

### 800. $ZSFNever (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "never"

### 801. $ZSFAny (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "any"

### 802. $ZSFEnum (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "enum"
  - elements: Elements

### 803. $ZSFArray (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "array"
  - prefixItems: PrefixItems
  - items: Items

### 804. $ZSFObject (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "object"
  - properties: Properties

### 805. $ZSFLiteral (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "literal"
  - schema: T
  - value: unknown

### 806. $ZSFUnion (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "union"
  - elements: Elements

### 807. $ZSFIntersection (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "intersection"
  - elements: $ZSF[]

### 808. $ZSFMap (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "map"
  - keys: K
  - values: V

### 809. $ZSFConditional (interface)
purpose: Interface definition
extends: $ZSF
properties:
  - type: "conditional"
  - if: If
  - then: Then
  - else: Else

### 810. BelarusianSizable (interface)
purpose: Interface definition
properties:
  - unit: {
    one: string;
    few: string;
    many: string;
  }
  - verb: string

### 811. RussianSizable (interface)
purpose: Interface definition
properties:
  - unit: {
    one: string;
    few: string;
    many: string;
  }
  - verb: string

### 812. ZodMiniISODateTime (interface)
purpose: Interface definition
extends: schemas.ZodMiniStringFormat<"datetime">
properties:
  - _zod: core.$ZodISODateTimeInternals

### 813. ZodMiniISODate (interface)
purpose: Interface definition
extends: schemas.ZodMiniStringFormat<"date">
properties:
  - _zod: core.$ZodISODateInternals

### 814. ZodMiniISOTime (interface)
purpose: Interface definition
extends: schemas.ZodMiniStringFormat<"time">
properties:
  - _zod: core.$ZodISOTimeInternals

### 815. ZodMiniISODuration (interface)
purpose: Interface definition
extends: schemas.ZodMiniStringFormat<"duration">
properties:
  - _zod: core.$ZodISODurationInternals

### 816. ZodMiniType (interface)
purpose: Interface definition
extends: core.$ZodType<Output, Input, Internals>
methods:
  - check(checks): this
  - clone(def, params): this
  - register(registry, meta): this
  - brand(value): PropertyKey extends T ? this : this & Record<"_zod", Record<"output", core.output<this> & core.$brand<T>>>
  - parse(data, params): core.output<this>
  - safeParse(data, params): util.SafeParseResult<core.output<this>>
  - parseAsync(data, params): Promise<core.output<this>>
  - safeParseAsync(data, params): Promise<util.SafeParseResult<core.output<this>>>
properties:
  - def: Internals["def"]

### 817. _ZodMiniType (interface)
purpose: Interface definition
extends: ZodMiniType<any, any, Internals>

### 818. _ZodMiniString (interface)
purpose: Interface definition
extends: _ZodMiniType<T>, core.$ZodString<T["input"]>
properties:
  - _zod: T

### 819. ZodMiniString (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodStringInternals<Input>>, core.$ZodString<Input>

### 820. ZodMiniStringFormat (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodStringFormatInternals<Format>>, core.$ZodStringFormat<Format>

### 821. ZodMiniEmail (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodEmailInternals>

### 822. ZodMiniGUID (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodGUIDInternals>

### 823. ZodMiniUUID (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodUUIDInternals>

### 824. ZodMiniURL (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodURLInternals>

### 825. ZodMiniEmoji (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodEmojiInternals>

### 826. ZodMiniNanoID (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodNanoIDInternals>

### 827. ZodMiniCUID (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodCUIDInternals>

### 828. ZodMiniCUID2 (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodCUID2Internals>

### 829. ZodMiniULID (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodULIDInternals>

### 830. ZodMiniXID (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodXIDInternals>

### 831. ZodMiniKSUID (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodKSUIDInternals>

### 832. ZodMiniIPv4 (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodIPv4Internals>

### 833. ZodMiniIPv6 (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodIPv6Internals>

### 834. ZodMiniCIDRv4 (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodCIDRv4Internals>

### 835. ZodMiniCIDRv6 (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodCIDRv6Internals>

### 836. ZodMiniBase64 (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodBase64Internals>

### 837. ZodMiniBase64URL (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodBase64URLInternals>

### 838. ZodMiniE164 (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodE164Internals>

### 839. ZodMiniJWT (interface)
purpose: Interface definition
extends: _ZodMiniString<core.$ZodJWTInternals>

### 840. ZodMiniCustomStringFormat (interface)
purpose: Interface definition
extends: ZodMiniStringFormat<Format>, core.$ZodCustomStringFormat<Format>
properties:
  - _zod: core.$ZodCustomStringFormatInternals<Format>

### 841. _ZodMiniNumber (interface)
purpose: Interface definition
extends: _ZodMiniType<T>, core.$ZodNumber<T["input"]>
properties:
  - _zod: T

### 842. ZodMiniNumber (interface)
purpose: Interface definition
extends: _ZodMiniNumber<core.$ZodNumberInternals<Input>>, core.$ZodNumber<Input>

### 843. ZodMiniNumberFormat (interface)
purpose: Interface definition
extends: _ZodMiniNumber<core.$ZodNumberFormatInternals>, core.$ZodNumberFormat

### 844. ZodMiniBoolean (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodBooleanInternals<T>>

### 845. ZodMiniBigInt (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodBigIntInternals<T>>, core.$ZodBigInt<T>

### 846. ZodMiniBigIntFormat (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodBigIntFormatInternals>

### 847. ZodMiniSymbol (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodSymbolInternals>

### 848. ZodMiniUndefined (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodUndefinedInternals>

### 849. ZodMiniNull (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodNullInternals>

### 850. ZodMiniAny (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodAnyInternals>

### 851. ZodMiniUnknown (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodUnknownInternals>

### 852. ZodMiniNever (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodNeverInternals>

### 853. ZodMiniVoid (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodVoidInternals>

### 854. ZodMiniDate (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodDateInternals<T>>

### 855. ZodMiniArray (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodArrayInternals<T>>, core.$ZodArray<T>

### 856. ZodMiniObject (interface)
purpose: Interface definition
extends: ZodMiniType<any, any, core.$ZodObjectInternals<Shape, Config>>, core.$ZodObject<Shape, Config>
properties:
  - shape: Shape

### 857. ZodMiniUnion (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodUnionInternals<T>>

### 858. ZodMiniDiscriminatedUnion (interface)
purpose: Interface definition
extends: ZodMiniUnion<Options>
properties:
  - _zod: core.$ZodDiscriminatedUnionInternals<Options>

### 859. ZodMiniIntersection (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodIntersectionInternals<A, B>>

### 860. ZodMiniTuple (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodTupleInternals<T, Rest>>

### 861. ZodMiniRecord (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodRecordInternals<Key, Value>>

### 862. ZodMiniMap (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodMapInternals<Key, Value>>

### 863. ZodMiniSet (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodSetInternals<T>>

### 864. ZodMiniEnum (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodEnumInternals<T>>

### 865. ZodMiniLiteral (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodLiteralInternals<T>>

### 866. ZodMiniFile (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodFileInternals>

### 867. ZodMiniTransform (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodTransformInternals<O, I>>

### 868. ZodMiniOptional (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodOptionalInternals<T>>, core.$ZodOptional<T>

### 869. ZodMiniNullable (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodNullableInternals<T>>

### 870. ZodMiniDefault (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodDefaultInternals<T>>

### 871. ZodMiniPrefault (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodPrefaultInternals<T>>

### 872. ZodMiniNonOptional (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodNonOptionalInternals<T>>

### 873. ZodMiniSuccess (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodSuccessInternals<T>>

### 874. ZodMiniCatch (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodCatchInternals<T>>

### 875. ZodMiniNaN (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodNaNInternals>

### 876. ZodMiniPipe (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodPipeInternals<A, B>>

### 877. ZodMiniReadonly (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodReadonlyInternals<T>>

### 878. ZodMiniTemplateLiteral (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodTemplateLiteralInternals<Template>>

### 879. ZodMiniLazy (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodLazyInternals<T>>

### 880. ZodMiniPromise (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodPromiseInternals<T>>

### 881. ZodMiniCustom (interface)
purpose: Interface definition
extends: _ZodMiniType<core.$ZodCustomInternals<O, I>>

### 882. ZodMiniJSONSchemaInternals (interface)
purpose: Interface definition
extends: _ZodMiniJSONSchemaInternals
properties:
  - output: util.JSONType
  - input: util.JSONType

### 883. ZodMiniJSONSchema (interface)
purpose: Interface definition
extends: _ZodMiniJSONSchema
properties:
  - _zod: ZodMiniJSONSchemaInternals

### 884. Category (interface)
purpose: Interface definition
properties:
  - name: string
  - subcategories: Category[]

### 885. A (interface)
purpose: Interface definition
properties:
  - val: number
  - b: B

### 886. B (interface)
purpose: Interface definition
properties:
  - val: number
  - a: A | undefined

### 887. nativeEnumTest (enum)
values:
  - asdf

### 888. testEnum (enum)
values:
  - A
  - B

### 889. nativeEnumTest (enum)
values:
  - asdf

### 890. testEnum (enum)
values:
  - A
  - B

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
     
  - filePath = __filename
  - Test = z.object({
  f1: z.number(),
})
  - instanceOfTest: Test = {
  f1: 1,
}
  - TestMerge = z
  .object({
    f2: z.string().optional(),
  })
  .merge(Test)
  - instanceOfTestMerge: TestMerge = {
  f1: 1,
  f2: "string",
}
  - TestUnion = z.union([
  z.object({
    f2: z.string().optional(),
  }),
  Test,
])
  - instanceOfTestUnion: TestUnion = {
  f1: 1,
  f2: "string",
}
  - TestPartial = Test.partial()
  - instanceOfTestPartial: TestPartial = {
  f1: 1,
}
  - TestPick = TestMerge.pick({ f1: true })
  - instanceOfTestPick: TestPick = {
  f1: 1,
}
  - TestOmit = TestMerge.omit({ f2: true })
  - instanceOfTestOmit: TestOmit = {
  f1: 1,
}
  - ZodIssueCode = {
  invalid_type: "invalid_type",
  too_big: "too_big",
  too_small: "too_small",
  invalid_format: 
  - ZodError: core.$constructor<ZodError> = core.$constructor("ZodError", initializer)
  - ZodRealError: core.$constructor<ZodError> = core.$constructor("ZodError", initializer, {
  Parent: Error,
})
  - ZodISODateTime: core.$constructor<ZodISODateTime> = core.$constructor(
  "ZodISODateTime",
  (inst, def) => {
    core.$ZodISODateTime.init(inst, def);

  - ZodISODate: core.$constructor<ZodISODate> = core.$constructor("ZodISODate", (inst, def) => {
  core.$ZodISODate.init(inst, def);
  schemas.ZodSt
  - ZodISOTime: core.$constructor<ZodISOTime> = core.$constructor("ZodISOTime", (inst, def) => {
  core.$ZodISOTime.init(inst, def);
  schemas.ZodSt
  - ZodISODuration: core.$constructor<ZodISODuration> = core.$constructor(
  "ZodISODuration",
  (inst, def) => {
    core.$ZodISODuration.init(inst, def);

  - parse: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>,
  _params?: { callee?: core.util.AnyFunc; Err?: core.$ZodErrorClass }
) => core.output<T> = core._parse(ZodRealError) as any
  - parseAsync: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>,
  _params?: { callee?: core.util.AnyFunc; Err?: core.$ZodErrorClass }
) => Promise<core.output<T>> = core._parseAsync(ZodRealError) as any
  - safeParse: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
  // _params?: { callee?: core.util.AnyFunc; Err?: core.$ZodErrorClass }
) => ZodSafeParseResult<core.output<T>> = core._safeParse(ZodRealError) as any
  - safeParseAsync: <T extends core.$ZodType>(
  schema: T,
  value: unknown,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => Promise<ZodSafeParseResult<core.output<T>>> = core._safeParseAsync(ZodRealError) as any
  - ZodType: core.$constructor<ZodType> = core.$constructor("ZodType", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst.def = def;
  O
  - _ZodString: core.$constructor<_ZodString> = core.$constructor("_ZodString", (inst, def) => {
  core.$ZodString.init(inst, def);
  ZodType.init(i
  - ZodString: core.$constructor<ZodString> = core.$constructor("ZodString", (inst, def) => {
  core.$ZodString.init(inst, def);
  _ZodString.init
  - ZodStringFormat: core.$constructor<ZodStringFormat> = core.$constructor(
  "ZodStringFormat",
  (inst, def) => {
    core.$ZodStringFormat.init(inst, def)
  - ZodEmail: core.$constructor<ZodEmail> = core.$constructor("ZodEmail", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodEmai
  - ZodGUID: core.$constructor<ZodGUID> = core.$constructor("ZodGUID", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodGUID.
  - ZodUUID: core.$constructor<ZodUUID> = core.$constructor("ZodUUID", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodUUID.
  - ZodURL: core.$constructor<ZodURL> = core.$constructor("ZodURL", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodURL.in
  - ZodEmoji: core.$constructor<ZodEmoji> = core.$constructor("ZodEmoji", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodEmoj
  - ZodNanoID: core.$constructor<ZodNanoID> = core.$constructor("ZodNanoID", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodNan
  - ZodCUID: core.$constructor<ZodCUID> = core.$constructor("ZodCUID", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodCUID.
  - ZodCUID2: core.$constructor<ZodCUID2> = core.$constructor("ZodCUID2", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodCUID
  - ZodULID: core.$constructor<ZodULID> = core.$constructor("ZodULID", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodULID.
  - ZodXID: core.$constructor<ZodXID> = core.$constructor("ZodXID", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodXID.in
  - ZodKSUID: core.$constructor<ZodKSUID> = core.$constructor("ZodKSUID", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodKSUI
  - ZodIPv4: core.$constructor<ZodIPv4> = core.$constructor("ZodIPv4", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodIPv4.
  - ZodIPv6: core.$constructor<ZodIPv6> = core.$constructor("ZodIPv6", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodIPv6.
  - ZodCIDRv4: core.$constructor<ZodCIDRv4> = core.$constructor("ZodCIDRv4", (inst, def) => {
  core.$ZodCIDRv4.init(inst, def);
  ZodStringFormat
  - ZodCIDRv6: core.$constructor<ZodCIDRv6> = core.$constructor("ZodCIDRv6", (inst, def) => {
  core.$ZodCIDRv6.init(inst, def);
  ZodStringFormat
  - ZodBase64: core.$constructor<ZodBase64> = core.$constructor("ZodBase64", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodBas
  - ZodBase64URL: core.$constructor<ZodBase64URL> = core.$constructor(
  "ZodBase64URL",
  (inst, def) => {
    // ZodStringFormat.init(inst, def);
    
  - ZodE164: core.$constructor<ZodE164> = core.$constructor("ZodE164", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodE164.
  - ZodJWT: core.$constructor<ZodJWT> = core.$constructor("ZodJWT", (inst, def) => {
  // ZodStringFormat.init(inst, def);
  core.$ZodJWT.in
  - ZodCustomStringFormat: core.$constructor<ZodCustomStringFormat> = core.$constructor(
  "ZodCustomStringFormat",
  (inst, def) => {
    // ZodStringFormat.init(inst, d
  - ZodNumber: core.$constructor<ZodNumber> = core.$constructor("ZodNumber", (inst, def) => {
  core.$ZodNumber.init(inst, def);
  ZodType.init(in
  - ZodNumberFormat: core.$constructor<ZodNumberFormat> = core.$constructor(
  "ZodNumberFormat",
  (inst, def) => {
    core.$ZodNumberFormat.init(inst, def)
  - ZodBoolean: core.$constructor<ZodBoolean> = core.$constructor("ZodBoolean", (inst, def) => {
  core.$ZodBoolean.init(inst, def);
  ZodType.init(
  - ZodBigInt: core.$constructor<ZodBigInt> = core.$constructor("ZodBigInt", (inst, def) => {
  core.$ZodBigInt.init(inst, def);
  ZodType.init(in
  - ZodBigIntFormat: core.$constructor<ZodBigIntFormat> = core.$constructor(
  "ZodBigIntFormat",
  (inst, def) => {
    core.$ZodBigIntFormat.init(inst, def)
  - ZodSymbol: core.$constructor<ZodSymbol> = core.$constructor("ZodSymbol", (inst, def) => {
  core.$ZodSymbol.init(inst, def);
  ZodType.init(in
  - ZodUndefined: core.$constructor<ZodUndefined> = core.$constructor(
  "ZodUndefined",
  (inst, def) => {
    core.$ZodUndefined.init(inst, def);
    
  - ZodNull: core.$constructor<ZodNull> = core.$constructor("ZodNull", (inst, def) => {
  core.$ZodNull.init(inst, def);
  ZodType.init(inst, 
  - ZodAny: core.$constructor<ZodAny> = core.$constructor("ZodAny", (inst, def) => {
  core.$ZodAny.init(inst, def);
  ZodType.init(inst, de
  - ZodUnknown: core.$constructor<ZodUnknown> = core.$constructor("ZodUnknown", (inst, def) => {
  core.$ZodUnknown.init(inst, def);
  ZodType.init(
  - ZodNever: core.$constructor<ZodNever> = core.$constructor("ZodNever", (inst, def) => {
  core.$ZodNever.init(inst, def);
  ZodType.init(inst
  - ZodVoid: core.$constructor<ZodVoid> = core.$constructor("ZodVoid", (inst, def) => {
  core.$ZodVoid.init(inst, def);
  ZodType.init(inst, 
  - ZodDate: core.$constructor<ZodDate> = core.$constructor("ZodDate", (inst, def) => {
  core.$ZodDate.init(inst, def);
  ZodType.init(inst, 
  - ZodArray: core.$constructor<ZodArray> = core.$constructor("ZodArray", (inst, def) => {
  core.$ZodArray.init(inst, def);
  ZodType.init(inst
  - ZodObject: core.$constructor<ZodObject> = core.$constructor("ZodObject", (inst, def) => {
  core.$ZodObject.init(inst, def);
  ZodType.init(in
  - ZodUnion: core.$constructor<ZodUnion> = core.$constructor("ZodUnion", (inst, def) => {
  core.$ZodUnion.init(inst, def);
  ZodType.init(inst
  - ZodDiscriminatedUnion: core.$constructor<ZodDiscriminatedUnion> = core.$constructor(
  "ZodDiscriminatedUnion",
  (inst, def) => {
    ZodUnion.init(inst, def);
    c
  - ZodIntersection: core.$constructor<ZodIntersection> = core.$constructor(
  "ZodIntersection",
  (inst, def) => {
    core.$ZodIntersection.init(inst, def)
  - ZodTuple: core.$constructor<ZodTuple> = core.$constructor("ZodTuple", (inst, def) => {
  core.$ZodTuple.init(inst, def);
  ZodType.init(inst
  - ZodRecord: core.$constructor<ZodRecord> = core.$constructor("ZodRecord", (inst, def) => {
  core.$ZodRecord.init(inst, def);
  ZodType.init(in
  - ZodMap: core.$constructor<ZodMap> = core.$constructor("ZodMap", (inst, def) => {
  core.$ZodMap.init(inst, def);
  ZodType.init(inst, de
  - ZodSet: core.$constructor<ZodSet> = core.$constructor("ZodSet", (inst, def) => {
  core.$ZodSet.init(inst, def);
  ZodType.init(inst, de
  - ZodEnum: core.$constructor<ZodEnum> = core.$constructor("ZodEnum", (inst, def) => {
  core.$ZodEnum.init(inst, def);
  ZodType.init(inst, 
  - ZodLiteral: core.$constructor<ZodLiteral> = core.$constructor("ZodLiteral", (inst, def) => {
  core.$ZodLiteral.init(inst, def);
  ZodType.init(
  - ZodFile: core.$constructor<ZodFile> = core.$constructor("ZodFile", (inst, def) => {
  core.$ZodFile.init(inst, def);
  ZodType.init(inst, 
  - ZodTransform: core.$constructor<ZodTransform> = core.$constructor(
  "ZodTransform",
  (inst, def) => {
    core.$ZodTransform.init(inst, def);
    
  - ZodOptional: core.$constructor<ZodOptional> = core.$constructor(
  "ZodOptional",
  (inst, def) => {
    core.$ZodOptional.init(inst, def);
    Zo
  - ZodNullable: core.$constructor<ZodNullable> = core.$constructor(
  "ZodNullable",
  (inst, def) => {
    core.$ZodNullable.init(inst, def);
    Zo
  - ZodDefault: core.$constructor<ZodDefault> = core.$constructor("ZodDefault", (inst, def) => {
  core.$ZodDefault.init(inst, def);
  ZodType.init(
  - ZodPrefault: core.$constructor<ZodPrefault> = core.$constructor(
  "ZodPrefault",
  (inst, def) => {
    core.$ZodPrefault.init(inst, def);
    Zo
  - ZodNonOptional: core.$constructor<ZodNonOptional> = core.$constructor(
  "ZodNonOptional",
  (inst, def) => {
    core.$ZodNonOptional.init(inst, def);

  - ZodSuccess: core.$constructor<ZodSuccess> = core.$constructor("ZodSuccess", (inst, def) => {
  core.$ZodSuccess.init(inst, def);
  ZodType.init(
  - ZodCatch: core.$constructor<ZodCatch> = core.$constructor("ZodCatch", (inst, def) => {
  core.$ZodCatch.init(inst, def);
  ZodType.init(inst
  - ZodNaN: core.$constructor<ZodNaN> = core.$constructor("ZodNaN", (inst, def) => {
  core.$ZodNaN.init(inst, def);
  ZodType.init(inst, de
  - ZodPipe: core.$constructor<ZodPipe> = core.$constructor("ZodPipe", (inst, def) => {
  core.$ZodPipe.init(inst, def);
  ZodType.init(inst, 
  - ZodReadonly: core.$constructor<ZodReadonly> = core.$constructor(
  "ZodReadonly",
  (inst, def) => {
    core.$ZodReadonly.init(inst, def);
    Zo
  - ZodTemplateLiteral: core.$constructor<ZodTemplateLiteral> = core.$constructor(
  "ZodTemplateLiteral",
  (inst, def) => {
    core.$ZodTemplateLiteral.init(inst
  - ZodLazy: core.$constructor<ZodLazy> = core.$constructor("ZodLazy", (inst, def) => {
  core.$ZodLazy.init(inst, def);
  ZodType.init(inst, 
  - ZodPromise: core.$constructor<ZodPromise> = core.$constructor("ZodPromise", (inst, def) => {
  core.$ZodPromise.init(inst, def);
  ZodType.init(
  - ZodCustom: core.$constructor<ZodCustom> = core.$constructor("ZodCustom", (inst, def) => {
  core.$ZodCustom.init(inst, def);
  ZodType.init(in
  - stringbool: (
  _params?: string | core.$ZodStringBoolParams
) => ZodPipe<ZodPipe<ZodString, ZodTransform<boolean, string>>, ZodBoolean> = (...args) =>
  core._stringbool(
    {
      Pipe: ZodPipe,
      Boolean: ZodBoolean,
      String:
  - TimePrecision = {
  Any: null,
  Minute: -1,
  Second: 0,
  Millisecond: 3,
  Microsecond: 6,
} as const
  - $ZodCheck: core.$constructor<$ZodCheck<any>> = core.$constructor(
  "$ZodCheck",
  (inst, def) => {
    inst._zod ??= {} as any;
    inst._zod.def 
  - $ZodCheckLessThan: core.$constructor<$ZodCheckLessThan> = core.$constructor(
  "$ZodCheckLessThan",
  (inst, def) => {
    $ZodCheck.init(inst, def);
    cons
  - $ZodCheckGreaterThan: core.$constructor<$ZodCheckGreaterThan> = core.$constructor(
  "$ZodCheckGreaterThan",
  (inst, def) => {
    $ZodCheck.init(inst, def);
    c
  - $ZodCheckMultipleOf: core.$constructor<$ZodCheckMultipleOf<number | bigint>> = core.$constructor("$ZodCheckMultipleOf", (inst, def) => {
    $ZodCheck.init(inst, def);

    inst._
  - $ZodCheckNumberFormat: core.$constructor<$ZodCheckNumberFormat> = core.$constructor(
  "$ZodCheckNumberFormat",
  (inst, def) => {
    $ZodCheck.init(inst, def); // n
  - $ZodCheckBigIntFormat: core.$constructor<$ZodCheckBigIntFormat> = core.$constructor(
  "$ZodCheckBigIntFormat",
  (inst, def) => {
    $ZodCheck.init(inst, def); // n
  - $ZodCheckMaxSize: core.$constructor<$ZodCheckMaxSize> = core.$constructor(
  "$ZodCheckMaxSize",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    inst
  - $ZodCheckMinSize: core.$constructor<$ZodCheckMinSize> = core.$constructor(
  "$ZodCheckMinSize",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    inst
  - $ZodCheckSizeEquals: core.$constructor<$ZodCheckSizeEquals> = core.$constructor(
  "$ZodCheckSizeEquals",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    i
  - $ZodCheckMaxLength: core.$constructor<$ZodCheckMaxLength> = core.$constructor(
  "$ZodCheckMaxLength",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    in
  - $ZodCheckMinLength: core.$constructor<$ZodCheckMinLength> = core.$constructor(
  "$ZodCheckMinLength",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    in
  - $ZodCheckLengthEquals: core.$constructor<$ZodCheckLengthEquals> = core.$constructor(
  "$ZodCheckLengthEquals",
  (inst, def) => {
    $ZodCheck.init(inst, def);

   
  - $ZodCheckStringFormat: core.$constructor<$ZodCheckStringFormat> = core.$constructor(
  "$ZodCheckStringFormat",
  (inst, def) => {
    $ZodCheck.init(inst, def);

   
  - $ZodCheckRegex: core.$constructor<$ZodCheckRegex> = core.$constructor(
  "$ZodCheckRegex",
  (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
  - $ZodCheckLowerCase: core.$constructor<$ZodCheckLowerCase> = core.$constructor(
  "$ZodCheckLowerCase",
  (inst, def) => {
    def.pattern ??= regexes.lowercase;
  - $ZodCheckUpperCase: core.$constructor<$ZodCheckUpperCase> = core.$constructor(
  "$ZodCheckUpperCase",
  (inst, def) => {
    def.pattern ??= regexes.uppercase;
  - $ZodCheckIncludes: core.$constructor<$ZodCheckIncludes> = core.$constructor(
  "$ZodCheckIncludes",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    con
  - $ZodCheckStartsWith: core.$constructor<$ZodCheckStartsWith> = core.$constructor(
  "$ZodCheckStartsWith",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    c
  - $ZodCheckEndsWith: core.$constructor<$ZodCheckEndsWith> = core.$constructor(
  "$ZodCheckEndsWith",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    con
  - $ZodCheckProperty: core.$constructor<$ZodCheckProperty> = core.$constructor(
  "$ZodCheckProperty",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    ins
  - $ZodCheckMimeType: core.$constructor<$ZodCheckMimeType> = core.$constructor(
  "$ZodCheckMimeType",
  (inst, def) => {
    $ZodCheck.init(inst, def);
    cons
  - $ZodCheckOverwrite: core.$constructor<$ZodCheckOverwrite> = core.$constructor(
  "$ZodCheckOverwrite",
  (inst, def) => {
    $ZodCheck.init(inst, def);

    in
  - globalConfig: $ZodConfig = {}
  - NEVER: never = Object.freeze({
  status: "aborted",
}) as never
  - $brand: unique symbol = Symbol("zod_brand")
  - globalConfig: $ZodConfig = {}
  - $ZodError: $constructor<$ZodError> = $constructor("$ZodError", initializer)
  - $ZodRealError: $constructor<$ZodRealError> = $constructor("$ZodError", initializer, { Parent: Error })
  - _parse: (_Err: $ZodErrorClass) => $Parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx: schemas.ParseContextInternal = _ctx ? Obj
  - parse: $Parse = _parse(errors.$ZodRealError)
  - _parseAsync: (_Err: $ZodErrorClass) => $ParseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx: schemas.ParseContextInternal = _ctx 
  - parseAsync: $ParseAsync = _parseAsync(errors.$ZodRealError)
  - _safeParse: (_Err: $ZodErrorClass) => $SafeParse = (_Err) => (schema, value, _ctx) => {
  const ctx: schemas.ParseContextInternal = _ctx ? { ..._ctx, a
  - safeParse: $SafeParse = _safeParse(errors.$ZodRealError)
  - _safeParseAsync: (_Err: $ZodErrorClass) => $SafeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx: schemas.ParseContextInternal = _ctx ? Object
  - safeParseAsync: $SafeParseAsync = _safeParseAsync(errors.$ZodRealError)
  - cuid: RegExp = /^[cC][^\s-]{8,}$/
  - cuid2: RegExp = /^[0-9a-z]+$/
  - ulid: RegExp = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/
  - xid: RegExp = /^[0-9a-vA-V]{20}$/
  - ksuid: RegExp = /^[A-Za-z0-9]{27}$/
  - nanoid: RegExp = /^[a-zA-Z0-9_-]{21}$/
  - duration: RegExp = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/
  - extendedDuration: RegExp = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[
  - guid: RegExp = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/
  - uuid = (version?: number | undefined): RegExp => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]
  - uuid4: RegExp = uuid(4)
  - uuid6: RegExp = uuid(6)
  - uuid7: RegExp = uuid(7)
  - email: RegExp = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
  - html5Email: RegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[
  - rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3
  - unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u
  - browserEmail: RegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[
  - _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`
  - ipv4: RegExp = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1
  - ipv6: RegExp = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/
  - cidrv4: RegExp = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-
  - cidrv6: RegExp = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-
  - base64: RegExp = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/
  - base64url: RegExp = /^[A-Za-z0-9_-]*$/
  - hostname: RegExp = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/
  - domain: RegExp = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  - e164: RegExp = /^\+(?:[0-9]){6,14}[0-9]$/
  - date: RegExp = new RegExp(`^${dateSource}$`)
  - string = (params?: { minimum?: number | undefined; maximum?: number | undefined }): RegExp => {
  const regex
  - bigint: RegExp = /^\d+n?$/
  - integer: RegExp = /^\d+$/
  - number: RegExp = /^-?\d+(?:\.\d+)?/i
  - boolean: RegExp = /true|false/i
  - lowercase: RegExp = /^[^A-Z]*$/
  - uppercase: RegExp = /^[^a-z]*$/
  - $output: unique symbol = Symbol("ZodOutput")
  - $input: unique symbol = Symbol("ZodInput")
  - globalRegistry: $ZodRegistry<GlobalMeta> = registry<GlobalMeta>()
  - $ZodType: core.$constructor<$ZodType> = core.$constructor("$ZodType", (inst, def) => {
  inst ??= {} as any;

  inst._zod.def = def; // set 
  - $ZodString: core.$constructor<$ZodString> = core.$constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [
  - $ZodStringFormat: core.$constructor<$ZodStringFormat> = core.$constructor(
  "$ZodStringFormat",
  (inst, def): void => {
    // check initialization must c
  - $ZodGUID: core.$constructor<$ZodGUID> = core.$constructor("$ZodGUID", (inst, def): void => {
  def.pattern ??= regexes.guid;
  $ZodStringFor
  - $ZodUUID: core.$constructor<$ZodUUID> = core.$constructor("$ZodUUID", (inst, def): void => {
  if (def.version) {
    const versionMap: Reco
  - $ZodEmail: core.$constructor<$ZodEmail> = core.$constructor(
  "$ZodEmail",
  (inst, def): void => {
    def.pattern ??= regexes.email;
    $Z
  - $ZodURL: core.$constructor<$ZodURL> = core.$constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check 
  - $ZodEmoji: core.$constructor<$ZodEmoji> = core.$constructor(
  "$ZodEmoji",
  (inst, def): void => {
    def.pattern ??= regexes.emoji();
    
  - $ZodNanoID: core.$constructor<$ZodNanoID> = core.$constructor(
  "$ZodNanoID",
  (inst, def): void => {
    def.pattern ??= regexes.nanoid;
    
  - $ZodCUID: core.$constructor<$ZodCUID> = core.$constructor("$ZodCUID", (inst, def): void => {
  def.pattern ??= regexes.cuid;
  $ZodStringFor
  - $ZodCUID2: core.$constructor<$ZodCUID2> = core.$constructor(
  "$ZodCUID2",
  (inst, def): void => {
    def.pattern ??= regexes.cuid2;
    $Z
  - $ZodULID: core.$constructor<$ZodULID> = core.$constructor("$ZodULID", (inst, def): void => {
  def.pattern ??= regexes.ulid;
  $ZodStringFor
  - $ZodXID: core.$constructor<$ZodXID> = core.$constructor("$ZodXID", (inst, def): void => {
  def.pattern ??= regexes.xid;
  $ZodStringForma
  - $ZodKSUID: core.$constructor<$ZodKSUID> = core.$constructor(
  "$ZodKSUID",
  (inst, def): void => {
    def.pattern ??= regexes.ksuid;
    $Z
  - $ZodISODateTime: core.$constructor<$ZodISODateTime> = core.$constructor(
  "$ZodISODateTime",
  (inst, def): void => {
    def.pattern ??= regexes.datetim
  - $ZodISODate: core.$constructor<$ZodISODate> = core.$constructor(
  "$ZodISODate",
  (inst, def): void => {
    def.pattern ??= regexes.date;
    $
  - $ZodISOTime: core.$constructor<$ZodISOTime> = core.$constructor(
  "$ZodISOTime",
  (inst, def): void => {
    def.pattern ??= regexes.time(def);

  - $ZodISODuration: core.$constructor<$ZodISODuration> = core.$constructor(
  "$ZodISODuration",
  (inst, def): void => {
    def.pattern ??= regexes.duratio
  - $ZodIPv4: core.$constructor<$ZodIPv4> = core.$constructor("$ZodIPv4", (inst, def): void => {
  def.pattern ??= regexes.ipv4;
  $ZodStringFor
  - $ZodIPv6: core.$constructor<$ZodIPv6> = core.$constructor("$ZodIPv6", (inst, def): void => {
  def.pattern ??= regexes.ipv6;
  $ZodStringFor
  - $ZodCIDRv4: core.$constructor<$ZodCIDRv4> = core.$constructor(
  "$ZodCIDRv4",
  (inst, def): void => {
    def.pattern ??= regexes.cidrv4;
    
  - $ZodCIDRv6: core.$constructor<$ZodCIDRv6> = core.$constructor(
  "$ZodCIDRv6",
  (inst, def): void => {
    def.pattern ??= regexes.cidrv6; // n
  - $ZodBase64: core.$constructor<$ZodBase64> = core.$constructor(
  "$ZodBase64",
  (inst, def): void => {
    def.pattern ??= regexes.base64;
    
  - $ZodBase64URL: core.$constructor<$ZodBase64URL> = core.$constructor(
  "$ZodBase64URL",
  (inst, def): void => {
    def.pattern ??= regexes.base64url
  - $ZodE164: core.$constructor<$ZodE164> = core.$constructor("$ZodE164", (inst, def): void => {
  def.pattern ??= regexes.e164;
  $ZodStringFor
  - $ZodJWT: core.$constructor<$ZodJWT> = core.$constructor("$ZodJWT", (inst, def): void => {
  $ZodStringFormat.init(inst, def);
  inst._zod.
  - $ZodCustomStringFormat: core.$constructor<$ZodCustomStringFormat> = core.$constructor(
  "$ZodCustomStringFormat",
  (inst, def): void => {
    $ZodStringFormat.init(in
  - $ZodNumber: core.$constructor<$ZodNumber> = core.$constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = i
  - $ZodNumberFormat: core.$constructor<$ZodNumberFormat> = core.$constructor(
  "$ZodNumber",
  (inst, def) => {
    checks.$ZodCheckNumberFormat.init(inst, de
  - $ZodBoolean: core.$constructor<$ZodBoolean> = core.$constructor(
  "$ZodBoolean",
  (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.p
  - $ZodBigInt: core.$constructor<$ZodBigInt> = core.$constructor("$ZodBigInt", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = r
  - $ZodBigIntFormat: core.$constructor<$ZodBigIntFormat> = core.$constructor(
  "$ZodBigInt",
  (inst, def) => {
    checks.$ZodCheckBigIntFormat.init(inst, de
  - $ZodSymbol: core.$constructor<$ZodSymbol> = core.$constructor("$ZodSymbol", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (p
  - $ZodUndefined: core.$constructor<$ZodUndefined> = core.$constructor(
  "$ZodUndefined",
  (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod
  - $ZodNull: core.$constructor<$ZodNull> = core.$constructor("$ZodNull", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = reg
  - $ZodAny: core.$constructor<$ZodAny> = core.$constructor("$ZodAny", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (payl
  - $ZodUnknown: core.$constructor<$ZodUnknown> = core.$constructor(
  "$ZodUnknown",
  (inst, def) => {
    $ZodType.init(inst, def);

    inst._zod.
  - $ZodNever: core.$constructor<$ZodNever> = core.$constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (pay
  - $ZodVoid: core.$constructor<$ZodVoid> = core.$constructor("$ZodVoid", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (pay
  - $ZodDate: core.$constructor<$ZodDate> = core.$constructor("$ZodDate", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (pay
  - $ZodArray: core.$constructor<$ZodArray> = core.$constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (pa
  - $ZodObject: core.$constructor<$ZodObject> = core.$constructor("$ZodObject", (inst, def) => {
  // requires cast because technically $ZodObject d
  - $ZodUnion: core.$constructor<$ZodUnion> = core.$constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);

  util.defineLazy(inst.
  - $ZodDiscriminatedUnion: core.$constructor<$ZodDiscriminatedUnion> = core.$constructor("$ZodDiscriminatedUnion", (inst, def) => {
    $ZodUnion.init(inst, def);

    con
  - $ZodIntersection: core.$constructor<$ZodIntersection> = core.$constructor(
  "$ZodIntersection",
  (inst, def) => {
    $ZodType.init(inst, def);

    inst.
  - $ZodTuple: core.$constructor<$ZodTuple> = core.$constructor("$ZodTuple", (inst, def) => {
  $ZodType.init(inst, def);
  const items = def.item
  - $ZodRecord: core.$constructor<$ZodRecord> = core.$constructor("$ZodRecord", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (p
  - $ZodMap: core.$constructor<$ZodMap> = core.$constructor("$ZodMap", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (payl
  - $ZodSet: core.$constructor<$ZodSet> = core.$constructor("$ZodSet", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (payl
  - $ZodEnum: core.$constructor<$ZodEnum> = core.$constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);

  const values = util.ge
  - $ZodLiteral: core.$constructor<$ZodLiteral> = core.$constructor(
  "$ZodLiteral",
  (inst, def) => {
    $ZodType.init(inst, def);

    inst._zod.
  - $ZodFile: core.$constructor<$ZodFile> = core.$constructor("$ZodFile", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (pay
  - $ZodTransform: core.$constructor<$ZodTransform> = core.$constructor(
  "$ZodTransform",
  (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod
  - $ZodOptional: core.$constructor<$ZodOptional> = core.$constructor(
  "$ZodOptional",
  (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.
  - $ZodNullable: core.$constructor<$ZodNullable> = core.$constructor(
  "$ZodNullable",
  (inst, def) => {
    $ZodType.init(inst, def);
    util.defin
  - $ZodDefault: core.$constructor<$ZodDefault> = core.$constructor(
  "$ZodDefault",
  (inst, def) => {
    $ZodType.init(inst, def);

    // inst._z
  - $ZodPrefault: core.$constructor<$ZodPrefault> = core.$constructor(
  "$ZodPrefault",
  (inst, def) => {
    $ZodType.init(inst, def);

    inst._zod
  - $ZodNonOptional: core.$constructor<$ZodNonOptional> = core.$constructor(
  "$ZodNonOptional",
  (inst, def) => {
    $ZodType.init(inst, def);

    util.d
  - $ZodSuccess: core.$constructor<$ZodSuccess> = core.$constructor(
  "$ZodSuccess",
  (inst, def) => {
    $ZodType.init(inst, def);

    inst._zod.
  - $ZodCatch: core.$constructor<$ZodCatch> = core.$constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "opt
  - $ZodNaN: core.$constructor<$ZodNaN> = core.$constructor("$ZodNaN", (inst, def) => {
  $ZodType.init(inst, def);

  inst._zod.parse = (payl
  - $ZodPipe: core.$constructor<$ZodPipe> = core.$constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  util.defineLazy(inst._z
  - $ZodReadonly: core.$constructor<$ZodReadonly> = core.$constructor(
  "$ZodReadonly",
  (inst, def) => {
    $ZodType.init(inst, def);
    util.defin
  - $ZodTemplateLiteral: core.$constructor<$ZodTemplateLiteral> = core.$constructor(
  "$ZodTemplateLiteral",
  (inst, def) => {
    $ZodType.init(inst, def);
    con
  - $ZodPromise: core.$constructor<$ZodPromise> = core.$constructor(
  "$ZodPromise",
  (inst, def) => {
    $ZodType.init(inst, def);

    inst._zod.
  - $ZodLazy: core.$constructor<$ZodLazy> = core.$constructor("$ZodLazy", (inst, def) => {
  $ZodType.init(inst, def);

  util.defineLazy(inst._
  - $ZodCustom: core.$constructor<$ZodCustom> = core.$constructor("$ZodCustom", (inst, def) => {
  checks.$ZodCheck.init(inst, def);
  $ZodType.init
  - captureStackTrace: (targetObject: object, constructorOpt?: Function) => void = Error.captureStackTrace
  ? Error.captureStackTrace
  : (..._args) => {}
  - allowsEval: { value: boolean } = cached(() => {
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare"
  - getParsedType = (data: any): ParsedTypes => {
  const t = typeof data;

  switch (t) {
    case "undefined":
      r
  - propertyKeyTypes: Set<string> = new Set(["string", "number", "symbol"])
  - primitiveTypes: Set<string> = new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"])
  - NUMBER_FORMAT_RANGES: Record<checks.$ZodNumberFormats, [number, number]> = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  - BIGINT_FORMAT_RANGES: Record<checks.$ZodBigIntFormats, [bigint, bigint]> = {
  int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("922337203685477580
  - version = {
  major: 4,
  minor: 0,
  patch: 0 as number,
} as const
  - parsedType = (data: any): string => {
  const t = typeof data;

  switch (t) {
    case "number": {
      return 
  - parsedType = (data: any): string => {
  const t = typeof data;

  switch (t) {
    case "number": {
      return 
  - parsedType = (data: any): string => {
  const t = typeof data;

  switch (t) {
    case "number": {
      return 
  - ZodMiniISODateTime: core.$constructor<ZodMiniISODateTime> = core.$constructor(
  "$ZodISODateTime",
  (inst, def) => {
    core.$ZodISODateTime.init(inst, def);
  - ZodMiniISODate: core.$constructor<ZodMiniISODate> = core.$constructor(
  "$ZodISODate",
  (inst, def) => {
    core.$ZodISODate.init(inst, def);
    sch
  - ZodMiniISOTime: core.$constructor<ZodMiniISOTime> = core.$constructor(
  "$ZodISOTime",
  (inst, def) => {
    core.$ZodISOTime.init(inst, def);
    sch
  - ZodMiniISODuration: core.$constructor<ZodMiniISODuration> = core.$constructor(
  "$ZodISODuration",
  (inst, def) => {
    core.$ZodISODuration.init(inst, def);
  - ZodMiniType: core.$constructor<ZodMiniType> = core.$constructor(
  "ZodMiniType",
  (inst, def) => {
    if (!inst._zod) throw new Error("Uninitia
  - ZodMiniString: core.$constructor<ZodMiniString> = core.$constructor(
  "ZodMiniString",
  (inst, def) => {
    core.$ZodString.init(inst, def);
    Zo
  - ZodMiniStringFormat: core.$constructor<ZodMiniStringFormat> = core.$constructor(
  "ZodMiniStringFormat",
  (inst, def) => {
    core.$ZodStringFormat.init(inst, 
  - ZodMiniEmail: core.$constructor<ZodMiniEmail> = core.$constructor(
  "ZodMiniEmail",
  (inst, def) => {
    core.$ZodEmail.init(inst, def);
    ZodM
  - ZodMiniGUID: core.$constructor<ZodMiniGUID> = core.$constructor(
  "ZodMiniGUID",
  (inst, def) => {
    core.$ZodGUID.init(inst, def);
    ZodMin
  - ZodMiniUUID: core.$constructor<ZodMiniUUID> = core.$constructor(
  "ZodMiniUUID",
  (inst, def) => {
    core.$ZodUUID.init(inst, def);
    ZodMin
  - ZodMiniURL: core.$constructor<ZodMiniURL> = core.$constructor("ZodMiniURL", (inst, def) => {
  core.$ZodURL.init(inst, def);
  ZodMiniStringForm
  - ZodMiniEmoji: core.$constructor<ZodMiniEmoji> = core.$constructor(
  "ZodMiniEmoji",
  (inst, def) => {
    core.$ZodEmoji.init(inst, def);
    ZodM
  - ZodMiniNanoID: core.$constructor<ZodMiniNanoID> = core.$constructor(
  "ZodMiniNanoID",
  (inst, def) => {
    core.$ZodNanoID.init(inst, def);
    Zo
  - ZodMiniCUID: core.$constructor<ZodMiniCUID> = core.$constructor(
  "ZodMiniCUID",
  (inst, def) => {
    core.$ZodCUID.init(inst, def);
    ZodMin
  - ZodMiniCUID2: core.$constructor<ZodMiniCUID2> = core.$constructor(
  "ZodMiniCUID2",
  (inst, def) => {
    core.$ZodCUID2.init(inst, def);
    ZodM
  - ZodMiniULID: core.$constructor<ZodMiniULID> = core.$constructor(
  "ZodMiniULID",
  (inst, def) => {
    core.$ZodULID.init(inst, def);
    ZodMin
  - ZodMiniXID: core.$constructor<ZodMiniXID> = core.$constructor("ZodMiniXID", (inst, def) => {
  core.$ZodXID.init(inst, def);
  ZodMiniStringForm
  - ZodMiniKSUID: core.$constructor<ZodMiniKSUID> = core.$constructor(
  "ZodMiniKSUID",
  (inst, def) => {
    core.$ZodKSUID.init(inst, def);
    ZodM
  - ZodMiniIPv4: core.$constructor<ZodMiniIPv4> = core.$constructor(
  "ZodMiniIPv4",
  (inst, def) => {
    core.$ZodIPv4.init(inst, def);
    ZodMin
  - ZodMiniIPv6: core.$constructor<ZodMiniIPv6> = core.$constructor(
  "ZodMiniIPv6",
  (inst, def) => {
    core.$ZodIPv6.init(inst, def);
    ZodMin
  - ZodMiniCIDRv4: core.$constructor<ZodMiniCIDRv4> = core.$constructor(
  "ZodMiniCIDRv4",
  (inst, def) => {
    core.$ZodCIDRv4.init(inst, def);
    Zo
  - ZodMiniCIDRv6: core.$constructor<ZodMiniCIDRv6> = core.$constructor(
  "ZodMiniCIDRv6",
  (inst, def) => {
    core.$ZodCIDRv6.init(inst, def);
    Zo
  - ZodMiniBase64: core.$constructor<ZodMiniBase64> = core.$constructor(
  "ZodMiniBase64",
  (inst, def) => {
    core.$ZodBase64.init(inst, def);
    Zo
  - ZodMiniBase64URL: core.$constructor<ZodMiniBase64URL> = core.$constructor(
  "ZodMiniBase64URL",
  (inst, def) => {
    core.$ZodBase64URL.init(inst, def);

  - ZodMiniE164: core.$constructor<ZodMiniE164> = core.$constructor(
  "ZodMiniE164",
  (inst, def) => {
    core.$ZodE164.init(inst, def);
    ZodMin
  - ZodMiniJWT: core.$constructor<ZodMiniJWT> = core.$constructor("ZodMiniJWT", (inst, def) => {
  core.$ZodJWT.init(inst, def);
  ZodMiniStringForm
  - ZodMiniCustomStringFormat: core.$constructor<ZodMiniCustomStringFormat> = core.$constructor(
  "ZodMiniCustomStringFormat",
  (inst, def) => {
    core.$ZodCustomStringFormat
  - ZodMiniNumber: core.$constructor<ZodMiniNumber> = core.$constructor(
  "ZodMiniNumber",
  (inst, def) => {
    core.$ZodNumber.init(inst, def);
    Zo
  - ZodMiniNumberFormat: core.$constructor<ZodMiniNumberFormat> = core.$constructor(
  "ZodMiniNumberFormat",
  (inst, def) => {
    core.$ZodNumberFormat.init(inst, 
  - ZodMiniBoolean: core.$constructor<ZodMiniBoolean> = core.$constructor(
  "ZodMiniBoolean",
  (inst, def) => {
    core.$ZodBoolean.init(inst, def);
    
  - ZodMiniBigInt: core.$constructor<ZodMiniBigInt> = core.$constructor(
  "ZodMiniBigInt",
  (inst, def) => {
    core.$ZodBigInt.init(inst, def);
    Zo
  - ZodMiniBigIntFormat: core.$constructor<ZodMiniBigIntFormat> = core.$constructor(
  "ZodMiniBigIntFormat",
  (inst, def) => {
    core.$ZodBigIntFormat.init(inst, 
  - ZodMiniSymbol: core.$constructor<ZodMiniSymbol> = core.$constructor(
  "ZodMiniSymbol",
  (inst, def) => {
    core.$ZodSymbol.init(inst, def);
    Zo
  - ZodMiniUndefined: core.$constructor<ZodMiniUndefined> = core.$constructor(
  "ZodMiniUndefined",
  (inst, def) => {
    core.$ZodUndefined.init(inst, def);

  - ZodMiniNull: core.$constructor<ZodMiniNull> = core.$constructor(
  "ZodMiniNull",
  (inst, def) => {
    core.$ZodNull.init(inst, def);
    ZodMin
  - ZodMiniAny: core.$constructor<ZodMiniAny> = core.$constructor("ZodMiniAny", (inst, def) => {
  core.$ZodAny.init(inst, def);
  ZodMiniType.init(
  - ZodMiniUnknown: core.$constructor<ZodMiniUnknown> = core.$constructor(
  "ZodMiniUnknown",
  (inst, def) => {
    core.$ZodUnknown.init(inst, def);
    
  - ZodMiniNever: core.$constructor<ZodMiniNever> = core.$constructor(
  "ZodMiniNever",
  (inst, def) => {
    core.$ZodNever.init(inst, def);
    ZodM
  - ZodMiniVoid: core.$constructor<ZodMiniVoid> = core.$constructor(
  "ZodMiniVoid",
  (inst, def) => {
    core.$ZodVoid.init(inst, def);
    ZodMin
  - ZodMiniDate: core.$constructor<ZodMiniDate> = core.$constructor(
  "ZodMiniDate",
  (inst, def) => {
    core.$ZodDate.init(inst, def);
    ZodMin
  - ZodMiniArray: core.$constructor<ZodMiniArray> = core.$constructor(
  "ZodMiniArray",
  (inst, def) => {
    core.$ZodArray.init(inst, def);
    ZodM
  - ZodMiniObject: core.$constructor<ZodMiniObject> = core.$constructor(
  "ZodMiniObject",
  (inst, def) => {
    core.$ZodObject.init(inst, def);
    Zo
  - ZodMiniUnion: core.$constructor<ZodMiniUnion> = core.$constructor(
  "ZodMiniUnion",
  (inst, def) => {
    core.$ZodUnion.init(inst, def);
    ZodM
  - ZodMiniDiscriminatedUnion: core.$constructor<ZodMiniDiscriminatedUnion> = core.$constructor(
  "ZodMiniDiscriminatedUnion",
  (inst, def) => {
    core.$ZodDiscriminatedUnion
  - ZodMiniIntersection: core.$constructor<ZodMiniIntersection> = core.$constructor(
  "ZodMiniIntersection",
  (inst, def) => {
    core.$ZodIntersection.init(inst, 
  - ZodMiniTuple: core.$constructor<ZodMiniTuple> = core.$constructor(
  "ZodMiniTuple",
  (inst, def) => {
    core.$ZodTuple.init(inst, def);
    ZodM
  - ZodMiniRecord: core.$constructor<ZodMiniRecord> = core.$constructor(
  "ZodMiniRecord",
  (inst, def) => {
    core.$ZodRecord.init(inst, def);
    Zo
  - ZodMiniMap: core.$constructor<ZodMiniMap> = core.$constructor("ZodMiniMap", (inst, def) => {
  core.$ZodMap.init(inst, def);
  ZodMiniType.init(
  - ZodMiniSet: core.$constructor<ZodMiniSet> = core.$constructor("ZodMiniSet", (inst, def) => {
  core.$ZodSet.init(inst, def);
  ZodMiniType.init(
  - ZodMiniEnum: core.$constructor<ZodMiniEnum> = core.$constructor(
  "ZodMiniEnum",
  (inst, def) => {
    core.$ZodEnum.init(inst, def);
    ZodMin
  - ZodMiniLiteral: core.$constructor<ZodMiniLiteral> = core.$constructor(
  "ZodMiniLiteral",
  (inst, def) => {
    core.$ZodLiteral.init(inst, def);
    
  - ZodMiniFile: core.$constructor<ZodMiniFile> = core.$constructor(
  "ZodMiniFile",
  (inst, def) => {
    core.$ZodFile.init(inst, def);
    ZodMin
  - ZodMiniTransform: core.$constructor<ZodMiniTransform> = core.$constructor(
  "ZodMiniTransform",
  (inst, def) => {
    core.$ZodTransform.init(inst, def);

  - ZodMiniOptional: core.$constructor<ZodMiniOptional> = core.$constructor(
  "ZodMiniOptional",
  (inst, def) => {
    core.$ZodOptional.init(inst, def);
  
  - ZodMiniNullable: core.$constructor<ZodMiniNullable> = core.$constructor(
  "ZodMiniNullable",
  (inst, def) => {
    core.$ZodNullable.init(inst, def);
  
  - ZodMiniDefault: core.$constructor<ZodMiniDefault> = core.$constructor(
  "ZodMiniDefault",
  (inst, def) => {
    core.$ZodDefault.init(inst, def);
    
  - ZodMiniPrefault: core.$constructor<ZodMiniPrefault> = core.$constructor(
  "ZodMiniPrefault",
  (inst, def) => {
    core.$ZodPrefault.init(inst, def);
  
  - ZodMiniNonOptional: core.$constructor<ZodMiniNonOptional> = core.$constructor(
  "ZodMiniNonOptional",
  (inst, def) => {
    core.$ZodNonOptional.init(inst, de
  - ZodMiniSuccess: core.$constructor<ZodMiniSuccess> = core.$constructor(
  "ZodMiniSuccess",
  (inst, def) => {
    core.$ZodSuccess.init(inst, def);
    
  - ZodMiniCatch: core.$constructor<ZodMiniCatch> = core.$constructor(
  "ZodMiniCatch",
  (inst, def) => {
    core.$ZodCatch.init(inst, def);
    ZodM
  - ZodMiniNaN: core.$constructor<ZodMiniNaN> = core.$constructor("ZodMiniNaN", (inst, def) => {
  core.$ZodNaN.init(inst, def);
  ZodMiniType.init(
  - ZodMiniPipe: core.$constructor<ZodMiniPipe> = core.$constructor(
  "ZodMiniPipe",
  (inst, def) => {
    core.$ZodPipe.init(inst, def);
    ZodMin
  - ZodMiniReadonly: core.$constructor<ZodMiniReadonly> = core.$constructor(
  "ZodMiniReadonly",
  (inst, def) => {
    core.$ZodReadonly.init(inst, def);
  
  - ZodMiniTemplateLiteral: core.$constructor<ZodMiniTemplateLiteral> = core.$constructor(
  "ZodMiniTemplateLiteral",
  (inst, def) => {
    core.$ZodTemplateLiteral.init(
  - ZodMiniLazy: core.$constructor<ZodMiniLazy> = core.$constructor(
  "ZodMiniLazy",
  (inst, def) => {
    core.$ZodLazy.init(inst, def);
    ZodMin
  - ZodMiniPromise: core.$constructor<ZodMiniPromise> = core.$constructor(
  "ZodMiniPromise",
  (inst, def) => {
    core.$ZodPromise.init(inst, def);
    
  - ZodMiniCustom: core.$constructor<ZodMiniCustom> = core.$constructor(
  "ZodMiniCustom",
  (inst, def) => {
    core.$ZodCustom.init(inst, def);
    Zo
  - stringbool: (
  _params?: string | core.$ZodStringBoolParams
) => ZodMiniPipe<ZodMiniPipe<ZodMiniString, ZodMiniTransform<boolean, string>>, ZodMiniBoolean> = (...args) =>
  core._stringbool(
    {
      Pipe: ZodMiniPipe,
      Boolean: ZodMiniBoolean,
     

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
  - StandardSchemaV1
  - core
  - infer
  - output
  - input
  - globalRegistry
  - GlobalMeta
  - registry
  - config
  - function
  - $output
  - $input
  - $brand
  - clone
  - regexes
  - treeifyError
  - prettifyError
  - formatError
  - flattenError
  - toJSONSchema
  - TimePrecision
  - NEVER
  - locales
  - ZodISODateTime
  - ZodISODate
  - ZodISOTime
  - ZodISODuration
  - iso
  - ZodCoercedString
  - ZodCoercedNumber
  - ZodCoercedBigInt
  - ZodCoercedBoolean
  - ZodCoercedDate
  - coerce
  - string
  - email
  - guid
  - uuid
  - uuidv4
  - uuidv6
  - uuidv7
  - url
  - emoji
  - nanoid
  - cuid
  - cuid2
  - ulid
  - xid
  - ksuid
  - ipv4
  - ipv6
  - cidrv4
  - cidrv6
  - base64
  - base64url
  - e164
  - jwt
  - stringFormat
  - number
  - int
  - float32
  - float64
  - int32
  - uint32
  - boolean
  - bigint
  - int64
  - uint64
  - symbol
  - any
  - unknown
  - never
  - date
  - array
  - keyof
  - object
  - strictObject
  - looseObject
  - union
  - discriminatedUnion
  - intersection
  - tuple
  - record
  - partialRecord
  - map
  - set
  - nativeEnum
  - literal
  - file
  - transform
  - optional
  - nullable
  - nullish
  - _default
  - prefault
  - nonoptional
  - success
  - nan
  - pipe
  - readonly
  - templateLiteral
  - lazy
  - promise
  - check
  - custom
  - refine
  - superRefine
  - json
  - preprocess
  - RefinementCtx
  - ZodType
  - _ZodType
  - _ZodString
  - ZodString
  - ZodStringFormat
  - ZodEmail
  - ZodGUID
  - ZodUUID
  - ZodURL
  - ZodEmoji
  - ZodNanoID
  - ZodCUID
  - ZodCUID2
  - ZodULID
  - ZodXID
  - ZodKSUID
  - ZodIPv4
  - ZodIPv6
  - ZodCIDRv4
  - ZodCIDRv6
  - ZodBase64
  - ZodBase64URL
  - ZodE164
  - ZodJWT
  - ZodCustomStringFormat
  - _ZodNumber
  - ZodNumber
  - ZodNumberFormat
  - ZodInt
  - ZodFloat32
  - ZodFloat64
  - ZodInt32
  - ZodUInt32
  - _ZodBoolean
  - ZodBoolean
  - _ZodBigInt
  - ZodBigInt
  - ZodBigIntFormat
  - ZodSymbol
  - ZodUndefined
  - undefined
  - ZodNull
  - null
  - ZodAny
  - ZodUnknown
  - ZodNever
  - ZodVoid
  - void
  - _ZodDate
  - ZodDate
  - ZodArray
  - ZodObject
  - ZodUnion
  - ZodDiscriminatedUnion
  - ZodIntersection
  - ZodTuple
  - ZodRecord
  - ZodMap
  - ZodSet
  - ZodEnum
  - enum
  - ZodLiteral
  - ZodFile
  - ZodTransform
  - ZodOptional
  - ZodNullable
  - ZodDefault
  - ZodPrefault
  - ZodNonOptional
  - ZodSuccess
  - ZodCatch
  - catch
  - ZodNaN
  - ZodPipe
  - ZodReadonly
  - ZodTemplateLiteral
  - ZodLazy
  - ZodPromise
  - ZodCustom
  - instanceof
  - stringbool
  - ZodJSONSchemaInternals
  - ZodJSONSchema
  - lt
  - lte
  - gt
  - gte
  - positive
  - negative
  - nonpositive
  - nonnegative
  - multipleOf
  - maxSize
  - minSize
  - size
  - maxLength
  - minLength
  - length
  - regex
  - lowercase
  - uppercase
  - includes
  - startsWith
  - endsWith
  - property
  - mime
  - overwrite
  - normalize
  - trim
  - toLowerCase
  - toUpperCase
  - ZodRealError
  - ZodFlattenedError
  - ZodSafeParseResult
  - ZodSafeParseSuccess
  - ZodSafeParseError
  - parse
  - parseAsync
  - safeParse
  - safeParseAsync
  - TypeOf
  - Infer
  - ZodFirstPartySchemaTypes
  - BRAND
  - ZodTypeAny
  - ZodSchema
  - Schema
  - ZodRawShape
  - ZodMiniISODateTime
  - ZodMiniISODate
  - ZodMiniISOTime
  - ZodMiniISODuration
  - extend
  - merge
  - pick
  - omit
  - partial
  - required
  - catchall
  - ZodMiniType
  - _ZodMiniString
  - ZodMiniString
  - ZodMiniStringFormat
  - ZodMiniEmail
  - ZodMiniGUID
  - ZodMiniUUID
  - ZodMiniURL
  - ZodMiniEmoji
  - ZodMiniNanoID
  - ZodMiniCUID
  - ZodMiniCUID2
  - ZodMiniULID
  - ZodMiniXID
  - ZodMiniKSUID
  - ZodMiniIPv4
  - ZodMiniIPv6
  - ZodMiniCIDRv4
  - ZodMiniCIDRv6
  - ZodMiniBase64
  - ZodMiniBase64URL
  - ZodMiniE164
  - ZodMiniJWT
  - ZodMiniCustomStringFormat
  - ZodMiniNumber
  - ZodMiniNumberFormat
  - ZodMiniBoolean
  - ZodMiniBigInt
  - ZodMiniBigIntFormat
  - ZodMiniSymbol
  - ZodMiniUndefined
  - ZodMiniNull
  - ZodMiniAny
  - ZodMiniUnknown
  - ZodMiniNever
  - ZodMiniVoid
  - ZodMiniDate
  - ZodMiniArray
  - ZodMiniObject
  - RequiredInterfaceShape
  - ZodMiniUnion
  - ZodMiniDiscriminatedUnion
  - ZodMiniIntersection
  - ZodMiniTuple
  - ZodMiniRecord
  - ZodMiniMap
  - ZodMiniSet
  - ZodMiniEnum
  - ZodMiniLiteral
  - ZodMiniFile
  - ZodMiniTransform
  - ZodMiniOptional
  - ZodMiniNullable
  - ZodMiniDefault
  - ZodMiniPrefault
  - ZodMiniNonOptional
  - ZodMiniSuccess
  - ZodMiniCatch
  - ZodMiniNaN
  - ZodMiniPipe
  - ZodMiniReadonly
  - ZodMiniTemplateLiteral
  - ZodMiniLazy
  - ZodMiniPromise
  - ZodMiniCustom
  - ZodMiniJSONSchemaInternals
  - ZodMiniJSONSchema
  - maximum
  - minimum
  - enumUtil
  - errorUtil
  - filePath
  - Test
  - instanceOfTest
  - TestMerge
  - instanceOfTestMerge
  - TestUnion
  - instanceOfTestUnion
  - TestPartial
  - instanceOfTestPartial
  - TestPick
  - instanceOfTestPick
  - TestOmit
  - instanceOfTestOmit
  - Mocker
  - datetime
  - time
  - duration
  - _string
  - _coercedString
  - _email
  - _guid
  - _uuid
  - _uuidv4
  - _uuidv6
  - _uuidv7
  - _url
  - _emoji
  - _nanoid
  - _cuid
  - _cuid2
  - _ulid
  - _xid
  - _ksuid
  - _ipv4
  - _ipv6
  - _cidrv4
  - _cidrv6
  - _base64
  - _base64url
  - _e164
  - _jwt
  - _isoDateTime
  - _isoDate
  - _isoTime
  - _isoDuration
  - _number
  - _coercedNumber
  - _int
  - _float32
  - _float64
  - _int32
  - _uint32
  - _boolean
  - _coercedBoolean
  - _bigint
  - _coercedBigint
  - _int64
  - _uint64
  - _symbol
  - _undefined
  - _null
  - _any
  - _unknown
  - _never
  - _void
  - _date
  - _coercedDate
  - _nan
  - _lt
  - _lte
  - _gt
  - _gte
  - _positive
  - _negative
  - _nonpositive
  - _nonnegative
  - _multipleOf
  - _maxSize
  - _minSize
  - _size
  - _maxLength
  - _minLength
  - _length
  - _regex
  - _lowercase
  - _uppercase
  - _includes
  - _startsWith
  - _endsWith
  - _property
  - _mime
  - _overwrite
  - _normalize
  - _trim
  - _toLowerCase
  - _toUpperCase
  - _array
  - _union
  - _discriminatedUnion
  - _intersection
  - _tuple
  - _record
  - _map
  - _set
  - _enum
  - _nativeEnum
  - _literal
  - _file
  - _transform
  - _optional
  - _nullable
  - _nonoptional
  - _success
  - _catch
  - _pipe
  - _readonly
  - _templateLiteral
  - _lazy
  - _promise
  - _custom
  - _refine
  - _stringbool
  - _stringFormat
  - Params
  - TypeParams
  - CheckParams
  - StringFormatParams
  - CheckStringFormatParams
  - CheckTypeParams
  - $ZodStringParams
  - $ZodStringFormatParams
  - $ZodCheckStringFormatParams
  - $ZodEmailParams
  - $ZodCheckEmailParams
  - $ZodGUIDParams
  - $ZodCheckGUIDParams
  - $ZodUUIDParams
  - $ZodCheckUUIDParams
  - $ZodUUIDv4Params
  - $ZodCheckUUIDv4Params
  - $ZodUUIDv6Params
  - $ZodCheckUUIDv6Params
  - $ZodUUIDv7Params
  - $ZodCheckUUIDv7Params
  - $ZodURLParams
  - $ZodCheckURLParams
  - $ZodEmojiParams
  - $ZodCheckEmojiParams
  - $ZodNanoIDParams
  - $ZodCheckNanoIDParams
  - $ZodCUIDParams
  - $ZodCheckCUIDParams
  - $ZodCUID2Params
  - $ZodCheckCUID2Params
  - $ZodULIDParams
  - $ZodCheckULIDParams
  - $ZodXIDParams
  - $ZodCheckXIDParams
  - $ZodKSUIDParams
  - $ZodCheckKSUIDParams
  - $ZodIPv4Params
  - $ZodCheckIPv4Params
  - $ZodIPv6Params
  - $ZodCheckIPv6Params
  - $ZodCIDRv4Params
  - $ZodCheckCIDRv4Params
  - $ZodCIDRv6Params
  - $ZodCheckCIDRv6Params
  - $ZodBase64Params
  - $ZodCheckBase64Params
  - $ZodBase64URLParams
  - $ZodCheckBase64URLParams
  - $ZodE164Params
  - $ZodCheckE164Params
  - $ZodJWTParams
  - $ZodCheckJWTParams
  - $ZodISODateTimeParams
  - $ZodCheckISODateTimeParams
  - $ZodISODateParams
  - $ZodCheckISODateParams
  - $ZodISOTimeParams
  - $ZodCheckISOTimeParams
  - $ZodISODurationParams
  - $ZodCheckISODurationParams
  - $ZodNumberParams
  - $ZodNumberFormatParams
  - $ZodCheckNumberFormatParams
  - $ZodBooleanParams
  - $ZodBigIntParams
  - $ZodBigIntFormatParams
  - $ZodCheckBigIntFormatParams
  - $ZodSymbolParams
  - $ZodUndefinedParams
  - $ZodNullParams
  - $ZodAnyParams
  - $ZodUnknownParams
  - $ZodNeverParams
  - $ZodVoidParams
  - $ZodDateParams
  - $ZodNaNParams
  - $ZodCheckLessThanParams
  - _max
  - $ZodCheckGreaterThanParams
  - _min
  - $ZodCheckMultipleOfParams
  - $ZodCheckMaxSizeParams
  - $ZodCheckMinSizeParams
  - $ZodCheckSizeEqualsParams
  - $ZodCheckMaxLengthParams
  - $ZodCheckMinLengthParams
  - $ZodCheckLengthEqualsParams
  - $ZodCheckRegexParams
  - $ZodCheckLowerCaseParams
  - $ZodCheckUpperCaseParams
  - $ZodCheckIncludesParams
  - $ZodCheckStartsWithParams
  - $ZodCheckEndsWithParams
  - $ZodCheckPropertyParams
  - $ZodCheckMimeTypeParams
  - $ZodArrayParams
  - $ZodObjectParams
  - $ZodUnionParams
  - $ZodTypeDiscriminableInternals
  - $ZodTypeDiscriminable
  - $ZodDiscriminatedUnionParams
  - $ZodIntersectionParams
  - $ZodTupleParams
  - $ZodRecordParams
  - $ZodMapParams
  - $ZodSetParams
  - $ZodEnumParams
  - $ZodLiteralParams
  - $ZodFileParams
  - $ZodTransformParams
  - $ZodOptionalParams
  - $ZodNullableParams
  - $ZodDefaultParams
  - $ZodNonOptionalParams
  - $ZodSuccessParams
  - $ZodCatchParams
  - $ZodPipeParams
  - $ZodReadonlyParams
  - $ZodTemplateLiteralParams
  - $ZodLazyParams
  - $ZodPromiseParams
  - $ZodCustomParams
  - $ZodStringBoolParams
  - $ZodCheckDef
  - $ZodCheckInternals
  - $ZodCheck
  - $ZodCheckLessThanDef
  - $ZodCheckLessThanInternals
  - $ZodCheckLessThan
  - $ZodCheckGreaterThanDef
  - $ZodCheckGreaterThanInternals
  - $ZodCheckGreaterThan
  - $ZodCheckMultipleOfDef
  - $ZodCheckMultipleOfInternals
  - $ZodCheckMultipleOf
  - $ZodNumberFormats
  - $ZodCheckNumberFormatDef
  - $ZodCheckNumberFormatInternals
  - $ZodCheckNumberFormat
  - $ZodBigIntFormats
  - $ZodCheckBigIntFormatDef
  - $ZodCheckBigIntFormatInternals
  - $ZodCheckBigIntFormat
  - $ZodCheckMaxSizeDef
  - $ZodCheckMaxSizeInternals
  - $ZodCheckMaxSize
  - $ZodCheckMinSizeDef
  - $ZodCheckMinSizeInternals
  - $ZodCheckMinSize
  - $ZodCheckSizeEqualsDef
  - $ZodCheckSizeEqualsInternals
  - $ZodCheckSizeEquals
  - $ZodCheckMaxLengthDef
  - $ZodCheckMaxLengthInternals
  - $ZodCheckMaxLength
  - $ZodCheckMinLengthDef
  - $ZodCheckMinLengthInternals
  - $ZodCheckMinLength
  - $ZodCheckLengthEqualsDef
  - $ZodCheckLengthEqualsInternals
  - $ZodCheckLengthEquals
  - $ZodStringFormats
  - $ZodCheckStringFormatDef
  - $ZodCheckStringFormatInternals
  - $ZodCheckStringFormat
  - $ZodCheckRegexDef
  - $ZodCheckRegexInternals
  - $ZodCheckRegex
  - $ZodCheckLowerCaseDef
  - $ZodCheckLowerCaseInternals
  - $ZodCheckLowerCase
  - $ZodCheckUpperCaseDef
  - $ZodCheckUpperCaseInternals
  - $ZodCheckUpperCase
  - $ZodCheckIncludesDef
  - $ZodCheckIncludesInternals
  - $ZodCheckIncludes
  - $ZodCheckStartsWithDef
  - $ZodCheckStartsWithInternals
  - $ZodCheckStartsWith
  - $ZodCheckEndsWithDef
  - $ZodCheckEndsWithInternals
  - $ZodCheckEndsWith
  - $ZodCheckPropertyDef
  - $ZodCheckPropertyInternals
  - $ZodCheckProperty
  - $ZodCheckMimeTypeDef
  - $ZodCheckMimeTypeInternals
  - $ZodCheckMimeType
  - $ZodCheckOverwriteDef
  - $ZodCheckOverwriteInternals
  - $ZodCheckOverwrite
  - $ZodChecks
  - $ZodStringFormatChecks
  - $ZodConfig
  - globalConfig
  - $constructor
  - $ZodBranded
  - $ZodAsyncError
  - Doc
  - toDotPath
  - $ZodIssueBase
  - $ZodIssueInvalidType
  - $ZodIssueTooBig
  - $ZodIssueTooSmall
  - $ZodIssueInvalidStringFormat
  - $ZodIssueNotMultipleOf
  - $ZodIssueUnrecognizedKeys
  - $ZodIssueInvalidUnion
  - $ZodIssueInvalidKey
  - $ZodIssueInvalidElement
  - $ZodIssueInvalidValue
  - $ZodIssueCustom
  - $ZodIssueStringCommonFormats
  - $ZodIssueStringInvalidRegex
  - $ZodIssueStringInvalidJWT
  - $ZodIssueStringStartsWith
  - $ZodIssueStringEndsWith
  - $ZodIssueStringIncludes
  - $ZodStringFormatIssues
  - $ZodIssue
  - $ZodIssueCode
  - $ZodRawIssue
  - $ZodErrorMap
  - $ZodError
  - $ZodRealError
  - $ZodFlattenedError
  - $ZodFormattedError
  - $ZodErrorTree
  - $ZodFunctionDef
  - $ZodFunctionArgs
  - $ZodFunctionIn
  - $ZodFunctionOut
  - $InferInnerFunctionType
  - $InferInnerFunctionTypeAsync
  - $InferOuterFunctionType
  - $InferOuterFunctionTypeAsync
  - $ZodFunction
  - $ZodFunctionParams
  - JSONSchema
  - $ZodErrorClass
  - $Parse
  - _parse
  - $ParseAsync
  - _parseAsync
  - $SafeParse
  - _safeParse
  - $SafeParseAsync
  - _safeParseAsync
  - isValidBase64
  - isValidBase64URL
  - isValidJWT
  - ParseContextInternal
  - ParsePayload
  - CheckFn
  - $ZodTypeDef
  - _$ZodTypeInternals
  - $ZodTypeInternals
  - $ZodStandardSchema
  - SomeType
  - $ZodType
  - _$ZodType
  - $ZodStringDef
  - $ZodStringInternals
  - $ZodString
  - $ZodStringFormatDef
  - $ZodStringFormatInternals
  - $ZodStringFormat
  - $ZodGUIDDef
  - $ZodGUIDInternals
  - $ZodGUID
  - $ZodUUIDDef
  - $ZodUUIDInternals
  - $ZodUUID
  - $ZodEmailDef
  - $ZodEmailInternals
  - $ZodEmail
  - $ZodURLDef
  - $ZodURLInternals
  - $ZodURL
  - $ZodEmojiDef
  - $ZodEmojiInternals
  - $ZodEmoji
  - $ZodNanoIDDef
  - $ZodNanoIDInternals
  - $ZodNanoID
  - $ZodCUIDDef
  - $ZodCUIDInternals
  - $ZodCUID
  - $ZodCUID2Def
  - $ZodCUID2Internals
  - $ZodCUID2
  - $ZodULIDDef
  - $ZodULIDInternals
  - $ZodULID
  - $ZodXIDDef
  - $ZodXIDInternals
  - $ZodXID
  - $ZodKSUIDDef
  - $ZodKSUIDInternals
  - $ZodKSUID
  - $ZodISODateTimeDef
  - $ZodISODateTimeInternals
  - $ZodISODateTime
  - $ZodISODateDef
  - $ZodISODateInternals
  - $ZodISODate
  - $ZodISOTimeDef
  - $ZodISOTimeInternals
  - $ZodISOTime
  - $ZodISODurationDef
  - $ZodISODurationInternals
  - $ZodISODuration
  - $ZodIPv4Def
  - $ZodIPv4Internals
  - $ZodIPv4
  - $ZodIPv6Def
  - $ZodIPv6Internals
  - $ZodIPv6
  - $ZodCIDRv4Def
  - $ZodCIDRv4Internals
  - $ZodCIDRv4
  - $ZodCIDRv6Def
  - $ZodCIDRv6Internals
  - $ZodCIDRv6
  - $ZodBase64Def
  - $ZodBase64Internals
  - $ZodBase64
  - $ZodBase64URLDef
  - $ZodBase64URLInternals
  - $ZodBase64URL
  - $ZodE164Def
  - $ZodE164Internals
  - $ZodE164
  - $ZodJWTDef
  - $ZodJWTInternals
  - $ZodJWT
  - $ZodCustomStringFormatDef
  - $ZodCustomStringFormatInternals
  - $ZodCustomStringFormat
  - $ZodNumberDef
  - $ZodNumberInternals
  - $ZodNumber
  - $ZodNumberFormatDef
  - $ZodNumberFormatInternals
  - $ZodNumberFormat
  - $ZodBooleanDef
  - $ZodBooleanInternals
  - $ZodBoolean
  - $ZodBigIntDef
  - $ZodBigIntInternals
  - $ZodBigInt
  - $ZodBigIntFormatDef
  - $ZodBigIntFormatInternals
  - $ZodBigIntFormat
  - $ZodSymbolDef
  - $ZodSymbolInternals
  - $ZodSymbol
  - $ZodUndefinedDef
  - $ZodUndefinedInternals
  - $ZodUndefined
  - $ZodNullDef
  - $ZodNullInternals
  - $ZodNull
  - $ZodAnyDef
  - $ZodAnyInternals
  - $ZodAny
  - $ZodUnknownDef
  - $ZodUnknownInternals
  - $ZodUnknown
  - $ZodNeverDef
  - $ZodNeverInternals
  - $ZodNever
  - $ZodVoidDef
  - $ZodVoidInternals
  - $ZodVoid
  - $ZodDateDef
  - $ZodDateInternals
  - $ZodDate
  - $ZodArrayDef
  - $ZodArrayInternals
  - $ZodArray
  - $InferObjectOutput
  - $InferObjectInput
  - $ZodObjectConfig
  - $loose
  - $strict
  - $strip
  - $catchall
  - $ZodShape
  - $ZodObjectDef
  - $ZodObjectInternals
  - $ZodLooseShape
  - $ZodObject
  - $InferUnionOutput
  - $InferUnionInput
  - $ZodUnionDef
  - $ZodUnionInternals
  - $ZodUnion
  - $ZodDiscriminatedUnionDef
  - $ZodDiscriminatedUnionInternals
  - $ZodDiscriminatedUnion
  - $ZodIntersectionDef
  - $ZodIntersectionInternals
  - $ZodIntersection
  - $ZodTupleDef
  - $InferTupleInputType
  - $InferTupleOutputType
  - $ZodTupleInternals
  - $ZodTuple
  - $ZodRecordKey
  - $ZodRecordDef
  - $InferZodRecordOutput
  - $InferZodRecordInput
  - $ZodRecordInternals
  - $partial
  - $ZodRecord
  - $ZodMapDef
  - $ZodMapInternals
  - $ZodMap
  - $ZodSetDef
  - $ZodSetInternals
  - $ZodSet
  - $InferEnumOutput
  - $InferEnumInput
  - $ZodEnumDef
  - $ZodEnumInternals
  - $ZodEnum
  - $ZodLiteralDef
  - $ZodLiteralInternals
  - $ZodLiteral
  - $ZodFileDef
  - $ZodFileInternals
  - $ZodFile
  - $ZodTransformDef
  - $ZodTransformInternals
  - $ZodTransform
  - $ZodOptionalDef
  - $ZodOptionalInternals
  - $ZodOptional
  - $ZodNullableDef
  - $ZodNullableInternals
  - $ZodNullable
  - $ZodDefaultDef
  - $ZodDefaultInternals
  - $ZodDefault
  - $ZodPrefaultDef
  - $ZodPrefaultInternals
  - $ZodPrefault
  - $ZodNonOptionalDef
  - $ZodNonOptionalInternals
  - $ZodNonOptional
  - $ZodSuccessDef
  - $ZodSuccessInternals
  - $ZodSuccess
  - $ZodCatchCtx
  - $ZodCatchDef
  - $ZodCatchInternals
  - $ZodCatch
  - $ZodNaNDef
  - $ZodNaNInternals
  - $ZodNaN
  - $ZodPipeDef
  - $ZodPipeInternals
  - $ZodPipe
  - $ZodReadonlyDef
  - $ZodReadonlyInternals
  - $ZodReadonly
  - $ZodTemplateLiteralDef
  - $ZodTemplateLiteralInternals
  - $ZodTemplateLiteral
  - $ZodTemplateLiteralPart
  - ConcatenateTupleOfStrings
  - ConvertPartsToStringTuple
  - ToTemplateLiteral
  - $PartsToTemplateLiteral
  - $ZodPromiseDef
  - $ZodPromiseInternals
  - $ZodPromise
  - $ZodLazyDef
  - $ZodLazyInternals
  - $ZodLazy
  - $ZodCustomDef
  - $ZodCustomInternals
  - $ZodCustom
  - $ZodTypes
  - $ZodStringFormatTypes
  - version
  - $replace
  - $ZodRegistry
  - JSONSchemaMeta
  - JSONSchemaGenerator
  - _JSONSchema
  - BaseSchema
  - ObjectSchema
  - ArraySchema
  - StringSchema
  - NumberSchema
  - IntegerSchema
  - BooleanSchema
  - NullSchema
  - extendedDuration
  - uuid4
  - uuid6
  - uuid7
  - html5Email
  - rfc5322Email
  - unicodeEmail
  - browserEmail
  - hostname
  - domain
  - integer
  - assertEqual
  - assertNotEqual
  - assertIs
  - assertNever
  - assert
  - getEnumValues
  - joinValues
  - jsonStringifyReplacer
  - cached
  - cleanRegex
  - floatSafeRemainder
  - defineLazy
  - assignProp
  - getElementAtPath
  - promiseAllObject
  - randomString
  - esc
  - isObject
  - isPlainObject
  - numKeys
  - escapeRegex
  - normalizeParams
  - createTransparentProxy
  - stringifyPrimitive
  - optionalKeys
  - aborted
  - prefixIssues
  - unwrapMessage
  - finalizeIssue
  - getSizableOrigin
  - getLengthableOrigin
  - issue
  - cleanEnum
  - JSONType
  - JWTAlgorithm
  - IPVersion
  - MimeTypes
  - ParsedTypes
  - AssertEqual
  - AssertNotEqual
  - AssertExtends
  - IsAny
  - Omit
  - OmitKeys
  - MakePartial
  - MakeRequired
  - Exactly
  - NoUndefined
  - Whatever
  - LoosePartial
  - Mask
  - Writeable
  - InexactPartial
  - EmptyObject
  - BuiltIn
  - MakeReadonly
  - SomeObject
  - Identity
  - Flatten
  - Mapped
  - Prettify
  - NoNeverKeys
  - NoNever
  - Extend
  - TupleItems
  - AnyFunc
  - IsProp
  - MaybeAsync
  - KeyOf
  - OmitIndexSignature
  - ExtractIndexSignature
  - Keys
  - SchemaClass
  - EnumValue
  - EnumLike
  - ToEnum
  - KeysEnum
  - KeysArray
  - Literal
  - LiteralArray
  - PrimitiveArray
  - HasSize
  - HasLength
  - Numeric
  - SafeParseResult
  - SafeParseSuccess
  - SafeParseError
  - PropValues
  - PrimitiveSet
  - captureStackTrace
  - allowsEval
  - propertyKeyTypes
  - primitiveTypes
  - EmptyToNever
  - Normalize
  - CleanKey
  - ToCleanMap
  - FromCleanMap
  - NUMBER_FORMAT_RANGES
  - BIGINT_FORMAT_RANGES
  - Constructor
  - Class
  - $ZSF
  - $ZSFString
  - NumberTypes
  - $ZSFNumber
  - $ZSFBoolean
  - $ZSFNull
  - $ZSFUndefined
  - $ZSFOptional
  - $ZSFNever
  - $ZSFAny
  - $ZSFEnum
  - $ZSFArray
  - $ZSFObject
  - $ZSFLiteral
  - $ZSFUnion
  - $ZSFIntersection
  - $ZSFMap
  - $ZSFConditional
  - parsedType
  - ar
  - az
  - be
  - ca
  - cs
  - de
  - en
  - eo
  - es
  - fa
  - fi
  - fr
  - frCA
  - he
  - hu
  - id
  - it
  - ja
  - kh
  - ko
  - mk
  - ms
  - nl
  - no
  - ota
  - ps
  - pl
  - pt
  - ru
  - sl
  - sv
  - ta
  - th
  - tr
  - ua
  - ur
  - vi
  - zhCN
  - zhTW
  - RecursiveA
