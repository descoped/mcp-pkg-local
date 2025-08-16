# typescript Overview

## 📦 Package Information
name: typescript
version: 5.9.2
type: TypeScript is a language for application scale JavaScript development
main: ./lib/typescript.js
license: Apache-2.0
package_manager: npm
type_system: dynamically typed
type_annotations: available
type_definitions: ./lib/typescript.d.ts

## 🔧 Configuration
build_system: npm
environment_variables:
  - TSS_LOG
  - TSS_TRACE
  - LOCALAPPDATA
  - APPDATA
  - USERPROFILE
  - HOMEDRIVE
  - HOMEPATH
  - XDG_CACHE_HOME
  - HOME
  - LOGNAME
  - USER
  - TSC_WATCHFILE
  - TSC_NONPOLLING_WATCHER
  - TSC_WATCHDIRECTORY
  - NODE_INSPECTOR_IPC
  - VSCODE_INSPECTOR_OPTIONS

commands:
  - test: hereby runtests-parallel --light=false
  - test:eslint-rules: hereby run-eslint-rules-tests
  - build: npm run build:compiler && npm run build:tests
  - build:compiler: hereby local
  - build:tests: hereby tests
  - build:tests:notypecheck: hereby tests --no-typecheck
  - clean: hereby clean
  - gulp: hereby
  - lint: hereby lint
  - knip: hereby knip
  - format: dprint fmt
  - setup-hooks: node scripts/link-hooks.mjs

## 🏗️ Core Components

### 1. Iterator
purpose: Class implementation
visibility: private
abstract: true
methods:
  - next(value): IteratorResult<T, TResult>

### 2. SafeArray
purpose: Represents an Automation SAFEARRAY
visibility: private
properties:
  - [private] SafeArray_typekey: SafeArray<T>

### 3. VarDate
purpose: Automation date (VT_DATE)
visibility: private
properties:
  - [private] VarDate_typekey: VarDate

### 4. ClassDecoratorContext (interface)
purpose: Interface definition
methods:
  - addInitializer(initializer): void
properties:
  - kind: "class"
  - name: string | undefined
  - metadata: DecoratorMetadata

### 5. ClassMethodDecoratorContext (interface)
purpose: Interface definition
methods:
  - addInitializer(initializer): void
properties:
  - kind: "method"
  - name: string | symbol
  - static: boolean
  - private: boolean
  - access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;
        /**
         * Gets the current value of the method from the provided object.
         *
         * @example
         * let fn = context.access.get(instance);
         */
        get(object: This): Value;
    }
  - metadata: DecoratorMetadata

### 6. ClassGetterDecoratorContext (interface)
purpose: Interface definition
methods:
  - addInitializer(initializer): void
properties:
  - kind: "getter"
  - name: string | symbol
  - static: boolean
  - private: boolean
  - access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;
        /**
         * Invokes the getter on the provided object.
         *
         * @example
         * let value = context.access.get(instance);
         */
        get(object: This): Value;
    }
  - metadata: DecoratorMetadata

### 7. ClassSetterDecoratorContext (interface)
purpose: Interface definition
methods:
  - addInitializer(initializer): void
properties:
  - kind: "setter"
  - name: string | symbol
  - static: boolean
  - private: boolean
  - access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;
        /**
         * Invokes the setter on the provided object.
         *
         * @example
         * context.access.set(instance, value);
         */
        set(object: This, value: Value): void;
    }
  - metadata: DecoratorMetadata

### 8. ClassAccessorDecoratorContext (interface)
purpose: Interface definition
methods:
  - addInitializer(initializer): void
properties:
  - kind: "accessor"
  - name: string | symbol
  - static: boolean
  - private: boolean
  - access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;

        /**
         * Invokes the getter on the provided object.
         *
         * @example
         * let value = context.access.get(instance);
         */
        get(object: This): Value;

        /**
         * Invokes the setter on the provided object.
         *
         * @example
         * context.access.set(instance, value);
         */
        set(object: This, value: Value): void;
    }
  - metadata: DecoratorMetadata

### 9. ClassAccessorDecoratorTarget (interface)
purpose: Interface definition
methods:
  - get(this): Value
  - set(this, value): void

### 10. ClassAccessorDecoratorResult (interface)
purpose: Interface definition
methods:
  - get(this): Value
  - set(this, value): void
  - init(this, value): Value

### 11. ClassFieldDecoratorContext (interface)
purpose: Interface definition
methods:
  - addInitializer(initializer): void
properties:
  - kind: "field"
  - name: string | symbol
  - static: boolean
  - private: boolean
  - access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;

        /**
         * Gets the value of the field on the provided object.
         */
        get(object: This): Value;

        /**
         * Sets the value of the field on the provided object.
         */
        set(object: This, value: Value): void;
    }
  - metadata: DecoratorMetadata

### 12. FileSystemDirectoryHandleAsyncIterator (interface)
purpose: Interface definition
extends: AsyncIteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.asyncIterator](): FileSystemDirectoryHandleAsyncIterator<T>

### 13. FileSystemDirectoryHandle (interface)
purpose: Interface definition
methods:
  - [Symbol.asyncIterator](): FileSystemDirectoryHandleAsyncIterator<[string, FileSystemHandle]>
  - entries(): FileSystemDirectoryHandleAsyncIterator<[string, FileSystemHandle]>
  - keys(): FileSystemDirectoryHandleAsyncIterator<string>
  - values(): FileSystemDirectoryHandleAsyncIterator<FileSystemHandle>

### 14. ReadableStreamAsyncIterator (interface)
purpose: Interface definition
extends: AsyncIteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.asyncIterator](): ReadableStreamAsyncIterator<T>

### 15. ReadableStream (interface)
purpose: Interface definition
methods:
  - [Symbol.asyncIterator](options): ReadableStreamAsyncIterator<R>
  - values(options): ReadableStreamAsyncIterator<R>

### 16. AudioParam (interface)
purpose: Interface definition
methods:
  - setValueCurveAtTime(values, startTime, duration): AudioParam

### 17. AudioParamMap (interface)
purpose: Interface definition
extends: ReadonlyMap<string, AudioParam>

### 18. BaseAudioContext (interface)
purpose: Interface definition
methods:
  - createIIRFilter(feedforward, feedback): IIRFilterNode
  - createPeriodicWave(real, imag, constraints): PeriodicWave

### 19. CSSKeyframesRule (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<CSSKeyframeRule>

### 20. CSSNumericArray (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<CSSNumericValue>
  - entries(): ArrayIterator<[number, CSSNumericValue]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<CSSNumericValue>

### 21. CSSRuleList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<CSSRule>

### 22. CSSStyleDeclaration (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<string>

### 23. CSSTransformValue (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<CSSTransformComponent>
  - entries(): ArrayIterator<[number, CSSTransformComponent]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<CSSTransformComponent>

### 24. CSSUnparsedValue (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<CSSUnparsedSegment>
  - entries(): ArrayIterator<[number, CSSUnparsedSegment]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<CSSUnparsedSegment>

### 25. Cache (interface)
purpose: Interface definition
methods:
  - addAll(requests): Promise<void>

### 26. CanvasPath (interface)
purpose: Interface definition
methods:
  - roundRect(x, y, w, h, radii): void

### 27. CanvasPathDrawingStyles (interface)
purpose: Interface definition
methods:
  - setLineDash(segments): void

### 28. CookieStoreManager (interface)
purpose: Interface definition
methods:
  - subscribe(subscriptions): Promise<void>
  - unsubscribe(subscriptions): Promise<void>

### 29. CustomStateSet (interface)
purpose: Interface definition
extends: Set<string>

### 30. DOMRectList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<DOMRect>

### 31. DOMStringList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<string>

### 32. DOMTokenList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<string>
  - entries(): ArrayIterator<[number, string]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<string>

### 33. DataTransferItemList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<DataTransferItem>

### 34. EventCounts (interface)
purpose: Interface definition
extends: ReadonlyMap<string, number>

### 35. FileList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<File>

### 36. FontFaceSet (interface)
purpose: Interface definition
extends: Set<FontFace>

### 37. FormDataIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): FormDataIterator<T>

### 38. FormData (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): FormDataIterator<[string, FormDataEntryValue]>
  - entries(): FormDataIterator<[string, FormDataEntryValue]>
  - keys(): FormDataIterator<string>
  - values(): FormDataIterator<FormDataEntryValue>

### 39. HTMLAllCollection (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<Element>

### 40. HTMLCollectionBase (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<Element>

### 41. HTMLCollectionOf (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<T>

### 42. HTMLFormElement (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<Element>

### 43. HTMLSelectElement (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<HTMLOptionElement>

### 44. HeadersIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): HeadersIterator<T>

### 45. Headers (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): HeadersIterator<[string, string]>
  - entries(): HeadersIterator<[string, string]>
  - keys(): HeadersIterator<string>
  - values(): HeadersIterator<string>

### 46. Highlight (interface)
purpose: Interface definition
extends: Set<AbstractRange>

### 47. HighlightRegistry (interface)
purpose: Interface definition
extends: Map<string, Highlight>

### 48. IDBDatabase (interface)
purpose: Interface definition
methods:
  - transaction(storeNames, mode, options): IDBTransaction

### 49. IDBObjectStore (interface)
purpose: Interface definition
methods:
  - createIndex(name, keyPath, options): IDBIndex

### 50. ImageTrackList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<ImageTrack>

### 51. MIDIInputMap (interface)
purpose: Interface definition
extends: ReadonlyMap<string, MIDIInput>

### 52. MIDIOutput (interface)
purpose: Interface definition
methods:
  - send(data, timestamp): void

### 53. MIDIOutputMap (interface)
purpose: Interface definition
extends: ReadonlyMap<string, MIDIOutput>

### 54. MediaKeyStatusMapIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): MediaKeyStatusMapIterator<T>

### 55. MediaKeyStatusMap (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): MediaKeyStatusMapIterator<[BufferSource, MediaKeyStatus]>
  - entries(): MediaKeyStatusMapIterator<[BufferSource, MediaKeyStatus]>
  - keys(): MediaKeyStatusMapIterator<BufferSource>
  - values(): MediaKeyStatusMapIterator<MediaKeyStatus>

### 56. MediaList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<string>

### 57. MessageEvent (interface)
purpose: Interface definition
methods:
  - initMessageEvent(type, bubbles, cancelable, data, origin, lastEventId, source, ports): void

### 58. MimeTypeArray (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<MimeType>

### 59. NamedNodeMap (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<Attr>

### 60. Navigator (interface)
purpose: Interface definition
methods:
  - requestMediaKeySystemAccess(keySystem, supportedConfigurations): Promise<MediaKeySystemAccess>
  - vibrate(pattern): boolean

### 61. NodeList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<Node>
  - entries(): ArrayIterator<[number, Node]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<Node>

### 62. NodeListOf (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<TNode>
  - entries(): ArrayIterator<[number, TNode]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<TNode>

### 63. Plugin (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<MimeType>

### 64. PluginArray (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<Plugin>

### 65. RTCRtpTransceiver (interface)
purpose: Interface definition
methods:
  - setCodecPreferences(codecs): void

### 66. RTCStatsReport (interface)
purpose: Interface definition
extends: ReadonlyMap<string, any>

### 67. SVGLengthList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<SVGLength>

### 68. SVGNumberList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<SVGNumber>

### 69. SVGPointList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<DOMPoint>

### 70. SVGStringList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<string>

### 71. SVGTransformList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<SVGTransform>

### 72. SourceBufferList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<SourceBuffer>

### 73. SpeechRecognitionResult (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<SpeechRecognitionAlternative>

### 74. SpeechRecognitionResultList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<SpeechRecognitionResult>

### 75. StylePropertyMapReadOnlyIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): StylePropertyMapReadOnlyIterator<T>

### 76. StylePropertyMapReadOnly (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): StylePropertyMapReadOnlyIterator<[string, Iterable<CSSStyleValue>]>
  - entries(): StylePropertyMapReadOnlyIterator<[string, Iterable<CSSStyleValue>]>
  - keys(): StylePropertyMapReadOnlyIterator<string>
  - values(): StylePropertyMapReadOnlyIterator<Iterable<CSSStyleValue>>

### 77. StyleSheetList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<CSSStyleSheet>

### 78. SubtleCrypto (interface)
purpose: Interface definition
methods:
  - deriveKey(algorithm, baseKey, derivedKeyType, extractable, keyUsages): Promise<CryptoKey>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKeyPair>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKeyPair>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKey>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKeyPair | CryptoKey>
  - importKey(format, keyData, algorithm, extractable, keyUsages): Promise<CryptoKey>
  - importKey(format, keyData, algorithm, extractable, keyUsages): Promise<CryptoKey>
  - unwrapKey(format, wrappedKey, unwrappingKey, unwrapAlgorithm, unwrappedKeyAlgorithm, extractable, keyUsages): Promise<CryptoKey>

### 79. TextTrackCueList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<TextTrackCue>

### 80. TextTrackList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<TextTrack>

### 81. TouchList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<Touch>

### 82. URLSearchParamsIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): URLSearchParamsIterator<T>

### 83. URLSearchParams (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): URLSearchParamsIterator<[string, string]>
  - entries(): URLSearchParamsIterator<[string, string]>
  - keys(): URLSearchParamsIterator<string>
  - values(): URLSearchParamsIterator<string>

### 84. ViewTransitionTypeSet (interface)
purpose: Interface definition
extends: Set<string>

### 85. WEBGL_draw_buffers (interface)
purpose: Interface definition
methods:
  - drawBuffersWEBGL(buffers): void

### 86. WEBGL_multi_draw (interface)
purpose: Interface definition
methods:
  - multiDrawArraysInstancedWEBGL(mode, firstsList, firstsOffset, countsList, countsOffset, instanceCountsList, instanceCountsOffset, drawcount): void
  - multiDrawArraysWEBGL(mode, firstsList, firstsOffset, countsList, countsOffset, drawcount): void
  - multiDrawElementsInstancedWEBGL(mode, countsList, countsOffset, type, offsetsList, offsetsOffset, instanceCountsList, instanceCountsOffset, drawcount): void
  - multiDrawElementsWEBGL(mode, countsList, countsOffset, type, offsetsList, offsetsOffset, drawcount): void

### 87. WebGL2RenderingContextBase (interface)
purpose: Interface definition
methods:
  - clearBufferfv(buffer, drawbuffer, values, srcOffset): void
  - clearBufferiv(buffer, drawbuffer, values, srcOffset): void
  - clearBufferuiv(buffer, drawbuffer, values, srcOffset): void
  - drawBuffers(buffers): void
  - getActiveUniforms(program, uniformIndices, pname): any
  - getUniformIndices(program, uniformNames): GLuint[] | null
  - invalidateFramebuffer(target, attachments): void
  - invalidateSubFramebuffer(target, attachments, x, y, width, height): void
  - transformFeedbackVaryings(program, varyings, bufferMode): void
  - uniform1uiv(location, data, srcOffset, srcLength): void
  - uniform2uiv(location, data, srcOffset, srcLength): void
  - uniform3uiv(location, data, srcOffset, srcLength): void
  - uniform4uiv(location, data, srcOffset, srcLength): void
  - uniformMatrix2x3fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix2x4fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix3x2fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix3x4fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix4x2fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix4x3fv(location, transpose, data, srcOffset, srcLength): void
  - vertexAttribI4iv(index, values): void
  - vertexAttribI4uiv(index, values): void

### 88. WebGL2RenderingContextOverloads (interface)
purpose: Interface definition
methods:
  - uniform1fv(location, data, srcOffset, srcLength): void
  - uniform1iv(location, data, srcOffset, srcLength): void
  - uniform2fv(location, data, srcOffset, srcLength): void
  - uniform2iv(location, data, srcOffset, srcLength): void
  - uniform3fv(location, data, srcOffset, srcLength): void
  - uniform3iv(location, data, srcOffset, srcLength): void
  - uniform4fv(location, data, srcOffset, srcLength): void
  - uniform4iv(location, data, srcOffset, srcLength): void
  - uniformMatrix2fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix3fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix4fv(location, transpose, data, srcOffset, srcLength): void

### 89. WebGLRenderingContextBase (interface)
purpose: Interface definition
methods:
  - vertexAttrib1fv(index, values): void
  - vertexAttrib2fv(index, values): void
  - vertexAttrib3fv(index, values): void
  - vertexAttrib4fv(index, values): void

### 90. WebGLRenderingContextOverloads (interface)
purpose: Interface definition
methods:
  - uniform1fv(location, v): void
  - uniform1iv(location, v): void
  - uniform2fv(location, v): void
  - uniform2iv(location, v): void
  - uniform3fv(location, v): void
  - uniform3iv(location, v): void
  - uniform4fv(location, v): void
  - uniform4iv(location, v): void
  - uniformMatrix2fv(location, transpose, value): void
  - uniformMatrix3fv(location, transpose, value): void
  - uniformMatrix4fv(location, transpose, value): void

### 91. Map (interface)
purpose: Interface definition
methods:
  - clear(): void
  - delete(key): boolean
  - forEach(callbackfn, thisArg): void
  - get(key): V | undefined
  - has(key): boolean
  - set(key, value): this
properties:
  - size: number

### 92. MapConstructor (interface)
purpose: Interface definition
properties:
  - prototype: Map<any, any>

### 93. ReadonlyMap (interface)
purpose: Interface definition
methods:
  - forEach(callbackfn, thisArg): void
  - get(key): V | undefined
  - has(key): boolean
properties:
  - size: number

### 94. WeakMap (interface)
purpose: Interface definition
methods:
  - delete(key): boolean
  - get(key): V | undefined
  - has(key): boolean
  - set(key, value): this

### 95. WeakMapConstructor (interface)
purpose: Interface definition
properties:
  - prototype: WeakMap<WeakKey, any>

### 96. Set (interface)
purpose: Interface definition
methods:
  - add(value): this
  - clear(): void
  - delete(value): boolean
  - forEach(callbackfn, thisArg): void
  - has(value): boolean
properties:
  - size: number

### 97. SetConstructor (interface)
purpose: Interface definition
properties:
  - prototype: Set<any>

### 98. ReadonlySet (interface)
purpose: Interface definition
methods:
  - forEach(callbackfn, thisArg): void
  - has(value): boolean
properties:
  - size: number

### 99. WeakSet (interface)
purpose: Interface definition
methods:
  - add(value): this
  - delete(value): boolean
  - has(value): boolean

### 100. WeakSetConstructor (interface)
purpose: Interface definition
properties:
  - prototype: WeakSet<WeakKey>

### 101. Array (interface)
purpose: Interface definition
methods:
  - find(predicate, thisArg): S | undefined
  - find(predicate, thisArg): T | undefined
  - findIndex(predicate, thisArg): number
  - fill(value, start, end): this
  - copyWithin(target, start, end): this
  - toLocaleString(locales, options): string

### 102. ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(arrayLike): T[]
  - from(arrayLike, mapfn, thisArg): U[]
  - of(items): T[]

### 103. DateConstructor (interface)
purpose: Interface definition

### 104. Function (interface)
purpose: Interface definition
properties:
  - name: string

### 105. Math (interface)
purpose: Interface definition
methods:
  - clz32(x): number
  - imul(x, y): number
  - sign(x): number
  - log10(x): number
  - log2(x): number
  - log1p(x): number
  - expm1(x): number
  - cosh(x): number
  - sinh(x): number
  - tanh(x): number
  - acosh(x): number
  - asinh(x): number
  - atanh(x): number
  - hypot(values): number
  - trunc(x): number
  - fround(x): number
  - cbrt(x): number

### 106. NumberConstructor (interface)
purpose: Interface definition
methods:
  - isFinite(number): boolean
  - isInteger(number): boolean
  - isNaN(number): boolean
  - isSafeInteger(number): boolean
  - parseFloat(string): number
  - parseInt(string, radix): number
properties:
  - EPSILON: number
  - MAX_SAFE_INTEGER: number
  - MIN_SAFE_INTEGER: number

### 107. ObjectConstructor (interface)
purpose: Interface definition
methods:
  - assign(target, source): T & U
  - assign(target, source1, source2): T & U & V
  - assign(target, source1, source2, source3): T & U & V & W
  - assign(target, sources): any
  - getOwnPropertySymbols(o): symbol[]
  - keys(o): string[]
  - is(value1, value2): boolean
  - setPrototypeOf(o, proto): any

### 108. ReadonlyArray (interface)
purpose: Interface definition
methods:
  - find(predicate, thisArg): S | undefined
  - find(predicate, thisArg): T | undefined
  - findIndex(predicate, thisArg): number
  - toLocaleString(locales, options): string

### 109. RegExp (interface)
purpose: Interface definition
properties:
  - flags: string
  - sticky: boolean
  - unicode: boolean

### 110. RegExpConstructor (interface)
purpose: Interface definition

### 111. String (interface)
purpose: Interface definition
methods:
  - codePointAt(pos): number | undefined
  - includes(searchString, position): boolean
  - endsWith(searchString, endPosition): boolean
  - normalize(form): string
  - normalize(form): string
  - repeat(count): string
  - startsWith(searchString, position): boolean
  - anchor(name): string
  - big(): string
  - blink(): string
  - bold(): string
  - fixed(): string
  - fontcolor(color): string
  - fontsize(size): string
  - fontsize(size): string
  - italics(): string
  - link(url): string
  - small(): string
  - strike(): string
  - sub(): string
  - sup(): string

### 112. StringConstructor (interface)
purpose: Interface definition
methods:
  - fromCodePoint(codePoints): string
  - raw(template, substitutions): string

### 113. Int8Array (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 114. Uint8Array (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 115. Uint8ClampedArray (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 116. Int16Array (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 117. Uint16Array (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 118. Int32Array (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 119. Uint32Array (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 120. Float32Array (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 121. Float64Array (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 122. Generator (interface)
purpose: Interface definition
extends: IteratorObject<T, TReturn, TNext>
methods:
  - next([value]): IteratorResult<T, TReturn>
  - return(value): IteratorResult<T, TReturn>
  - throw(e): IteratorResult<T, TReturn>
  - [Symbol.iterator](): Generator<T, TReturn, TNext>

### 123. GeneratorFunction (interface)
purpose: Interface definition
properties:
  - length: number
  - name: string
  - prototype: Generator

### 124. GeneratorFunctionConstructor (interface)
purpose: Interface definition
properties:
  - length: number
  - name: string
  - prototype: GeneratorFunction

### 125. SymbolConstructor (interface)
purpose: Interface definition
properties:
  - iterator: unique symbol

### 126. IteratorYieldResult (interface)
purpose: Interface definition
properties:
  - done: false
  - value: TYield

### 127. IteratorReturnResult (interface)
purpose: Interface definition
properties:
  - done: true
  - value: TReturn

### 128. Iterator (interface)
purpose: Interface definition
methods:
  - next([value]): IteratorResult<T, TReturn>
  - return(value): IteratorResult<T, TReturn>
  - throw(e): IteratorResult<T, TReturn>

### 129. Iterable (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): Iterator<T, TReturn, TNext>

### 130. IterableIterator (interface)
purpose: Interface definition
extends: Iterator<T, TReturn, TNext>
methods:
  - [Symbol.iterator](): IterableIterator<T, TReturn, TNext>

### 131. IteratorObject (interface)
purpose: Interface definition
extends: Iterator<T, TReturn, TNext>
methods:
  - [Symbol.iterator](): IteratorObject<T, TReturn, TNext>

### 132. ArrayIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): ArrayIterator<T>

### 133. Array (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<T>
  - entries(): ArrayIterator<[number, T]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<T>

### 134. ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(iterable): T[]
  - from(iterable, mapfn, thisArg): U[]

### 135. ReadonlyArray (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<T>
  - entries(): ArrayIterator<[number, T]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<T>

### 136. IArguments (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<any>

### 137. MapIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): MapIterator<T>

### 138. Map (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): MapIterator<[K, V]>
  - entries(): MapIterator<[K, V]>
  - keys(): MapIterator<K>
  - values(): MapIterator<V>

### 139. ReadonlyMap (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): MapIterator<[K, V]>
  - entries(): MapIterator<[K, V]>
  - keys(): MapIterator<K>
  - values(): MapIterator<V>

### 140. MapConstructor (interface)
purpose: Interface definition

### 141. WeakMap (interface)
purpose: Interface definition

### 142. WeakMapConstructor (interface)
purpose: Interface definition

### 143. SetIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): SetIterator<T>

### 144. Set (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): SetIterator<T>
  - entries(): SetIterator<[T, T]>
  - keys(): SetIterator<T>
  - values(): SetIterator<T>

### 145. ReadonlySet (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): SetIterator<T>
  - entries(): SetIterator<[T, T]>
  - keys(): SetIterator<T>
  - values(): SetIterator<T>

### 146. SetConstructor (interface)
purpose: Interface definition

### 147. WeakSet (interface)
purpose: Interface definition

### 148. WeakSetConstructor (interface)
purpose: Interface definition

### 149. Promise (interface)
purpose: Interface definition

### 150. PromiseConstructor (interface)
purpose: Interface definition
methods:
  - all(values): Promise<Awaited<T>[]>
  - race(values): Promise<Awaited<T>>

### 151. StringIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): StringIterator<T>

### 152. String (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): StringIterator<string>

### 153. Int8Array (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>

### 154. Int8ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(elements): Int8Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): Int8Array<ArrayBuffer>

### 155. Uint8Array (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>

### 156. Uint8ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(elements): Uint8Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): Uint8Array<ArrayBuffer>

### 157. Uint8ClampedArray (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>

### 158. Uint8ClampedArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(elements): Uint8ClampedArray<ArrayBuffer>
  - from(elements, mapfn, thisArg): Uint8ClampedArray<ArrayBuffer>

### 159. Int16Array (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>

### 160. Int16ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(elements): Int16Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): Int16Array<ArrayBuffer>

### 161. Uint16Array (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>

### 162. Uint16ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(elements): Uint16Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): Uint16Array<ArrayBuffer>

### 163. Int32Array (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>

### 164. Int32ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(elements): Int32Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): Int32Array<ArrayBuffer>

### 165. Uint32Array (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>

### 166. Uint32ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(elements): Uint32Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): Uint32Array<ArrayBuffer>

### 167. Float32Array (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>

### 168. Float32ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(elements): Float32Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): Float32Array<ArrayBuffer>

### 169. Float64Array (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>

### 170. Float64ArrayConstructor (interface)
purpose: Interface definition
methods:
  - from(elements): Float64Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): Float64Array<ArrayBuffer>

### 171. PromiseConstructor (interface)
purpose: Interface definition
methods:
  - all(values): Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>
  - race(values): Promise<Awaited<T[number]>>
  - reject(reason): Promise<T>
  - resolve(): Promise<void>
  - resolve(value): Promise<Awaited<T>>
  - resolve(value): Promise<Awaited<T>>
properties:
  - prototype: Promise<any>

### 172. ProxyHandler (interface)
purpose: Interface definition
methods:
  - apply(target, thisArg, argArray): any
  - construct(target, argArray, newTarget): object
  - defineProperty(target, property, attributes): boolean
  - deleteProperty(target, p): boolean
  - get(target, p, receiver): any
  - getOwnPropertyDescriptor(target, p): PropertyDescriptor | undefined
  - getPrototypeOf(target): object | null
  - has(target, p): boolean
  - isExtensible(target): boolean
  - ownKeys(target): ArrayLike<string | symbol>
  - preventExtensions(target): boolean
  - set(target, p, newValue, receiver): boolean
  - setPrototypeOf(target, v): boolean

### 173. ProxyConstructor (interface)
purpose: Interface definition
methods:
  - revocable(target, handler): { proxy: T; revoke: () => void; }

### 174. SymbolConstructor (interface)
purpose: Interface definition
methods:
  - for(key): symbol
  - keyFor(sym): string | undefined
properties:
  - prototype: Symbol

### 175. SymbolConstructor (interface)
purpose: Interface definition
properties:
  - hasInstance: unique symbol
  - isConcatSpreadable: unique symbol
  - match: unique symbol
  - replace: unique symbol
  - search: unique symbol
  - species: unique symbol
  - split: unique symbol
  - toPrimitive: unique symbol
  - toStringTag: unique symbol
  - unscopables: unique symbol

### 176. Symbol (interface)
purpose: Interface definition
methods:
  - [Symbol.toPrimitive](hint): symbol
properties:
  - [Symbol.toStringTag]: string

### 177. Array (interface)
purpose: Interface definition
properties:
  - [Symbol.unscopables]: {
        [K in keyof any[]]?: boolean;
    }

### 178. ReadonlyArray (interface)
purpose: Interface definition
properties:
  - [Symbol.unscopables]: {
        [K in keyof readonly any[]]?: boolean;
    }

### 179. Date (interface)
purpose: Interface definition
methods:
  - [Symbol.toPrimitive](hint): string
  - [Symbol.toPrimitive](hint): string
  - [Symbol.toPrimitive](hint): number
  - [Symbol.toPrimitive](hint): string | number

### 180. Map (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: string

### 181. WeakMap (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: string

### 182. Set (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: string

### 183. WeakSet (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: string

### 184. JSON (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: string

### 185. Function (interface)
purpose: Interface definition
methods:
  - [Symbol.hasInstance](value): boolean

### 186. GeneratorFunction (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: string

### 187. Math (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: string

### 188. Promise (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: string

### 189. PromiseConstructor (interface)
purpose: Interface definition
properties:
  - [Symbol.species]: PromiseConstructor

### 190. RegExp (interface)
purpose: Interface definition
methods:
  - [Symbol.match](string): RegExpMatchArray | null
  - [Symbol.replace](string, replaceValue): string
  - [Symbol.replace](string, replacer): string
  - [Symbol.search](string): number
  - [Symbol.split](string, limit): string[]

### 191. RegExpConstructor (interface)
purpose: Interface definition
properties:
  - [Symbol.species]: RegExpConstructor

### 192. String (interface)
purpose: Interface definition
methods:
  - match(matcher): RegExpMatchArray | null
  - replace(searchValue, replaceValue): string
  - replace(searchValue, replacer): string
  - search(searcher): number
  - split(splitter, limit): string[]

### 193. ArrayBuffer (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "ArrayBuffer"

### 194. DataView (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: string

### 195. Int8Array (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "Int8Array"

### 196. Uint8Array (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "Uint8Array"

### 197. Uint8ClampedArray (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "Uint8ClampedArray"

### 198. Int16Array (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "Int16Array"

### 199. Uint16Array (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "Uint16Array"

### 200. Int32Array (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "Int32Array"

### 201. Uint32Array (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "Uint32Array"

### 202. Float32Array (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "Float32Array"

### 203. Float64Array (interface)
purpose: Interface definition
properties:
  - [Symbol.toStringTag]: "Float64Array"

### 204. ArrayConstructor (interface)
purpose: Interface definition
properties:
  - [Symbol.species]: ArrayConstructor

### 205. MapConstructor (interface)
purpose: Interface definition
properties:
  - [Symbol.species]: MapConstructor

### 206. SetConstructor (interface)
purpose: Interface definition
properties:
  - [Symbol.species]: SetConstructor

### 207. ArrayBufferConstructor (interface)
purpose: Interface definition
properties:
  - [Symbol.species]: ArrayBufferConstructor

### 208. Array (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 209. ReadonlyArray (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 210. Int8Array (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 211. Uint8Array (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 212. Uint8ClampedArray (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 213. Int16Array (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 214. Uint16Array (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 215. Int32Array (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 216. Uint32Array (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 217. Float32Array (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 218. Float64Array (interface)
purpose: Interface definition
methods:
  - includes(searchElement, fromIndex): boolean

### 219. ArrayBufferConstructor (interface)
purpose: Interface definition

### 220. DateConstructor (interface)
purpose: Interface definition
methods:
  - UTC(year, monthIndex, date, hours, minutes, seconds, ms): number

### 221. ObjectConstructor (interface)
purpose: Interface definition
methods:
  - values(o): T[]
  - values(o): any[]
  - entries(o): [string, T][]
  - entries(o): [string, any][]
  - getOwnPropertyDescriptors(o): { [P in keyof T]: TypedPropertyDescriptor<T[P]>; } & { [x: string]: PropertyDescriptor; }

### 222. SharedArrayBuffer (interface)
purpose: Interface definition
methods:
  - slice(begin, end): SharedArrayBuffer
properties:
  - byteLength: number
  - [Symbol.toStringTag]: "SharedArrayBuffer"

### 223. SharedArrayBufferConstructor (interface)
purpose: Interface definition
properties:
  - prototype: SharedArrayBuffer
  - [Symbol.species]: SharedArrayBufferConstructor

### 224. ArrayBufferTypes (interface)
purpose: Interface definition
properties:
  - SharedArrayBuffer: SharedArrayBuffer

### 225. Atomics (interface)
purpose: Interface definition
methods:
  - add(typedArray, index, value): number
  - and(typedArray, index, value): number
  - compareExchange(typedArray, index, expectedValue, replacementValue): number
  - exchange(typedArray, index, value): number
  - isLockFree(size): boolean
  - load(typedArray, index): number
  - or(typedArray, index, value): number
  - store(typedArray, index, value): number
  - sub(typedArray, index, value): number
  - wait(typedArray, index, value, timeout): "ok" | "not-equal" | "timed-out"
  - notify(typedArray, index, count): number
  - xor(typedArray, index, value): number
properties:
  - [Symbol.toStringTag]: "Atomics"

### 226. String (interface)
purpose: Interface definition
methods:
  - padStart(maxLength, fillString): string
  - padEnd(maxLength, fillString): string

### 227. Int8ArrayConstructor (interface)
purpose: Interface definition

### 228. Uint8ArrayConstructor (interface)
purpose: Interface definition

### 229. Uint8ClampedArrayConstructor (interface)
purpose: Interface definition

### 230. Int16ArrayConstructor (interface)
purpose: Interface definition

### 231. Uint16ArrayConstructor (interface)
purpose: Interface definition

### 232. Int32ArrayConstructor (interface)
purpose: Interface definition

### 233. Uint32ArrayConstructor (interface)
purpose: Interface definition

### 234. Float32ArrayConstructor (interface)
purpose: Interface definition

### 235. Float64ArrayConstructor (interface)
purpose: Interface definition

### 236. AsyncGenerator (interface)
purpose: Interface definition
extends: AsyncIteratorObject<T, TReturn, TNext>
methods:
  - next([value]): Promise<IteratorResult<T, TReturn>>
  - return(value): Promise<IteratorResult<T, TReturn>>
  - throw(e): Promise<IteratorResult<T, TReturn>>
  - [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>

### 237. AsyncGeneratorFunction (interface)
purpose: Interface definition
properties:
  - length: number
  - name: string
  - prototype: AsyncGenerator

### 238. AsyncGeneratorFunctionConstructor (interface)
purpose: Interface definition
properties:
  - length: number
  - name: string
  - prototype: AsyncGeneratorFunction

### 239. SymbolConstructor (interface)
purpose: Interface definition
properties:
  - asyncIterator: unique symbol

### 240. AsyncIterator (interface)
purpose: Interface definition
methods:
  - next([value]): Promise<IteratorResult<T, TReturn>>
  - return(value): Promise<IteratorResult<T, TReturn>>
  - throw(e): Promise<IteratorResult<T, TReturn>>

### 241. AsyncIterable (interface)
purpose: Interface definition
methods:
  - [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>

### 242. AsyncIterableIterator (interface)
purpose: Interface definition
extends: AsyncIterator<T, TReturn, TNext>
methods:
  - [Symbol.asyncIterator](): AsyncIterableIterator<T, TReturn, TNext>

### 243. AsyncIteratorObject (interface)
purpose: Interface definition
extends: AsyncIterator<T, TReturn, TNext>
methods:
  - [Symbol.asyncIterator](): AsyncIteratorObject<T, TReturn, TNext>

### 244. Promise (interface)
purpose: Interface definition
methods:
  - finally(onfinally): Promise<T>

### 245. RegExpMatchArray (interface)
purpose: Interface definition
properties:
  - groups: {
        [key: string]: string;
    }

### 246. RegExpExecArray (interface)
purpose: Interface definition
properties:
  - groups: {
        [key: string]: string;
    }

### 247. RegExp (interface)
purpose: Interface definition
properties:
  - dotAll: boolean

### 248. ReadonlyArray (interface)
purpose: Interface definition
methods:
  - flatMap(callback, thisArg): U[]
  - flat(this, depth): FlatArray<A, D>[]

### 249. Array (interface)
purpose: Interface definition
methods:
  - flatMap(callback, thisArg): U[]
  - flat(this, depth): FlatArray<A, D>[]

### 250. ObjectConstructor (interface)
purpose: Interface definition
methods:
  - fromEntries(entries): { [k: string]: T; }
  - fromEntries(entries): any

### 251. String (interface)
purpose: Interface definition
methods:
  - trimEnd(): string
  - trimStart(): string
  - trimLeft(): string
  - trimRight(): string

### 252. Symbol (interface)
purpose: Interface definition
properties:
  - description: string | undefined

### 253. BigIntToLocaleStringOptions (interface)
purpose: Interface definition
properties:
  - localeMatcher: string
  - style: string
  - numberingSystem: string
  - unit: string
  - unitDisplay: string
  - currency: string
  - currencyDisplay: string
  - useGrouping: boolean
  - minimumIntegerDigits: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21
  - minimumFractionDigits: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  - maximumFractionDigits: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  - minimumSignificantDigits: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21
  - maximumSignificantDigits: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21
  - notation: string
  - compactDisplay: string

### 254. BigInt (interface)
purpose: Interface definition
methods:
  - toString(radix): string
  - toLocaleString(locales, options): string
  - valueOf(): bigint
properties:
  - [Symbol.toStringTag]: "BigInt"

### 255. BigIntConstructor (interface)
purpose: Interface definition
methods:
  - asIntN(bits, int): bigint
  - asUintN(bits, int): bigint
properties:
  - prototype: BigInt

### 256. BigInt64Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - entries(): ArrayIterator<[number, bigint]>
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): BigInt64Array<ArrayBuffer>
  - find(predicate, thisArg): bigint | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - includes(searchElement, fromIndex): boolean
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - keys(): ArrayIterator<number>
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): BigInt64Array<ArrayBuffer>
  - reduce(callbackfn): bigint
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): bigint
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): BigInt64Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): BigInt64Array<TArrayBuffer>
  - toLocaleString(locales, options): string
  - toString(): string
  - valueOf(): BigInt64Array<TArrayBuffer>
  - values(): ArrayIterator<bigint>
  - [Symbol.iterator](): ArrayIterator<bigint>
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number
  - [Symbol.toStringTag]: "BigInt64Array"

### 257. BigInt64ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): BigInt64Array<ArrayBuffer>
  - from(arrayLike): BigInt64Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): BigInt64Array<ArrayBuffer>
  - from(elements): BigInt64Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): BigInt64Array<ArrayBuffer>
properties:
  - prototype: BigInt64Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 258. BigUint64Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - entries(): ArrayIterator<[number, bigint]>
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): BigUint64Array<ArrayBuffer>
  - find(predicate, thisArg): bigint | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - includes(searchElement, fromIndex): boolean
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - keys(): ArrayIterator<number>
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): BigUint64Array<ArrayBuffer>
  - reduce(callbackfn): bigint
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): bigint
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): BigUint64Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): BigUint64Array<TArrayBuffer>
  - toLocaleString(locales, options): string
  - toString(): string
  - valueOf(): BigUint64Array<TArrayBuffer>
  - values(): ArrayIterator<bigint>
  - [Symbol.iterator](): ArrayIterator<bigint>
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number
  - [Symbol.toStringTag]: "BigUint64Array"

### 259. BigUint64ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): BigUint64Array<ArrayBuffer>
  - from(arrayLike): BigUint64Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): BigUint64Array<ArrayBuffer>
  - from(elements): BigUint64Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): BigUint64Array<ArrayBuffer>
properties:
  - prototype: BigUint64Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 260. DataView (interface)
purpose: Interface definition
methods:
  - getBigInt64(byteOffset, littleEndian): bigint
  - getBigUint64(byteOffset, littleEndian): bigint
  - setBigInt64(byteOffset, value, littleEndian): void
  - setBigUint64(byteOffset, value, littleEndian): void

### 261. Date (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string
  - toLocaleDateString(locales, options): string
  - toLocaleTimeString(locales, options): string

### 262. Number (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 263. PromiseFulfilledResult (interface)
purpose: Interface definition
properties:
  - status: "fulfilled"
  - value: T

### 264. PromiseRejectedResult (interface)
purpose: Interface definition
properties:
  - status: "rejected"
  - reason: any

### 265. PromiseConstructor (interface)
purpose: Interface definition
methods:
  - allSettled(values): Promise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>; }>
  - allSettled(values): Promise<PromiseSettledResult<Awaited<T>>[]>

### 266. Atomics (interface)
purpose: Interface definition
methods:
  - add(typedArray, index, value): bigint
  - and(typedArray, index, value): bigint
  - compareExchange(typedArray, index, expectedValue, replacementValue): bigint
  - exchange(typedArray, index, value): bigint
  - load(typedArray, index): bigint
  - or(typedArray, index, value): bigint
  - store(typedArray, index, value): bigint
  - sub(typedArray, index, value): bigint
  - wait(typedArray, index, value, timeout): "ok" | "not-equal" | "timed-out"
  - notify(typedArray, index, count): number
  - xor(typedArray, index, value): bigint

### 267. String (interface)
purpose: Interface definition
methods:
  - matchAll(regexp): RegExpStringIterator<RegExpExecArray>
  - toLocaleLowerCase(locales): string
  - toLocaleUpperCase(locales): string
  - localeCompare(that, locales, options): number

### 268. SymbolConstructor (interface)
purpose: Interface definition
properties:
  - matchAll: unique symbol

### 269. RegExpStringIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): RegExpStringIterator<T>

### 270. RegExp (interface)
purpose: Interface definition
methods:
  - [Symbol.matchAll](str): RegExpStringIterator<RegExpMatchArray>

### 271. AggregateError (interface)
purpose: Interface definition
extends: Error
properties:
  - errors: any[]

### 272. AggregateErrorConstructor (interface)
purpose: Interface definition
properties:
  - prototype: AggregateError

### 273. PromiseConstructor (interface)
purpose: Interface definition
methods:
  - any(values): Promise<Awaited<T[number]>>
  - any(values): Promise<Awaited<T>>

### 274. String (interface)
purpose: Interface definition
methods:
  - replaceAll(searchValue, replaceValue): string
  - replaceAll(searchValue, replacer): string

### 275. WeakRef (interface)
purpose: Interface definition
methods:
  - deref(): T | undefined
properties:
  - [Symbol.toStringTag]: "WeakRef"

### 276. WeakRefConstructor (interface)
purpose: Interface definition
properties:
  - prototype: WeakRef<any>

### 277. FinalizationRegistry (interface)
purpose: Interface definition
methods:
  - register(target, heldValue, unregisterToken): void
  - unregister(unregisterToken): boolean
properties:
  - [Symbol.toStringTag]: "FinalizationRegistry"

### 278. FinalizationRegistryConstructor (interface)
purpose: Interface definition
properties:
  - prototype: FinalizationRegistry<any>

### 279. Array (interface)
purpose: Interface definition
methods:
  - at(index): T | undefined

### 280. ReadonlyArray (interface)
purpose: Interface definition
methods:
  - at(index): T | undefined

### 281. Int8Array (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined

### 282. Uint8Array (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined

### 283. Uint8ClampedArray (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined

### 284. Int16Array (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined

### 285. Uint16Array (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined

### 286. Int32Array (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined

### 287. Uint32Array (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined

### 288. Float32Array (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined

### 289. Float64Array (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined

### 290. BigInt64Array (interface)
purpose: Interface definition
methods:
  - at(index): bigint | undefined

### 291. BigUint64Array (interface)
purpose: Interface definition
methods:
  - at(index): bigint | undefined

### 292. ErrorOptions (interface)
purpose: Interface definition
properties:
  - cause: unknown

### 293. Error (interface)
purpose: Interface definition
properties:
  - cause: unknown

### 294. ErrorConstructor (interface)
purpose: Interface definition

### 295. EvalErrorConstructor (interface)
purpose: Interface definition

### 296. RangeErrorConstructor (interface)
purpose: Interface definition

### 297. ReferenceErrorConstructor (interface)
purpose: Interface definition

### 298. SyntaxErrorConstructor (interface)
purpose: Interface definition

### 299. TypeErrorConstructor (interface)
purpose: Interface definition

### 300. URIErrorConstructor (interface)
purpose: Interface definition

### 301. AggregateErrorConstructor (interface)
purpose: Interface definition

### 302. ObjectConstructor (interface)
purpose: Interface definition
methods:
  - hasOwn(o, v): boolean

### 303. RegExpMatchArray (interface)
purpose: Interface definition
properties:
  - indices: RegExpIndicesArray

### 304. RegExpExecArray (interface)
purpose: Interface definition
properties:
  - indices: RegExpIndicesArray

### 305. RegExpIndicesArray (interface)
purpose: Interface definition
extends: Array<[number, number]>
properties:
  - groups: {
        [key: string]: [number, number];
    }

### 306. RegExp (interface)
purpose: Interface definition
properties:
  - hasIndices: boolean

### 307. String (interface)
purpose: Interface definition
methods:
  - at(index): string | undefined

### 308. Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): T | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): T[]
  - toSorted(compareFn): T[]
  - toSpliced(start, deleteCount, items): T[]
  - toSpliced(start, deleteCount): T[]
  - with(index, value): T[]

### 309. ReadonlyArray (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): T | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): T[]
  - toSorted(compareFn): T[]
  - toSpliced(start, deleteCount, items): T[]
  - toSpliced(start, deleteCount): T[]
  - with(index, value): T[]

### 310. Int8Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): Int8Array<ArrayBuffer>
  - toSorted(compareFn): Int8Array<ArrayBuffer>
  - with(index, value): Int8Array<ArrayBuffer>

### 311. Uint8Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): Uint8Array<ArrayBuffer>
  - toSorted(compareFn): Uint8Array<ArrayBuffer>
  - with(index, value): Uint8Array<ArrayBuffer>

### 312. Uint8ClampedArray (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): Uint8ClampedArray<ArrayBuffer>
  - toSorted(compareFn): Uint8ClampedArray<ArrayBuffer>
  - with(index, value): Uint8ClampedArray<ArrayBuffer>

### 313. Int16Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): Int16Array<ArrayBuffer>
  - toSorted(compareFn): Int16Array<ArrayBuffer>
  - with(index, value): Int16Array<ArrayBuffer>

### 314. Uint16Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): Uint16Array<ArrayBuffer>
  - toSorted(compareFn): Uint16Array<ArrayBuffer>
  - with(index, value): Uint16Array<ArrayBuffer>

### 315. Int32Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): Int32Array<ArrayBuffer>
  - toSorted(compareFn): Int32Array<ArrayBuffer>
  - with(index, value): Int32Array<ArrayBuffer>

### 316. Uint32Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): Uint32Array<ArrayBuffer>
  - toSorted(compareFn): Uint32Array<ArrayBuffer>
  - with(index, value): Uint32Array<ArrayBuffer>

### 317. Float32Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): Float32Array<ArrayBuffer>
  - toSorted(compareFn): Float32Array<ArrayBuffer>
  - with(index, value): Float32Array<ArrayBuffer>

### 318. Float64Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): Float64Array<ArrayBuffer>
  - toSorted(compareFn): Float64Array<ArrayBuffer>
  - with(index, value): Float64Array<ArrayBuffer>

### 319. BigInt64Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): bigint | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): BigInt64Array<ArrayBuffer>
  - toSorted(compareFn): BigInt64Array<ArrayBuffer>
  - with(index, value): BigInt64Array<ArrayBuffer>

### 320. BigUint64Array (interface)
purpose: Interface definition
methods:
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): bigint | undefined
  - findLastIndex(predicate, thisArg): number
  - toReversed(): BigUint64Array<ArrayBuffer>
  - toSorted(compareFn): BigUint64Array<ArrayBuffer>
  - with(index, value): BigUint64Array<ArrayBuffer>

### 321. WeakKeyTypes (interface)
purpose: Interface definition
properties:
  - symbol: symbol

### 322. ArrayBuffer (interface)
purpose: Interface definition
methods:
  - resize(newByteLength): void
  - transfer(newByteLength): ArrayBuffer
  - transferToFixedLength(newByteLength): ArrayBuffer

### 323. ArrayBufferConstructor (interface)
purpose: Interface definition

### 324. MapConstructor (interface)
purpose: Interface definition
methods:
  - groupBy(items, keySelector): Map<K, T[]>

### 325. ObjectConstructor (interface)
purpose: Interface definition
methods:
  - groupBy(items, keySelector): Partial<Record<K, T[]>>

### 326. PromiseWithResolvers (interface)
purpose: Interface definition
properties:
  - promise: Promise<T>
  - resolve: (value: T | PromiseLike<T>) => void
  - reject: (reason?: any) => void

### 327. PromiseConstructor (interface)
purpose: Interface definition
methods:
  - withResolvers(): PromiseWithResolvers<T>

### 328. RegExp (interface)
purpose: Interface definition
properties:
  - unicodeSets: boolean

### 329. Atomics (interface)
purpose: Interface definition
methods:
  - waitAsync(typedArray, index, value, timeout): { async: false; value: "not-equal" | "timed-out"; } | { async: true; value: Promise<"ok" | "timed-out">; }
  - waitAsync(typedArray, index, value, timeout): { async: false; value: "not-equal" | "timed-out"; } | { async: true; value: Promise<"ok" | "timed-out">; }

### 330. SharedArrayBuffer (interface)
purpose: Interface definition
methods:
  - grow(newByteLength): void

### 331. SharedArrayBufferConstructor (interface)
purpose: Interface definition

### 332. String (interface)
purpose: Interface definition
methods:
  - isWellFormed(): boolean
  - toWellFormed(): string

### 333. Symbol (interface)
purpose: Interface definition
methods:
  - toString(): string
  - valueOf(): symbol

### 334. PropertyDescriptor (interface)
purpose: Interface definition
methods:
  - get(): any
  - set(v): void
properties:
  - configurable: boolean
  - enumerable: boolean
  - value: any
  - writable: boolean

### 335. PropertyDescriptorMap (interface)
purpose: Interface definition

### 336. Object (interface)
purpose: Interface definition
methods:
  - toString(): string
  - toLocaleString(): string
  - valueOf(): Object
  - hasOwnProperty(v): boolean
  - isPrototypeOf(v): boolean
  - propertyIsEnumerable(v): boolean
properties:
  - constructor: Function

### 337. ObjectConstructor (interface)
purpose: Interface definition
methods:
  - getPrototypeOf(o): any
  - getOwnPropertyDescriptor(o, p): PropertyDescriptor | undefined
  - getOwnPropertyNames(o): string[]
  - create(o): any
  - create(o, properties): any
  - defineProperty(o, p, attributes): T
  - defineProperties(o, properties): T
  - seal(o): T
  - freeze(f): T
  - freeze(o): Readonly<T>
  - freeze(o): Readonly<T>
  - preventExtensions(o): T
  - isSealed(o): boolean
  - isFrozen(o): boolean
  - isExtensible(o): boolean
  - keys(o): string[]
properties:
  - prototype: Object

### 338. Function (interface)
purpose: Interface definition
methods:
  - apply(this, thisArg, argArray): any
  - call(this, thisArg, argArray): any
  - bind(this, thisArg, argArray): any
  - toString(): string
properties:
  - prototype: any
  - length: number
  - arguments: any
  - caller: Function

### 339. FunctionConstructor (interface)
purpose: Interface definition
properties:
  - prototype: Function

### 340. CallableFunction (interface)
purpose: Interface definition
extends: Function
methods:
  - apply(this, thisArg): R
  - apply(this, thisArg, args): R
  - call(this, thisArg, args): R
  - bind(this, thisArg): OmitThisParameter<T>
  - bind(this, thisArg, args): (...args: B) => R

### 341. NewableFunction (interface)
purpose: Interface definition
extends: Function
methods:
  - apply(this, thisArg): void
  - apply(this, thisArg, args): void
  - call(this, thisArg, args): void
  - bind(this, thisArg): T
  - bind(this, thisArg, args): new (...args: B) => R

### 342. IArguments (interface)
purpose: Interface definition
properties:
  - length: number
  - callee: Function

### 343. String (interface)
purpose: Interface definition
methods:
  - toString(): string
  - charAt(pos): string
  - charCodeAt(index): number
  - concat(strings): string
  - indexOf(searchString, position): number
  - lastIndexOf(searchString, position): number
  - localeCompare(that): number
  - match(regexp): RegExpMatchArray | null
  - replace(searchValue, replaceValue): string
  - replace(searchValue, replacer): string
  - search(regexp): number
  - slice(start, end): string
  - split(separator, limit): string[]
  - substring(start, end): string
  - toLowerCase(): string
  - toLocaleLowerCase(locales): string
  - toUpperCase(): string
  - toLocaleUpperCase(locales): string
  - trim(): string
  - substr(from, length): string
  - valueOf(): string
properties:
  - length: number

### 344. StringConstructor (interface)
purpose: Interface definition
methods:
  - fromCharCode(codes): string
properties:
  - prototype: String

### 345. Boolean (interface)
purpose: Interface definition
methods:
  - valueOf(): boolean

### 346. BooleanConstructor (interface)
purpose: Interface definition
properties:
  - prototype: Boolean

### 347. Number (interface)
purpose: Interface definition
methods:
  - toString(radix): string
  - toFixed(fractionDigits): string
  - toExponential(fractionDigits): string
  - toPrecision(precision): string
  - valueOf(): number

### 348. NumberConstructor (interface)
purpose: Interface definition
properties:
  - prototype: Number
  - MAX_VALUE: number
  - MIN_VALUE: number
  - NaN: number
  - NEGATIVE_INFINITY: number
  - POSITIVE_INFINITY: number

### 349. TemplateStringsArray (interface)
purpose: Interface definition
extends: ReadonlyArray<string>
properties:
  - raw: readonly string[]

### 350. ImportMeta (interface)
purpose: Interface definition

### 351. ImportCallOptions (interface)
purpose: Interface definition
properties:
  - assert: ImportAssertions
  - with: ImportAttributes

### 352. ImportAssertions (interface)
purpose: Interface definition

### 353. ImportAttributes (interface)
purpose: Interface definition

### 354. Math (interface)
purpose: Interface definition
methods:
  - abs(x): number
  - acos(x): number
  - asin(x): number
  - atan(x): number
  - atan2(y, x): number
  - ceil(x): number
  - cos(x): number
  - exp(x): number
  - floor(x): number
  - log(x): number
  - max(values): number
  - min(values): number
  - pow(x, y): number
  - random(): number
  - round(x): number
  - sin(x): number
  - sqrt(x): number
  - tan(x): number
properties:
  - E: number
  - LN10: number
  - LN2: number
  - LOG2E: number
  - LOG10E: number
  - PI: number
  - SQRT1_2: number
  - SQRT2: number

### 355. Date (interface)
purpose: Interface definition
methods:
  - toString(): string
  - toDateString(): string
  - toTimeString(): string
  - toLocaleString(): string
  - toLocaleDateString(): string
  - toLocaleTimeString(): string
  - valueOf(): number
  - getTime(): number
  - getFullYear(): number
  - getUTCFullYear(): number
  - getMonth(): number
  - getUTCMonth(): number
  - getDate(): number
  - getUTCDate(): number
  - getDay(): number
  - getUTCDay(): number
  - getHours(): number
  - getUTCHours(): number
  - getMinutes(): number
  - getUTCMinutes(): number
  - getSeconds(): number
  - getUTCSeconds(): number
  - getMilliseconds(): number
  - getUTCMilliseconds(): number
  - getTimezoneOffset(): number
  - setTime(time): number
  - setMilliseconds(ms): number
  - setUTCMilliseconds(ms): number
  - setSeconds(sec, ms): number
  - setUTCSeconds(sec, ms): number
  - setMinutes(min, sec, ms): number
  - setUTCMinutes(min, sec, ms): number
  - setHours(hours, min, sec, ms): number
  - setUTCHours(hours, min, sec, ms): number
  - setDate(date): number
  - setUTCDate(date): number
  - setMonth(month, date): number
  - setUTCMonth(month, date): number
  - setFullYear(year, month, date): number
  - setUTCFullYear(year, month, date): number
  - toUTCString(): string
  - toISOString(): string
  - toJSON(key): string

### 356. DateConstructor (interface)
purpose: Interface definition
methods:
  - parse(s): number
  - UTC(year, monthIndex, date, hours, minutes, seconds, ms): number
  - now(): number
properties:
  - prototype: Date

### 357. RegExpMatchArray (interface)
purpose: Interface definition
extends: Array<string>
properties:
  - index: number
  - input: string
  - 0: string

### 358. RegExpExecArray (interface)
purpose: Interface definition
extends: Array<string>
properties:
  - index: number
  - input: string
  - 0: string

### 359. RegExp (interface)
purpose: Interface definition
methods:
  - exec(string): RegExpExecArray | null
  - test(string): boolean
  - compile(pattern, flags): this
properties:
  - source: string
  - global: boolean
  - ignoreCase: boolean
  - multiline: boolean
  - lastIndex: number

### 360. RegExpConstructor (interface)
purpose: Interface definition
properties:
  - "prototype": RegExp
  - "$1": string
  - "$2": string
  - "$3": string
  - "$4": string
  - "$5": string
  - "$6": string
  - "$7": string
  - "$8": string
  - "$9": string
  - "input": string
  - "$_": string
  - "lastMatch": string
  - "$&": string
  - "lastParen": string
  - "$+": string
  - "leftContext": string
  - "$`": string
  - "rightContext": string
  - "$'": string

### 361. Error (interface)
purpose: Interface definition
properties:
  - name: string
  - message: string
  - stack: string

### 362. ErrorConstructor (interface)
purpose: Interface definition
properties:
  - prototype: Error

### 363. EvalError (interface)
purpose: Interface definition
extends: Error

### 364. EvalErrorConstructor (interface)
purpose: Interface definition
extends: ErrorConstructor
properties:
  - prototype: EvalError

### 365. RangeError (interface)
purpose: Interface definition
extends: Error

### 366. RangeErrorConstructor (interface)
purpose: Interface definition
extends: ErrorConstructor
properties:
  - prototype: RangeError

### 367. ReferenceError (interface)
purpose: Interface definition
extends: Error

### 368. ReferenceErrorConstructor (interface)
purpose: Interface definition
extends: ErrorConstructor
properties:
  - prototype: ReferenceError

### 369. SyntaxError (interface)
purpose: Interface definition
extends: Error

### 370. SyntaxErrorConstructor (interface)
purpose: Interface definition
extends: ErrorConstructor
properties:
  - prototype: SyntaxError

### 371. TypeError (interface)
purpose: Interface definition
extends: Error

### 372. TypeErrorConstructor (interface)
purpose: Interface definition
extends: ErrorConstructor
properties:
  - prototype: TypeError

### 373. URIError (interface)
purpose: Interface definition
extends: Error

### 374. URIErrorConstructor (interface)
purpose: Interface definition
extends: ErrorConstructor
properties:
  - prototype: URIError

### 375. JSON (interface)
purpose: Interface definition
methods:
  - parse(text, reviver): any
  - stringify(value, replacer, space): string
  - stringify(value, replacer, space): string

### 376. ReadonlyArray (interface)
purpose: Interface definition
methods:
  - toString(): string
  - toLocaleString(): string
  - concat(items): T[]
  - concat(items): T[]
  - join(separator): string
  - slice(start, end): T[]
  - indexOf(searchElement, fromIndex): number
  - lastIndexOf(searchElement, fromIndex): number
  - every(predicate, thisArg): this is readonly S[]
  - every(predicate, thisArg): boolean
  - some(predicate, thisArg): boolean
  - forEach(callbackfn, thisArg): void
  - map(callbackfn, thisArg): U[]
  - filter(predicate, thisArg): S[]
  - filter(predicate, thisArg): T[]
  - reduce(callbackfn): T
  - reduce(callbackfn, initialValue): T
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): T
  - reduceRight(callbackfn, initialValue): T
  - reduceRight(callbackfn, initialValue): U
properties:
  - length: number

### 377. ConcatArray (interface)
purpose: Interface definition
methods:
  - join(separator): string
  - slice(start, end): T[]
properties:
  - length: number

### 378. Array (interface)
purpose: Interface definition
methods:
  - toString(): string
  - toLocaleString(): string
  - pop(): T | undefined
  - push(items): number
  - concat(items): T[]
  - concat(items): T[]
  - join(separator): string
  - reverse(): T[]
  - shift(): T | undefined
  - slice(start, end): T[]
  - sort(compareFn): this
  - splice(start, deleteCount): T[]
  - splice(start, deleteCount, items): T[]
  - unshift(items): number
  - indexOf(searchElement, fromIndex): number
  - lastIndexOf(searchElement, fromIndex): number
  - every(predicate, thisArg): this is S[]
  - every(predicate, thisArg): boolean
  - some(predicate, thisArg): boolean
  - forEach(callbackfn, thisArg): void
  - map(callbackfn, thisArg): U[]
  - filter(predicate, thisArg): S[]
  - filter(predicate, thisArg): T[]
  - reduce(callbackfn): T
  - reduce(callbackfn, initialValue): T
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): T
  - reduceRight(callbackfn, initialValue): T
  - reduceRight(callbackfn, initialValue): U
properties:
  - length: number

### 379. ArrayConstructor (interface)
purpose: Interface definition
methods:
  - isArray(arg): arg is any[]
properties:
  - prototype: any[]

### 380. TypedPropertyDescriptor (interface)
purpose: Interface definition
properties:
  - enumerable: boolean
  - configurable: boolean
  - writable: boolean
  - value: T
  - get: () => T
  - set: (value: T) => void

### 381. PromiseLike (interface)
purpose: Interface definition
methods:
  - then(onfulfilled, onrejected): PromiseLike<TResult1 | TResult2>

### 382. Promise (interface)
purpose: Interface definition
methods:
  - then(onfulfilled, onrejected): Promise<TResult1 | TResult2>
  - catch(onrejected): Promise<T | TResult>

### 383. ArrayLike (interface)
purpose: Interface definition
properties:
  - length: number

### 384. ThisType (interface)
purpose: Interface definition

### 385. WeakKeyTypes (interface)
purpose: Interface definition
properties:
  - object: object

### 386. ArrayBuffer (interface)
purpose: Interface definition
methods:
  - slice(begin, end): ArrayBuffer
properties:
  - byteLength: number

### 387. ArrayBufferTypes (interface)
purpose: Interface definition
properties:
  - ArrayBuffer: ArrayBuffer

### 388. ArrayBufferConstructor (interface)
purpose: Interface definition
methods:
  - isView(arg): arg is ArrayBufferView
properties:
  - prototype: ArrayBuffer

### 389. ArrayBufferView (interface)
purpose: Interface definition
properties:
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number

### 390. DataView (interface)
purpose: Interface definition
methods:
  - getFloat32(byteOffset, littleEndian): number
  - getFloat64(byteOffset, littleEndian): number
  - getInt8(byteOffset): number
  - getInt16(byteOffset, littleEndian): number
  - getInt32(byteOffset, littleEndian): number
  - getUint8(byteOffset): number
  - getUint16(byteOffset, littleEndian): number
  - getUint32(byteOffset, littleEndian): number
  - setFloat32(byteOffset, value, littleEndian): void
  - setFloat64(byteOffset, value, littleEndian): void
  - setInt8(byteOffset, value): void
  - setInt16(byteOffset, value, littleEndian): void
  - setInt32(byteOffset, value, littleEndian): void
  - setUint8(byteOffset, value): void
  - setUint16(byteOffset, value, littleEndian): void
  - setUint32(byteOffset, value, littleEndian): void
properties:
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number

### 391. DataViewConstructor (interface)
purpose: Interface definition
properties:
  - prototype: DataView<ArrayBufferLike>

### 392. Int8Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Int8Array<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Int8Array<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Int8Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Int8Array<TArrayBuffer>
  - toLocaleString(): string
  - toString(): string
  - valueOf(): this
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number

### 393. Int8ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Int8Array<ArrayBuffer>
  - from(arrayLike): Int8Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Int8Array<ArrayBuffer>
properties:
  - prototype: Int8Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 394. Uint8Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Uint8Array<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Uint8Array<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Uint8Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Uint8Array<TArrayBuffer>
  - toLocaleString(): string
  - toString(): string
  - valueOf(): this
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number

### 395. Uint8ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Uint8Array<ArrayBuffer>
  - from(arrayLike): Uint8Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Uint8Array<ArrayBuffer>
properties:
  - prototype: Uint8Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 396. Uint8ClampedArray (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Uint8ClampedArray<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Uint8ClampedArray<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Uint8ClampedArray<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Uint8ClampedArray<TArrayBuffer>
  - toLocaleString(): string
  - toString(): string
  - valueOf(): this
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number

### 397. Uint8ClampedArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Uint8ClampedArray<ArrayBuffer>
  - from(arrayLike): Uint8ClampedArray<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Uint8ClampedArray<ArrayBuffer>
properties:
  - prototype: Uint8ClampedArray<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 398. Int16Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Int16Array<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Int16Array<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Int16Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Int16Array<TArrayBuffer>
  - toLocaleString(): string
  - toString(): string
  - valueOf(): this
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number

### 399. Int16ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Int16Array<ArrayBuffer>
  - from(arrayLike): Int16Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Int16Array<ArrayBuffer>
properties:
  - prototype: Int16Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 400. Uint16Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Uint16Array<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Uint16Array<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Uint16Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Uint16Array<TArrayBuffer>
  - toLocaleString(): string
  - toString(): string
  - valueOf(): this
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number

### 401. Uint16ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Uint16Array<ArrayBuffer>
  - from(arrayLike): Uint16Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Uint16Array<ArrayBuffer>
properties:
  - prototype: Uint16Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 402. Int32Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Int32Array<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Int32Array<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Int32Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Int32Array<TArrayBuffer>
  - toLocaleString(): string
  - toString(): string
  - valueOf(): this
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number

### 403. Int32ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Int32Array<ArrayBuffer>
  - from(arrayLike): Int32Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Int32Array<ArrayBuffer>
properties:
  - prototype: Int32Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 404. Uint32Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Uint32Array<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Uint32Array<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Uint32Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Uint32Array<TArrayBuffer>
  - toLocaleString(): string
  - toString(): string
  - valueOf(): this
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number

### 405. Uint32ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Uint32Array<ArrayBuffer>
  - from(arrayLike): Uint32Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Uint32Array<ArrayBuffer>
properties:
  - prototype: Uint32Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 406. Float32Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Float32Array<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Float32Array<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Float32Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Float32Array<TArrayBuffer>
  - toLocaleString(): string
  - toString(): string
  - valueOf(): this
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number

### 407. Float32ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Float32Array<ArrayBuffer>
  - from(arrayLike): Float32Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Float32Array<ArrayBuffer>
properties:
  - prototype: Float32Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 408. Float64Array (interface)
purpose: Interface definition
methods:
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Float64Array<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Float64Array<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Float64Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Float64Array<TArrayBuffer>
  - toLocaleString(): string
  - toString(): string
  - valueOf(): this
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number

### 409. Float64ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Float64Array<ArrayBuffer>
  - from(arrayLike): Float64Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Float64Array<ArrayBuffer>
properties:
  - prototype: Float64Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 410. String (interface)
purpose: Interface definition
methods:
  - localeCompare(that, locales, options): number

### 411. Number (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string

### 412. Date (interface)
purpose: Interface definition
methods:
  - toLocaleString(locales, options): string
  - toLocaleDateString(locales, options): string
  - toLocaleTimeString(locales, options): string

### 413. ArrayConstructor (interface)
purpose: Interface definition
methods:
  - fromAsync(iterableOrArrayLike): Promise<T[]>
  - fromAsync(iterableOrArrayLike, mapFn, thisArg): Promise<Awaited<U>[]>

### 414. ReadonlySetLike (interface)
purpose: Interface definition
methods:
  - keys(): Iterator<T>
  - has(value): boolean
properties:
  - size: number

### 415. Set (interface)
purpose: Interface definition
methods:
  - union(other): Set<T | U>
  - intersection(other): Set<T & U>
  - difference(other): Set<T>
  - symmetricDifference(other): Set<T | U>
  - isSubsetOf(other): boolean
  - isSupersetOf(other): boolean
  - isDisjointFrom(other): boolean

### 416. ReadonlySet (interface)
purpose: Interface definition
methods:
  - union(other): Set<T | U>
  - intersection(other): Set<T & U>
  - difference(other): Set<T>
  - symmetricDifference(other): Set<T | U>
  - isSubsetOf(other): boolean
  - isSupersetOf(other): boolean
  - isDisjointFrom(other): boolean

### 417. SymbolConstructor (interface)
purpose: Interface definition
properties:
  - metadata: unique symbol

### 418. Function (interface)
purpose: Interface definition
properties:
  - [Symbol.metadata]: DecoratorMetadata | null

### 419. SymbolConstructor (interface)
purpose: Interface definition
properties:
  - dispose: unique symbol
  - asyncDispose: unique symbol

### 420. Disposable (interface)
purpose: Interface definition
methods:
  - [Symbol.dispose](): void

### 421. AsyncDisposable (interface)
purpose: Interface definition
methods:
  - [Symbol.asyncDispose](): PromiseLike<void>

### 422. SuppressedError (interface)
purpose: Interface definition
extends: Error
properties:
  - error: any
  - suppressed: any

### 423. SuppressedErrorConstructor (interface)
purpose: Interface definition
properties:
  - prototype: SuppressedError

### 424. DisposableStack (interface)
purpose: Interface definition
methods:
  - dispose(): void
  - use(value): T
  - adopt(value, onDispose): T
  - defer(onDispose): void
  - move(): DisposableStack
  - [Symbol.dispose](): void
properties:
  - disposed: boolean
  - [Symbol.toStringTag]: string

### 425. DisposableStackConstructor (interface)
purpose: Interface definition
properties:
  - prototype: DisposableStack

### 426. AsyncDisposableStack (interface)
purpose: Interface definition
methods:
  - disposeAsync(): Promise<void>
  - use(value): T
  - adopt(value, onDisposeAsync): T
  - defer(onDisposeAsync): void
  - move(): AsyncDisposableStack
  - [Symbol.asyncDispose](): Promise<void>
properties:
  - disposed: boolean
  - [Symbol.toStringTag]: string

### 427. AsyncDisposableStackConstructor (interface)
purpose: Interface definition
properties:
  - prototype: AsyncDisposableStack

### 428. IteratorObject (interface)
purpose: Interface definition
extends: Disposable

### 429. AsyncIteratorObject (interface)
purpose: Interface definition
extends: AsyncDisposable

### 430. ErrorConstructor (interface)
purpose: Interface definition
methods:
  - isError(error): error is Error

### 431. Float16Array (interface)
purpose: Interface definition
methods:
  - at(index): number | undefined
  - copyWithin(target, start, end): this
  - every(predicate, thisArg): boolean
  - fill(value, start, end): this
  - filter(predicate, thisArg): Float16Array<ArrayBuffer>
  - find(predicate, thisArg): number | undefined
  - findIndex(predicate, thisArg): number
  - findLast(predicate, thisArg): S | undefined
  - findLast(predicate, thisArg): number | undefined
  - findLastIndex(predicate, thisArg): number
  - forEach(callbackfn, thisArg): void
  - includes(searchElement, fromIndex): boolean
  - indexOf(searchElement, fromIndex): number
  - join(separator): string
  - lastIndexOf(searchElement, fromIndex): number
  - map(callbackfn, thisArg): Float16Array<ArrayBuffer>
  - reduce(callbackfn): number
  - reduce(callbackfn, initialValue): number
  - reduce(callbackfn, initialValue): U
  - reduceRight(callbackfn): number
  - reduceRight(callbackfn, initialValue): number
  - reduceRight(callbackfn, initialValue): U
  - reverse(): this
  - set(array, offset): void
  - slice(start, end): Float16Array<ArrayBuffer>
  - some(predicate, thisArg): boolean
  - sort(compareFn): this
  - subarray(begin, end): Float16Array<TArrayBuffer>
  - toLocaleString(locales, options): string
  - toReversed(): Float16Array<ArrayBuffer>
  - toSorted(compareFn): Float16Array<ArrayBuffer>
  - toString(): string
  - valueOf(): this
  - with(index, value): Float16Array<ArrayBuffer>
  - [Symbol.iterator](): ArrayIterator<number>
  - entries(): ArrayIterator<[number, number]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<number>
properties:
  - BYTES_PER_ELEMENT: number
  - buffer: TArrayBuffer
  - byteLength: number
  - byteOffset: number
  - length: number
  - [Symbol.toStringTag]: "Float16Array"

### 432. Float16ArrayConstructor (interface)
purpose: Interface definition
methods:
  - of(items): Float16Array<ArrayBuffer>
  - from(arrayLike): Float16Array<ArrayBuffer>
  - from(arrayLike, mapfn, thisArg): Float16Array<ArrayBuffer>
  - from(elements): Float16Array<ArrayBuffer>
  - from(elements, mapfn, thisArg): Float16Array<ArrayBuffer>
properties:
  - prototype: Float16Array<ArrayBufferLike>
  - BYTES_PER_ELEMENT: number

### 433. Math (interface)
purpose: Interface definition
methods:
  - f16round(x): number

### 434. DataView (interface)
purpose: Interface definition
methods:
  - getFloat16(byteOffset, littleEndian): number
  - setFloat16(byteOffset, value, littleEndian): void

### 435. Iterator (interface)
purpose: Interface definition
extends: globalThis.IteratorObject<T, TResult, TNext>

### 436. PromiseConstructor (interface)
purpose: Interface definition
methods:
  - try(callbackFn, args): Promise<Awaited<T>>

### 437. Atomics (interface)
purpose: Interface definition
methods:
  - pause(n): void

### 438. ActiveXObject (interface)
purpose: Interface definition

### 439. ITextWriter (interface)
purpose: Interface definition
methods:
  - Write(s): void
  - WriteLine(s): void
  - Close(): void

### 440. TextStreamBase (interface)
purpose: Interface definition
methods:
  - Close(): void
properties:
  - Column: number
  - Line: number

### 441. TextStreamWriter (interface)
purpose: Interface definition
extends: TextStreamBase
methods:
  - Write(s): void
  - WriteBlankLines(intLines): void
  - WriteLine(s): void

### 442. TextStreamReader (interface)
purpose: Interface definition
extends: TextStreamBase
methods:
  - Read(characters): string
  - ReadAll(): string
  - ReadLine(): string
  - Skip(characters): void
  - SkipLine(): void
properties:
  - AtEndOfLine: boolean
  - AtEndOfStream: boolean

### 443. Enumerator (interface)
purpose: Interface definition
methods:
  - atEnd(): boolean
  - item(): T
  - moveFirst(): void
  - moveNext(): void

### 444. EnumeratorConstructor (interface)
purpose: Interface definition

### 445. VBArray (interface)
purpose: Interface definition
methods:
  - dimensions(): number
  - getItem(dimension1Index, dimensionNIndexes): T
  - lbound(dimension): number
  - ubound(dimension): number
  - toArray(): T[]

### 446. VBArrayConstructor (interface)
purpose: Interface definition

### 447. DateConstructor (interface)
purpose: Interface definition

### 448. Date (interface)
purpose: Interface definition
properties:
  - getVarDate: () => VarDate

### 449. FileSystemDirectoryHandleAsyncIterator (interface)
purpose: Interface definition
extends: AsyncIteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.asyncIterator](): FileSystemDirectoryHandleAsyncIterator<T>

### 450. FileSystemDirectoryHandle (interface)
purpose: Interface definition
methods:
  - [Symbol.asyncIterator](): FileSystemDirectoryHandleAsyncIterator<[string, FileSystemHandle]>
  - entries(): FileSystemDirectoryHandleAsyncIterator<[string, FileSystemHandle]>
  - keys(): FileSystemDirectoryHandleAsyncIterator<string>
  - values(): FileSystemDirectoryHandleAsyncIterator<FileSystemHandle>

### 451. ReadableStreamAsyncIterator (interface)
purpose: Interface definition
extends: AsyncIteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.asyncIterator](): ReadableStreamAsyncIterator<T>

### 452. ReadableStream (interface)
purpose: Interface definition
methods:
  - [Symbol.asyncIterator](options): ReadableStreamAsyncIterator<R>
  - values(options): ReadableStreamAsyncIterator<R>

### 453. AddEventListenerOptions (interface)
purpose: Interface definition
extends: EventListenerOptions
properties:
  - once: boolean
  - passive: boolean
  - signal: AbortSignal

### 454. AesCbcParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - iv: BufferSource

### 455. AesCtrParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - counter: BufferSource
  - length: number

### 456. AesDerivedKeyParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - length: number

### 457. AesGcmParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - additionalData: BufferSource
  - iv: BufferSource
  - tagLength: number

### 458. AesKeyAlgorithm (interface)
purpose: Interface definition
extends: KeyAlgorithm
properties:
  - length: number

### 459. AesKeyGenParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - length: number

### 460. Algorithm (interface)
purpose: Interface definition
properties:
  - name: string

### 461. AudioConfiguration (interface)
purpose: Interface definition
properties:
  - bitrate: number
  - channels: string
  - contentType: string
  - samplerate: number
  - spatialRendering: boolean

### 462. AudioDataCopyToOptions (interface)
purpose: Interface definition
properties:
  - format: AudioSampleFormat
  - frameCount: number
  - frameOffset: number
  - planeIndex: number

### 463. AudioDataInit (interface)
purpose: Interface definition
properties:
  - data: BufferSource
  - format: AudioSampleFormat
  - numberOfChannels: number
  - numberOfFrames: number
  - sampleRate: number
  - timestamp: number
  - transfer: ArrayBuffer[]

### 464. AudioDecoderConfig (interface)
purpose: Interface definition
properties:
  - codec: string
  - description: AllowSharedBufferSource
  - numberOfChannels: number
  - sampleRate: number

### 465. AudioDecoderInit (interface)
purpose: Interface definition
properties:
  - error: WebCodecsErrorCallback
  - output: AudioDataOutputCallback

### 466. AudioDecoderSupport (interface)
purpose: Interface definition
properties:
  - config: AudioDecoderConfig
  - supported: boolean

### 467. AudioEncoderConfig (interface)
purpose: Interface definition
properties:
  - bitrate: number
  - bitrateMode: BitrateMode
  - codec: string
  - numberOfChannels: number
  - opus: OpusEncoderConfig
  - sampleRate: number

### 468. AudioEncoderInit (interface)
purpose: Interface definition
properties:
  - error: WebCodecsErrorCallback
  - output: EncodedAudioChunkOutputCallback

### 469. AudioEncoderSupport (interface)
purpose: Interface definition
properties:
  - config: AudioEncoderConfig
  - supported: boolean

### 470. AvcEncoderConfig (interface)
purpose: Interface definition
properties:
  - format: AvcBitstreamFormat

### 471. BlobPropertyBag (interface)
purpose: Interface definition
properties:
  - endings: EndingType
  - type: string

### 472. CSSMatrixComponentOptions (interface)
purpose: Interface definition
properties:
  - is2D: boolean

### 473. CSSNumericType (interface)
purpose: Interface definition
properties:
  - angle: number
  - flex: number
  - frequency: number
  - length: number
  - percent: number
  - percentHint: CSSNumericBaseType
  - resolution: number
  - time: number

### 474. CacheQueryOptions (interface)
purpose: Interface definition
properties:
  - ignoreMethod: boolean
  - ignoreSearch: boolean
  - ignoreVary: boolean

### 475. ClientQueryOptions (interface)
purpose: Interface definition
properties:
  - includeUncontrolled: boolean
  - type: ClientTypes

### 476. CloseEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - code: number
  - reason: string
  - wasClean: boolean

### 477. CookieInit (interface)
purpose: Interface definition
properties:
  - domain: string | null
  - expires: DOMHighResTimeStamp | null
  - name: string
  - partitioned: boolean
  - path: string
  - sameSite: CookieSameSite
  - value: string

### 478. CookieListItem (interface)
purpose: Interface definition
properties:
  - name: string
  - value: string

### 479. CookieStoreDeleteOptions (interface)
purpose: Interface definition
properties:
  - domain: string | null
  - name: string
  - partitioned: boolean
  - path: string

### 480. CookieStoreGetOptions (interface)
purpose: Interface definition
properties:
  - name: string
  - url: string

### 481. CryptoKeyPair (interface)
purpose: Interface definition
properties:
  - privateKey: CryptoKey
  - publicKey: CryptoKey

### 482. CustomEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - detail: T

### 483. DOMMatrix2DInit (interface)
purpose: Interface definition
properties:
  - a: number
  - b: number
  - c: number
  - d: number
  - e: number
  - f: number
  - m11: number
  - m12: number
  - m21: number
  - m22: number
  - m41: number
  - m42: number

### 484. DOMMatrixInit (interface)
purpose: Interface definition
extends: DOMMatrix2DInit
properties:
  - is2D: boolean
  - m13: number
  - m14: number
  - m23: number
  - m24: number
  - m31: number
  - m32: number
  - m33: number
  - m34: number
  - m43: number
  - m44: number

### 485. DOMPointInit (interface)
purpose: Interface definition
properties:
  - w: number
  - x: number
  - y: number
  - z: number

### 486. DOMQuadInit (interface)
purpose: Interface definition
properties:
  - p1: DOMPointInit
  - p2: DOMPointInit
  - p3: DOMPointInit
  - p4: DOMPointInit

### 487. DOMRectInit (interface)
purpose: Interface definition
properties:
  - height: number
  - width: number
  - x: number
  - y: number

### 488. EcKeyGenParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - namedCurve: NamedCurve

### 489. EcKeyImportParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - namedCurve: NamedCurve

### 490. EcdhKeyDeriveParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - public: CryptoKey

### 491. EcdsaParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - hash: HashAlgorithmIdentifier

### 492. EncodedAudioChunkInit (interface)
purpose: Interface definition
properties:
  - data: AllowSharedBufferSource
  - duration: number
  - timestamp: number
  - transfer: ArrayBuffer[]
  - type: EncodedAudioChunkType

### 493. EncodedAudioChunkMetadata (interface)
purpose: Interface definition
properties:
  - decoderConfig: AudioDecoderConfig

### 494. EncodedVideoChunkInit (interface)
purpose: Interface definition
properties:
  - data: AllowSharedBufferSource
  - duration: number
  - timestamp: number
  - type: EncodedVideoChunkType

### 495. EncodedVideoChunkMetadata (interface)
purpose: Interface definition
properties:
  - decoderConfig: VideoDecoderConfig

### 496. ErrorEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - colno: number
  - error: any
  - filename: string
  - lineno: number
  - message: string

### 497. EventInit (interface)
purpose: Interface definition
properties:
  - bubbles: boolean
  - cancelable: boolean
  - composed: boolean

### 498. EventListenerOptions (interface)
purpose: Interface definition
properties:
  - capture: boolean

### 499. EventSourceInit (interface)
purpose: Interface definition
properties:
  - withCredentials: boolean

### 500. ExtendableCookieChangeEventInit (interface)
purpose: Interface definition
extends: ExtendableEventInit
properties:
  - changed: CookieList
  - deleted: CookieList

### 501. ExtendableEventInit (interface)
purpose: Interface definition
extends: EventInit

### 502. ExtendableMessageEventInit (interface)
purpose: Interface definition
extends: ExtendableEventInit
properties:
  - data: any
  - lastEventId: string
  - origin: string
  - ports: MessagePort[]
  - source: Client | ServiceWorker | MessagePort | null

### 503. FetchEventInit (interface)
purpose: Interface definition
extends: ExtendableEventInit
properties:
  - clientId: string
  - handled: Promise<void>
  - preloadResponse: Promise<any>
  - request: Request
  - resultingClientId: string

### 504. FilePropertyBag (interface)
purpose: Interface definition
extends: BlobPropertyBag
properties:
  - lastModified: number

### 505. FileSystemCreateWritableOptions (interface)
purpose: Interface definition
properties:
  - keepExistingData: boolean

### 506. FileSystemGetDirectoryOptions (interface)
purpose: Interface definition
properties:
  - create: boolean

### 507. FileSystemGetFileOptions (interface)
purpose: Interface definition
properties:
  - create: boolean

### 508. FileSystemReadWriteOptions (interface)
purpose: Interface definition
properties:
  - at: number

### 509. FileSystemRemoveOptions (interface)
purpose: Interface definition
properties:
  - recursive: boolean

### 510. FontFaceDescriptors (interface)
purpose: Interface definition
properties:
  - ascentOverride: string
  - descentOverride: string
  - display: FontDisplay
  - featureSettings: string
  - lineGapOverride: string
  - stretch: string
  - style: string
  - unicodeRange: string
  - weight: string

### 511. FontFaceSetLoadEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - fontfaces: FontFace[]

### 512. GetNotificationOptions (interface)
purpose: Interface definition
properties:
  - tag: string

### 513. HkdfParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - hash: HashAlgorithmIdentifier
  - info: BufferSource
  - salt: BufferSource

### 514. HmacImportParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - hash: HashAlgorithmIdentifier
  - length: number

### 515. HmacKeyGenParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - hash: HashAlgorithmIdentifier
  - length: number

### 516. IDBDatabaseInfo (interface)
purpose: Interface definition
properties:
  - name: string
  - version: number

### 517. IDBIndexParameters (interface)
purpose: Interface definition
properties:
  - multiEntry: boolean
  - unique: boolean

### 518. IDBObjectStoreParameters (interface)
purpose: Interface definition
properties:
  - autoIncrement: boolean
  - keyPath: string | string[] | null

### 519. IDBTransactionOptions (interface)
purpose: Interface definition
properties:
  - durability: IDBTransactionDurability

### 520. IDBVersionChangeEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - newVersion: number | null
  - oldVersion: number

### 521. ImageBitmapOptions (interface)
purpose: Interface definition
properties:
  - colorSpaceConversion: ColorSpaceConversion
  - imageOrientation: ImageOrientation
  - premultiplyAlpha: PremultiplyAlpha
  - resizeHeight: number
  - resizeQuality: ResizeQuality
  - resizeWidth: number

### 522. ImageBitmapRenderingContextSettings (interface)
purpose: Interface definition
properties:
  - alpha: boolean

### 523. ImageDataSettings (interface)
purpose: Interface definition
properties:
  - colorSpace: PredefinedColorSpace

### 524. ImageDecodeOptions (interface)
purpose: Interface definition
properties:
  - completeFramesOnly: boolean
  - frameIndex: number

### 525. ImageDecodeResult (interface)
purpose: Interface definition
properties:
  - complete: boolean
  - image: VideoFrame

### 526. ImageDecoderInit (interface)
purpose: Interface definition
properties:
  - colorSpaceConversion: ColorSpaceConversion
  - data: ImageBufferSource
  - desiredHeight: number
  - desiredWidth: number
  - preferAnimation: boolean
  - transfer: ArrayBuffer[]
  - type: string

### 527. ImageEncodeOptions (interface)
purpose: Interface definition
properties:
  - quality: number
  - type: string

### 528. JsonWebKey (interface)
purpose: Interface definition
properties:
  - alg: string
  - crv: string
  - d: string
  - dp: string
  - dq: string
  - e: string
  - ext: boolean
  - k: string
  - key_ops: string[]
  - kty: string
  - n: string
  - oth: RsaOtherPrimesInfo[]
  - p: string
  - q: string
  - qi: string
  - use: string
  - x: string
  - y: string

### 529. KeyAlgorithm (interface)
purpose: Interface definition
properties:
  - name: string

### 530. KeySystemTrackConfiguration (interface)
purpose: Interface definition
properties:
  - robustness: string

### 531. LockInfo (interface)
purpose: Interface definition
properties:
  - clientId: string
  - mode: LockMode
  - name: string

### 532. LockManagerSnapshot (interface)
purpose: Interface definition
properties:
  - held: LockInfo[]
  - pending: LockInfo[]

### 533. LockOptions (interface)
purpose: Interface definition
properties:
  - ifAvailable: boolean
  - mode: LockMode
  - signal: AbortSignal
  - steal: boolean

### 534. MediaCapabilitiesDecodingInfo (interface)
purpose: Interface definition
extends: MediaCapabilitiesInfo

### 535. MediaCapabilitiesEncodingInfo (interface)
purpose: Interface definition
extends: MediaCapabilitiesInfo

### 536. MediaCapabilitiesInfo (interface)
purpose: Interface definition
properties:
  - powerEfficient: boolean
  - smooth: boolean
  - supported: boolean

### 537. MediaCapabilitiesKeySystemConfiguration (interface)
purpose: Interface definition
properties:
  - audio: KeySystemTrackConfiguration
  - distinctiveIdentifier: MediaKeysRequirement
  - initDataType: string
  - keySystem: string
  - persistentState: MediaKeysRequirement
  - sessionTypes: string[]
  - video: KeySystemTrackConfiguration

### 538. MediaConfiguration (interface)
purpose: Interface definition
properties:
  - audio: AudioConfiguration
  - video: VideoConfiguration

### 539. MediaDecodingConfiguration (interface)
purpose: Interface definition
extends: MediaConfiguration
properties:
  - keySystemConfiguration: MediaCapabilitiesKeySystemConfiguration
  - type: MediaDecodingType

### 540. MediaEncodingConfiguration (interface)
purpose: Interface definition
extends: MediaConfiguration
properties:
  - type: MediaEncodingType

### 541. MediaStreamTrackProcessorInit (interface)
purpose: Interface definition
properties:
  - maxBufferSize: number

### 542. MessageEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - data: T
  - lastEventId: string
  - origin: string
  - ports: MessagePort[]
  - source: MessageEventSource | null

### 543. MultiCacheQueryOptions (interface)
purpose: Interface definition
extends: CacheQueryOptions
properties:
  - cacheName: string

### 544. NavigationPreloadState (interface)
purpose: Interface definition
properties:
  - enabled: boolean
  - headerValue: string

### 545. NotificationEventInit (interface)
purpose: Interface definition
extends: ExtendableEventInit
properties:
  - action: string
  - notification: Notification

### 546. NotificationOptions (interface)
purpose: Interface definition
properties:
  - badge: string
  - body: string
  - data: any
  - dir: NotificationDirection
  - icon: string
  - lang: string
  - requireInteraction: boolean
  - silent: boolean | null
  - tag: string

### 547. OpusEncoderConfig (interface)
purpose: Interface definition
properties:
  - complexity: number
  - format: OpusBitstreamFormat
  - frameDuration: number
  - packetlossperc: number
  - usedtx: boolean
  - useinbandfec: boolean

### 548. Pbkdf2Params (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - hash: HashAlgorithmIdentifier
  - iterations: number
  - salt: BufferSource

### 549. PerformanceMarkOptions (interface)
purpose: Interface definition
properties:
  - detail: any
  - startTime: DOMHighResTimeStamp

### 550. PerformanceMeasureOptions (interface)
purpose: Interface definition
properties:
  - detail: any
  - duration: DOMHighResTimeStamp
  - end: string | DOMHighResTimeStamp
  - start: string | DOMHighResTimeStamp

### 551. PerformanceObserverInit (interface)
purpose: Interface definition
properties:
  - buffered: boolean
  - entryTypes: string[]
  - type: string

### 552. PermissionDescriptor (interface)
purpose: Interface definition
properties:
  - name: PermissionName

### 553. PlaneLayout (interface)
purpose: Interface definition
properties:
  - offset: number
  - stride: number

### 554. ProgressEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - lengthComputable: boolean
  - loaded: number
  - total: number

### 555. PromiseRejectionEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - promise: Promise<any>
  - reason: any

### 556. PushEventInit (interface)
purpose: Interface definition
extends: ExtendableEventInit
properties:
  - data: PushMessageDataInit

### 557. PushSubscriptionChangeEventInit (interface)
purpose: Interface definition
extends: ExtendableEventInit
properties:
  - newSubscription: PushSubscription
  - oldSubscription: PushSubscription

### 558. PushSubscriptionJSON (interface)
purpose: Interface definition
properties:
  - endpoint: string
  - expirationTime: EpochTimeStamp | null
  - keys: Record<string, string>

### 559. PushSubscriptionOptionsInit (interface)
purpose: Interface definition
properties:
  - applicationServerKey: BufferSource | string | null
  - userVisibleOnly: boolean

### 560. QueuingStrategy (interface)
purpose: Interface definition
properties:
  - highWaterMark: number
  - size: QueuingStrategySize<T>

### 561. QueuingStrategyInit (interface)
purpose: Interface definition
properties:
  - highWaterMark: number

### 562. RTCEncodedAudioFrameMetadata (interface)
purpose: Interface definition
extends: RTCEncodedFrameMetadata
properties:
  - sequenceNumber: number

### 563. RTCEncodedFrameMetadata (interface)
purpose: Interface definition
properties:
  - contributingSources: number[]
  - mimeType: string
  - payloadType: number
  - rtpTimestamp: number
  - synchronizationSource: number

### 564. RTCEncodedVideoFrameMetadata (interface)
purpose: Interface definition
extends: RTCEncodedFrameMetadata
properties:
  - dependencies: number[]
  - frameId: number
  - height: number
  - spatialIndex: number
  - temporalIndex: number
  - timestamp: number
  - width: number

### 565. ReadableStreamGetReaderOptions (interface)
purpose: Interface definition
properties:
  - mode: ReadableStreamReaderMode

### 566. ReadableStreamIteratorOptions (interface)
purpose: Interface definition
properties:
  - preventCancel: boolean

### 567. ReadableStreamReadDoneResult (interface)
purpose: Interface definition
properties:
  - done: true
  - value: T | undefined

### 568. ReadableStreamReadValueResult (interface)
purpose: Interface definition
properties:
  - done: false
  - value: T

### 569. ReadableWritablePair (interface)
purpose: Interface definition
properties:
  - readable: ReadableStream<R>
  - writable: WritableStream<W>

### 570. RegistrationOptions (interface)
purpose: Interface definition
properties:
  - scope: string
  - type: WorkerType
  - updateViaCache: ServiceWorkerUpdateViaCache

### 571. ReportingObserverOptions (interface)
purpose: Interface definition
properties:
  - buffered: boolean
  - types: string[]

### 572. RequestInit (interface)
purpose: Interface definition
properties:
  - body: BodyInit | null
  - cache: RequestCache
  - credentials: RequestCredentials
  - headers: HeadersInit
  - integrity: string
  - keepalive: boolean
  - method: string
  - mode: RequestMode
  - priority: RequestPriority
  - redirect: RequestRedirect
  - referrer: string
  - referrerPolicy: ReferrerPolicy
  - signal: AbortSignal | null
  - window: null

### 573. ResponseInit (interface)
purpose: Interface definition
properties:
  - headers: HeadersInit
  - status: number
  - statusText: string

### 574. RsaHashedImportParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - hash: HashAlgorithmIdentifier

### 575. RsaHashedKeyGenParams (interface)
purpose: Interface definition
extends: RsaKeyGenParams
properties:
  - hash: HashAlgorithmIdentifier

### 576. RsaKeyGenParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - modulusLength: number
  - publicExponent: BigInteger

### 577. RsaOaepParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - label: BufferSource

### 578. RsaOtherPrimesInfo (interface)
purpose: Interface definition
properties:
  - d: string
  - r: string
  - t: string

### 579. RsaPssParams (interface)
purpose: Interface definition
extends: Algorithm
properties:
  - saltLength: number

### 580. SecurityPolicyViolationEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - blockedURI: string
  - columnNumber: number
  - disposition: SecurityPolicyViolationEventDisposition
  - documentURI: string
  - effectiveDirective: string
  - lineNumber: number
  - originalPolicy: string
  - referrer: string
  - sample: string
  - sourceFile: string
  - statusCode: number
  - violatedDirective: string

### 581. StorageEstimate (interface)
purpose: Interface definition
properties:
  - quota: number
  - usage: number

### 582. StreamPipeOptions (interface)
purpose: Interface definition
properties:
  - preventAbort: boolean
  - preventCancel: boolean
  - preventClose: boolean
  - signal: AbortSignal

### 583. StructuredSerializeOptions (interface)
purpose: Interface definition
properties:
  - transfer: Transferable[]

### 584. TextDecodeOptions (interface)
purpose: Interface definition
properties:
  - stream: boolean

### 585. TextDecoderOptions (interface)
purpose: Interface definition
properties:
  - fatal: boolean
  - ignoreBOM: boolean

### 586. TextEncoderEncodeIntoResult (interface)
purpose: Interface definition
properties:
  - read: number
  - written: number

### 587. Transformer (interface)
purpose: Interface definition
properties:
  - flush: TransformerFlushCallback<O>
  - readableType: undefined
  - start: TransformerStartCallback<O>
  - transform: TransformerTransformCallback<I, O>
  - writableType: undefined

### 588. UnderlyingByteSource (interface)
purpose: Interface definition
properties:
  - autoAllocateChunkSize: number
  - cancel: UnderlyingSourceCancelCallback
  - pull: (controller: ReadableByteStreamController) => void | PromiseLike<void>
  - start: (controller: ReadableByteStreamController) => any
  - type: "bytes"

### 589. UnderlyingDefaultSource (interface)
purpose: Interface definition
properties:
  - cancel: UnderlyingSourceCancelCallback
  - pull: (controller: ReadableStreamDefaultController<R>) => void | PromiseLike<void>
  - start: (controller: ReadableStreamDefaultController<R>) => any
  - type: undefined

### 590. UnderlyingSink (interface)
purpose: Interface definition
properties:
  - abort: UnderlyingSinkAbortCallback
  - close: UnderlyingSinkCloseCallback
  - start: UnderlyingSinkStartCallback
  - type: undefined
  - write: UnderlyingSinkWriteCallback<W>

### 591. UnderlyingSource (interface)
purpose: Interface definition
properties:
  - autoAllocateChunkSize: number
  - cancel: UnderlyingSourceCancelCallback
  - pull: UnderlyingSourcePullCallback<R>
  - start: UnderlyingSourceStartCallback<R>
  - type: ReadableStreamType

### 592. VideoColorSpaceInit (interface)
purpose: Interface definition
properties:
  - fullRange: boolean | null
  - matrix: VideoMatrixCoefficients | null
  - primaries: VideoColorPrimaries | null
  - transfer: VideoTransferCharacteristics | null

### 593. VideoConfiguration (interface)
purpose: Interface definition
properties:
  - bitrate: number
  - colorGamut: ColorGamut
  - contentType: string
  - framerate: number
  - hasAlphaChannel: boolean
  - hdrMetadataType: HdrMetadataType
  - height: number
  - scalabilityMode: string
  - transferFunction: TransferFunction
  - width: number

### 594. VideoDecoderConfig (interface)
purpose: Interface definition
properties:
  - codec: string
  - codedHeight: number
  - codedWidth: number
  - colorSpace: VideoColorSpaceInit
  - description: AllowSharedBufferSource
  - displayAspectHeight: number
  - displayAspectWidth: number
  - hardwareAcceleration: HardwareAcceleration
  - optimizeForLatency: boolean

### 595. VideoDecoderInit (interface)
purpose: Interface definition
properties:
  - error: WebCodecsErrorCallback
  - output: VideoFrameOutputCallback

### 596. VideoDecoderSupport (interface)
purpose: Interface definition
properties:
  - config: VideoDecoderConfig
  - supported: boolean

### 597. VideoEncoderConfig (interface)
purpose: Interface definition
properties:
  - alpha: AlphaOption
  - avc: AvcEncoderConfig
  - bitrate: number
  - bitrateMode: VideoEncoderBitrateMode
  - codec: string
  - contentHint: string
  - displayHeight: number
  - displayWidth: number
  - framerate: number
  - hardwareAcceleration: HardwareAcceleration
  - height: number
  - latencyMode: LatencyMode
  - scalabilityMode: string
  - width: number

### 598. VideoEncoderEncodeOptions (interface)
purpose: Interface definition
properties:
  - avc: VideoEncoderEncodeOptionsForAvc
  - keyFrame: boolean

### 599. VideoEncoderEncodeOptionsForAvc (interface)
purpose: Interface definition
properties:
  - quantizer: number | null

### 600. VideoEncoderInit (interface)
purpose: Interface definition
properties:
  - error: WebCodecsErrorCallback
  - output: EncodedVideoChunkOutputCallback

### 601. VideoEncoderSupport (interface)
purpose: Interface definition
properties:
  - config: VideoEncoderConfig
  - supported: boolean

### 602. VideoFrameBufferInit (interface)
purpose: Interface definition
properties:
  - codedHeight: number
  - codedWidth: number
  - colorSpace: VideoColorSpaceInit
  - displayHeight: number
  - displayWidth: number
  - duration: number
  - format: VideoPixelFormat
  - layout: PlaneLayout[]
  - timestamp: number
  - visibleRect: DOMRectInit

### 603. VideoFrameCopyToOptions (interface)
purpose: Interface definition
properties:
  - colorSpace: PredefinedColorSpace
  - format: VideoPixelFormat
  - layout: PlaneLayout[]
  - rect: DOMRectInit

### 604. VideoFrameInit (interface)
purpose: Interface definition
properties:
  - alpha: AlphaOption
  - displayHeight: number
  - displayWidth: number
  - duration: number
  - timestamp: number
  - visibleRect: DOMRectInit

### 605. WebGLContextAttributes (interface)
purpose: Interface definition
properties:
  - alpha: boolean
  - antialias: boolean
  - depth: boolean
  - desynchronized: boolean
  - failIfMajorPerformanceCaveat: boolean
  - powerPreference: WebGLPowerPreference
  - premultipliedAlpha: boolean
  - preserveDrawingBuffer: boolean
  - stencil: boolean

### 606. WebGLContextEventInit (interface)
purpose: Interface definition
extends: EventInit
properties:
  - statusMessage: string

### 607. WebTransportCloseInfo (interface)
purpose: Interface definition
properties:
  - closeCode: number
  - reason: string

### 608. WebTransportErrorOptions (interface)
purpose: Interface definition
properties:
  - source: WebTransportErrorSource
  - streamErrorCode: number | null

### 609. WebTransportHash (interface)
purpose: Interface definition
properties:
  - algorithm: string
  - value: BufferSource

### 610. WebTransportOptions (interface)
purpose: Interface definition
properties:
  - allowPooling: boolean
  - congestionControl: WebTransportCongestionControl
  - requireUnreliable: boolean
  - serverCertificateHashes: WebTransportHash[]

### 611. WebTransportSendOptions (interface)
purpose: Interface definition
properties:
  - sendOrder: number

### 612. WebTransportSendStreamOptions (interface)
purpose: Interface definition
extends: WebTransportSendOptions

### 613. WorkerOptions (interface)
purpose: Interface definition
properties:
  - credentials: RequestCredentials
  - name: string
  - type: WorkerType

### 614. WriteParams (interface)
purpose: Interface definition
properties:
  - data: BufferSource | Blob | string | null
  - position: number | null
  - size: number | null
  - type: WriteCommandType

### 615. ANGLE_instanced_arrays (interface)
purpose: Interface definition
methods:
  - drawArraysInstancedANGLE(mode, first, count, primcount): void
  - drawElementsInstancedANGLE(mode, count, type, offset, primcount): void
  - vertexAttribDivisorANGLE(index, divisor): void
properties:
  - VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: 0x88FE

### 616. AbortController (interface)
purpose: Interface definition
methods:
  - abort(reason): void
properties:
  - signal: AbortSignal

### 617. AbortSignalEventMap (interface)
purpose: Interface definition
properties:
  - "abort": Event

### 618. AbortSignal (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - throwIfAborted(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - aborted: boolean
  - onabort: ((this: AbortSignal, ev: Event) => any) | null
  - reason: any

### 619. AbstractWorkerEventMap (interface)
purpose: Interface definition
properties:
  - "error": ErrorEvent

### 620. AbstractWorker (interface)
purpose: Interface definition
methods:
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null

### 621. AnimationFrameProvider (interface)
purpose: Interface definition
methods:
  - cancelAnimationFrame(handle): void
  - requestAnimationFrame(callback): number

### 622. AudioData (interface)
purpose: Interface definition
methods:
  - allocationSize(options): number
  - clone(): AudioData
  - close(): void
  - copyTo(destination, options): void
properties:
  - duration: number
  - format: AudioSampleFormat | null
  - numberOfChannels: number
  - numberOfFrames: number
  - sampleRate: number
  - timestamp: number

### 623. AudioDecoderEventMap (interface)
purpose: Interface definition
properties:
  - "dequeue": Event

### 624. AudioDecoder (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(): void
  - configure(config): void
  - decode(chunk): void
  - flush(): Promise<void>
  - reset(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - decodeQueueSize: number
  - ondequeue: ((this: AudioDecoder, ev: Event) => any) | null
  - state: CodecState

### 625. AudioEncoderEventMap (interface)
purpose: Interface definition
properties:
  - "dequeue": Event

### 626. AudioEncoder (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(): void
  - configure(config): void
  - encode(data): void
  - flush(): Promise<void>
  - reset(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - encodeQueueSize: number
  - ondequeue: ((this: AudioEncoder, ev: Event) => any) | null
  - state: CodecState

### 627. Blob (interface)
purpose: Interface definition
methods:
  - arrayBuffer(): Promise<ArrayBuffer>
  - bytes(): Promise<Uint8Array<ArrayBuffer>>
  - slice(start, end, contentType): Blob
  - stream(): ReadableStream<Uint8Array<ArrayBuffer>>
  - text(): Promise<string>
properties:
  - size: number
  - type: string

### 628. Body (interface)
purpose: Interface definition
methods:
  - arrayBuffer(): Promise<ArrayBuffer>
  - blob(): Promise<Blob>
  - bytes(): Promise<Uint8Array<ArrayBuffer>>
  - formData(): Promise<FormData>
  - json(): Promise<any>
  - text(): Promise<string>
properties:
  - body: ReadableStream<Uint8Array<ArrayBuffer>> | null
  - bodyUsed: boolean

### 629. BroadcastChannelEventMap (interface)
purpose: Interface definition
properties:
  - "message": MessageEvent
  - "messageerror": MessageEvent

### 630. BroadcastChannel (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(): void
  - postMessage(message): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - name: string
  - onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null
  - onmessageerror: ((this: BroadcastChannel, ev: MessageEvent) => any) | null

### 631. ByteLengthQueuingStrategy (interface)
purpose: Interface definition
extends: QueuingStrategy<ArrayBufferView>
properties:
  - highWaterMark: number
  - size: QueuingStrategySize<ArrayBufferView>

### 632. CSSImageValue (interface)
purpose: Interface definition
extends: CSSStyleValue

### 633. CSSKeywordValue (interface)
purpose: Interface definition
extends: CSSStyleValue
properties:
  - value: string

### 634. CSSMathClamp (interface)
purpose: Interface definition
extends: CSSMathValue
properties:
  - lower: CSSNumericValue
  - upper: CSSNumericValue
  - value: CSSNumericValue

### 635. CSSMathInvert (interface)
purpose: Interface definition
extends: CSSMathValue
properties:
  - value: CSSNumericValue

### 636. CSSMathMax (interface)
purpose: Interface definition
extends: CSSMathValue
properties:
  - values: CSSNumericArray

### 637. CSSMathMin (interface)
purpose: Interface definition
extends: CSSMathValue
properties:
  - values: CSSNumericArray

### 638. CSSMathNegate (interface)
purpose: Interface definition
extends: CSSMathValue
properties:
  - value: CSSNumericValue

### 639. CSSMathProduct (interface)
purpose: Interface definition
extends: CSSMathValue
properties:
  - values: CSSNumericArray

### 640. CSSMathSum (interface)
purpose: Interface definition
extends: CSSMathValue
properties:
  - values: CSSNumericArray

### 641. CSSMathValue (interface)
purpose: Interface definition
extends: CSSNumericValue
properties:
  - operator: CSSMathOperator

### 642. CSSMatrixComponent (interface)
purpose: Interface definition
extends: CSSTransformComponent
properties:
  - matrix: DOMMatrix

### 643. CSSNumericArray (interface)
purpose: Interface definition
methods:
  - forEach(callbackfn, thisArg): void
properties:
  - length: number

### 644. CSSNumericValue (interface)
purpose: Interface definition
extends: CSSStyleValue
methods:
  - add(values): CSSNumericValue
  - div(values): CSSNumericValue
  - equals(value): boolean
  - max(values): CSSNumericValue
  - min(values): CSSNumericValue
  - mul(values): CSSNumericValue
  - sub(values): CSSNumericValue
  - to(unit): CSSUnitValue
  - toSum(units): CSSMathSum
  - type(): CSSNumericType

### 645. CSSPerspective (interface)
purpose: Interface definition
extends: CSSTransformComponent
properties:
  - length: CSSPerspectiveValue

### 646. CSSRotate (interface)
purpose: Interface definition
extends: CSSTransformComponent
properties:
  - angle: CSSNumericValue
  - x: CSSNumberish
  - y: CSSNumberish
  - z: CSSNumberish

### 647. CSSScale (interface)
purpose: Interface definition
extends: CSSTransformComponent
properties:
  - x: CSSNumberish
  - y: CSSNumberish
  - z: CSSNumberish

### 648. CSSSkew (interface)
purpose: Interface definition
extends: CSSTransformComponent
properties:
  - ax: CSSNumericValue
  - ay: CSSNumericValue

### 649. CSSSkewX (interface)
purpose: Interface definition
extends: CSSTransformComponent
properties:
  - ax: CSSNumericValue

### 650. CSSSkewY (interface)
purpose: Interface definition
extends: CSSTransformComponent
properties:
  - ay: CSSNumericValue

### 651. CSSStyleValue (interface)
purpose: Interface definition
methods:
  - toString(): string

### 652. CSSTransformComponent (interface)
purpose: Interface definition
methods:
  - toMatrix(): DOMMatrix
  - toString(): string
properties:
  - is2D: boolean

### 653. CSSTransformValue (interface)
purpose: Interface definition
extends: CSSStyleValue
methods:
  - toMatrix(): DOMMatrix
  - forEach(callbackfn, thisArg): void
properties:
  - is2D: boolean
  - length: number

### 654. CSSTranslate (interface)
purpose: Interface definition
extends: CSSTransformComponent
properties:
  - x: CSSNumericValue
  - y: CSSNumericValue
  - z: CSSNumericValue

### 655. CSSUnitValue (interface)
purpose: Interface definition
extends: CSSNumericValue
properties:
  - unit: string
  - value: number

### 656. CSSUnparsedValue (interface)
purpose: Interface definition
extends: CSSStyleValue
methods:
  - forEach(callbackfn, thisArg): void
properties:
  - length: number

### 657. CSSVariableReferenceValue (interface)
purpose: Interface definition
properties:
  - fallback: CSSUnparsedValue | null
  - variable: string

### 658. Cache (interface)
purpose: Interface definition
methods:
  - add(request): Promise<void>
  - addAll(requests): Promise<void>
  - delete(request, options): Promise<boolean>
  - keys(request, options): Promise<ReadonlyArray<Request>>
  - match(request, options): Promise<Response | undefined>
  - matchAll(request, options): Promise<ReadonlyArray<Response>>
  - put(request, response): Promise<void>

### 659. CacheStorage (interface)
purpose: Interface definition
methods:
  - delete(cacheName): Promise<boolean>
  - has(cacheName): Promise<boolean>
  - keys(): Promise<string[]>
  - match(request, options): Promise<Response | undefined>
  - open(cacheName): Promise<Cache>

### 660. CanvasCompositing (interface)
purpose: Interface definition
properties:
  - globalAlpha: number
  - globalCompositeOperation: GlobalCompositeOperation

### 661. CanvasDrawImage (interface)
purpose: Interface definition
methods:
  - drawImage(image, dx, dy): void
  - drawImage(image, dx, dy, dw, dh): void
  - drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh): void

### 662. CanvasDrawPath (interface)
purpose: Interface definition
methods:
  - beginPath(): void
  - clip(fillRule): void
  - clip(path, fillRule): void
  - fill(fillRule): void
  - fill(path, fillRule): void
  - isPointInPath(x, y, fillRule): boolean
  - isPointInPath(path, x, y, fillRule): boolean
  - isPointInStroke(x, y): boolean
  - isPointInStroke(path, x, y): boolean
  - stroke(): void
  - stroke(path): void

### 663. CanvasFillStrokeStyles (interface)
purpose: Interface definition
methods:
  - createConicGradient(startAngle, x, y): CanvasGradient
  - createLinearGradient(x0, y0, x1, y1): CanvasGradient
  - createPattern(image, repetition): CanvasPattern | null
  - createRadialGradient(x0, y0, r0, x1, y1, r1): CanvasGradient
properties:
  - fillStyle: string | CanvasGradient | CanvasPattern
  - strokeStyle: string | CanvasGradient | CanvasPattern

### 664. CanvasFilters (interface)
purpose: Interface definition
properties:
  - filter: string

### 665. CanvasGradient (interface)
purpose: Interface definition
methods:
  - addColorStop(offset, color): void

### 666. CanvasImageData (interface)
purpose: Interface definition
methods:
  - createImageData(sw, sh, settings): ImageData
  - createImageData(imageData): ImageData
  - getImageData(sx, sy, sw, sh, settings): ImageData
  - putImageData(imageData, dx, dy): void
  - putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight): void

### 667. CanvasImageSmoothing (interface)
purpose: Interface definition
properties:
  - imageSmoothingEnabled: boolean
  - imageSmoothingQuality: ImageSmoothingQuality

### 668. CanvasPath (interface)
purpose: Interface definition
methods:
  - arc(x, y, radius, startAngle, endAngle, counterclockwise): void
  - arcTo(x1, y1, x2, y2, radius): void
  - bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y): void
  - closePath(): void
  - ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise): void
  - lineTo(x, y): void
  - moveTo(x, y): void
  - quadraticCurveTo(cpx, cpy, x, y): void
  - rect(x, y, w, h): void
  - roundRect(x, y, w, h, radii): void

### 669. CanvasPathDrawingStyles (interface)
purpose: Interface definition
methods:
  - getLineDash(): number[]
  - setLineDash(segments): void
properties:
  - lineCap: CanvasLineCap
  - lineDashOffset: number
  - lineJoin: CanvasLineJoin
  - lineWidth: number
  - miterLimit: number

### 670. CanvasPattern (interface)
purpose: Interface definition
methods:
  - setTransform(transform): void

### 671. CanvasRect (interface)
purpose: Interface definition
methods:
  - clearRect(x, y, w, h): void
  - fillRect(x, y, w, h): void
  - strokeRect(x, y, w, h): void

### 672. CanvasShadowStyles (interface)
purpose: Interface definition
properties:
  - shadowBlur: number
  - shadowColor: string
  - shadowOffsetX: number
  - shadowOffsetY: number

### 673. CanvasState (interface)
purpose: Interface definition
methods:
  - isContextLost(): boolean
  - reset(): void
  - restore(): void
  - save(): void

### 674. CanvasText (interface)
purpose: Interface definition
methods:
  - fillText(text, x, y, maxWidth): void
  - measureText(text): TextMetrics
  - strokeText(text, x, y, maxWidth): void

### 675. CanvasTextDrawingStyles (interface)
purpose: Interface definition
properties:
  - direction: CanvasDirection
  - font: string
  - fontKerning: CanvasFontKerning
  - fontStretch: CanvasFontStretch
  - fontVariantCaps: CanvasFontVariantCaps
  - letterSpacing: string
  - textAlign: CanvasTextAlign
  - textBaseline: CanvasTextBaseline
  - textRendering: CanvasTextRendering
  - wordSpacing: string

### 676. CanvasTransform (interface)
purpose: Interface definition
methods:
  - getTransform(): DOMMatrix
  - resetTransform(): void
  - rotate(angle): void
  - scale(x, y): void
  - setTransform(a, b, c, d, e, f): void
  - setTransform(transform): void
  - transform(a, b, c, d, e, f): void
  - translate(x, y): void

### 677. Client (interface)
purpose: Interface definition
methods:
  - postMessage(message, transfer): void
  - postMessage(message, options): void
properties:
  - frameType: FrameType
  - id: string
  - type: ClientTypes
  - url: string

### 678. Clients (interface)
purpose: Interface definition
methods:
  - claim(): Promise<void>
  - get(id): Promise<Client | undefined>
  - matchAll(options): Promise<ReadonlyArray<T["type"] extends "window" ? WindowClient : Client>>
  - openWindow(url): Promise<WindowClient | null>

### 679. CloseEvent (interface)
purpose: Interface definition
extends: Event
properties:
  - code: number
  - reason: string
  - wasClean: boolean

### 680. CompressionStream (interface)
purpose: Interface definition
extends: GenericTransformStream
properties:
  - readable: ReadableStream<Uint8Array<ArrayBuffer>>
  - writable: WritableStream<BufferSource>

### 681. CookieStore (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - delete(name): Promise<void>
  - delete(options): Promise<void>
  - get(name): Promise<CookieListItem | null>
  - get(options): Promise<CookieListItem | null>
  - getAll(name): Promise<CookieList>
  - getAll(options): Promise<CookieList>
  - set(name, value): Promise<void>
  - set(options): Promise<void>

### 682. CookieStoreManager (interface)
purpose: Interface definition
methods:
  - getSubscriptions(): Promise<CookieStoreGetOptions[]>
  - subscribe(subscriptions): Promise<void>
  - unsubscribe(subscriptions): Promise<void>

### 683. CountQueuingStrategy (interface)
purpose: Interface definition
extends: QueuingStrategy
properties:
  - highWaterMark: number
  - size: QueuingStrategySize

### 684. Crypto (interface)
purpose: Interface definition
methods:
  - getRandomValues(array): T
  - randomUUID(): `${string}-${string}-${string}-${string}-${string}`
properties:
  - subtle: SubtleCrypto

### 685. CryptoKey (interface)
purpose: Interface definition
properties:
  - algorithm: KeyAlgorithm
  - extractable: boolean
  - type: KeyType
  - usages: KeyUsage[]

### 686. CustomEvent (interface)
purpose: Interface definition
extends: Event
methods:
  - initCustomEvent(type, bubbles, cancelable, detail): void
properties:
  - detail: T

### 687. DOMException (interface)
purpose: Interface definition
extends: Error
properties:
  - code: number
  - message: string
  - name: string
  - INDEX_SIZE_ERR: 1
  - DOMSTRING_SIZE_ERR: 2
  - HIERARCHY_REQUEST_ERR: 3
  - WRONG_DOCUMENT_ERR: 4
  - INVALID_CHARACTER_ERR: 5
  - NO_DATA_ALLOWED_ERR: 6
  - NO_MODIFICATION_ALLOWED_ERR: 7
  - NOT_FOUND_ERR: 8
  - NOT_SUPPORTED_ERR: 9
  - INUSE_ATTRIBUTE_ERR: 10
  - INVALID_STATE_ERR: 11
  - SYNTAX_ERR: 12
  - INVALID_MODIFICATION_ERR: 13
  - NAMESPACE_ERR: 14
  - INVALID_ACCESS_ERR: 15
  - VALIDATION_ERR: 16
  - TYPE_MISMATCH_ERR: 17
  - SECURITY_ERR: 18
  - NETWORK_ERR: 19
  - ABORT_ERR: 20
  - URL_MISMATCH_ERR: 21
  - QUOTA_EXCEEDED_ERR: 22
  - TIMEOUT_ERR: 23
  - INVALID_NODE_TYPE_ERR: 24
  - DATA_CLONE_ERR: 25

### 688. DOMMatrix (interface)
purpose: Interface definition
extends: DOMMatrixReadOnly
methods:
  - invertSelf(): DOMMatrix
  - multiplySelf(other): DOMMatrix
  - preMultiplySelf(other): DOMMatrix
  - rotateAxisAngleSelf(x, y, z, angle): DOMMatrix
  - rotateFromVectorSelf(x, y): DOMMatrix
  - rotateSelf(rotX, rotY, rotZ): DOMMatrix
  - scale3dSelf(scale, originX, originY, originZ): DOMMatrix
  - scaleSelf(scaleX, scaleY, scaleZ, originX, originY, originZ): DOMMatrix
  - skewXSelf(sx): DOMMatrix
  - skewYSelf(sy): DOMMatrix
  - translateSelf(tx, ty, tz): DOMMatrix
properties:
  - a: number
  - b: number
  - c: number
  - d: number
  - e: number
  - f: number
  - m11: number
  - m12: number
  - m13: number
  - m14: number
  - m21: number
  - m22: number
  - m23: number
  - m24: number
  - m31: number
  - m32: number
  - m33: number
  - m34: number
  - m41: number
  - m42: number
  - m43: number
  - m44: number

### 689. DOMMatrixReadOnly (interface)
purpose: Interface definition
methods:
  - flipX(): DOMMatrix
  - flipY(): DOMMatrix
  - inverse(): DOMMatrix
  - multiply(other): DOMMatrix
  - rotate(rotX, rotY, rotZ): DOMMatrix
  - rotateAxisAngle(x, y, z, angle): DOMMatrix
  - rotateFromVector(x, y): DOMMatrix
  - scale(scaleX, scaleY, scaleZ, originX, originY, originZ): DOMMatrix
  - scale3d(scale, originX, originY, originZ): DOMMatrix
  - scaleNonUniform(scaleX, scaleY): DOMMatrix
  - skewX(sx): DOMMatrix
  - skewY(sy): DOMMatrix
  - toFloat32Array(): Float32Array<ArrayBuffer>
  - toFloat64Array(): Float64Array<ArrayBuffer>
  - toJSON(): any
  - transformPoint(point): DOMPoint
  - translate(tx, ty, tz): DOMMatrix
properties:
  - a: number
  - b: number
  - c: number
  - d: number
  - e: number
  - f: number
  - is2D: boolean
  - isIdentity: boolean
  - m11: number
  - m12: number
  - m13: number
  - m14: number
  - m21: number
  - m22: number
  - m23: number
  - m24: number
  - m31: number
  - m32: number
  - m33: number
  - m34: number
  - m41: number
  - m42: number
  - m43: number
  - m44: number

### 690. DOMPoint (interface)
purpose: Interface definition
extends: DOMPointReadOnly
properties:
  - w: number
  - x: number
  - y: number
  - z: number

### 691. DOMPointReadOnly (interface)
purpose: Interface definition
methods:
  - matrixTransform(matrix): DOMPoint
  - toJSON(): any
properties:
  - w: number
  - x: number
  - y: number
  - z: number

### 692. DOMQuad (interface)
purpose: Interface definition
methods:
  - getBounds(): DOMRect
  - toJSON(): any
properties:
  - p1: DOMPoint
  - p2: DOMPoint
  - p3: DOMPoint
  - p4: DOMPoint

### 693. DOMRect (interface)
purpose: Interface definition
extends: DOMRectReadOnly
properties:
  - height: number
  - width: number
  - x: number
  - y: number

### 694. DOMRectReadOnly (interface)
purpose: Interface definition
methods:
  - toJSON(): any
properties:
  - bottom: number
  - height: number
  - left: number
  - right: number
  - top: number
  - width: number
  - x: number
  - y: number

### 695. DOMStringList (interface)
purpose: Interface definition
methods:
  - contains(string): boolean
  - item(index): string | null
properties:
  - length: number

### 696. DecompressionStream (interface)
purpose: Interface definition
extends: GenericTransformStream
properties:
  - readable: ReadableStream<Uint8Array<ArrayBuffer>>
  - writable: WritableStream<BufferSource>

### 697. DedicatedWorkerGlobalScopeEventMap (interface)
purpose: Interface definition
extends: WorkerGlobalScopeEventMap, MessageEventTargetEventMap
properties:
  - "message": MessageEvent
  - "messageerror": MessageEvent
  - "rtctransform": RTCTransformEvent

### 698. DedicatedWorkerGlobalScope (interface)
purpose: Interface definition
extends: WorkerGlobalScope, AnimationFrameProvider, MessageEventTarget<DedicatedWorkerGlobalScope>
methods:
  - close(): void
  - postMessage(message, transfer): void
  - postMessage(message, options): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - name: string
  - onrtctransform: ((this: DedicatedWorkerGlobalScope, ev: RTCTransformEvent) => any) | null

### 699. EXT_blend_minmax (interface)
purpose: Interface definition
properties:
  - MIN_EXT: 0x8007
  - MAX_EXT: 0x8008

### 700. EXT_color_buffer_float (interface)
purpose: Interface definition

### 701. EXT_color_buffer_half_float (interface)
purpose: Interface definition
properties:
  - RGBA16F_EXT: 0x881A
  - RGB16F_EXT: 0x881B
  - FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211
  - UNSIGNED_NORMALIZED_EXT: 0x8C17

### 702. EXT_float_blend (interface)
purpose: Interface definition

### 703. EXT_frag_depth (interface)
purpose: Interface definition

### 704. EXT_sRGB (interface)
purpose: Interface definition
properties:
  - SRGB_EXT: 0x8C40
  - SRGB_ALPHA_EXT: 0x8C42
  - SRGB8_ALPHA8_EXT: 0x8C43
  - FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT: 0x8210

### 705. EXT_shader_texture_lod (interface)
purpose: Interface definition

### 706. EXT_texture_compression_bptc (interface)
purpose: Interface definition
properties:
  - COMPRESSED_RGBA_BPTC_UNORM_EXT: 0x8E8C
  - COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT: 0x8E8D
  - COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT: 0x8E8E
  - COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT: 0x8E8F

### 707. EXT_texture_compression_rgtc (interface)
purpose: Interface definition
properties:
  - COMPRESSED_RED_RGTC1_EXT: 0x8DBB
  - COMPRESSED_SIGNED_RED_RGTC1_EXT: 0x8DBC
  - COMPRESSED_RED_GREEN_RGTC2_EXT: 0x8DBD
  - COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT: 0x8DBE

### 708. EXT_texture_filter_anisotropic (interface)
purpose: Interface definition
properties:
  - TEXTURE_MAX_ANISOTROPY_EXT: 0x84FE
  - MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84FF

### 709. EXT_texture_norm16 (interface)
purpose: Interface definition
properties:
  - R16_EXT: 0x822A
  - RG16_EXT: 0x822C
  - RGB16_EXT: 0x8054
  - RGBA16_EXT: 0x805B
  - R16_SNORM_EXT: 0x8F98
  - RG16_SNORM_EXT: 0x8F99
  - RGB16_SNORM_EXT: 0x8F9A
  - RGBA16_SNORM_EXT: 0x8F9B

### 710. EncodedAudioChunk (interface)
purpose: Interface definition
methods:
  - copyTo(destination): void
properties:
  - byteLength: number
  - duration: number | null
  - timestamp: number
  - type: EncodedAudioChunkType

### 711. EncodedVideoChunk (interface)
purpose: Interface definition
methods:
  - copyTo(destination): void
properties:
  - byteLength: number
  - duration: number | null
  - timestamp: number
  - type: EncodedVideoChunkType

### 712. ErrorEvent (interface)
purpose: Interface definition
extends: Event
properties:
  - colno: number
  - error: any
  - filename: string
  - lineno: number
  - message: string

### 713. Event (interface)
purpose: Interface definition
methods:
  - composedPath(): EventTarget[]
  - initEvent(type, bubbles, cancelable): void
  - preventDefault(): void
  - stopImmediatePropagation(): void
  - stopPropagation(): void
properties:
  - bubbles: boolean
  - cancelBubble: boolean
  - cancelable: boolean
  - composed: boolean
  - currentTarget: EventTarget | null
  - defaultPrevented: boolean
  - eventPhase: number
  - isTrusted: boolean
  - returnValue: boolean
  - srcElement: EventTarget | null
  - target: EventTarget | null
  - timeStamp: DOMHighResTimeStamp
  - type: string
  - NONE: 0
  - CAPTURING_PHASE: 1
  - AT_TARGET: 2
  - BUBBLING_PHASE: 3

### 714. EventListener (interface)
purpose: Interface definition

### 715. EventListenerObject (interface)
purpose: Interface definition
methods:
  - handleEvent(object): void

### 716. EventSourceEventMap (interface)
purpose: Interface definition
properties:
  - "error": Event
  - "message": MessageEvent
  - "open": Event

### 717. EventSource (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - onerror: ((this: EventSource, ev: Event) => any) | null
  - onmessage: ((this: EventSource, ev: MessageEvent) => any) | null
  - onopen: ((this: EventSource, ev: Event) => any) | null
  - readyState: number
  - url: string
  - withCredentials: boolean
  - CONNECTING: 0
  - OPEN: 1
  - CLOSED: 2

### 718. EventTarget (interface)
purpose: Interface definition
methods:
  - addEventListener(type, callback, options): void
  - dispatchEvent(event): boolean
  - removeEventListener(type, callback, options): void

### 719. ExtendableCookieChangeEvent (interface)
purpose: Interface definition
extends: ExtendableEvent
properties:
  - changed: ReadonlyArray<CookieListItem>
  - deleted: ReadonlyArray<CookieListItem>

### 720. ExtendableEvent (interface)
purpose: Interface definition
extends: Event
methods:
  - waitUntil(f): void

### 721. ExtendableMessageEvent (interface)
purpose: Interface definition
extends: ExtendableEvent
properties:
  - data: any
  - lastEventId: string
  - origin: string
  - ports: ReadonlyArray<MessagePort>
  - source: Client | ServiceWorker | MessagePort | null

### 722. FetchEvent (interface)
purpose: Interface definition
extends: ExtendableEvent
methods:
  - respondWith(r): void
properties:
  - clientId: string
  - handled: Promise<void>
  - preloadResponse: Promise<any>
  - request: Request
  - resultingClientId: string

### 723. File (interface)
purpose: Interface definition
extends: Blob
properties:
  - lastModified: number
  - name: string
  - webkitRelativePath: string

### 724. FileList (interface)
purpose: Interface definition
methods:
  - item(index): File | null
properties:
  - length: number

### 725. FileReaderEventMap (interface)
purpose: Interface definition
properties:
  - "abort": ProgressEvent<FileReader>
  - "error": ProgressEvent<FileReader>
  - "load": ProgressEvent<FileReader>
  - "loadend": ProgressEvent<FileReader>
  - "loadstart": ProgressEvent<FileReader>
  - "progress": ProgressEvent<FileReader>

### 726. FileReader (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - abort(): void
  - readAsArrayBuffer(blob): void
  - readAsBinaryString(blob): void
  - readAsDataURL(blob): void
  - readAsText(blob, encoding): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - error: DOMException | null
  - onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null
  - onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null
  - onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null
  - onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null
  - onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null
  - onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null
  - readyState: typeof FileReader.EMPTY | typeof FileReader.LOADING | typeof FileReader.DONE
  - result: string | ArrayBuffer | null
  - EMPTY: 0
  - LOADING: 1
  - DONE: 2

### 727. FileReaderSync (interface)
purpose: Interface definition
methods:
  - readAsArrayBuffer(blob): ArrayBuffer
  - readAsBinaryString(blob): string
  - readAsDataURL(blob): string
  - readAsText(blob, encoding): string

### 728. FileSystemDirectoryHandle (interface)
purpose: Interface definition
extends: FileSystemHandle
methods:
  - getDirectoryHandle(name, options): Promise<FileSystemDirectoryHandle>
  - getFileHandle(name, options): Promise<FileSystemFileHandle>
  - removeEntry(name, options): Promise<void>
  - resolve(possibleDescendant): Promise<string[] | null>
properties:
  - kind: "directory"

### 729. FileSystemFileHandle (interface)
purpose: Interface definition
extends: FileSystemHandle
methods:
  - createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>
  - createWritable(options): Promise<FileSystemWritableFileStream>
  - getFile(): Promise<File>
properties:
  - kind: "file"

### 730. FileSystemHandle (interface)
purpose: Interface definition
methods:
  - isSameEntry(other): Promise<boolean>
properties:
  - kind: FileSystemHandleKind
  - name: string

### 731. FileSystemSyncAccessHandle (interface)
purpose: Interface definition
methods:
  - close(): void
  - flush(): void
  - getSize(): number
  - read(buffer, options): number
  - truncate(newSize): void
  - write(buffer, options): number

### 732. FileSystemWritableFileStream (interface)
purpose: Interface definition
extends: WritableStream
methods:
  - seek(position): Promise<void>
  - truncate(size): Promise<void>
  - write(data): Promise<void>

### 733. FontFace (interface)
purpose: Interface definition
methods:
  - load(): Promise<FontFace>
properties:
  - ascentOverride: string
  - descentOverride: string
  - display: FontDisplay
  - family: string
  - featureSettings: string
  - lineGapOverride: string
  - loaded: Promise<FontFace>
  - status: FontFaceLoadStatus
  - stretch: string
  - style: string
  - unicodeRange: string
  - weight: string

### 734. FontFaceSetEventMap (interface)
purpose: Interface definition
properties:
  - "loading": FontFaceSetLoadEvent
  - "loadingdone": FontFaceSetLoadEvent
  - "loadingerror": FontFaceSetLoadEvent

### 735. FontFaceSet (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - check(font, text): boolean
  - load(font, text): Promise<FontFace[]>
  - forEach(callbackfn, thisArg): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - onloading: ((this: FontFaceSet, ev: FontFaceSetLoadEvent) => any) | null
  - onloadingdone: ((this: FontFaceSet, ev: FontFaceSetLoadEvent) => any) | null
  - onloadingerror: ((this: FontFaceSet, ev: FontFaceSetLoadEvent) => any) | null
  - ready: Promise<FontFaceSet>
  - status: FontFaceSetLoadStatus

### 736. FontFaceSetLoadEvent (interface)
purpose: Interface definition
extends: Event
properties:
  - fontfaces: ReadonlyArray<FontFace>

### 737. FontFaceSource (interface)
purpose: Interface definition
properties:
  - fonts: FontFaceSet

### 738. FormData (interface)
purpose: Interface definition
methods:
  - append(name, value): void
  - append(name, value): void
  - append(name, blobValue, filename): void
  - delete(name): void
  - get(name): FormDataEntryValue | null
  - getAll(name): FormDataEntryValue[]
  - has(name): boolean
  - set(name, value): void
  - set(name, value): void
  - set(name, blobValue, filename): void
  - forEach(callbackfn, thisArg): void

### 739. GPUError (interface)
purpose: Interface definition
properties:
  - message: string

### 740. GenericTransformStream (interface)
purpose: Interface definition
properties:
  - readable: ReadableStream
  - writable: WritableStream

### 741. Headers (interface)
purpose: Interface definition
methods:
  - append(name, value): void
  - delete(name): void
  - get(name): string | null
  - getSetCookie(): string[]
  - has(name): boolean
  - set(name, value): void
  - forEach(callbackfn, thisArg): void

### 742. IDBCursor (interface)
purpose: Interface definition
methods:
  - advance(count): void
  - continue(key): void
  - continuePrimaryKey(key, primaryKey): void
  - delete(): IDBRequest<undefined>
  - update(value): IDBRequest<IDBValidKey>
properties:
  - direction: IDBCursorDirection
  - key: IDBValidKey
  - primaryKey: IDBValidKey
  - request: IDBRequest
  - source: IDBObjectStore | IDBIndex

### 743. IDBCursorWithValue (interface)
purpose: Interface definition
extends: IDBCursor
properties:
  - value: any

### 744. IDBDatabaseEventMap (interface)
purpose: Interface definition
properties:
  - "abort": Event
  - "close": Event
  - "error": Event
  - "versionchange": IDBVersionChangeEvent

### 745. IDBDatabase (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(): void
  - createObjectStore(name, options): IDBObjectStore
  - deleteObjectStore(name): void
  - transaction(storeNames, mode, options): IDBTransaction
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - name: string
  - objectStoreNames: DOMStringList
  - onabort: ((this: IDBDatabase, ev: Event) => any) | null
  - onclose: ((this: IDBDatabase, ev: Event) => any) | null
  - onerror: ((this: IDBDatabase, ev: Event) => any) | null
  - onversionchange: ((this: IDBDatabase, ev: IDBVersionChangeEvent) => any) | null
  - version: number

### 746. IDBFactory (interface)
purpose: Interface definition
methods:
  - cmp(first, second): number
  - databases(): Promise<IDBDatabaseInfo[]>
  - deleteDatabase(name): IDBOpenDBRequest
  - open(name, version): IDBOpenDBRequest

### 747. IDBIndex (interface)
purpose: Interface definition
methods:
  - count(query): IDBRequest<number>
  - get(query): IDBRequest<any>
  - getAll(query, count): IDBRequest<any[]>
  - getAllKeys(query, count): IDBRequest<IDBValidKey[]>
  - getKey(query): IDBRequest<IDBValidKey | undefined>
  - openCursor(query, direction): IDBRequest<IDBCursorWithValue | null>
  - openKeyCursor(query, direction): IDBRequest<IDBCursor | null>
properties:
  - keyPath: string | string[]
  - multiEntry: boolean
  - name: string
  - objectStore: IDBObjectStore
  - unique: boolean

### 748. IDBKeyRange (interface)
purpose: Interface definition
methods:
  - includes(key): boolean
properties:
  - lower: any
  - lowerOpen: boolean
  - upper: any
  - upperOpen: boolean

### 749. IDBObjectStore (interface)
purpose: Interface definition
methods:
  - add(value, key): IDBRequest<IDBValidKey>
  - clear(): IDBRequest<undefined>
  - count(query): IDBRequest<number>
  - createIndex(name, keyPath, options): IDBIndex
  - delete(query): IDBRequest<undefined>
  - deleteIndex(name): void
  - get(query): IDBRequest<any>
  - getAll(query, count): IDBRequest<any[]>
  - getAllKeys(query, count): IDBRequest<IDBValidKey[]>
  - getKey(query): IDBRequest<IDBValidKey | undefined>
  - index(name): IDBIndex
  - openCursor(query, direction): IDBRequest<IDBCursorWithValue | null>
  - openKeyCursor(query, direction): IDBRequest<IDBCursor | null>
  - put(value, key): IDBRequest<IDBValidKey>
properties:
  - autoIncrement: boolean
  - indexNames: DOMStringList
  - keyPath: string | string[] | null
  - name: string
  - transaction: IDBTransaction

### 750. IDBOpenDBRequestEventMap (interface)
purpose: Interface definition
extends: IDBRequestEventMap
properties:
  - "blocked": IDBVersionChangeEvent
  - "upgradeneeded": IDBVersionChangeEvent

### 751. IDBOpenDBRequest (interface)
purpose: Interface definition
extends: IDBRequest<IDBDatabase>
methods:
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - onblocked: ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any) | null
  - onupgradeneeded: ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any) | null

### 752. IDBRequestEventMap (interface)
purpose: Interface definition
properties:
  - "error": Event
  - "success": Event

### 753. IDBRequest (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - error: DOMException | null
  - onerror: ((this: IDBRequest<T>, ev: Event) => any) | null
  - onsuccess: ((this: IDBRequest<T>, ev: Event) => any) | null
  - readyState: IDBRequestReadyState
  - result: T
  - source: IDBObjectStore | IDBIndex | IDBCursor
  - transaction: IDBTransaction | null

### 754. IDBTransactionEventMap (interface)
purpose: Interface definition
properties:
  - "abort": Event
  - "complete": Event
  - "error": Event

### 755. IDBTransaction (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - abort(): void
  - commit(): void
  - objectStore(name): IDBObjectStore
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - db: IDBDatabase
  - durability: IDBTransactionDurability
  - error: DOMException | null
  - mode: IDBTransactionMode
  - objectStoreNames: DOMStringList
  - onabort: ((this: IDBTransaction, ev: Event) => any) | null
  - oncomplete: ((this: IDBTransaction, ev: Event) => any) | null
  - onerror: ((this: IDBTransaction, ev: Event) => any) | null

### 756. IDBVersionChangeEvent (interface)
purpose: Interface definition
extends: Event
properties:
  - newVersion: number | null
  - oldVersion: number

### 757. ImageBitmap (interface)
purpose: Interface definition
methods:
  - close(): void
properties:
  - height: number
  - width: number

### 758. ImageBitmapRenderingContext (interface)
purpose: Interface definition
methods:
  - transferFromImageBitmap(bitmap): void

### 759. ImageData (interface)
purpose: Interface definition
properties:
  - colorSpace: PredefinedColorSpace
  - data: ImageDataArray
  - height: number
  - width: number

### 760. ImageDecoder (interface)
purpose: Interface definition
methods:
  - close(): void
  - decode(options): Promise<ImageDecodeResult>
  - reset(): void
properties:
  - complete: boolean
  - completed: Promise<void>
  - tracks: ImageTrackList
  - type: string

### 761. ImageTrack (interface)
purpose: Interface definition
properties:
  - animated: boolean
  - frameCount: number
  - repetitionCount: number
  - selected: boolean

### 762. ImageTrackList (interface)
purpose: Interface definition
properties:
  - length: number
  - ready: Promise<void>
  - selectedIndex: number
  - selectedTrack: ImageTrack | null

### 763. ImportMeta (interface)
purpose: Interface definition
methods:
  - resolve(specifier): string
properties:
  - url: string

### 764. KHR_parallel_shader_compile (interface)
purpose: Interface definition
properties:
  - COMPLETION_STATUS_KHR: 0x91B1

### 765. Lock (interface)
purpose: Interface definition
properties:
  - mode: LockMode
  - name: string

### 766. LockManager (interface)
purpose: Interface definition
methods:
  - query(): Promise<LockManagerSnapshot>
  - request(name, callback): Promise<T>
  - request(name, options, callback): Promise<T>

### 767. MediaCapabilities (interface)
purpose: Interface definition
methods:
  - decodingInfo(configuration): Promise<MediaCapabilitiesDecodingInfo>
  - encodingInfo(configuration): Promise<MediaCapabilitiesEncodingInfo>

### 768. MediaSourceHandle (interface)
purpose: Interface definition

### 769. MediaStreamTrackProcessor (interface)
purpose: Interface definition
properties:
  - readable: ReadableStream

### 770. MessageChannel (interface)
purpose: Interface definition
properties:
  - port1: MessagePort
  - port2: MessagePort

### 771. MessageEvent (interface)
purpose: Interface definition
extends: Event
methods:
  - initMessageEvent(type, bubbles, cancelable, data, origin, lastEventId, source, ports): void
properties:
  - data: T
  - lastEventId: string
  - origin: string
  - ports: ReadonlyArray<MessagePort>
  - source: MessageEventSource | null

### 772. MessageEventTargetEventMap (interface)
purpose: Interface definition
properties:
  - "message": MessageEvent
  - "messageerror": MessageEvent

### 773. MessageEventTarget (interface)
purpose: Interface definition
methods:
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - onmessage: ((this: T, ev: MessageEvent) => any) | null
  - onmessageerror: ((this: T, ev: MessageEvent) => any) | null

### 774. MessagePortEventMap (interface)
purpose: Interface definition
extends: MessageEventTargetEventMap
properties:
  - "message": MessageEvent
  - "messageerror": MessageEvent

### 775. MessagePort (interface)
purpose: Interface definition
extends: EventTarget, MessageEventTarget<MessagePort>
methods:
  - close(): void
  - postMessage(message, transfer): void
  - postMessage(message, options): void
  - start(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void

### 776. NavigationPreloadManager (interface)
purpose: Interface definition
methods:
  - disable(): Promise<void>
  - enable(): Promise<void>
  - getState(): Promise<NavigationPreloadState>
  - setHeaderValue(value): Promise<void>

### 777. NavigatorBadge (interface)
purpose: Interface definition
methods:
  - clearAppBadge(): Promise<void>
  - setAppBadge(contents): Promise<void>

### 778. NavigatorConcurrentHardware (interface)
purpose: Interface definition
properties:
  - hardwareConcurrency: number

### 779. NavigatorID (interface)
purpose: Interface definition
properties:
  - appCodeName: string
  - appName: string
  - appVersion: string
  - platform: string
  - product: string
  - userAgent: string

### 780. NavigatorLanguage (interface)
purpose: Interface definition
properties:
  - language: string
  - languages: ReadonlyArray<string>

### 781. NavigatorLocks (interface)
purpose: Interface definition
properties:
  - locks: LockManager

### 782. NavigatorOnLine (interface)
purpose: Interface definition
properties:
  - onLine: boolean

### 783. NavigatorStorage (interface)
purpose: Interface definition
properties:
  - storage: StorageManager

### 784. NotificationEventMap (interface)
purpose: Interface definition
properties:
  - "click": Event
  - "close": Event
  - "error": Event
  - "show": Event

### 785. Notification (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - badge: string
  - body: string
  - data: any
  - dir: NotificationDirection
  - icon: string
  - lang: string
  - onclick: ((this: Notification, ev: Event) => any) | null
  - onclose: ((this: Notification, ev: Event) => any) | null
  - onerror: ((this: Notification, ev: Event) => any) | null
  - onshow: ((this: Notification, ev: Event) => any) | null
  - requireInteraction: boolean
  - silent: boolean | null
  - tag: string
  - title: string

### 786. NotificationEvent (interface)
purpose: Interface definition
extends: ExtendableEvent
properties:
  - action: string
  - notification: Notification

### 787. OES_draw_buffers_indexed (interface)
purpose: Interface definition
methods:
  - blendEquationSeparateiOES(buf, modeRGB, modeAlpha): void
  - blendEquationiOES(buf, mode): void
  - blendFuncSeparateiOES(buf, srcRGB, dstRGB, srcAlpha, dstAlpha): void
  - blendFunciOES(buf, src, dst): void
  - colorMaskiOES(buf, r, g, b, a): void
  - disableiOES(target, index): void
  - enableiOES(target, index): void

### 788. OES_element_index_uint (interface)
purpose: Interface definition

### 789. OES_fbo_render_mipmap (interface)
purpose: Interface definition

### 790. OES_standard_derivatives (interface)
purpose: Interface definition
properties:
  - FRAGMENT_SHADER_DERIVATIVE_HINT_OES: 0x8B8B

### 791. OES_texture_float (interface)
purpose: Interface definition

### 792. OES_texture_float_linear (interface)
purpose: Interface definition

### 793. OES_texture_half_float (interface)
purpose: Interface definition
properties:
  - HALF_FLOAT_OES: 0x8D61

### 794. OES_texture_half_float_linear (interface)
purpose: Interface definition

### 795. OES_vertex_array_object (interface)
purpose: Interface definition
methods:
  - bindVertexArrayOES(arrayObject): void
  - createVertexArrayOES(): WebGLVertexArrayObjectOES
  - deleteVertexArrayOES(arrayObject): void
  - isVertexArrayOES(arrayObject): GLboolean
properties:
  - VERTEX_ARRAY_BINDING_OES: 0x85B5

### 796. OVR_multiview2 (interface)
purpose: Interface definition
methods:
  - framebufferTextureMultiviewOVR(target, attachment, texture, level, baseViewIndex, numViews): void
properties:
  - FRAMEBUFFER_ATTACHMENT_TEXTURE_NUM_VIEWS_OVR: 0x9630
  - FRAMEBUFFER_ATTACHMENT_TEXTURE_BASE_VIEW_INDEX_OVR: 0x9632
  - MAX_VIEWS_OVR: 0x9631
  - FRAMEBUFFER_INCOMPLETE_VIEW_TARGETS_OVR: 0x9633

### 797. OffscreenCanvasEventMap (interface)
purpose: Interface definition
properties:
  - "contextlost": Event
  - "contextrestored": Event

### 798. OffscreenCanvas (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - convertToBlob(options): Promise<Blob>
  - getContext(contextId, options): OffscreenCanvasRenderingContext2D | null
  - getContext(contextId, options): ImageBitmapRenderingContext | null
  - getContext(contextId, options): WebGLRenderingContext | null
  - getContext(contextId, options): WebGL2RenderingContext | null
  - getContext(contextId, options): OffscreenRenderingContext | null
  - transferToImageBitmap(): ImageBitmap
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - height: number
  - oncontextlost: ((this: OffscreenCanvas, ev: Event) => any) | null
  - oncontextrestored: ((this: OffscreenCanvas, ev: Event) => any) | null
  - width: number

### 799. OffscreenCanvasRenderingContext2D (interface)
purpose: Interface definition
extends: CanvasCompositing, CanvasDrawImage, CanvasDrawPath, CanvasFillStrokeStyles, CanvasFilters, CanvasImageData, CanvasImageSmoothing, CanvasPath, CanvasPathDrawingStyles, CanvasRect, CanvasShadowStyles, CanvasState, CanvasText, CanvasTextDrawingStyles, CanvasTransform
properties:
  - canvas: OffscreenCanvas

### 800. Path2D (interface)
purpose: Interface definition
extends: CanvasPath
methods:
  - addPath(path, transform): void

### 801. PerformanceEventMap (interface)
purpose: Interface definition
properties:
  - "resourcetimingbufferfull": Event

### 802. Performance (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - clearMarks(markName): void
  - clearMeasures(measureName): void
  - clearResourceTimings(): void
  - getEntries(): PerformanceEntryList
  - getEntriesByName(name, type): PerformanceEntryList
  - getEntriesByType(type): PerformanceEntryList
  - mark(markName, markOptions): PerformanceMark
  - measure(measureName, startOrMeasureOptions, endMark): PerformanceMeasure
  - now(): DOMHighResTimeStamp
  - setResourceTimingBufferSize(maxSize): void
  - toJSON(): any
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - onresourcetimingbufferfull: ((this: Performance, ev: Event) => any) | null
  - timeOrigin: DOMHighResTimeStamp

### 803. PerformanceEntry (interface)
purpose: Interface definition
methods:
  - toJSON(): any
properties:
  - duration: DOMHighResTimeStamp
  - entryType: string
  - name: string
  - startTime: DOMHighResTimeStamp

### 804. PerformanceMark (interface)
purpose: Interface definition
extends: PerformanceEntry
properties:
  - detail: any

### 805. PerformanceMeasure (interface)
purpose: Interface definition
extends: PerformanceEntry
properties:
  - detail: any

### 806. PerformanceObserver (interface)
purpose: Interface definition
methods:
  - disconnect(): void
  - observe(options): void
  - takeRecords(): PerformanceEntryList

### 807. PerformanceObserverEntryList (interface)
purpose: Interface definition
methods:
  - getEntries(): PerformanceEntryList
  - getEntriesByName(name, type): PerformanceEntryList
  - getEntriesByType(type): PerformanceEntryList

### 808. PerformanceResourceTiming (interface)
purpose: Interface definition
extends: PerformanceEntry
methods:
  - toJSON(): any
properties:
  - connectEnd: DOMHighResTimeStamp
  - connectStart: DOMHighResTimeStamp
  - decodedBodySize: number
  - domainLookupEnd: DOMHighResTimeStamp
  - domainLookupStart: DOMHighResTimeStamp
  - encodedBodySize: number
  - fetchStart: DOMHighResTimeStamp
  - initiatorType: string
  - nextHopProtocol: string
  - redirectEnd: DOMHighResTimeStamp
  - redirectStart: DOMHighResTimeStamp
  - requestStart: DOMHighResTimeStamp
  - responseEnd: DOMHighResTimeStamp
  - responseStart: DOMHighResTimeStamp
  - responseStatus: number
  - secureConnectionStart: DOMHighResTimeStamp
  - serverTiming: ReadonlyArray<PerformanceServerTiming>
  - transferSize: number
  - workerStart: DOMHighResTimeStamp

### 809. PerformanceServerTiming (interface)
purpose: Interface definition
methods:
  - toJSON(): any
properties:
  - description: string
  - duration: DOMHighResTimeStamp
  - name: string

### 810. PermissionStatusEventMap (interface)
purpose: Interface definition
properties:
  - "change": Event

### 811. PermissionStatus (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - name: string
  - onchange: ((this: PermissionStatus, ev: Event) => any) | null
  - state: PermissionState

### 812. Permissions (interface)
purpose: Interface definition
methods:
  - query(permissionDesc): Promise<PermissionStatus>

### 813. ProgressEvent (interface)
purpose: Interface definition
extends: Event
properties:
  - lengthComputable: boolean
  - loaded: number
  - target: T | null
  - total: number

### 814. PromiseRejectionEvent (interface)
purpose: Interface definition
extends: Event
properties:
  - promise: Promise<any>
  - reason: any

### 815. PushEvent (interface)
purpose: Interface definition
extends: ExtendableEvent
properties:
  - data: PushMessageData | null

### 816. PushManager (interface)
purpose: Interface definition
methods:
  - getSubscription(): Promise<PushSubscription | null>
  - permissionState(options): Promise<PermissionState>
  - subscribe(options): Promise<PushSubscription>

### 817. PushMessageData (interface)
purpose: Interface definition
methods:
  - arrayBuffer(): ArrayBuffer
  - blob(): Blob
  - bytes(): Uint8Array<ArrayBuffer>
  - json(): any
  - text(): string

### 818. PushSubscription (interface)
purpose: Interface definition
methods:
  - getKey(name): ArrayBuffer | null
  - toJSON(): PushSubscriptionJSON
  - unsubscribe(): Promise<boolean>
properties:
  - endpoint: string
  - expirationTime: EpochTimeStamp | null
  - options: PushSubscriptionOptions

### 819. PushSubscriptionChangeEvent (interface)
purpose: Interface definition
extends: ExtendableEvent
properties:
  - newSubscription: PushSubscription | null
  - oldSubscription: PushSubscription | null

### 820. PushSubscriptionOptions (interface)
purpose: Interface definition
properties:
  - applicationServerKey: ArrayBuffer | null
  - userVisibleOnly: boolean

### 821. RTCDataChannelEventMap (interface)
purpose: Interface definition
properties:
  - "bufferedamountlow": Event
  - "close": Event
  - "closing": Event
  - "error": Event
  - "message": MessageEvent
  - "open": Event

### 822. RTCDataChannel (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(): void
  - send(data): void
  - send(data): void
  - send(data): void
  - send(data): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - binaryType: BinaryType
  - bufferedAmount: number
  - bufferedAmountLowThreshold: number
  - id: number | null
  - label: string
  - maxPacketLifeTime: number | null
  - maxRetransmits: number | null
  - negotiated: boolean
  - onbufferedamountlow: ((this: RTCDataChannel, ev: Event) => any) | null
  - onclose: ((this: RTCDataChannel, ev: Event) => any) | null
  - onclosing: ((this: RTCDataChannel, ev: Event) => any) | null
  - onerror: ((this: RTCDataChannel, ev: Event) => any) | null
  - onmessage: ((this: RTCDataChannel, ev: MessageEvent) => any) | null
  - onopen: ((this: RTCDataChannel, ev: Event) => any) | null
  - ordered: boolean
  - protocol: string
  - readyState: RTCDataChannelState

### 823. RTCEncodedAudioFrame (interface)
purpose: Interface definition
methods:
  - getMetadata(): RTCEncodedAudioFrameMetadata
properties:
  - data: ArrayBuffer
  - timestamp: number

### 824. RTCEncodedVideoFrame (interface)
purpose: Interface definition
methods:
  - getMetadata(): RTCEncodedVideoFrameMetadata
properties:
  - data: ArrayBuffer
  - timestamp: number
  - type: RTCEncodedVideoFrameType

### 825. RTCRtpScriptTransformer (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - generateKeyFrame(rid): Promise<number>
  - sendKeyFrameRequest(): Promise<void>
properties:
  - options: any
  - readable: ReadableStream
  - writable: WritableStream

### 826. RTCTransformEvent (interface)
purpose: Interface definition
extends: Event
properties:
  - transformer: RTCRtpScriptTransformer

### 827. ReadableByteStreamController (interface)
purpose: Interface definition
methods:
  - close(): void
  - enqueue(chunk): void
  - error(e): void
properties:
  - byobRequest: ReadableStreamBYOBRequest | null
  - desiredSize: number | null

### 828. ReadableStream (interface)
purpose: Interface definition
methods:
  - cancel(reason): Promise<void>
  - getReader(options): ReadableStreamBYOBReader
  - getReader(): ReadableStreamDefaultReader<R>
  - getReader(options): ReadableStreamReader<R>
  - pipeThrough(transform, options): ReadableStream<T>
  - pipeTo(destination, options): Promise<void>
  - tee(): [ReadableStream<R>, ReadableStream<R>]
properties:
  - locked: boolean

### 829. ReadableStreamBYOBReader (interface)
purpose: Interface definition
extends: ReadableStreamGenericReader
methods:
  - read(view): Promise<ReadableStreamReadResult<T>>
  - releaseLock(): void

### 830. ReadableStreamBYOBRequest (interface)
purpose: Interface definition
methods:
  - respond(bytesWritten): void
  - respondWithNewView(view): void
properties:
  - view: ArrayBufferView<ArrayBuffer> | null

### 831. ReadableStreamDefaultController (interface)
purpose: Interface definition
methods:
  - close(): void
  - enqueue(chunk): void
  - error(e): void
properties:
  - desiredSize: number | null

### 832. ReadableStreamDefaultReader (interface)
purpose: Interface definition
extends: ReadableStreamGenericReader
methods:
  - read(): Promise<ReadableStreamReadResult<R>>
  - releaseLock(): void

### 833. ReadableStreamGenericReader (interface)
purpose: Interface definition
methods:
  - cancel(reason): Promise<void>
properties:
  - closed: Promise<void>

### 834. Report (interface)
purpose: Interface definition
methods:
  - toJSON(): any
properties:
  - body: ReportBody | null
  - type: string
  - url: string

### 835. ReportBody (interface)
purpose: Interface definition
methods:
  - toJSON(): any

### 836. ReportingObserver (interface)
purpose: Interface definition
methods:
  - disconnect(): void
  - observe(): void
  - takeRecords(): ReportList

### 837. Request (interface)
purpose: Interface definition
extends: Body
methods:
  - clone(): Request
properties:
  - cache: RequestCache
  - credentials: RequestCredentials
  - destination: RequestDestination
  - headers: Headers
  - integrity: string
  - keepalive: boolean
  - method: string
  - mode: RequestMode
  - redirect: RequestRedirect
  - referrer: string
  - referrerPolicy: ReferrerPolicy
  - signal: AbortSignal
  - url: string

### 838. Response (interface)
purpose: Interface definition
extends: Body
methods:
  - clone(): Response
properties:
  - headers: Headers
  - ok: boolean
  - redirected: boolean
  - status: number
  - statusText: string
  - type: ResponseType
  - url: string

### 839. SecurityPolicyViolationEvent (interface)
purpose: Interface definition
extends: Event
properties:
  - blockedURI: string
  - columnNumber: number
  - disposition: SecurityPolicyViolationEventDisposition
  - documentURI: string
  - effectiveDirective: string
  - lineNumber: number
  - originalPolicy: string
  - referrer: string
  - sample: string
  - sourceFile: string
  - statusCode: number
  - violatedDirective: string

### 840. ServiceWorkerEventMap (interface)
purpose: Interface definition
extends: AbstractWorkerEventMap
properties:
  - "statechange": Event

### 841. ServiceWorker (interface)
purpose: Interface definition
extends: EventTarget, AbstractWorker
methods:
  - postMessage(message, transfer): void
  - postMessage(message, options): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - onstatechange: ((this: ServiceWorker, ev: Event) => any) | null
  - scriptURL: string
  - state: ServiceWorkerState

### 842. ServiceWorkerContainerEventMap (interface)
purpose: Interface definition
properties:
  - "controllerchange": Event
  - "message": MessageEvent
  - "messageerror": MessageEvent

### 843. ServiceWorkerContainer (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - getRegistration(clientURL): Promise<ServiceWorkerRegistration | undefined>
  - getRegistrations(): Promise<ReadonlyArray<ServiceWorkerRegistration>>
  - register(scriptURL, options): Promise<ServiceWorkerRegistration>
  - startMessages(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - controller: ServiceWorker | null
  - oncontrollerchange: ((this: ServiceWorkerContainer, ev: Event) => any) | null
  - onmessage: ((this: ServiceWorkerContainer, ev: MessageEvent) => any) | null
  - onmessageerror: ((this: ServiceWorkerContainer, ev: MessageEvent) => any) | null
  - ready: Promise<ServiceWorkerRegistration>

### 844. ServiceWorkerGlobalScopeEventMap (interface)
purpose: Interface definition
extends: WorkerGlobalScopeEventMap
properties:
  - "activate": ExtendableEvent
  - "cookiechange": ExtendableCookieChangeEvent
  - "fetch": FetchEvent
  - "install": ExtendableEvent
  - "message": ExtendableMessageEvent
  - "messageerror": MessageEvent
  - "notificationclick": NotificationEvent
  - "notificationclose": NotificationEvent
  - "push": PushEvent
  - "pushsubscriptionchange": PushSubscriptionChangeEvent

### 845. ServiceWorkerGlobalScope (interface)
purpose: Interface definition
extends: WorkerGlobalScope
methods:
  - skipWaiting(): Promise<void>
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - clients: Clients
  - cookieStore: CookieStore
  - onactivate: ((this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any) | null
  - oncookiechange: ((this: ServiceWorkerGlobalScope, ev: ExtendableCookieChangeEvent) => any) | null
  - onfetch: ((this: ServiceWorkerGlobalScope, ev: FetchEvent) => any) | null
  - oninstall: ((this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any) | null
  - onmessage: ((this: ServiceWorkerGlobalScope, ev: ExtendableMessageEvent) => any) | null
  - onmessageerror: ((this: ServiceWorkerGlobalScope, ev: MessageEvent) => any) | null
  - onnotificationclick: ((this: ServiceWorkerGlobalScope, ev: NotificationEvent) => any) | null
  - onnotificationclose: ((this: ServiceWorkerGlobalScope, ev: NotificationEvent) => any) | null
  - onpush: ((this: ServiceWorkerGlobalScope, ev: PushEvent) => any) | null
  - onpushsubscriptionchange: ((this: ServiceWorkerGlobalScope, ev: PushSubscriptionChangeEvent) => any) | null
  - registration: ServiceWorkerRegistration
  - serviceWorker: ServiceWorker

### 846. ServiceWorkerRegistrationEventMap (interface)
purpose: Interface definition
properties:
  - "updatefound": Event

### 847. ServiceWorkerRegistration (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - getNotifications(filter): Promise<Notification[]>
  - showNotification(title, options): Promise<void>
  - unregister(): Promise<boolean>
  - update(): Promise<ServiceWorkerRegistration>
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - active: ServiceWorker | null
  - cookies: CookieStoreManager
  - installing: ServiceWorker | null
  - navigationPreload: NavigationPreloadManager
  - onupdatefound: ((this: ServiceWorkerRegistration, ev: Event) => any) | null
  - pushManager: PushManager
  - scope: string
  - updateViaCache: ServiceWorkerUpdateViaCache
  - waiting: ServiceWorker | null

### 848. SharedWorkerGlobalScopeEventMap (interface)
purpose: Interface definition
extends: WorkerGlobalScopeEventMap
properties:
  - "connect": MessageEvent

### 849. SharedWorkerGlobalScope (interface)
purpose: Interface definition
extends: WorkerGlobalScope
methods:
  - close(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - name: string
  - onconnect: ((this: SharedWorkerGlobalScope, ev: MessageEvent) => any) | null

### 850. StorageManager (interface)
purpose: Interface definition
methods:
  - estimate(): Promise<StorageEstimate>
  - getDirectory(): Promise<FileSystemDirectoryHandle>
  - persisted(): Promise<boolean>

### 851. StylePropertyMapReadOnly (interface)
purpose: Interface definition
methods:
  - get(property): undefined | CSSStyleValue
  - getAll(property): CSSStyleValue[]
  - has(property): boolean
  - forEach(callbackfn, thisArg): void
properties:
  - size: number

### 852. SubtleCrypto (interface)
purpose: Interface definition
methods:
  - decrypt(algorithm, key, data): Promise<ArrayBuffer>
  - deriveBits(algorithm, baseKey, length): Promise<ArrayBuffer>
  - deriveKey(algorithm, baseKey, derivedKeyType, extractable, keyUsages): Promise<CryptoKey>
  - digest(algorithm, data): Promise<ArrayBuffer>
  - encrypt(algorithm, key, data): Promise<ArrayBuffer>
  - exportKey(format, key): Promise<JsonWebKey>
  - exportKey(format, key): Promise<ArrayBuffer>
  - exportKey(format, key): Promise<ArrayBuffer | JsonWebKey>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKeyPair>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKeyPair>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKey>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKeyPair | CryptoKey>
  - importKey(format, keyData, algorithm, extractable, keyUsages): Promise<CryptoKey>
  - importKey(format, keyData, algorithm, extractable, keyUsages): Promise<CryptoKey>
  - sign(algorithm, key, data): Promise<ArrayBuffer>
  - unwrapKey(format, wrappedKey, unwrappingKey, unwrapAlgorithm, unwrappedKeyAlgorithm, extractable, keyUsages): Promise<CryptoKey>
  - verify(algorithm, key, signature, data): Promise<boolean>
  - wrapKey(format, key, wrappingKey, wrapAlgorithm): Promise<ArrayBuffer>

### 853. TextDecoder (interface)
purpose: Interface definition
extends: TextDecoderCommon
methods:
  - decode(input, options): string

### 854. TextDecoderCommon (interface)
purpose: Interface definition
properties:
  - encoding: string
  - fatal: boolean
  - ignoreBOM: boolean

### 855. TextDecoderStream (interface)
purpose: Interface definition
extends: GenericTransformStream, TextDecoderCommon
properties:
  - readable: ReadableStream<string>
  - writable: WritableStream<BufferSource>

### 856. TextEncoder (interface)
purpose: Interface definition
extends: TextEncoderCommon
methods:
  - encode(input): Uint8Array<ArrayBuffer>
  - encodeInto(source, destination): TextEncoderEncodeIntoResult

### 857. TextEncoderCommon (interface)
purpose: Interface definition
properties:
  - encoding: string

### 858. TextEncoderStream (interface)
purpose: Interface definition
extends: GenericTransformStream, TextEncoderCommon
properties:
  - readable: ReadableStream<Uint8Array<ArrayBuffer>>
  - writable: WritableStream<string>

### 859. TextMetrics (interface)
purpose: Interface definition
properties:
  - actualBoundingBoxAscent: number
  - actualBoundingBoxDescent: number
  - actualBoundingBoxLeft: number
  - actualBoundingBoxRight: number
  - alphabeticBaseline: number
  - emHeightAscent: number
  - emHeightDescent: number
  - fontBoundingBoxAscent: number
  - fontBoundingBoxDescent: number
  - hangingBaseline: number
  - ideographicBaseline: number
  - width: number

### 860. TransformStream (interface)
purpose: Interface definition
properties:
  - readable: ReadableStream<O>
  - writable: WritableStream<I>

### 861. TransformStreamDefaultController (interface)
purpose: Interface definition
methods:
  - enqueue(chunk): void
  - error(reason): void
  - terminate(): void
properties:
  - desiredSize: number | null

### 862. URL (interface)
purpose: Interface definition
methods:
  - toString(): string
  - toJSON(): string
properties:
  - hash: string
  - host: string
  - hostname: string
  - href: string
  - origin: string
  - password: string
  - pathname: string
  - port: string
  - protocol: string
  - search: string
  - searchParams: URLSearchParams
  - username: string

### 863. URLSearchParams (interface)
purpose: Interface definition
methods:
  - append(name, value): void
  - delete(name, value): void
  - get(name): string | null
  - getAll(name): string[]
  - has(name, value): boolean
  - set(name, value): void
  - sort(): void
  - toString(): string
  - forEach(callbackfn, thisArg): void
properties:
  - size: number

### 864. VideoColorSpace (interface)
purpose: Interface definition
methods:
  - toJSON(): VideoColorSpaceInit
properties:
  - fullRange: boolean | null
  - matrix: VideoMatrixCoefficients | null
  - primaries: VideoColorPrimaries | null
  - transfer: VideoTransferCharacteristics | null

### 865. VideoDecoderEventMap (interface)
purpose: Interface definition
properties:
  - "dequeue": Event

### 866. VideoDecoder (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(): void
  - configure(config): void
  - decode(chunk): void
  - flush(): Promise<void>
  - reset(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - decodeQueueSize: number
  - ondequeue: ((this: VideoDecoder, ev: Event) => any) | null
  - state: CodecState

### 867. VideoEncoderEventMap (interface)
purpose: Interface definition
properties:
  - "dequeue": Event

### 868. VideoEncoder (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(): void
  - configure(config): void
  - encode(frame, options): void
  - flush(): Promise<void>
  - reset(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - encodeQueueSize: number
  - ondequeue: ((this: VideoEncoder, ev: Event) => any) | null
  - state: CodecState

### 869. VideoFrame (interface)
purpose: Interface definition
methods:
  - allocationSize(options): number
  - clone(): VideoFrame
  - close(): void
  - copyTo(destination, options): Promise<PlaneLayout[]>
properties:
  - codedHeight: number
  - codedRect: DOMRectReadOnly | null
  - codedWidth: number
  - colorSpace: VideoColorSpace
  - displayHeight: number
  - displayWidth: number
  - duration: number | null
  - format: VideoPixelFormat | null
  - timestamp: number
  - visibleRect: DOMRectReadOnly | null

### 870. WEBGL_color_buffer_float (interface)
purpose: Interface definition
properties:
  - RGBA32F_EXT: 0x8814
  - FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211
  - UNSIGNED_NORMALIZED_EXT: 0x8C17

### 871. WEBGL_compressed_texture_astc (interface)
purpose: Interface definition
methods:
  - getSupportedProfiles(): string[]
properties:
  - COMPRESSED_RGBA_ASTC_4x4_KHR: 0x93B0
  - COMPRESSED_RGBA_ASTC_5x4_KHR: 0x93B1
  - COMPRESSED_RGBA_ASTC_5x5_KHR: 0x93B2
  - COMPRESSED_RGBA_ASTC_6x5_KHR: 0x93B3
  - COMPRESSED_RGBA_ASTC_6x6_KHR: 0x93B4
  - COMPRESSED_RGBA_ASTC_8x5_KHR: 0x93B5
  - COMPRESSED_RGBA_ASTC_8x6_KHR: 0x93B6
  - COMPRESSED_RGBA_ASTC_8x8_KHR: 0x93B7
  - COMPRESSED_RGBA_ASTC_10x5_KHR: 0x93B8
  - COMPRESSED_RGBA_ASTC_10x6_KHR: 0x93B9
  - COMPRESSED_RGBA_ASTC_10x8_KHR: 0x93BA
  - COMPRESSED_RGBA_ASTC_10x10_KHR: 0x93BB
  - COMPRESSED_RGBA_ASTC_12x10_KHR: 0x93BC
  - COMPRESSED_RGBA_ASTC_12x12_KHR: 0x93BD
  - COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR: 0x93D0
  - COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR: 0x93D1
  - COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR: 0x93D2
  - COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR: 0x93D3
  - COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR: 0x93D4
  - COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR: 0x93D5
  - COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR: 0x93D6
  - COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR: 0x93D7
  - COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR: 0x93D8
  - COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR: 0x93D9
  - COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR: 0x93DA
  - COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR: 0x93DB
  - COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR: 0x93DC
  - COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR: 0x93DD

### 872. WEBGL_compressed_texture_etc (interface)
purpose: Interface definition
properties:
  - COMPRESSED_R11_EAC: 0x9270
  - COMPRESSED_SIGNED_R11_EAC: 0x9271
  - COMPRESSED_RG11_EAC: 0x9272
  - COMPRESSED_SIGNED_RG11_EAC: 0x9273
  - COMPRESSED_RGB8_ETC2: 0x9274
  - COMPRESSED_SRGB8_ETC2: 0x9275
  - COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: 0x9276
  - COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: 0x9277
  - COMPRESSED_RGBA8_ETC2_EAC: 0x9278
  - COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: 0x9279

### 873. WEBGL_compressed_texture_etc1 (interface)
purpose: Interface definition
properties:
  - COMPRESSED_RGB_ETC1_WEBGL: 0x8D64

### 874. WEBGL_compressed_texture_pvrtc (interface)
purpose: Interface definition
properties:
  - COMPRESSED_RGB_PVRTC_4BPPV1_IMG: 0x8C00
  - COMPRESSED_RGB_PVRTC_2BPPV1_IMG: 0x8C01
  - COMPRESSED_RGBA_PVRTC_4BPPV1_IMG: 0x8C02
  - COMPRESSED_RGBA_PVRTC_2BPPV1_IMG: 0x8C03

### 875. WEBGL_compressed_texture_s3tc (interface)
purpose: Interface definition
properties:
  - COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0
  - COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1
  - COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83F2
  - COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3

### 876. WEBGL_compressed_texture_s3tc_srgb (interface)
purpose: Interface definition
properties:
  - COMPRESSED_SRGB_S3TC_DXT1_EXT: 0x8C4C
  - COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT: 0x8C4D
  - COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT: 0x8C4E
  - COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT: 0x8C4F

### 877. WEBGL_debug_renderer_info (interface)
purpose: Interface definition
properties:
  - UNMASKED_VENDOR_WEBGL: 0x9245
  - UNMASKED_RENDERER_WEBGL: 0x9246

### 878. WEBGL_debug_shaders (interface)
purpose: Interface definition
methods:
  - getTranslatedShaderSource(shader): string

### 879. WEBGL_depth_texture (interface)
purpose: Interface definition
properties:
  - UNSIGNED_INT_24_8_WEBGL: 0x84FA

### 880. WEBGL_draw_buffers (interface)
purpose: Interface definition
methods:
  - drawBuffersWEBGL(buffers): void
properties:
  - COLOR_ATTACHMENT0_WEBGL: 0x8CE0
  - COLOR_ATTACHMENT1_WEBGL: 0x8CE1
  - COLOR_ATTACHMENT2_WEBGL: 0x8CE2
  - COLOR_ATTACHMENT3_WEBGL: 0x8CE3
  - COLOR_ATTACHMENT4_WEBGL: 0x8CE4
  - COLOR_ATTACHMENT5_WEBGL: 0x8CE5
  - COLOR_ATTACHMENT6_WEBGL: 0x8CE6
  - COLOR_ATTACHMENT7_WEBGL: 0x8CE7
  - COLOR_ATTACHMENT8_WEBGL: 0x8CE8
  - COLOR_ATTACHMENT9_WEBGL: 0x8CE9
  - COLOR_ATTACHMENT10_WEBGL: 0x8CEA
  - COLOR_ATTACHMENT11_WEBGL: 0x8CEB
  - COLOR_ATTACHMENT12_WEBGL: 0x8CEC
  - COLOR_ATTACHMENT13_WEBGL: 0x8CED
  - COLOR_ATTACHMENT14_WEBGL: 0x8CEE
  - COLOR_ATTACHMENT15_WEBGL: 0x8CEF
  - DRAW_BUFFER0_WEBGL: 0x8825
  - DRAW_BUFFER1_WEBGL: 0x8826
  - DRAW_BUFFER2_WEBGL: 0x8827
  - DRAW_BUFFER3_WEBGL: 0x8828
  - DRAW_BUFFER4_WEBGL: 0x8829
  - DRAW_BUFFER5_WEBGL: 0x882A
  - DRAW_BUFFER6_WEBGL: 0x882B
  - DRAW_BUFFER7_WEBGL: 0x882C
  - DRAW_BUFFER8_WEBGL: 0x882D
  - DRAW_BUFFER9_WEBGL: 0x882E
  - DRAW_BUFFER10_WEBGL: 0x882F
  - DRAW_BUFFER11_WEBGL: 0x8830
  - DRAW_BUFFER12_WEBGL: 0x8831
  - DRAW_BUFFER13_WEBGL: 0x8832
  - DRAW_BUFFER14_WEBGL: 0x8833
  - DRAW_BUFFER15_WEBGL: 0x8834
  - MAX_COLOR_ATTACHMENTS_WEBGL: 0x8CDF
  - MAX_DRAW_BUFFERS_WEBGL: 0x8824

### 881. WEBGL_lose_context (interface)
purpose: Interface definition
methods:
  - loseContext(): void
  - restoreContext(): void

### 882. WEBGL_multi_draw (interface)
purpose: Interface definition
methods:
  - multiDrawArraysInstancedWEBGL(mode, firstsList, firstsOffset, countsList, countsOffset, instanceCountsList, instanceCountsOffset, drawcount): void
  - multiDrawArraysWEBGL(mode, firstsList, firstsOffset, countsList, countsOffset, drawcount): void
  - multiDrawElementsInstancedWEBGL(mode, countsList, countsOffset, type, offsetsList, offsetsOffset, instanceCountsList, instanceCountsOffset, drawcount): void
  - multiDrawElementsWEBGL(mode, countsList, countsOffset, type, offsetsList, offsetsOffset, drawcount): void

### 883. WebGL2RenderingContext (interface)
purpose: Interface definition
extends: WebGL2RenderingContextBase, WebGL2RenderingContextOverloads, WebGLRenderingContextBase

### 884. WebGL2RenderingContextBase (interface)
purpose: Interface definition
methods:
  - beginQuery(target, query): void
  - beginTransformFeedback(primitiveMode): void
  - bindBufferBase(target, index, buffer): void
  - bindBufferRange(target, index, buffer, offset, size): void
  - bindSampler(unit, sampler): void
  - bindTransformFeedback(target, tf): void
  - bindVertexArray(array): void
  - blitFramebuffer(srcX0, srcY0, srcX1, srcY1, dstX0, dstY0, dstX1, dstY1, mask, filter): void
  - clearBufferfi(buffer, drawbuffer, depth, stencil): void
  - clearBufferfv(buffer, drawbuffer, values, srcOffset): void
  - clearBufferiv(buffer, drawbuffer, values, srcOffset): void
  - clearBufferuiv(buffer, drawbuffer, values, srcOffset): void
  - clientWaitSync(sync, flags, timeout): GLenum
  - compressedTexImage3D(target, level, internalformat, width, height, depth, border, imageSize, offset): void
  - compressedTexImage3D(target, level, internalformat, width, height, depth, border, srcData, srcOffset, srcLengthOverride): void
  - compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, offset): void
  - compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, srcData, srcOffset, srcLengthOverride): void
  - copyBufferSubData(readTarget, writeTarget, readOffset, writeOffset, size): void
  - copyTexSubImage3D(target, level, xoffset, yoffset, zoffset, x, y, width, height): void
  - createQuery(): WebGLQuery
  - createSampler(): WebGLSampler
  - createTransformFeedback(): WebGLTransformFeedback
  - createVertexArray(): WebGLVertexArrayObject
  - deleteQuery(query): void
  - deleteSampler(sampler): void
  - deleteSync(sync): void
  - deleteTransformFeedback(tf): void
  - deleteVertexArray(vertexArray): void
  - drawArraysInstanced(mode, first, count, instanceCount): void
  - drawBuffers(buffers): void
  - drawElementsInstanced(mode, count, type, offset, instanceCount): void
  - drawRangeElements(mode, start, end, count, type, offset): void
  - endQuery(target): void
  - endTransformFeedback(): void
  - fenceSync(condition, flags): WebGLSync | null
  - framebufferTextureLayer(target, attachment, texture, level, layer): void
  - getActiveUniformBlockName(program, uniformBlockIndex): string | null
  - getActiveUniformBlockParameter(program, uniformBlockIndex, pname): any
  - getActiveUniforms(program, uniformIndices, pname): any
  - getBufferSubData(target, srcByteOffset, dstBuffer, dstOffset, length): void
  - getFragDataLocation(program, name): GLint
  - getIndexedParameter(target, index): any
  - getInternalformatParameter(target, internalformat, pname): any
  - getQuery(target, pname): WebGLQuery | null
  - getQueryParameter(query, pname): any
  - getSamplerParameter(sampler, pname): any
  - getSyncParameter(sync, pname): any
  - getTransformFeedbackVarying(program, index): WebGLActiveInfo | null
  - getUniformBlockIndex(program, uniformBlockName): GLuint
  - getUniformIndices(program, uniformNames): GLuint[] | null
  - invalidateFramebuffer(target, attachments): void
  - invalidateSubFramebuffer(target, attachments, x, y, width, height): void
  - isQuery(query): GLboolean
  - isSampler(sampler): GLboolean
  - isSync(sync): GLboolean
  - isTransformFeedback(tf): GLboolean
  - isVertexArray(vertexArray): GLboolean
  - pauseTransformFeedback(): void
  - readBuffer(src): void
  - renderbufferStorageMultisample(target, samples, internalformat, width, height): void
  - resumeTransformFeedback(): void
  - samplerParameterf(sampler, pname, param): void
  - samplerParameteri(sampler, pname, param): void
  - texImage3D(target, level, internalformat, width, height, depth, border, format, type, pboOffset): void
  - texImage3D(target, level, internalformat, width, height, depth, border, format, type, source): void
  - texImage3D(target, level, internalformat, width, height, depth, border, format, type, srcData): void
  - texImage3D(target, level, internalformat, width, height, depth, border, format, type, srcData, srcOffset): void
  - texStorage2D(target, levels, internalformat, width, height): void
  - texStorage3D(target, levels, internalformat, width, height, depth): void
  - texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pboOffset): void
  - texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, source): void
  - texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, srcData, srcOffset): void
  - transformFeedbackVaryings(program, varyings, bufferMode): void
  - uniform1ui(location, v0): void
  - uniform1uiv(location, data, srcOffset, srcLength): void
  - uniform2ui(location, v0, v1): void
  - uniform2uiv(location, data, srcOffset, srcLength): void
  - uniform3ui(location, v0, v1, v2): void
  - uniform3uiv(location, data, srcOffset, srcLength): void
  - uniform4ui(location, v0, v1, v2, v3): void
  - uniform4uiv(location, data, srcOffset, srcLength): void
  - uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding): void
  - uniformMatrix2x3fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix2x4fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix3x2fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix3x4fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix4x2fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix4x3fv(location, transpose, data, srcOffset, srcLength): void
  - vertexAttribDivisor(index, divisor): void
  - vertexAttribI4i(index, x, y, z, w): void
  - vertexAttribI4iv(index, values): void
  - vertexAttribI4ui(index, x, y, z, w): void
  - vertexAttribI4uiv(index, values): void
  - vertexAttribIPointer(index, size, type, stride, offset): void
  - waitSync(sync, flags, timeout): void
properties:
  - READ_BUFFER: 0x0C02
  - UNPACK_ROW_LENGTH: 0x0CF2
  - UNPACK_SKIP_ROWS: 0x0CF3
  - UNPACK_SKIP_PIXELS: 0x0CF4
  - PACK_ROW_LENGTH: 0x0D02
  - PACK_SKIP_ROWS: 0x0D03
  - PACK_SKIP_PIXELS: 0x0D04
  - COLOR: 0x1800
  - DEPTH: 0x1801
  - STENCIL: 0x1802
  - RED: 0x1903
  - RGB8: 0x8051
  - RGB10_A2: 0x8059
  - TEXTURE_BINDING_3D: 0x806A
  - UNPACK_SKIP_IMAGES: 0x806D
  - UNPACK_IMAGE_HEIGHT: 0x806E
  - TEXTURE_3D: 0x806F
  - TEXTURE_WRAP_R: 0x8072
  - MAX_3D_TEXTURE_SIZE: 0x8073
  - UNSIGNED_INT_2_10_10_10_REV: 0x8368
  - MAX_ELEMENTS_VERTICES: 0x80E8
  - MAX_ELEMENTS_INDICES: 0x80E9
  - TEXTURE_MIN_LOD: 0x813A
  - TEXTURE_MAX_LOD: 0x813B
  - TEXTURE_BASE_LEVEL: 0x813C
  - TEXTURE_MAX_LEVEL: 0x813D
  - MIN: 0x8007
  - MAX: 0x8008
  - DEPTH_COMPONENT24: 0x81A6
  - MAX_TEXTURE_LOD_BIAS: 0x84FD
  - TEXTURE_COMPARE_MODE: 0x884C
  - TEXTURE_COMPARE_FUNC: 0x884D
  - CURRENT_QUERY: 0x8865
  - QUERY_RESULT: 0x8866
  - QUERY_RESULT_AVAILABLE: 0x8867
  - STREAM_READ: 0x88E1
  - STREAM_COPY: 0x88E2
  - STATIC_READ: 0x88E5
  - STATIC_COPY: 0x88E6
  - DYNAMIC_READ: 0x88E9
  - DYNAMIC_COPY: 0x88EA
  - MAX_DRAW_BUFFERS: 0x8824
  - DRAW_BUFFER0: 0x8825
  - DRAW_BUFFER1: 0x8826
  - DRAW_BUFFER2: 0x8827
  - DRAW_BUFFER3: 0x8828
  - DRAW_BUFFER4: 0x8829
  - DRAW_BUFFER5: 0x882A
  - DRAW_BUFFER6: 0x882B
  - DRAW_BUFFER7: 0x882C
  - DRAW_BUFFER8: 0x882D
  - DRAW_BUFFER9: 0x882E
  - DRAW_BUFFER10: 0x882F
  - DRAW_BUFFER11: 0x8830
  - DRAW_BUFFER12: 0x8831
  - DRAW_BUFFER13: 0x8832
  - DRAW_BUFFER14: 0x8833
  - DRAW_BUFFER15: 0x8834
  - MAX_FRAGMENT_UNIFORM_COMPONENTS: 0x8B49
  - MAX_VERTEX_UNIFORM_COMPONENTS: 0x8B4A
  - SAMPLER_3D: 0x8B5F
  - SAMPLER_2D_SHADOW: 0x8B62
  - FRAGMENT_SHADER_DERIVATIVE_HINT: 0x8B8B
  - PIXEL_PACK_BUFFER: 0x88EB
  - PIXEL_UNPACK_BUFFER: 0x88EC
  - PIXEL_PACK_BUFFER_BINDING: 0x88ED
  - PIXEL_UNPACK_BUFFER_BINDING: 0x88EF
  - FLOAT_MAT2x3: 0x8B65
  - FLOAT_MAT2x4: 0x8B66
  - FLOAT_MAT3x2: 0x8B67
  - FLOAT_MAT3x4: 0x8B68
  - FLOAT_MAT4x2: 0x8B69
  - FLOAT_MAT4x3: 0x8B6A
  - SRGB: 0x8C40
  - SRGB8: 0x8C41
  - SRGB8_ALPHA8: 0x8C43
  - COMPARE_REF_TO_TEXTURE: 0x884E
  - RGBA32F: 0x8814
  - RGB32F: 0x8815
  - RGBA16F: 0x881A
  - RGB16F: 0x881B
  - VERTEX_ATTRIB_ARRAY_INTEGER: 0x88FD
  - MAX_ARRAY_TEXTURE_LAYERS: 0x88FF
  - MIN_PROGRAM_TEXEL_OFFSET: 0x8904
  - MAX_PROGRAM_TEXEL_OFFSET: 0x8905
  - MAX_VARYING_COMPONENTS: 0x8B4B
  - TEXTURE_2D_ARRAY: 0x8C1A
  - TEXTURE_BINDING_2D_ARRAY: 0x8C1D
  - R11F_G11F_B10F: 0x8C3A
  - UNSIGNED_INT_10F_11F_11F_REV: 0x8C3B
  - RGB9_E5: 0x8C3D
  - UNSIGNED_INT_5_9_9_9_REV: 0x8C3E
  - TRANSFORM_FEEDBACK_BUFFER_MODE: 0x8C7F
  - MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: 0x8C80
  - TRANSFORM_FEEDBACK_VARYINGS: 0x8C83
  - TRANSFORM_FEEDBACK_BUFFER_START: 0x8C84
  - TRANSFORM_FEEDBACK_BUFFER_SIZE: 0x8C85
  - TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: 0x8C88
  - RASTERIZER_DISCARD: 0x8C89
  - MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: 0x8C8A
  - MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: 0x8C8B
  - INTERLEAVED_ATTRIBS: 0x8C8C
  - SEPARATE_ATTRIBS: 0x8C8D
  - TRANSFORM_FEEDBACK_BUFFER: 0x8C8E
  - TRANSFORM_FEEDBACK_BUFFER_BINDING: 0x8C8F
  - RGBA32UI: 0x8D70
  - RGB32UI: 0x8D71
  - RGBA16UI: 0x8D76
  - RGB16UI: 0x8D77
  - RGBA8UI: 0x8D7C
  - RGB8UI: 0x8D7D
  - RGBA32I: 0x8D82
  - RGB32I: 0x8D83
  - RGBA16I: 0x8D88
  - RGB16I: 0x8D89
  - RGBA8I: 0x8D8E
  - RGB8I: 0x8D8F
  - RED_INTEGER: 0x8D94
  - RGB_INTEGER: 0x8D98
  - RGBA_INTEGER: 0x8D99
  - SAMPLER_2D_ARRAY: 0x8DC1
  - SAMPLER_2D_ARRAY_SHADOW: 0x8DC4
  - SAMPLER_CUBE_SHADOW: 0x8DC5
  - UNSIGNED_INT_VEC2: 0x8DC6
  - UNSIGNED_INT_VEC3: 0x8DC7
  - UNSIGNED_INT_VEC4: 0x8DC8
  - INT_SAMPLER_2D: 0x8DCA
  - INT_SAMPLER_3D: 0x8DCB
  - INT_SAMPLER_CUBE: 0x8DCC
  - INT_SAMPLER_2D_ARRAY: 0x8DCF
  - UNSIGNED_INT_SAMPLER_2D: 0x8DD2
  - UNSIGNED_INT_SAMPLER_3D: 0x8DD3
  - UNSIGNED_INT_SAMPLER_CUBE: 0x8DD4
  - UNSIGNED_INT_SAMPLER_2D_ARRAY: 0x8DD7
  - DEPTH_COMPONENT32F: 0x8CAC
  - DEPTH32F_STENCIL8: 0x8CAD
  - FLOAT_32_UNSIGNED_INT_24_8_REV: 0x8DAD
  - FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: 0x8210
  - FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: 0x8211
  - FRAMEBUFFER_ATTACHMENT_RED_SIZE: 0x8212
  - FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: 0x8213
  - FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: 0x8214
  - FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: 0x8215
  - FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: 0x8216
  - FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: 0x8217
  - FRAMEBUFFER_DEFAULT: 0x8218
  - UNSIGNED_INT_24_8: 0x84FA
  - DEPTH24_STENCIL8: 0x88F0
  - UNSIGNED_NORMALIZED: 0x8C17
  - DRAW_FRAMEBUFFER_BINDING: 0x8CA6
  - READ_FRAMEBUFFER: 0x8CA8
  - DRAW_FRAMEBUFFER: 0x8CA9
  - READ_FRAMEBUFFER_BINDING: 0x8CAA
  - RENDERBUFFER_SAMPLES: 0x8CAB
  - FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: 0x8CD4
  - MAX_COLOR_ATTACHMENTS: 0x8CDF
  - COLOR_ATTACHMENT1: 0x8CE1
  - COLOR_ATTACHMENT2: 0x8CE2
  - COLOR_ATTACHMENT3: 0x8CE3
  - COLOR_ATTACHMENT4: 0x8CE4
  - COLOR_ATTACHMENT5: 0x8CE5
  - COLOR_ATTACHMENT6: 0x8CE6
  - COLOR_ATTACHMENT7: 0x8CE7
  - COLOR_ATTACHMENT8: 0x8CE8
  - COLOR_ATTACHMENT9: 0x8CE9
  - COLOR_ATTACHMENT10: 0x8CEA
  - COLOR_ATTACHMENT11: 0x8CEB
  - COLOR_ATTACHMENT12: 0x8CEC
  - COLOR_ATTACHMENT13: 0x8CED
  - COLOR_ATTACHMENT14: 0x8CEE
  - COLOR_ATTACHMENT15: 0x8CEF
  - FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: 0x8D56
  - MAX_SAMPLES: 0x8D57
  - HALF_FLOAT: 0x140B
  - RG: 0x8227
  - RG_INTEGER: 0x8228
  - R8: 0x8229
  - RG8: 0x822B
  - R16F: 0x822D
  - R32F: 0x822E
  - RG16F: 0x822F
  - RG32F: 0x8230
  - R8I: 0x8231
  - R8UI: 0x8232
  - R16I: 0x8233
  - R16UI: 0x8234
  - R32I: 0x8235
  - R32UI: 0x8236
  - RG8I: 0x8237
  - RG8UI: 0x8238
  - RG16I: 0x8239
  - RG16UI: 0x823A
  - RG32I: 0x823B
  - RG32UI: 0x823C
  - VERTEX_ARRAY_BINDING: 0x85B5
  - R8_SNORM: 0x8F94
  - RG8_SNORM: 0x8F95
  - RGB8_SNORM: 0x8F96
  - RGBA8_SNORM: 0x8F97
  - SIGNED_NORMALIZED: 0x8F9C
  - COPY_READ_BUFFER: 0x8F36
  - COPY_WRITE_BUFFER: 0x8F37
  - COPY_READ_BUFFER_BINDING: 0x8F36
  - COPY_WRITE_BUFFER_BINDING: 0x8F37
  - UNIFORM_BUFFER: 0x8A11
  - UNIFORM_BUFFER_BINDING: 0x8A28
  - UNIFORM_BUFFER_START: 0x8A29
  - UNIFORM_BUFFER_SIZE: 0x8A2A
  - MAX_VERTEX_UNIFORM_BLOCKS: 0x8A2B
  - MAX_FRAGMENT_UNIFORM_BLOCKS: 0x8A2D
  - MAX_COMBINED_UNIFORM_BLOCKS: 0x8A2E
  - MAX_UNIFORM_BUFFER_BINDINGS: 0x8A2F
  - MAX_UNIFORM_BLOCK_SIZE: 0x8A30
  - MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: 0x8A31
  - MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: 0x8A33
  - UNIFORM_BUFFER_OFFSET_ALIGNMENT: 0x8A34
  - ACTIVE_UNIFORM_BLOCKS: 0x8A36
  - UNIFORM_TYPE: 0x8A37
  - UNIFORM_SIZE: 0x8A38
  - UNIFORM_BLOCK_INDEX: 0x8A3A
  - UNIFORM_OFFSET: 0x8A3B
  - UNIFORM_ARRAY_STRIDE: 0x8A3C
  - UNIFORM_MATRIX_STRIDE: 0x8A3D
  - UNIFORM_IS_ROW_MAJOR: 0x8A3E
  - UNIFORM_BLOCK_BINDING: 0x8A3F
  - UNIFORM_BLOCK_DATA_SIZE: 0x8A40
  - UNIFORM_BLOCK_ACTIVE_UNIFORMS: 0x8A42
  - UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: 0x8A43
  - UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: 0x8A44
  - UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: 0x8A46
  - INVALID_INDEX: 0xFFFFFFFF
  - MAX_VERTEX_OUTPUT_COMPONENTS: 0x9122
  - MAX_FRAGMENT_INPUT_COMPONENTS: 0x9125
  - MAX_SERVER_WAIT_TIMEOUT: 0x9111
  - OBJECT_TYPE: 0x9112
  - SYNC_CONDITION: 0x9113
  - SYNC_STATUS: 0x9114
  - SYNC_FLAGS: 0x9115
  - SYNC_FENCE: 0x9116
  - SYNC_GPU_COMMANDS_COMPLETE: 0x9117
  - UNSIGNALED: 0x9118
  - SIGNALED: 0x9119
  - ALREADY_SIGNALED: 0x911A
  - TIMEOUT_EXPIRED: 0x911B
  - CONDITION_SATISFIED: 0x911C
  - WAIT_FAILED: 0x911D
  - SYNC_FLUSH_COMMANDS_BIT: 0x00000001
  - VERTEX_ATTRIB_ARRAY_DIVISOR: 0x88FE
  - ANY_SAMPLES_PASSED: 0x8C2F
  - ANY_SAMPLES_PASSED_CONSERVATIVE: 0x8D6A
  - SAMPLER_BINDING: 0x8919
  - RGB10_A2UI: 0x906F
  - INT_2_10_10_10_REV: 0x8D9F
  - TRANSFORM_FEEDBACK: 0x8E22
  - TRANSFORM_FEEDBACK_PAUSED: 0x8E23
  - TRANSFORM_FEEDBACK_ACTIVE: 0x8E24
  - TRANSFORM_FEEDBACK_BINDING: 0x8E25
  - TEXTURE_IMMUTABLE_FORMAT: 0x912F
  - MAX_ELEMENT_INDEX: 0x8D6B
  - TEXTURE_IMMUTABLE_LEVELS: 0x82DF
  - TIMEOUT_IGNORED: -1
  - MAX_CLIENT_WAIT_TIMEOUT_WEBGL: 0x9247

### 885. WebGL2RenderingContextOverloads (interface)
purpose: Interface definition
methods:
  - bufferData(target, size, usage): void
  - bufferData(target, srcData, usage): void
  - bufferData(target, srcData, usage, srcOffset, length): void
  - bufferSubData(target, dstByteOffset, srcData): void
  - bufferSubData(target, dstByteOffset, srcData, srcOffset, length): void
  - compressedTexImage2D(target, level, internalformat, width, height, border, imageSize, offset): void
  - compressedTexImage2D(target, level, internalformat, width, height, border, srcData, srcOffset, srcLengthOverride): void
  - compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, offset): void
  - compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, srcData, srcOffset, srcLengthOverride): void
  - readPixels(x, y, width, height, format, type, dstData): void
  - readPixels(x, y, width, height, format, type, offset): void
  - readPixels(x, y, width, height, format, type, dstData, dstOffset): void
  - texImage2D(target, level, internalformat, width, height, border, format, type, pixels): void
  - texImage2D(target, level, internalformat, format, type, source): void
  - texImage2D(target, level, internalformat, width, height, border, format, type, pboOffset): void
  - texImage2D(target, level, internalformat, width, height, border, format, type, source): void
  - texImage2D(target, level, internalformat, width, height, border, format, type, srcData, srcOffset): void
  - texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels): void
  - texSubImage2D(target, level, xoffset, yoffset, format, type, source): void
  - texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pboOffset): void
  - texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, source): void
  - texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, srcData, srcOffset): void
  - uniform1fv(location, data, srcOffset, srcLength): void
  - uniform1iv(location, data, srcOffset, srcLength): void
  - uniform2fv(location, data, srcOffset, srcLength): void
  - uniform2iv(location, data, srcOffset, srcLength): void
  - uniform3fv(location, data, srcOffset, srcLength): void
  - uniform3iv(location, data, srcOffset, srcLength): void
  - uniform4fv(location, data, srcOffset, srcLength): void
  - uniform4iv(location, data, srcOffset, srcLength): void
  - uniformMatrix2fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix3fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix4fv(location, transpose, data, srcOffset, srcLength): void

### 886. WebGLActiveInfo (interface)
purpose: Interface definition
properties:
  - name: string
  - size: GLint
  - type: GLenum

### 887. WebGLBuffer (interface)
purpose: Interface definition

### 888. WebGLContextEvent (interface)
purpose: Interface definition
extends: Event
properties:
  - statusMessage: string

### 889. WebGLFramebuffer (interface)
purpose: Interface definition

### 890. WebGLProgram (interface)
purpose: Interface definition

### 891. WebGLQuery (interface)
purpose: Interface definition

### 892. WebGLRenderbuffer (interface)
purpose: Interface definition

### 893. WebGLRenderingContext (interface)
purpose: Interface definition
extends: WebGLRenderingContextBase, WebGLRenderingContextOverloads

### 894. WebGLRenderingContextBase (interface)
purpose: Interface definition
methods:
  - activeTexture(texture): void
  - attachShader(program, shader): void
  - bindAttribLocation(program, index, name): void
  - bindBuffer(target, buffer): void
  - bindFramebuffer(target, framebuffer): void
  - bindRenderbuffer(target, renderbuffer): void
  - bindTexture(target, texture): void
  - blendColor(red, green, blue, alpha): void
  - blendEquation(mode): void
  - blendEquationSeparate(modeRGB, modeAlpha): void
  - blendFunc(sfactor, dfactor): void
  - blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha): void
  - checkFramebufferStatus(target): GLenum
  - clear(mask): void
  - clearColor(red, green, blue, alpha): void
  - clearDepth(depth): void
  - clearStencil(s): void
  - colorMask(red, green, blue, alpha): void
  - compileShader(shader): void
  - copyTexImage2D(target, level, internalformat, x, y, width, height, border): void
  - copyTexSubImage2D(target, level, xoffset, yoffset, x, y, width, height): void
  - createBuffer(): WebGLBuffer
  - createFramebuffer(): WebGLFramebuffer
  - createProgram(): WebGLProgram
  - createRenderbuffer(): WebGLRenderbuffer
  - createShader(type): WebGLShader | null
  - createTexture(): WebGLTexture
  - cullFace(mode): void
  - deleteBuffer(buffer): void
  - deleteFramebuffer(framebuffer): void
  - deleteProgram(program): void
  - deleteRenderbuffer(renderbuffer): void
  - deleteShader(shader): void
  - deleteTexture(texture): void
  - depthFunc(func): void
  - depthMask(flag): void
  - depthRange(zNear, zFar): void
  - detachShader(program, shader): void
  - disable(cap): void
  - disableVertexAttribArray(index): void
  - drawArrays(mode, first, count): void
  - drawElements(mode, count, type, offset): void
  - enable(cap): void
  - enableVertexAttribArray(index): void
  - finish(): void
  - flush(): void
  - framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer): void
  - framebufferTexture2D(target, attachment, textarget, texture, level): void
  - frontFace(mode): void
  - generateMipmap(target): void
  - getActiveAttrib(program, index): WebGLActiveInfo | null
  - getActiveUniform(program, index): WebGLActiveInfo | null
  - getAttachedShaders(program): WebGLShader[] | null
  - getAttribLocation(program, name): GLint
  - getBufferParameter(target, pname): any
  - getContextAttributes(): WebGLContextAttributes | null
  - getError(): GLenum
  - getExtension(extensionName): ANGLE_instanced_arrays | null
  - getExtension(extensionName): EXT_blend_minmax | null
  - getExtension(extensionName): EXT_color_buffer_float | null
  - getExtension(extensionName): EXT_color_buffer_half_float | null
  - getExtension(extensionName): EXT_float_blend | null
  - getExtension(extensionName): EXT_frag_depth | null
  - getExtension(extensionName): EXT_sRGB | null
  - getExtension(extensionName): EXT_shader_texture_lod | null
  - getExtension(extensionName): EXT_texture_compression_bptc | null
  - getExtension(extensionName): EXT_texture_compression_rgtc | null
  - getExtension(extensionName): EXT_texture_filter_anisotropic | null
  - getExtension(extensionName): KHR_parallel_shader_compile | null
  - getExtension(extensionName): OES_element_index_uint | null
  - getExtension(extensionName): OES_fbo_render_mipmap | null
  - getExtension(extensionName): OES_standard_derivatives | null
  - getExtension(extensionName): OES_texture_float | null
  - getExtension(extensionName): OES_texture_float_linear | null
  - getExtension(extensionName): OES_texture_half_float | null
  - getExtension(extensionName): OES_texture_half_float_linear | null
  - getExtension(extensionName): OES_vertex_array_object | null
  - getExtension(extensionName): OVR_multiview2 | null
  - getExtension(extensionName): WEBGL_color_buffer_float | null
  - getExtension(extensionName): WEBGL_compressed_texture_astc | null
  - getExtension(extensionName): WEBGL_compressed_texture_etc | null
  - getExtension(extensionName): WEBGL_compressed_texture_etc1 | null
  - getExtension(extensionName): WEBGL_compressed_texture_pvrtc | null
  - getExtension(extensionName): WEBGL_compressed_texture_s3tc | null
  - getExtension(extensionName): WEBGL_compressed_texture_s3tc_srgb | null
  - getExtension(extensionName): WEBGL_debug_renderer_info | null
  - getExtension(extensionName): WEBGL_debug_shaders | null
  - getExtension(extensionName): WEBGL_depth_texture | null
  - getExtension(extensionName): WEBGL_draw_buffers | null
  - getExtension(extensionName): WEBGL_lose_context | null
  - getExtension(extensionName): WEBGL_multi_draw | null
  - getExtension(name): any
  - getFramebufferAttachmentParameter(target, attachment, pname): any
  - getParameter(pname): any
  - getProgramInfoLog(program): string | null
  - getProgramParameter(program, pname): any
  - getRenderbufferParameter(target, pname): any
  - getShaderInfoLog(shader): string | null
  - getShaderParameter(shader, pname): any
  - getShaderPrecisionFormat(shadertype, precisiontype): WebGLShaderPrecisionFormat | null
  - getShaderSource(shader): string | null
  - getSupportedExtensions(): string[] | null
  - getTexParameter(target, pname): any
  - getUniform(program, location): any
  - getUniformLocation(program, name): WebGLUniformLocation | null
  - getVertexAttrib(index, pname): any
  - getVertexAttribOffset(index, pname): GLintptr
  - hint(target, mode): void
  - isBuffer(buffer): GLboolean
  - isContextLost(): boolean
  - isEnabled(cap): GLboolean
  - isFramebuffer(framebuffer): GLboolean
  - isProgram(program): GLboolean
  - isRenderbuffer(renderbuffer): GLboolean
  - isShader(shader): GLboolean
  - isTexture(texture): GLboolean
  - lineWidth(width): void
  - linkProgram(program): void
  - pixelStorei(pname, param): void
  - polygonOffset(factor, units): void
  - renderbufferStorage(target, internalformat, width, height): void
  - sampleCoverage(value, invert): void
  - scissor(x, y, width, height): void
  - shaderSource(shader, source): void
  - stencilFunc(func, ref, mask): void
  - stencilFuncSeparate(face, func, ref, mask): void
  - stencilMask(mask): void
  - stencilMaskSeparate(face, mask): void
  - stencilOp(fail, zfail, zpass): void
  - stencilOpSeparate(face, fail, zfail, zpass): void
  - texParameterf(target, pname, param): void
  - texParameteri(target, pname, param): void
  - uniform1f(location, x): void
  - uniform1i(location, x): void
  - uniform2f(location, x, y): void
  - uniform2i(location, x, y): void
  - uniform3f(location, x, y, z): void
  - uniform3i(location, x, y, z): void
  - uniform4f(location, x, y, z, w): void
  - uniform4i(location, x, y, z, w): void
  - useProgram(program): void
  - validateProgram(program): void
  - vertexAttrib1f(index, x): void
  - vertexAttrib1fv(index, values): void
  - vertexAttrib2f(index, x, y): void
  - vertexAttrib2fv(index, values): void
  - vertexAttrib3f(index, x, y, z): void
  - vertexAttrib3fv(index, values): void
  - vertexAttrib4f(index, x, y, z, w): void
  - vertexAttrib4fv(index, values): void
  - vertexAttribPointer(index, size, type, normalized, stride, offset): void
  - viewport(x, y, width, height): void
properties:
  - drawingBufferColorSpace: PredefinedColorSpace
  - drawingBufferHeight: GLsizei
  - drawingBufferWidth: GLsizei
  - unpackColorSpace: PredefinedColorSpace
  - DEPTH_BUFFER_BIT: 0x00000100
  - STENCIL_BUFFER_BIT: 0x00000400
  - COLOR_BUFFER_BIT: 0x00004000
  - POINTS: 0x0000
  - LINES: 0x0001
  - LINE_LOOP: 0x0002
  - LINE_STRIP: 0x0003
  - TRIANGLES: 0x0004
  - TRIANGLE_STRIP: 0x0005
  - TRIANGLE_FAN: 0x0006
  - ZERO: 0
  - ONE: 1
  - SRC_COLOR: 0x0300
  - ONE_MINUS_SRC_COLOR: 0x0301
  - SRC_ALPHA: 0x0302
  - ONE_MINUS_SRC_ALPHA: 0x0303
  - DST_ALPHA: 0x0304
  - ONE_MINUS_DST_ALPHA: 0x0305
  - DST_COLOR: 0x0306
  - ONE_MINUS_DST_COLOR: 0x0307
  - SRC_ALPHA_SATURATE: 0x0308
  - FUNC_ADD: 0x8006
  - BLEND_EQUATION: 0x8009
  - BLEND_EQUATION_RGB: 0x8009
  - BLEND_EQUATION_ALPHA: 0x883D
  - FUNC_SUBTRACT: 0x800A
  - FUNC_REVERSE_SUBTRACT: 0x800B
  - BLEND_DST_RGB: 0x80C8
  - BLEND_SRC_RGB: 0x80C9
  - BLEND_DST_ALPHA: 0x80CA
  - BLEND_SRC_ALPHA: 0x80CB
  - CONSTANT_COLOR: 0x8001
  - ONE_MINUS_CONSTANT_COLOR: 0x8002
  - CONSTANT_ALPHA: 0x8003
  - ONE_MINUS_CONSTANT_ALPHA: 0x8004
  - BLEND_COLOR: 0x8005
  - ARRAY_BUFFER: 0x8892
  - ELEMENT_ARRAY_BUFFER: 0x8893
  - ARRAY_BUFFER_BINDING: 0x8894
  - ELEMENT_ARRAY_BUFFER_BINDING: 0x8895
  - STREAM_DRAW: 0x88E0
  - STATIC_DRAW: 0x88E4
  - DYNAMIC_DRAW: 0x88E8
  - BUFFER_SIZE: 0x8764
  - BUFFER_USAGE: 0x8765
  - CURRENT_VERTEX_ATTRIB: 0x8626
  - FRONT: 0x0404
  - BACK: 0x0405
  - FRONT_AND_BACK: 0x0408
  - CULL_FACE: 0x0B44
  - BLEND: 0x0BE2
  - DITHER: 0x0BD0
  - STENCIL_TEST: 0x0B90
  - DEPTH_TEST: 0x0B71
  - SCISSOR_TEST: 0x0C11
  - POLYGON_OFFSET_FILL: 0x8037
  - SAMPLE_ALPHA_TO_COVERAGE: 0x809E
  - SAMPLE_COVERAGE: 0x80A0
  - NO_ERROR: 0
  - INVALID_ENUM: 0x0500
  - INVALID_VALUE: 0x0501
  - INVALID_OPERATION: 0x0502
  - OUT_OF_MEMORY: 0x0505
  - CW: 0x0900
  - CCW: 0x0901
  - LINE_WIDTH: 0x0B21
  - ALIASED_POINT_SIZE_RANGE: 0x846D
  - ALIASED_LINE_WIDTH_RANGE: 0x846E
  - CULL_FACE_MODE: 0x0B45
  - FRONT_FACE: 0x0B46
  - DEPTH_RANGE: 0x0B70
  - DEPTH_WRITEMASK: 0x0B72
  - DEPTH_CLEAR_VALUE: 0x0B73
  - DEPTH_FUNC: 0x0B74
  - STENCIL_CLEAR_VALUE: 0x0B91
  - STENCIL_FUNC: 0x0B92
  - STENCIL_FAIL: 0x0B94
  - STENCIL_PASS_DEPTH_FAIL: 0x0B95
  - STENCIL_PASS_DEPTH_PASS: 0x0B96
  - STENCIL_REF: 0x0B97
  - STENCIL_VALUE_MASK: 0x0B93
  - STENCIL_WRITEMASK: 0x0B98
  - STENCIL_BACK_FUNC: 0x8800
  - STENCIL_BACK_FAIL: 0x8801
  - STENCIL_BACK_PASS_DEPTH_FAIL: 0x8802
  - STENCIL_BACK_PASS_DEPTH_PASS: 0x8803
  - STENCIL_BACK_REF: 0x8CA3
  - STENCIL_BACK_VALUE_MASK: 0x8CA4
  - STENCIL_BACK_WRITEMASK: 0x8CA5
  - VIEWPORT: 0x0BA2
  - SCISSOR_BOX: 0x0C10
  - COLOR_CLEAR_VALUE: 0x0C22
  - COLOR_WRITEMASK: 0x0C23
  - UNPACK_ALIGNMENT: 0x0CF5
  - PACK_ALIGNMENT: 0x0D05
  - MAX_TEXTURE_SIZE: 0x0D33
  - MAX_VIEWPORT_DIMS: 0x0D3A
  - SUBPIXEL_BITS: 0x0D50
  - RED_BITS: 0x0D52
  - GREEN_BITS: 0x0D53
  - BLUE_BITS: 0x0D54
  - ALPHA_BITS: 0x0D55
  - DEPTH_BITS: 0x0D56
  - STENCIL_BITS: 0x0D57
  - POLYGON_OFFSET_UNITS: 0x2A00
  - POLYGON_OFFSET_FACTOR: 0x8038
  - TEXTURE_BINDING_2D: 0x8069
  - SAMPLE_BUFFERS: 0x80A8
  - SAMPLES: 0x80A9
  - SAMPLE_COVERAGE_VALUE: 0x80AA
  - SAMPLE_COVERAGE_INVERT: 0x80AB
  - COMPRESSED_TEXTURE_FORMATS: 0x86A3
  - DONT_CARE: 0x1100
  - FASTEST: 0x1101
  - NICEST: 0x1102
  - GENERATE_MIPMAP_HINT: 0x8192
  - BYTE: 0x1400
  - UNSIGNED_BYTE: 0x1401
  - SHORT: 0x1402
  - UNSIGNED_SHORT: 0x1403
  - INT: 0x1404
  - UNSIGNED_INT: 0x1405
  - FLOAT: 0x1406
  - DEPTH_COMPONENT: 0x1902
  - ALPHA: 0x1906
  - RGB: 0x1907
  - RGBA: 0x1908
  - LUMINANCE: 0x1909
  - LUMINANCE_ALPHA: 0x190A
  - UNSIGNED_SHORT_4_4_4_4: 0x8033
  - UNSIGNED_SHORT_5_5_5_1: 0x8034
  - UNSIGNED_SHORT_5_6_5: 0x8363
  - FRAGMENT_SHADER: 0x8B30
  - VERTEX_SHADER: 0x8B31
  - MAX_VERTEX_ATTRIBS: 0x8869
  - MAX_VERTEX_UNIFORM_VECTORS: 0x8DFB
  - MAX_VARYING_VECTORS: 0x8DFC
  - MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8B4D
  - MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8B4C
  - MAX_TEXTURE_IMAGE_UNITS: 0x8872
  - MAX_FRAGMENT_UNIFORM_VECTORS: 0x8DFD
  - SHADER_TYPE: 0x8B4F
  - DELETE_STATUS: 0x8B80
  - LINK_STATUS: 0x8B82
  - VALIDATE_STATUS: 0x8B83
  - ATTACHED_SHADERS: 0x8B85
  - ACTIVE_UNIFORMS: 0x8B86
  - ACTIVE_ATTRIBUTES: 0x8B89
  - SHADING_LANGUAGE_VERSION: 0x8B8C
  - CURRENT_PROGRAM: 0x8B8D
  - NEVER: 0x0200
  - LESS: 0x0201
  - EQUAL: 0x0202
  - LEQUAL: 0x0203
  - GREATER: 0x0204
  - NOTEQUAL: 0x0205
  - GEQUAL: 0x0206
  - ALWAYS: 0x0207
  - KEEP: 0x1E00
  - REPLACE: 0x1E01
  - INCR: 0x1E02
  - DECR: 0x1E03
  - INVERT: 0x150A
  - INCR_WRAP: 0x8507
  - DECR_WRAP: 0x8508
  - VENDOR: 0x1F00
  - RENDERER: 0x1F01
  - VERSION: 0x1F02
  - NEAREST: 0x2600
  - LINEAR: 0x2601
  - NEAREST_MIPMAP_NEAREST: 0x2700
  - LINEAR_MIPMAP_NEAREST: 0x2701
  - NEAREST_MIPMAP_LINEAR: 0x2702
  - LINEAR_MIPMAP_LINEAR: 0x2703
  - TEXTURE_MAG_FILTER: 0x2800
  - TEXTURE_MIN_FILTER: 0x2801
  - TEXTURE_WRAP_S: 0x2802
  - TEXTURE_WRAP_T: 0x2803
  - TEXTURE_2D: 0x0DE1
  - TEXTURE: 0x1702
  - TEXTURE_CUBE_MAP: 0x8513
  - TEXTURE_BINDING_CUBE_MAP: 0x8514
  - TEXTURE_CUBE_MAP_POSITIVE_X: 0x8515
  - TEXTURE_CUBE_MAP_NEGATIVE_X: 0x8516
  - TEXTURE_CUBE_MAP_POSITIVE_Y: 0x8517
  - TEXTURE_CUBE_MAP_NEGATIVE_Y: 0x8518
  - TEXTURE_CUBE_MAP_POSITIVE_Z: 0x8519
  - TEXTURE_CUBE_MAP_NEGATIVE_Z: 0x851A
  - MAX_CUBE_MAP_TEXTURE_SIZE: 0x851C
  - TEXTURE0: 0x84C0
  - TEXTURE1: 0x84C1
  - TEXTURE2: 0x84C2
  - TEXTURE3: 0x84C3
  - TEXTURE4: 0x84C4
  - TEXTURE5: 0x84C5
  - TEXTURE6: 0x84C6
  - TEXTURE7: 0x84C7
  - TEXTURE8: 0x84C8
  - TEXTURE9: 0x84C9
  - TEXTURE10: 0x84CA
  - TEXTURE11: 0x84CB
  - TEXTURE12: 0x84CC
  - TEXTURE13: 0x84CD
  - TEXTURE14: 0x84CE
  - TEXTURE15: 0x84CF
  - TEXTURE16: 0x84D0
  - TEXTURE17: 0x84D1
  - TEXTURE18: 0x84D2
  - TEXTURE19: 0x84D3
  - TEXTURE20: 0x84D4
  - TEXTURE21: 0x84D5
  - TEXTURE22: 0x84D6
  - TEXTURE23: 0x84D7
  - TEXTURE24: 0x84D8
  - TEXTURE25: 0x84D9
  - TEXTURE26: 0x84DA
  - TEXTURE27: 0x84DB
  - TEXTURE28: 0x84DC
  - TEXTURE29: 0x84DD
  - TEXTURE30: 0x84DE
  - TEXTURE31: 0x84DF
  - ACTIVE_TEXTURE: 0x84E0
  - REPEAT: 0x2901
  - CLAMP_TO_EDGE: 0x812F
  - MIRRORED_REPEAT: 0x8370
  - FLOAT_VEC2: 0x8B50
  - FLOAT_VEC3: 0x8B51
  - FLOAT_VEC4: 0x8B52
  - INT_VEC2: 0x8B53
  - INT_VEC3: 0x8B54
  - INT_VEC4: 0x8B55
  - BOOL: 0x8B56
  - BOOL_VEC2: 0x8B57
  - BOOL_VEC3: 0x8B58
  - BOOL_VEC4: 0x8B59
  - FLOAT_MAT2: 0x8B5A
  - FLOAT_MAT3: 0x8B5B
  - FLOAT_MAT4: 0x8B5C
  - SAMPLER_2D: 0x8B5E
  - SAMPLER_CUBE: 0x8B60
  - VERTEX_ATTRIB_ARRAY_ENABLED: 0x8622
  - VERTEX_ATTRIB_ARRAY_SIZE: 0x8623
  - VERTEX_ATTRIB_ARRAY_STRIDE: 0x8624
  - VERTEX_ATTRIB_ARRAY_TYPE: 0x8625
  - VERTEX_ATTRIB_ARRAY_NORMALIZED: 0x886A
  - VERTEX_ATTRIB_ARRAY_POINTER: 0x8645
  - VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: 0x889F
  - IMPLEMENTATION_COLOR_READ_TYPE: 0x8B9A
  - IMPLEMENTATION_COLOR_READ_FORMAT: 0x8B9B
  - COMPILE_STATUS: 0x8B81
  - LOW_FLOAT: 0x8DF0
  - MEDIUM_FLOAT: 0x8DF1
  - HIGH_FLOAT: 0x8DF2
  - LOW_INT: 0x8DF3
  - MEDIUM_INT: 0x8DF4
  - HIGH_INT: 0x8DF5
  - FRAMEBUFFER: 0x8D40
  - RENDERBUFFER: 0x8D41
  - RGBA4: 0x8056
  - RGB5_A1: 0x8057
  - RGBA8: 0x8058
  - RGB565: 0x8D62
  - DEPTH_COMPONENT16: 0x81A5
  - STENCIL_INDEX8: 0x8D48
  - DEPTH_STENCIL: 0x84F9
  - RENDERBUFFER_WIDTH: 0x8D42
  - RENDERBUFFER_HEIGHT: 0x8D43
  - RENDERBUFFER_INTERNAL_FORMAT: 0x8D44
  - RENDERBUFFER_RED_SIZE: 0x8D50
  - RENDERBUFFER_GREEN_SIZE: 0x8D51
  - RENDERBUFFER_BLUE_SIZE: 0x8D52
  - RENDERBUFFER_ALPHA_SIZE: 0x8D53
  - RENDERBUFFER_DEPTH_SIZE: 0x8D54
  - RENDERBUFFER_STENCIL_SIZE: 0x8D55
  - FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: 0x8CD0
  - FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: 0x8CD1
  - FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: 0x8CD2
  - FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: 0x8CD3
  - COLOR_ATTACHMENT0: 0x8CE0
  - DEPTH_ATTACHMENT: 0x8D00
  - STENCIL_ATTACHMENT: 0x8D20
  - DEPTH_STENCIL_ATTACHMENT: 0x821A
  - NONE: 0
  - FRAMEBUFFER_COMPLETE: 0x8CD5
  - FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 0x8CD6
  - FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: 0x8CD7
  - FRAMEBUFFER_INCOMPLETE_DIMENSIONS: 0x8CD9
  - FRAMEBUFFER_UNSUPPORTED: 0x8CDD
  - FRAMEBUFFER_BINDING: 0x8CA6
  - RENDERBUFFER_BINDING: 0x8CA7
  - MAX_RENDERBUFFER_SIZE: 0x84E8
  - INVALID_FRAMEBUFFER_OPERATION: 0x0506
  - UNPACK_FLIP_Y_WEBGL: 0x9240
  - UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241
  - CONTEXT_LOST_WEBGL: 0x9242
  - UNPACK_COLORSPACE_CONVERSION_WEBGL: 0x9243
  - BROWSER_DEFAULT_WEBGL: 0x9244

### 895. WebGLRenderingContextOverloads (interface)
purpose: Interface definition
methods:
  - bufferData(target, size, usage): void
  - bufferData(target, data, usage): void
  - bufferSubData(target, offset, data): void
  - compressedTexImage2D(target, level, internalformat, width, height, border, data): void
  - compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, data): void
  - readPixels(x, y, width, height, format, type, pixels): void
  - texImage2D(target, level, internalformat, width, height, border, format, type, pixels): void
  - texImage2D(target, level, internalformat, format, type, source): void
  - texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels): void
  - texSubImage2D(target, level, xoffset, yoffset, format, type, source): void
  - uniform1fv(location, v): void
  - uniform1iv(location, v): void
  - uniform2fv(location, v): void
  - uniform2iv(location, v): void
  - uniform3fv(location, v): void
  - uniform3iv(location, v): void
  - uniform4fv(location, v): void
  - uniform4iv(location, v): void
  - uniformMatrix2fv(location, transpose, value): void
  - uniformMatrix3fv(location, transpose, value): void
  - uniformMatrix4fv(location, transpose, value): void

### 896. WebGLSampler (interface)
purpose: Interface definition

### 897. WebGLShader (interface)
purpose: Interface definition

### 898. WebGLShaderPrecisionFormat (interface)
purpose: Interface definition
properties:
  - precision: GLint
  - rangeMax: GLint
  - rangeMin: GLint

### 899. WebGLSync (interface)
purpose: Interface definition

### 900. WebGLTexture (interface)
purpose: Interface definition

### 901. WebGLTransformFeedback (interface)
purpose: Interface definition

### 902. WebGLUniformLocation (interface)
purpose: Interface definition

### 903. WebGLVertexArrayObject (interface)
purpose: Interface definition

### 904. WebGLVertexArrayObjectOES (interface)
purpose: Interface definition

### 905. WebSocketEventMap (interface)
purpose: Interface definition
properties:
  - "close": CloseEvent
  - "error": Event
  - "message": MessageEvent
  - "open": Event

### 906. WebSocket (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - close(code, reason): void
  - send(data): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - binaryType: BinaryType
  - bufferedAmount: number
  - extensions: string
  - onclose: ((this: WebSocket, ev: CloseEvent) => any) | null
  - onerror: ((this: WebSocket, ev: Event) => any) | null
  - onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null
  - onopen: ((this: WebSocket, ev: Event) => any) | null
  - protocol: string
  - readyState: number
  - url: string
  - CONNECTING: 0
  - OPEN: 1
  - CLOSING: 2
  - CLOSED: 3

### 907. WebTransport (interface)
purpose: Interface definition
methods:
  - close(closeInfo): void
  - createBidirectionalStream(options): Promise<WebTransportBidirectionalStream>
  - createUnidirectionalStream(options): Promise<WritableStream>
properties:
  - closed: Promise<WebTransportCloseInfo>
  - datagrams: WebTransportDatagramDuplexStream
  - incomingBidirectionalStreams: ReadableStream
  - incomingUnidirectionalStreams: ReadableStream
  - ready: Promise<void>

### 908. WebTransportBidirectionalStream (interface)
purpose: Interface definition
properties:
  - readable: ReadableStream
  - writable: WritableStream

### 909. WebTransportDatagramDuplexStream (interface)
purpose: Interface definition
properties:
  - incomingHighWaterMark: number
  - incomingMaxAge: number | null
  - maxDatagramSize: number
  - outgoingHighWaterMark: number
  - outgoingMaxAge: number | null
  - readable: ReadableStream
  - writable: WritableStream

### 910. WebTransportError (interface)
purpose: Interface definition
extends: DOMException
properties:
  - source: WebTransportErrorSource
  - streamErrorCode: number | null

### 911. WindowClient (interface)
purpose: Interface definition
extends: Client
methods:
  - focus(): Promise<WindowClient>
  - navigate(url): Promise<WindowClient | null>
properties:
  - focused: boolean
  - visibilityState: DocumentVisibilityState

### 912. WindowOrWorkerGlobalScope (interface)
purpose: Interface definition
methods:
  - atob(data): string
  - btoa(data): string
  - clearInterval(id): void
  - clearTimeout(id): void
  - createImageBitmap(image, options): Promise<ImageBitmap>
  - createImageBitmap(image, sx, sy, sw, sh, options): Promise<ImageBitmap>
  - fetch(input, init): Promise<Response>
  - queueMicrotask(callback): void
  - reportError(e): void
  - setInterval(handler, timeout, arguments): number
  - setTimeout(handler, timeout, arguments): number
  - structuredClone(value, options): T
properties:
  - caches: CacheStorage
  - crossOriginIsolated: boolean
  - crypto: Crypto
  - indexedDB: IDBFactory
  - isSecureContext: boolean
  - origin: string
  - performance: Performance

### 913. WorkerEventMap (interface)
purpose: Interface definition
extends: AbstractWorkerEventMap, MessageEventTargetEventMap

### 914. Worker (interface)
purpose: Interface definition
extends: EventTarget, AbstractWorker, MessageEventTarget<Worker>
methods:
  - postMessage(message, transfer): void
  - postMessage(message, options): void
  - terminate(): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void

### 915. WorkerGlobalScopeEventMap (interface)
purpose: Interface definition
properties:
  - "error": ErrorEvent
  - "languagechange": Event
  - "offline": Event
  - "online": Event
  - "rejectionhandled": PromiseRejectionEvent
  - "unhandledrejection": PromiseRejectionEvent

### 916. WorkerGlobalScope (interface)
purpose: Interface definition
extends: EventTarget, FontFaceSource, WindowOrWorkerGlobalScope
methods:
  - importScripts(urls): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - location: WorkerLocation
  - navigator: WorkerNavigator
  - onerror: ((this: WorkerGlobalScope, ev: ErrorEvent) => any) | null
  - onlanguagechange: ((this: WorkerGlobalScope, ev: Event) => any) | null
  - onoffline: ((this: WorkerGlobalScope, ev: Event) => any) | null
  - ononline: ((this: WorkerGlobalScope, ev: Event) => any) | null
  - onrejectionhandled: ((this: WorkerGlobalScope, ev: PromiseRejectionEvent) => any) | null
  - onunhandledrejection: ((this: WorkerGlobalScope, ev: PromiseRejectionEvent) => any) | null
  - self: WorkerGlobalScope & typeof globalThis

### 917. WorkerLocation (interface)
purpose: Interface definition
methods:
  - toString(): string
properties:
  - hash: string
  - host: string
  - hostname: string
  - href: string
  - origin: string
  - pathname: string
  - port: string
  - protocol: string
  - search: string

### 918. WorkerNavigator (interface)
purpose: Interface definition
extends: NavigatorBadge, NavigatorConcurrentHardware, NavigatorID, NavigatorLanguage, NavigatorLocks, NavigatorOnLine, NavigatorStorage
properties:
  - mediaCapabilities: MediaCapabilities
  - permissions: Permissions
  - serviceWorker: ServiceWorkerContainer

### 919. WritableStream (interface)
purpose: Interface definition
methods:
  - abort(reason): Promise<void>
  - close(): Promise<void>
  - getWriter(): WritableStreamDefaultWriter<W>
properties:
  - locked: boolean

### 920. WritableStreamDefaultController (interface)
purpose: Interface definition
methods:
  - error(e): void
properties:
  - signal: AbortSignal

### 921. WritableStreamDefaultWriter (interface)
purpose: Interface definition
methods:
  - abort(reason): Promise<void>
  - close(): Promise<void>
  - releaseLock(): void
  - write(chunk): Promise<void>
properties:
  - closed: Promise<void>
  - desiredSize: number | null
  - ready: Promise<void>

### 922. XMLHttpRequestEventMap (interface)
purpose: Interface definition
extends: XMLHttpRequestEventTargetEventMap
properties:
  - "readystatechange": Event

### 923. XMLHttpRequest (interface)
purpose: Interface definition
extends: XMLHttpRequestEventTarget
methods:
  - abort(): void
  - getAllResponseHeaders(): string
  - getResponseHeader(name): string | null
  - open(method, url): void
  - open(method, url, async, username, password): void
  - overrideMimeType(mime): void
  - send(body): void
  - setRequestHeader(name, value): void
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null
  - readyState: number
  - response: any
  - responseText: string
  - responseType: XMLHttpRequestResponseType
  - responseURL: string
  - status: number
  - statusText: string
  - timeout: number
  - upload: XMLHttpRequestUpload
  - withCredentials: boolean
  - UNSENT: 0
  - OPENED: 1
  - HEADERS_RECEIVED: 2
  - LOADING: 3
  - DONE: 4

### 924. XMLHttpRequestEventTargetEventMap (interface)
purpose: Interface definition
properties:
  - "abort": ProgressEvent<XMLHttpRequestEventTarget>
  - "error": ProgressEvent<XMLHttpRequestEventTarget>
  - "load": ProgressEvent<XMLHttpRequestEventTarget>
  - "loadend": ProgressEvent<XMLHttpRequestEventTarget>
  - "loadstart": ProgressEvent<XMLHttpRequestEventTarget>
  - "progress": ProgressEvent<XMLHttpRequestEventTarget>
  - "timeout": ProgressEvent<XMLHttpRequestEventTarget>

### 925. XMLHttpRequestEventTarget (interface)
purpose: Interface definition
extends: EventTarget
methods:
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
properties:
  - onabort: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null
  - onerror: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null
  - onload: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null
  - onloadend: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null
  - onloadstart: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null
  - onprogress: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null
  - ontimeout: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null

### 926. XMLHttpRequestUpload (interface)
purpose: Interface definition
extends: XMLHttpRequestEventTarget
methods:
  - addEventListener(type, listener, options): void
  - addEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void
  - removeEventListener(type, listener, options): void

### 927. Console (interface)
purpose: Interface definition
methods:
  - assert(condition, data): void
  - clear(): void
  - count(label): void
  - countReset(label): void
  - debug(data): void
  - dir(item, options): void
  - dirxml(data): void
  - error(data): void
  - group(data): void
  - groupCollapsed(data): void
  - groupEnd(): void
  - info(data): void
  - log(data): void
  - table(tabularData, properties): void
  - time(label): void
  - timeEnd(label): void
  - timeLog(label, data): void
  - timeStamp(label): void
  - trace(data): void
  - warn(data): void

### 928. AudioDataOutputCallback (interface)
purpose: Interface definition

### 929. EncodedAudioChunkOutputCallback (interface)
purpose: Interface definition

### 930. EncodedVideoChunkOutputCallback (interface)
purpose: Interface definition

### 931. FrameRequestCallback (interface)
purpose: Interface definition

### 932. LockGrantedCallback (interface)
purpose: Interface definition

### 933. OnErrorEventHandlerNonNull (interface)
purpose: Interface definition

### 934. PerformanceObserverCallback (interface)
purpose: Interface definition

### 935. QueuingStrategySize (interface)
purpose: Interface definition

### 936. ReportingObserverCallback (interface)
purpose: Interface definition

### 937. TransformerFlushCallback (interface)
purpose: Interface definition

### 938. TransformerStartCallback (interface)
purpose: Interface definition

### 939. TransformerTransformCallback (interface)
purpose: Interface definition

### 940. UnderlyingSinkAbortCallback (interface)
purpose: Interface definition

### 941. UnderlyingSinkCloseCallback (interface)
purpose: Interface definition

### 942. UnderlyingSinkStartCallback (interface)
purpose: Interface definition

### 943. UnderlyingSinkWriteCallback (interface)
purpose: Interface definition

### 944. UnderlyingSourceCancelCallback (interface)
purpose: Interface definition

### 945. UnderlyingSourcePullCallback (interface)
purpose: Interface definition

### 946. UnderlyingSourceStartCallback (interface)
purpose: Interface definition

### 947. VideoFrameOutputCallback (interface)
purpose: Interface definition

### 948. VoidFunction (interface)
purpose: Interface definition

### 949. WebCodecsErrorCallback (interface)
purpose: Interface definition

### 950. CSSNumericArray (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<CSSNumericValue>
  - entries(): ArrayIterator<[number, CSSNumericValue]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<CSSNumericValue>

### 951. CSSTransformValue (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<CSSTransformComponent>
  - entries(): ArrayIterator<[number, CSSTransformComponent]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<CSSTransformComponent>

### 952. CSSUnparsedValue (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<CSSUnparsedSegment>
  - entries(): ArrayIterator<[number, CSSUnparsedSegment]>
  - keys(): ArrayIterator<number>
  - values(): ArrayIterator<CSSUnparsedSegment>

### 953. Cache (interface)
purpose: Interface definition
methods:
  - addAll(requests): Promise<void>

### 954. CanvasPath (interface)
purpose: Interface definition
methods:
  - roundRect(x, y, w, h, radii): void

### 955. CanvasPathDrawingStyles (interface)
purpose: Interface definition
methods:
  - setLineDash(segments): void

### 956. CookieStoreManager (interface)
purpose: Interface definition
methods:
  - subscribe(subscriptions): Promise<void>
  - unsubscribe(subscriptions): Promise<void>

### 957. DOMStringList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<string>

### 958. FileList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<File>

### 959. FontFaceSet (interface)
purpose: Interface definition
extends: Set<FontFace>

### 960. FormDataIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): FormDataIterator<T>

### 961. FormData (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): FormDataIterator<[string, FormDataEntryValue]>
  - entries(): FormDataIterator<[string, FormDataEntryValue]>
  - keys(): FormDataIterator<string>
  - values(): FormDataIterator<FormDataEntryValue>

### 962. HeadersIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): HeadersIterator<T>

### 963. Headers (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): HeadersIterator<[string, string]>
  - entries(): HeadersIterator<[string, string]>
  - keys(): HeadersIterator<string>
  - values(): HeadersIterator<string>

### 964. IDBDatabase (interface)
purpose: Interface definition
methods:
  - transaction(storeNames, mode, options): IDBTransaction

### 965. IDBObjectStore (interface)
purpose: Interface definition
methods:
  - createIndex(name, keyPath, options): IDBIndex

### 966. ImageTrackList (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): ArrayIterator<ImageTrack>

### 967. MessageEvent (interface)
purpose: Interface definition
methods:
  - initMessageEvent(type, bubbles, cancelable, data, origin, lastEventId, source, ports): void

### 968. StylePropertyMapReadOnlyIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): StylePropertyMapReadOnlyIterator<T>

### 969. StylePropertyMapReadOnly (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): StylePropertyMapReadOnlyIterator<[string, Iterable<CSSStyleValue>]>
  - entries(): StylePropertyMapReadOnlyIterator<[string, Iterable<CSSStyleValue>]>
  - keys(): StylePropertyMapReadOnlyIterator<string>
  - values(): StylePropertyMapReadOnlyIterator<Iterable<CSSStyleValue>>

### 970. SubtleCrypto (interface)
purpose: Interface definition
methods:
  - deriveKey(algorithm, baseKey, derivedKeyType, extractable, keyUsages): Promise<CryptoKey>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKeyPair>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKeyPair>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKey>
  - generateKey(algorithm, extractable, keyUsages): Promise<CryptoKeyPair | CryptoKey>
  - importKey(format, keyData, algorithm, extractable, keyUsages): Promise<CryptoKey>
  - importKey(format, keyData, algorithm, extractable, keyUsages): Promise<CryptoKey>
  - unwrapKey(format, wrappedKey, unwrappingKey, unwrapAlgorithm, unwrappedKeyAlgorithm, extractable, keyUsages): Promise<CryptoKey>

### 971. URLSearchParamsIterator (interface)
purpose: Interface definition
extends: IteratorObject<T, BuiltinIteratorReturn, unknown>
methods:
  - [Symbol.iterator](): URLSearchParamsIterator<T>

### 972. URLSearchParams (interface)
purpose: Interface definition
methods:
  - [Symbol.iterator](): URLSearchParamsIterator<[string, string]>
  - entries(): URLSearchParamsIterator<[string, string]>
  - keys(): URLSearchParamsIterator<string>
  - values(): URLSearchParamsIterator<string>

### 973. WEBGL_draw_buffers (interface)
purpose: Interface definition
methods:
  - drawBuffersWEBGL(buffers): void

### 974. WEBGL_multi_draw (interface)
purpose: Interface definition
methods:
  - multiDrawArraysInstancedWEBGL(mode, firstsList, firstsOffset, countsList, countsOffset, instanceCountsList, instanceCountsOffset, drawcount): void
  - multiDrawArraysWEBGL(mode, firstsList, firstsOffset, countsList, countsOffset, drawcount): void
  - multiDrawElementsInstancedWEBGL(mode, countsList, countsOffset, type, offsetsList, offsetsOffset, instanceCountsList, instanceCountsOffset, drawcount): void
  - multiDrawElementsWEBGL(mode, countsList, countsOffset, type, offsetsList, offsetsOffset, drawcount): void

### 975. WebGL2RenderingContextBase (interface)
purpose: Interface definition
methods:
  - clearBufferfv(buffer, drawbuffer, values, srcOffset): void
  - clearBufferiv(buffer, drawbuffer, values, srcOffset): void
  - clearBufferuiv(buffer, drawbuffer, values, srcOffset): void
  - drawBuffers(buffers): void
  - getActiveUniforms(program, uniformIndices, pname): any
  - getUniformIndices(program, uniformNames): GLuint[] | null
  - invalidateFramebuffer(target, attachments): void
  - invalidateSubFramebuffer(target, attachments, x, y, width, height): void
  - transformFeedbackVaryings(program, varyings, bufferMode): void
  - uniform1uiv(location, data, srcOffset, srcLength): void
  - uniform2uiv(location, data, srcOffset, srcLength): void
  - uniform3uiv(location, data, srcOffset, srcLength): void
  - uniform4uiv(location, data, srcOffset, srcLength): void
  - uniformMatrix2x3fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix2x4fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix3x2fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix3x4fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix4x2fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix4x3fv(location, transpose, data, srcOffset, srcLength): void
  - vertexAttribI4iv(index, values): void
  - vertexAttribI4uiv(index, values): void

### 976. WebGL2RenderingContextOverloads (interface)
purpose: Interface definition
methods:
  - uniform1fv(location, data, srcOffset, srcLength): void
  - uniform1iv(location, data, srcOffset, srcLength): void
  - uniform2fv(location, data, srcOffset, srcLength): void
  - uniform2iv(location, data, srcOffset, srcLength): void
  - uniform3fv(location, data, srcOffset, srcLength): void
  - uniform3iv(location, data, srcOffset, srcLength): void
  - uniform4fv(location, data, srcOffset, srcLength): void
  - uniform4iv(location, data, srcOffset, srcLength): void
  - uniformMatrix2fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix3fv(location, transpose, data, srcOffset, srcLength): void
  - uniformMatrix4fv(location, transpose, data, srcOffset, srcLength): void

### 977. WebGLRenderingContextBase (interface)
purpose: Interface definition
methods:
  - vertexAttrib1fv(index, values): void
  - vertexAttrib2fv(index, values): void
  - vertexAttrib3fv(index, values): void
  - vertexAttrib4fv(index, values): void

### 978. WebGLRenderingContextOverloads (interface)
purpose: Interface definition
methods:
  - uniform1fv(location, v): void
  - uniform1iv(location, v): void
  - uniform2fv(location, v): void
  - uniform2iv(location, v): void
  - uniform3fv(location, v): void
  - uniform3iv(location, v): void
  - uniform4fv(location, v): void
  - uniform4iv(location, v): void
  - uniformMatrix2fv(location, transpose, value): void
  - uniformMatrix3fv(location, transpose, value): void
  - uniformMatrix4fv(location, transpose, value): void

## 🔌 Exports
named_exports:
  - tokenToString
  - getPositionOfLineAndCharacter
  - getLineAndCharacterOfPosition
  - isWhiteSpaceLike
  - isWhiteSpaceSingleLine
  - isLineBreak
  - couldStartTrivia
  - forEachLeadingCommentRange
  - forEachTrailingCommentRange
  - reduceEachLeadingCommentRange
  - reduceEachTrailingCommentRange
  - getLeadingCommentRanges
  - getTrailingCommentRanges
  - getShebang
  - isIdentifierStart
  - isIdentifierPart
  - createScanner
  - isExternalModuleNameRelative
  - sortAndDeduplicateDiagnostics
  - getDefaultLibFileName
  - textSpanEnd
  - textSpanIsEmpty
  - textSpanContainsPosition
  - textSpanContainsTextSpan
  - textSpanOverlapsWith
  - textSpanOverlap
  - textSpanIntersectsWithTextSpan
  - textSpanIntersectsWith
  - decodedTextSpanIntersectsWith
  - textSpanIntersectsWithPosition
  - textSpanIntersection
  - createTextSpan
  - createTextSpanFromBounds
  - textChangeRangeNewSpan
  - textChangeRangeIsUnchanged
  - createTextChangeRange
  - collapseTextChangeRangesAcrossMultipleVersions
  - getTypeParameterOwner
  - isParameterPropertyDeclaration
  - isEmptyBindingPattern
  - isEmptyBindingElement
  - walkUpBindingElementsAndPatterns
  - getCombinedModifierFlags
  - getCombinedNodeFlags
  - validateLocaleAndSetLanguage
  - getOriginalNode
  - findAncestor
  - isParseTreeNode
  - getParseTreeNode
  - escapeLeadingUnderscores
  - unescapeLeadingUnderscores
  - idText
  - identifierToKeywordKind
  - symbolName
  - getNameOfJSDocTypedef
  - getNameOfDeclaration
  - getDecorators
  - getModifiers
  - getJSDocParameterTags
  - getJSDocTypeParameterTags
  - hasJSDocParameterTags
  - getJSDocAugmentsTag
  - getJSDocImplementsTags
  - getJSDocClassTag
  - getJSDocPublicTag
  - getJSDocPrivateTag
  - getJSDocProtectedTag
  - getJSDocReadonlyTag
  - getJSDocOverrideTagNoCache
  - getJSDocDeprecatedTag
  - getJSDocEnumTag
  - getJSDocThisTag
  - getJSDocReturnTag
  - getJSDocTemplateTag
  - getJSDocSatisfiesTag
  - getJSDocTypeTag
  - getJSDocType
  - getJSDocReturnType
  - getJSDocTags
  - getAllJSDocTags
  - getAllJSDocTagsOfKind
  - getTextOfJSDocComment
  - getEffectiveTypeParameterDeclarations
  - getEffectiveConstraintOfTypeParameter
  - isMemberName
  - isPropertyAccessChain
  - isElementAccessChain
  - isCallChain
  - isOptionalChain
  - isNullishCoalesce
  - isConstTypeReference
  - skipPartiallyEmittedExpressions
  - isNonNullChain
  - isBreakOrContinueStatement
  - isNamedExportBindings
  - isJSDocPropertyLikeTag
  - isTokenKind
  - isToken
  - isLiteralExpression
  - isTemplateLiteralToken
  - isTemplateMiddleOrTemplateTail
  - isImportOrExportSpecifier
  - isTypeOnlyImportDeclaration
  - isTypeOnlyExportDeclaration
  - isTypeOnlyImportOrExportDeclaration
  - isPartOfTypeOnlyImportOrExportDeclaration
  - isStringTextContainingNode
  - isImportAttributeName
  - isModifier
  - isEntityName
  - isPropertyName
  - isBindingName
  - isFunctionLike
  - isClassElement
  - isClassLike
  - isAccessor
  - isAutoAccessorPropertyDeclaration
  - isModifierLike
  - isTypeElement
  - isClassOrTypeElement
  - isObjectLiteralElementLike
  - isTypeNode
  - isFunctionOrConstructorTypeNode
  - isArrayBindingElement
  - isPropertyAccessOrQualifiedName
  - isCallLikeExpression
  - isCallOrNewExpression
  - isTemplateLiteral
  - isLeftHandSideExpression
  - isLiteralTypeLiteral
  - isExpression
  - isAssertionExpression
  - isIterationStatement
  - isConciseBody
  - isForInitializer
  - isModuleBody
  - isNamedImportBindings
  - isDeclarationStatement
  - isStatement
  - isModuleReference
  - isJsxTagNameExpression
  - isJsxChild
  - isJsxAttributeLike
  - isStringLiteralOrJsxExpression
  - isJsxOpeningLikeElement
  - isJsxCallLike
  - isCaseOrDefaultClause
  - isJSDocCommentContainingNode
  - isSetAccessor
  - isGetAccessor
  - hasOnlyExpressionInitializer
  - isObjectLiteralElement
  - isStringLiteralLike
  - isJSDocLinkLike
  - hasRestParameter
  - isRestParameter
  - isInternalDeclaration
  - isPartOfTypeNode
  - getJSDocCommentsAndTags
  - createSourceMapSource
  - setOriginalNode
  - disposeEmitNodes
  - setEmitFlags
  - getSourceMapRange
  - setSourceMapRange
  - getTokenSourceMapRange
  - setTokenSourceMapRange
  - getCommentRange
  - setCommentRange
  - getSyntheticLeadingComments
  - setSyntheticLeadingComments
  - addSyntheticLeadingComment
  - getSyntheticTrailingComments
  - setSyntheticTrailingComments
  - addSyntheticTrailingComment
  - moveSyntheticComments
  - getConstantValue
  - setConstantValue
  - addEmitHelper
  - addEmitHelpers
  - removeEmitHelper
  - getEmitHelpers
  - moveEmitHelpers
  - isNumericLiteral
  - isBigIntLiteral
  - isStringLiteral
  - isJsxText
  - isRegularExpressionLiteral
  - isNoSubstitutionTemplateLiteral
  - isTemplateHead
  - isTemplateMiddle
  - isTemplateTail
  - isDotDotDotToken
  - isPlusToken
  - isMinusToken
  - isAsteriskToken
  - isExclamationToken
  - isQuestionToken
  - isColonToken
  - isQuestionDotToken
  - isEqualsGreaterThanToken
  - isIdentifier
  - isPrivateIdentifier
  - isAssertsKeyword
  - isAwaitKeyword
  - isQualifiedName
  - isComputedPropertyName
  - isTypeParameterDeclaration
  - isParameter
  - isDecorator
  - isPropertySignature
  - isPropertyDeclaration
  - isMethodSignature
  - isMethodDeclaration
  - isClassStaticBlockDeclaration
  - isConstructorDeclaration
  - isGetAccessorDeclaration
  - isSetAccessorDeclaration
  - isCallSignatureDeclaration
  - isConstructSignatureDeclaration
  - isIndexSignatureDeclaration
  - isTypePredicateNode
  - isTypeReferenceNode
  - isFunctionTypeNode
  - isConstructorTypeNode
  - isTypeQueryNode
  - isTypeLiteralNode
  - isArrayTypeNode
  - isTupleTypeNode
  - isNamedTupleMember
  - isOptionalTypeNode
  - isRestTypeNode
  - isUnionTypeNode
  - isIntersectionTypeNode
  - isConditionalTypeNode
  - isInferTypeNode
  - isParenthesizedTypeNode
  - isThisTypeNode
  - isTypeOperatorNode
  - isIndexedAccessTypeNode
  - isMappedTypeNode
  - isLiteralTypeNode
  - isImportTypeNode
  - isTemplateLiteralTypeSpan
  - isTemplateLiteralTypeNode
  - isObjectBindingPattern
  - isArrayBindingPattern
  - isBindingElement
  - isArrayLiteralExpression
  - isObjectLiteralExpression
  - isPropertyAccessExpression
  - isElementAccessExpression
  - isCallExpression
  - isNewExpression
  - isTaggedTemplateExpression
  - isTypeAssertionExpression
  - isParenthesizedExpression
  - isFunctionExpression
  - isArrowFunction
  - isDeleteExpression
  - isTypeOfExpression
  - isVoidExpression
  - isAwaitExpression
  - isPrefixUnaryExpression
  - isPostfixUnaryExpression
  - isBinaryExpression
  - isConditionalExpression
  - isTemplateExpression
  - isYieldExpression
  - isSpreadElement
  - isClassExpression
  - isOmittedExpression
  - isExpressionWithTypeArguments
  - isAsExpression
  - isSatisfiesExpression
  - isNonNullExpression
  - isMetaProperty
  - isSyntheticExpression
  - isPartiallyEmittedExpression
  - isCommaListExpression
  - isTemplateSpan
  - isSemicolonClassElement
  - isBlock
  - isVariableStatement
  - isEmptyStatement
  - isExpressionStatement
  - isIfStatement
  - isDoStatement
  - isWhileStatement
  - isForStatement
  - isForInStatement
  - isForOfStatement
  - isContinueStatement
  - isBreakStatement
  - isReturnStatement
  - isWithStatement
  - isSwitchStatement
  - isLabeledStatement
  - isThrowStatement
  - isTryStatement
  - isDebuggerStatement
  - isVariableDeclaration
  - isVariableDeclarationList
  - isFunctionDeclaration
  - isClassDeclaration
  - isInterfaceDeclaration
  - isTypeAliasDeclaration
  - isEnumDeclaration
  - isModuleDeclaration
  - isModuleBlock
  - isCaseBlock
  - isNamespaceExportDeclaration
  - isImportEqualsDeclaration
  - isImportDeclaration
  - isImportClause
  - isImportTypeAssertionContainer
  - isAssertClause
  - isAssertEntry
  - isImportAttributes
  - isImportAttribute
  - isNamespaceImport
  - isNamespaceExport
  - isNamedImports
  - isImportSpecifier
  - isExportAssignment
  - isExportDeclaration
  - isNamedExports
  - isExportSpecifier
  - isModuleExportName
  - isMissingDeclaration
  - isNotEmittedStatement
  - isExternalModuleReference
  - isJsxElement
  - isJsxSelfClosingElement
  - isJsxOpeningElement
  - isJsxClosingElement
  - isJsxFragment
  - isJsxOpeningFragment
  - isJsxClosingFragment
  - isJsxAttribute
  - isJsxAttributes
  - isJsxSpreadAttribute
  - isJsxExpression
  - isJsxNamespacedName
  - isCaseClause
  - isDefaultClause
  - isHeritageClause
  - isCatchClause
  - isPropertyAssignment
  - isShorthandPropertyAssignment
  - isSpreadAssignment
  - isEnumMember
  - isSourceFile
  - isBundle
  - isJSDocTypeExpression
  - isJSDocNameReference
  - isJSDocMemberName
  - isJSDocLink
  - isJSDocLinkCode
  - isJSDocLinkPlain
  - isJSDocAllType
  - isJSDocUnknownType
  - isJSDocNullableType
  - isJSDocNonNullableType
  - isJSDocOptionalType
  - isJSDocFunctionType
  - isJSDocVariadicType
  - isJSDocNamepathType
  - isJSDoc
  - isJSDocTypeLiteral
  - isJSDocSignature
  - isJSDocAugmentsTag
  - isJSDocAuthorTag
  - isJSDocClassTag
  - isJSDocCallbackTag
  - isJSDocPublicTag
  - isJSDocPrivateTag
  - isJSDocProtectedTag
  - isJSDocReadonlyTag
  - isJSDocOverrideTag
  - isJSDocOverloadTag
  - isJSDocDeprecatedTag
  - isJSDocSeeTag
  - isJSDocEnumTag
  - isJSDocParameterTag
  - isJSDocReturnTag
  - isJSDocThisTag
  - isJSDocTypeTag
  - isJSDocTemplateTag
  - isJSDocTypedefTag
  - isJSDocUnknownTag
  - isJSDocPropertyTag
  - isJSDocImplementsTag
  - isJSDocSatisfiesTag
  - isJSDocThrowsTag
  - isJSDocImportTag
  - isQuestionOrExclamationToken
  - isIdentifierOrThisTypeNode
  - isReadonlyKeywordOrPlusOrMinusToken
  - isQuestionOrPlusOrMinusToken
  - isModuleName
  - isBinaryOperatorToken
  - setTextRange
  - canHaveModifiers
  - canHaveDecorators
  - forEachChild
  - createSourceFile
  - parseIsolatedEntityName
  - parseJsonText
  - isExternalModule
  - updateSourceFile
  - parseCommandLine
  - parseBuildCommand
  - getParsedCommandLineOfConfigFile
  - readConfigFile
  - parseConfigFileTextToJson
  - readJsonConfigFile
  - convertToObject
  - parseJsonConfigFileContent
  - parseJsonSourceFileConfigFileContent
  - convertCompilerOptionsFromJson
  - convertTypeAcquisitionFromJson
  - getEffectiveTypeRoots
  - resolveTypeReferenceDirective
  - getAutomaticTypeDirectiveNames
  - createModuleResolutionCache
  - createTypeReferenceDirectiveResolutionCache
  - resolveModuleNameFromCache
  - resolveModuleName
  - bundlerModuleNameResolver
  - nodeModuleNameResolver
  - classicNameResolver
  - visitNode
  - visitNodes
  - visitLexicalEnvironment
  - visitParameterList
  - visitFunctionBody
  - visitIterationBody
  - visitCommaListElements
  - visitEachChild
  - getTsBuildInfoEmitOutputFilePath
  - getOutputFileNames
  - createPrinter
  - findConfigFile
  - resolveTripleslashReference
  - createCompilerHost
  - getPreEmitDiagnostics
  - formatDiagnostics
  - formatDiagnostic
  - formatDiagnosticsWithColorAndContext
  - flattenDiagnosticMessageText
  - getModeForFileReference
  - getModeForResolutionAtIndex
  - getModeForUsageLocation
  - getConfigFileParsingDiagnostics
  - getImpliedNodeFormatForFile
  - createProgram
  - resolveProjectReferencePath
  - createSemanticDiagnosticsBuilderProgram
  - createEmitAndSemanticDiagnosticsBuilderProgram
  - createAbstractBuilder
  - readBuilderProgram
  - createIncrementalCompilerHost
  - createIncrementalProgram
  - createWatchCompilerHost
  - createWatchProgram
  - createBuilderStatusReporter
  - createSolutionBuilderHost
  - createSolutionBuilderWithWatchHost
  - createSolutionBuilder
  - createSolutionBuilderWithWatch
  - isBuildCommand
  - getDefaultFormatCodeSettings
  - createClassifier
  - createDocumentRegistry
  - preProcessFile
  - transpileModule
  - transpileDeclaration
  - transpile
  - toEditorSettings
  - displayPartsToString
  - getDefaultCompilerOptions
  - getSupportedCodeFixes
  - createLanguageServiceSourceFile
  - updateLanguageServiceSourceFile
  - createLanguageService
  - getDefaultLibFilePath
  - transform
  - server
  - JsTyping
  - versionMajorMinor
  - version
  - MapLike
  - SortedReadonlyArray
  - SortedArray
  - Path
  - TextRange
  - ReadonlyTextRange
  - SyntaxKind
  - TriviaSyntaxKind
  - LiteralSyntaxKind
  - PseudoLiteralSyntaxKind
  - PunctuationSyntaxKind
  - KeywordSyntaxKind
  - ModifierSyntaxKind
  - KeywordTypeSyntaxKind
  - TokenSyntaxKind
  - JsxTokenSyntaxKind
  - JSDocSyntaxKind
  - NodeFlags
  - ModifierFlags
  - JsxFlags
  - Node
  - JSDocContainer
  - LocalsContainer
  - FlowContainer
  - HasJSDoc
  - HasType
  - HasTypeArguments
  - HasInitializer
  - HasExpressionInitializer
  - HasDecorators
  - HasModifiers
  - NodeArray
  - Token
  - EndOfFileToken
  - PunctuationToken
  - DotToken
  - DotDotDotToken
  - QuestionToken
  - ExclamationToken
  - ColonToken
  - EqualsToken
  - AmpersandAmpersandEqualsToken
  - BarBarEqualsToken
  - QuestionQuestionEqualsToken
  - AsteriskToken
  - EqualsGreaterThanToken
  - PlusToken
  - MinusToken
  - QuestionDotToken
  - KeywordToken
  - AssertsKeyword
  - AssertKeyword
  - AwaitKeyword
  - CaseKeyword
  - ModifierToken
  - AbstractKeyword
  - AccessorKeyword
  - AsyncKeyword
  - ConstKeyword
  - DeclareKeyword
  - DefaultKeyword
  - ExportKeyword
  - InKeyword
  - PrivateKeyword
  - ProtectedKeyword
  - PublicKeyword
  - ReadonlyKeyword
  - OutKeyword
  - OverrideKeyword
  - StaticKeyword
  - Modifier
  - ModifierLike
  - AccessibilityModifier
  - ParameterPropertyModifier
  - ClassMemberModifier
  - ModifiersArray
  - GeneratedIdentifierFlags
  - Identifier
  - TransientIdentifier
  - QualifiedName
  - EntityName
  - PropertyName
  - MemberName
  - DeclarationName
  - Declaration
  - NamedDeclaration
  - DeclarationStatement
  - ComputedPropertyName
  - PrivateIdentifier
  - Decorator
  - TypeParameterDeclaration
  - SignatureDeclarationBase
  - SignatureDeclaration
  - CallSignatureDeclaration
  - ConstructSignatureDeclaration
  - BindingName
  - VariableDeclaration
  - VariableDeclarationList
  - ParameterDeclaration
  - BindingElement
  - PropertySignature
  - PropertyDeclaration
  - AutoAccessorPropertyDeclaration
  - ObjectLiteralElement
  - ObjectLiteralElementLike
  - PropertyAssignment
  - ShorthandPropertyAssignment
  - SpreadAssignment
  - VariableLikeDeclaration
  - ObjectBindingPattern
  - ArrayBindingPattern
  - BindingPattern
  - ArrayBindingElement
  - FunctionLikeDeclarationBase
  - FunctionLikeDeclaration
  - FunctionLike
  - FunctionDeclaration
  - MethodSignature
  - MethodDeclaration
  - ConstructorDeclaration
  - SemicolonClassElement
  - GetAccessorDeclaration
  - SetAccessorDeclaration
  - AccessorDeclaration
  - IndexSignatureDeclaration
  - ClassStaticBlockDeclaration
  - TypeNode
  - KeywordTypeNode
  - ImportTypeAssertionContainer
  - ImportTypeNode
  - ThisTypeNode
  - FunctionOrConstructorTypeNode
  - FunctionOrConstructorTypeNodeBase
  - FunctionTypeNode
  - ConstructorTypeNode
  - NodeWithTypeArguments
  - TypeReferenceType
  - TypeReferenceNode
  - TypePredicateNode
  - TypeQueryNode
  - TypeLiteralNode
  - ArrayTypeNode
  - TupleTypeNode
  - NamedTupleMember
  - OptionalTypeNode
  - RestTypeNode
  - UnionOrIntersectionTypeNode
  - UnionTypeNode
  - IntersectionTypeNode
  - ConditionalTypeNode
  - InferTypeNode
  - ParenthesizedTypeNode
  - TypeOperatorNode
  - IndexedAccessTypeNode
  - MappedTypeNode
  - LiteralTypeNode
  - StringLiteral
  - StringLiteralLike
  - PropertyNameLiteral
  - TemplateLiteralTypeNode
  - TemplateLiteralTypeSpan
  - Expression
  - OmittedExpression
  - PartiallyEmittedExpression
  - UnaryExpression
  - IncrementExpression
  - UpdateExpression
  - PrefixUnaryOperator
  - PrefixUnaryExpression
  - PostfixUnaryOperator
  - PostfixUnaryExpression
  - LeftHandSideExpression
  - MemberExpression
  - PrimaryExpression
  - NullLiteral
  - TrueLiteral
  - FalseLiteral
  - BooleanLiteral
  - ThisExpression
  - SuperExpression
  - ImportExpression
  - DeleteExpression
  - TypeOfExpression
  - VoidExpression
  - AwaitExpression
  - YieldExpression
  - SyntheticExpression
  - ExponentiationOperator
  - MultiplicativeOperator
  - MultiplicativeOperatorOrHigher
  - AdditiveOperator
  - AdditiveOperatorOrHigher
  - ShiftOperator
  - ShiftOperatorOrHigher
  - RelationalOperator
  - RelationalOperatorOrHigher
  - EqualityOperator
  - EqualityOperatorOrHigher
  - BitwiseOperator
  - BitwiseOperatorOrHigher
  - LogicalOperator
  - LogicalOperatorOrHigher
  - CompoundAssignmentOperator
  - AssignmentOperator
  - AssignmentOperatorOrHigher
  - BinaryOperator
  - LogicalOrCoalescingAssignmentOperator
  - BinaryOperatorToken
  - BinaryExpression
  - AssignmentOperatorToken
  - AssignmentExpression
  - ObjectDestructuringAssignment
  - ArrayDestructuringAssignment
  - DestructuringAssignment
  - BindingOrAssignmentElement
  - ObjectBindingOrAssignmentElement
  - ArrayBindingOrAssignmentElement
  - BindingOrAssignmentElementRestIndicator
  - BindingOrAssignmentElementTarget
  - ObjectBindingOrAssignmentPattern
  - ArrayBindingOrAssignmentPattern
  - AssignmentPattern
  - BindingOrAssignmentPattern
  - ConditionalExpression
  - FunctionBody
  - ConciseBody
  - FunctionExpression
  - ArrowFunction
  - LiteralLikeNode
  - TemplateLiteralLikeNode
  - LiteralExpression
  - RegularExpressionLiteral
  - NoSubstitutionTemplateLiteral
  - TokenFlags
  - NumericLiteral
  - BigIntLiteral
  - LiteralToken
  - TemplateHead
  - TemplateMiddle
  - TemplateTail
  - PseudoLiteralToken
  - TemplateLiteralToken
  - TemplateExpression
  - TemplateLiteral
  - TemplateSpan
  - ParenthesizedExpression
  - ArrayLiteralExpression
  - SpreadElement
  - ObjectLiteralExpressionBase
  - ObjectLiteralExpression
  - EntityNameExpression
  - EntityNameOrEntityNameExpression
  - AccessExpression
  - PropertyAccessExpression
  - PropertyAccessChain
  - SuperPropertyAccessExpression
  - PropertyAccessEntityNameExpression
  - ElementAccessExpression
  - ElementAccessChain
  - SuperElementAccessExpression
  - SuperProperty
  - CallExpression
  - CallChain
  - OptionalChain
  - SuperCall
  - ImportCall
  - ExpressionWithTypeArguments
  - NewExpression
  - TaggedTemplateExpression
  - InstanceofExpression
  - CallLikeExpression
  - AsExpression
  - TypeAssertion
  - SatisfiesExpression
  - AssertionExpression
  - NonNullExpression
  - NonNullChain
  - MetaProperty
  - ImportDeferProperty
  - JsxElement
  - JsxOpeningLikeElement
  - JsxCallLike
  - JsxAttributeLike
  - JsxAttributeName
  - JsxTagNameExpression
  - JsxTagNamePropertyAccess
  - JsxAttributes
  - JsxNamespacedName
  - JsxOpeningElement
  - JsxSelfClosingElement
  - JsxFragment
  - JsxOpeningFragment
  - JsxClosingFragment
  - JsxAttribute
  - JsxAttributeValue
  - JsxSpreadAttribute
  - JsxClosingElement
  - JsxExpression
  - JsxText
  - JsxChild
  - Statement
  - NotEmittedStatement
  - NotEmittedTypeElement
  - CommaListExpression
  - EmptyStatement
  - DebuggerStatement
  - MissingDeclaration
  - BlockLike
  - Block
  - VariableStatement
  - ExpressionStatement
  - IfStatement
  - IterationStatement
  - DoStatement
  - WhileStatement
  - ForInitializer
  - ForStatement
  - ForInOrOfStatement
  - ForInStatement
  - ForOfStatement
  - BreakStatement
  - ContinueStatement
  - BreakOrContinueStatement
  - ReturnStatement
  - WithStatement
  - SwitchStatement
  - CaseBlock
  - CaseClause
  - DefaultClause
  - CaseOrDefaultClause
  - LabeledStatement
  - ThrowStatement
  - TryStatement
  - CatchClause
  - ObjectTypeDeclaration
  - DeclarationWithTypeParameters
  - DeclarationWithTypeParameterChildren
  - ClassLikeDeclarationBase
  - ClassDeclaration
  - ClassExpression
  - ClassLikeDeclaration
  - ClassElement
  - TypeElement
  - InterfaceDeclaration
  - HeritageClause
  - TypeAliasDeclaration
  - EnumMember
  - EnumDeclaration
  - ModuleName
  - ModuleBody
  - ModuleDeclaration
  - NamespaceBody
  - NamespaceDeclaration
  - JSDocNamespaceBody
  - JSDocNamespaceDeclaration
  - ModuleBlock
  - ModuleReference
  - ImportEqualsDeclaration
  - ExternalModuleReference
  - ImportDeclaration
  - NamedImportBindings
  - NamedExportBindings
  - ImportClause
  - ImportPhaseModifierSyntaxKind
  - AssertionKey
  - AssertEntry
  - AssertClause
  - ImportAttributeName
  - ImportAttribute
  - ImportAttributes
  - NamespaceImport
  - NamespaceExport
  - NamespaceExportDeclaration
  - ExportDeclaration
  - NamedImports
  - NamedExports
  - NamedImportsOrExports
  - ImportSpecifier
  - ExportSpecifier
  - ModuleExportName
  - ImportOrExportSpecifier
  - TypeOnlyCompatibleAliasDeclaration
  - TypeOnlyImportDeclaration
  - TypeOnlyExportDeclaration
  - TypeOnlyAliasDeclaration
  - ExportAssignment
  - FileReference
  - CheckJsDirective
  - CommentKind
  - CommentRange
  - SynthesizedComment
  - JSDocTypeExpression
  - JSDocNameReference
  - JSDocMemberName
  - JSDocType
  - JSDocAllType
  - JSDocUnknownType
  - JSDocNonNullableType
  - JSDocNullableType
  - JSDocOptionalType
  - JSDocFunctionType
  - JSDocVariadicType
  - JSDocNamepathType
  - JSDocTypeReferencingNode
  - JSDoc
  - JSDocTag
  - JSDocLink
  - JSDocLinkCode
  - JSDocLinkPlain
  - JSDocComment
  - JSDocText
  - JSDocUnknownTag
  - JSDocAugmentsTag
  - JSDocImplementsTag
  - JSDocAuthorTag
  - JSDocDeprecatedTag
  - JSDocClassTag
  - JSDocPublicTag
  - JSDocPrivateTag
  - JSDocProtectedTag
  - JSDocReadonlyTag
  - JSDocOverrideTag
  - JSDocEnumTag
  - JSDocThisTag
  - JSDocTemplateTag
  - JSDocSeeTag
  - JSDocReturnTag
  - JSDocTypeTag
  - JSDocTypedefTag
  - JSDocCallbackTag
  - JSDocOverloadTag
  - JSDocThrowsTag
  - JSDocSignature
  - JSDocPropertyLikeTag
  - JSDocPropertyTag
  - JSDocParameterTag
  - JSDocTypeLiteral
  - JSDocSatisfiesTag
  - JSDocImportTag
  - FlowType
  - IncompleteType
  - AmdDependency
  - SourceFileLike
  - ResolutionMode
  - SourceFile
  - Bundle
  - JsonSourceFile
  - TsConfigSourceFile
  - JsonMinusNumericLiteral
  - JsonObjectExpression
  - JsonObjectExpressionStatement
  - ScriptReferenceHost
  - ParseConfigHost
  - ResolvedConfigFileName
  - WriteFileCallbackData
  - WriteFileCallback
  - OperationCanceledException
  - CancellationToken
  - Program
  - ResolvedProjectReference
  - CustomTransformerFactory
  - CustomTransformer
  - CustomTransformers
  - SourceMapSpan
  - ExitStatus
  - EmitResult
  - TypeChecker
  - NodeBuilderFlags
  - TypeFormatFlags
  - SymbolFormatFlags
  - TypePredicateKind
  - TypePredicateBase
  - ThisTypePredicate
  - IdentifierTypePredicate
  - AssertsThisTypePredicate
  - AssertsIdentifierTypePredicate
  - TypePredicate
  - SymbolFlags
  - Symbol
  - InternalSymbolName
  - __String
  - ReadonlyUnderscoreEscapedMap
  - UnderscoreEscapedMap
  - SymbolTable
  - TypeFlags
  - DestructuringPattern
  - Type
  - FreshableType
  - LiteralType
  - UniqueESSymbolType
  - StringLiteralType
  - NumberLiteralType
  - BigIntLiteralType
  - EnumType
  - ObjectFlags
  - ObjectType
  - InterfaceType
  - BaseType
  - InterfaceTypeWithDeclaredMembers
  - TypeReference
  - DeferredTypeReference
  - GenericType
  - ElementFlags
  - TupleType
  - TupleTypeReference
  - UnionOrIntersectionType
  - UnionType
  - IntersectionType
  - StructuredType
  - EvolvingArrayType
  - InstantiableType
  - TypeParameter
  - IndexedAccessType
  - TypeVariable
  - IndexType
  - ConditionalRoot
  - ConditionalType
  - TemplateLiteralType
  - StringMappingType
  - SubstitutionType
  - SignatureKind
  - Signature
  - IndexKind
  - ElementWithComputedPropertyName
  - IndexInfo
  - InferencePriority
  - FileExtensionInfo
  - DiagnosticMessage
  - DiagnosticMessageChain
  - Diagnostic
  - DiagnosticRelatedInformation
  - DiagnosticWithLocation
  - DiagnosticCategory
  - ModuleResolutionKind
  - ModuleDetectionKind
  - PluginImport
  - ProjectReference
  - WatchFileKind
  - WatchDirectoryKind
  - PollingWatchKind
  - CompilerOptionsValue
  - CompilerOptions
  - WatchOptions
  - TypeAcquisition
  - ModuleKind
  - JsxEmit
  - ImportsNotUsedAsValues
  - NewLineKind
  - LineAndCharacter
  - ScriptKind
  - ScriptTarget
  - LanguageVariant
  - ParsedCommandLine
  - WatchDirectoryFlags
  - CreateProgramOptions
  - ModuleResolutionHost
  - MinimalResolutionCacheHost
  - ResolvedModule
  - ResolvedModuleFull
  - PackageId
  - Extension
  - ResolvedModuleWithFailedLookupLocations
  - ResolvedTypeReferenceDirective
  - ResolvedTypeReferenceDirectiveWithFailedLookupLocations
  - CompilerHost
  - SourceMapRange
  - SourceMapSource
  - EmitFlags
  - EmitHelperBase
  - ScopedEmitHelper
  - UnscopedEmitHelper
  - EmitHelper
  - EmitHelperUniqueNameCallback
  - EmitHint
  - OuterExpressionKinds
  - ImmediatelyInvokedFunctionExpression
  - ImmediatelyInvokedArrowFunction
  - NodeFactory
  - CoreTransformationContext
  - TransformationContext
  - TransformationResult
  - TransformerFactory
  - Transformer
  - Visitor
  - NodeVisitor
  - NodesVisitor
  - VisitResult
  - Printer
  - PrintHandlers
  - PrinterOptions
  - GetEffectiveTypeRootsHost
  - TextSpan
  - TextChangeRange
  - SyntaxList
  - ListFormat
  - JSDocParsingMode
  - UserPreferences
  - OrganizeImportsTypeOrder
  - PseudoBigInt
  - FileWatcherEventKind
  - FileWatcherCallback
  - DirectoryWatcherCallback
  - BufferEncoding
  - System
  - FileWatcher
  - sys
  - ErrorCallback
  - Scanner
  - unchangedTextChangeRange
  - ParameterPropertyDeclaration
  - factory
  - CreateSourceFileOptions
  - ParsedBuildCommand
  - DiagnosticReporter
  - ConfigFileDiagnosticsReporter
  - ParseConfigFileHost
  - ParsedTsconfig
  - ExtendedConfigCacheEntry
  - TypeReferenceDirectiveResolutionCache
  - ModeAwareCache
  - PerDirectoryResolutionCache
  - NonRelativeNameResolutionCache
  - PerNonRelativeNameCache
  - ModuleResolutionCache
  - NonRelativeModuleNameResolutionCache
  - PackageJsonInfoCache
  - PerModuleNameCache
  - ProgramUpdateLevel
  - FormatDiagnosticsHost
  - EmitOutput
  - OutputFile
  - AffectedFileResult
  - BuilderProgramHost
  - BuilderProgram
  - SemanticDiagnosticsBuilderProgram
  - EmitAndSemanticDiagnosticsBuilderProgram
  - ReadBuildProgramHost
  - IncrementalProgramOptions
  - WatchStatusReporter
  - CreateProgram
  - WatchHost
  - ProgramHost
  - WatchCompilerHost
  - WatchCompilerHostOfFilesAndCompilerOptions
  - WatchCompilerHostOfConfigFile
  - Watch
  - WatchOfConfigFile
  - WatchOfFilesAndCompilerOptions
  - BuildOptions
  - ReportEmitErrorSummary
  - ReportFileInError
  - SolutionBuilderHostBase
  - SolutionBuilderHost
  - SolutionBuilderWithWatchHost
  - SolutionBuilder
  - InvalidatedProjectKind
  - InvalidatedProjectBase
  - UpdateOutputFileStampsProject
  - BuildInvalidedProject
  - InvalidatedProject
  - IScriptSnapshot
  - ScriptSnapshot
  - PreProcessedFileInfo
  - HostCancellationToken
  - InstallPackageOptions
  - PerformanceEvent
  - LanguageServiceMode
  - IncompleteCompletionsCache
  - LanguageServiceHost
  - WithMetadata
  - SemanticClassificationFormat
  - LanguageService
  - JsxClosingTagInfo
  - LinkedEditingInfo
  - CombinedCodeFixScope
  - OrganizeImportsMode
  - PasteEdits
  - PasteEditsArgs
  - OrganizeImportsArgs
  - CompletionsTriggerCharacter
  - CompletionTriggerKind
  - GetCompletionsAtPositionOptions
  - SignatureHelpTriggerCharacter
  - SignatureHelpRetriggerCharacter
  - SignatureHelpItemsOptions
  - SignatureHelpTriggerReason
  - SignatureHelpInvokedReason
  - SignatureHelpCharacterTypedReason
  - SignatureHelpRetriggeredReason
  - ApplyCodeActionCommandResult
  - Classifications
  - ClassifiedSpan
  - ClassifiedSpan2020
  - NavigationBarItem
  - NavigationTree
  - CallHierarchyItem
  - CallHierarchyIncomingCall
  - CallHierarchyOutgoingCall
  - InlayHintKind
  - InlayHint
  - InlayHintDisplayPart
  - TodoCommentDescriptor
  - TodoComment
  - TextChange
  - FileTextChanges
  - CodeAction
  - CodeFixAction
  - CombinedCodeActions
  - CodeActionCommand
  - InstallPackageAction
  - ApplicableRefactorInfo
  - RefactorActionInfo
  - RefactorEditInfo
  - RefactorTriggerReason
  - TextInsertion
  - DocumentSpan
  - RenameLocation
  - ReferenceEntry
  - ImplementationLocation
  - HighlightSpanKind
  - HighlightSpan
  - NavigateToItem
  - IndentStyle
  - SemicolonPreference
  - EditorOptions
  - EditorSettings
  - FormatCodeOptions
  - FormatCodeSettings
  - DefinitionInfo
  - DefinitionInfoAndBoundSpan
  - ReferencedSymbolDefinitionInfo
  - ReferencedSymbol
  - ReferencedSymbolEntry
  - SymbolDisplayPartKind
  - SymbolDisplayPart
  - JSDocLinkDisplayPart
  - JSDocTagInfo
  - QuickInfo
  - RenameInfo
  - RenameInfoSuccess
  - RenameInfoFailure
  - RenameInfoOptions
  - DocCommentTemplateOptions
  - InteractiveRefactorArguments
  - SignatureHelpParameter
  - SelectionRange
  - SignatureHelpItem
  - SignatureHelpItems
  - CompletionInfoFlags
  - CompletionInfo
  - CompletionEntryDataAutoImport
  - CompletionEntryDataUnresolved
  - CompletionEntryDataResolved
  - CompletionEntryData
  - CompletionEntry
  - CompletionEntryLabelDetails
  - CompletionEntryDetails
  - OutliningSpan
  - OutliningSpanKind
  - OutputFileType
  - EndOfLineState
  - TokenClass
  - ClassificationResult
  - ClassificationInfo
  - Classifier
  - ScriptElementKind
  - ScriptElementKindModifier
  - ClassificationTypeNames
  - ClassificationType
  - InlayHintsContext
  - ExportMapInfoKey
  - DocumentHighlights
  - DocumentRegistry
  - DocumentRegistryBucketKey
  - TranspileOptions
  - TranspileOutput
  - servicesVersion
  - ANONYMOUS
  - AccessFlags
  - AssertionLevel
  - AssignmentDeclarationKind
  - AssignmentKind
  - Associativity
  - BreakpointResolver
  - BuilderFileEmit
  - BuilderProgramKind
  - BuilderState
  - CallHierarchy
  - CharacterCodes
  - CheckFlags
  - CheckMode
  - CommentDirectiveType
  - Comparison
  - Completions
  - ContainerFlags
  - ContextFlags
  - Debug
  - Diagnostics
  - EmitOnly
  - ExportKind
  - ExternalEmitHelpers
  - FileIncludeKind
  - FilePreprocessingDiagnosticsKind
  - FileSystemEntryKind
  - FindAllReferences
  - FlattenLevel
  - FlowFlags
  - ForegroundColorEscapeSequences
  - FunctionFlags
  - GetLiteralTextFlags
  - GoToDefinition
  - IdentifierNameMap
  - ImportKind
  - IndexFlags
  - InferenceFlags
  - InlayHints
  - InternalEmitFlags
  - InternalNodeBuilderFlags
  - IntersectionFlags
  - JsDoc
  - JsxReferenceKind
  - LanguageFeatureMinimumTarget
  - LexicalEnvironmentFlags
  - LogLevel
  - MapCode
  - MemberOverrideStatus
  - ModuleInstanceState
  - ModuleSpecifierEnding
  - NavigateTo
  - NavigationBar
  - NodeCheckFlags
  - NodeFactoryFlags
  - NodeResolutionFeatures
  - OperatorPrecedence
  - OrganizeImports
  - OutliningElementsCollector
  - PackageJsonAutoImportPreference
  - PackageJsonDependencyGroup
  - PatternMatchKind
  - PollingInterval
  - PragmaKindFlags
  - PredicateSemantics
  - PreparePasteEdits
  - PrivateIdentifierKind
  - ProcessLevel
  - QuotePreference
  - RegularExpressionFlags
  - RelationComparisonResult
  - Rename
  - SemanticMeaning
  - SignatureCheckMode
  - SignatureFlags
  - SignatureHelp
  - SignatureInfo
  - SmartSelectionRange
  - SnippetKind
  - StatisticType
  - StructureIsReused
  - SymbolAccessibility
  - SymbolDisplay
  - Ternary
  - ThrottledCancellationToken
  - TransformFlags
  - TypeFacts
  - TypeMapKind
  - TypeReferenceSerializationKind
  - UnionReduction
  - UpToDateStatusType
  - VarianceFlags
  - Version
  - VersionRange
  - WatchLogLevel
  - WatchType
  - accessPrivateIdentifier
  - addEmitFlags
  - addInternalEmitFlags
  - addNodeFactoryPatcher
  - addObjectAllocatorPatcher
  - addRange
  - addRelatedInfo
  - addToSeen
  - advancedAsyncSuperHelper
  - affectsDeclarationPathOptionDeclarations
  - affectsEmitOptionDeclarations
  - allKeysStartWithDot
  - altDirectorySeparator
  - and
  - append
  - appendIfUnique
  - arrayFrom
  - arrayIsEqualTo
  - arrayIsHomogeneous
  - arrayOf
  - arrayReverseIterator
  - arrayToMap
  - arrayToMultiMap
  - arrayToNumericMap
  - assertType
  - assign
  - asyncSuperHelper
  - attachFileToDiagnostics
  - base64decode
  - base64encode
  - binarySearch
  - binarySearchKey
  - bindSourceFile
  - breakIntoCharacterSpans
  - breakIntoWordSpans
  - buildLinkParts
  - buildOpts
  - buildOverload
  - canBeConvertedToAsync
  - canHaveExportModifier
  - canHaveFlowNode
  - canHaveIllegalDecorators
  - canHaveIllegalModifiers
  - canHaveIllegalType
  - canHaveIllegalTypeParameters
  - canHaveJSDoc
  - canHaveLocals
  - canHaveModuleSpecifier
  - canHaveSymbol
  - canIncludeBindAndCheckDiagnostics
  - canJsonReportNoInputFiles
  - canProduceDiagnostics
  - canUsePropertyAccess
  - canWatchAffectingLocation
  - canWatchAtTypes
  - canWatchDirectoryOrFile
  - canWatchDirectoryOrFilePath
  - cartesianProduct
  - cast
  - chainBundle
  - chainDiagnosticMessages
  - changeAnyExtension
  - changeCompilerHostLikeToUseCache
  - changeExtension
  - changeFullExtension
  - changesAffectModuleResolution
  - changesAffectingProgramStructure
  - characterCodeToRegularExpressionFlag
  - childIsDecorated
  - classElementOrClassElementParameterIsDecorated
  - classHasClassThisAssignment
  - classHasDeclaredOrExplicitlyAssignedName
  - classHasExplicitlyAssignedName
  - classOrConstructorParameterIsDecorated
  - classifier
  - cleanExtendedConfigCache
  - clear
  - clearMap
  - clearSharedExtendedConfigFileWatcher
  - climbPastPropertyAccess
  - clone
  - cloneCompilerOptions
  - closeFileWatcher
  - closeFileWatcherOf
  - codefix
  - collectExternalModuleInfo
  - combine
  - combinePaths
  - commandLineOptionOfCustomType
  - commentPragmas
  - commonOptionsWithBuild
  - compact
  - compareBooleans
  - compareDataObjects
  - compareDiagnostics
  - compareEmitHelpers
  - compareNumberOfDirectorySeparators
  - comparePaths
  - comparePathsCaseInsensitive
  - comparePathsCaseSensitive
  - comparePatternKeys
  - compareProperties
  - compareStringsCaseInsensitive
  - compareStringsCaseInsensitiveEslintCompatible
  - compareStringsCaseSensitive
  - compareStringsCaseSensitiveUI
  - compareTextSpans
  - compareValues
  - compilerOptionsAffectDeclarationPath
  - compilerOptionsAffectEmit
  - compilerOptionsAffectSemanticDiagnostics
  - compilerOptionsDidYouMeanDiagnostics
  - compilerOptionsIndicateEsModules
  - computeCommonSourceDirectoryOfFilenames
  - computeLineAndCharacterOfPosition
  - computeLineOfPosition
  - computeLineStarts
  - computePositionOfLineAndCharacter
  - computeSignatureWithDiagnostics
  - computeSuggestionDiagnostics
  - computedOptions
  - concatenate
  - concatenateDiagnosticMessageChains
  - consumesNodeCoreModules
  - contains
  - containsIgnoredPath
  - containsObjectRestOrSpread
  - containsParseError
  - containsPath
  - convertCompilerOptionsForTelemetry
  - convertJsonOption
  - convertToBase64
  - convertToJson
  - convertToOptionsWithAbsolutePaths
  - convertToRelativePath
  - convertToTSConfig
  - copyComments
  - copyEntries
  - copyLeadingComments
  - copyProperties
  - copyTrailingAsLeadingComments
  - copyTrailingComments
  - countWhere
  - createAccessorPropertyBackingField
  - createAccessorPropertyGetRedirector
  - createAccessorPropertySetRedirector
  - createBaseNodeFactory
  - createBinaryExpressionTrampoline
  - createBuilderProgram
  - createBuilderProgramUsingIncrementalBuildInfo
  - createCacheableExportInfoMap
  - createCachedDirectoryStructureHost
  - createCommentDirectivesMap
  - createCompilerDiagnostic
  - createCompilerDiagnosticForInvalidCustomType
  - createCompilerDiagnosticFromMessageChain
  - createCompilerHostFromProgramHost
  - createCompilerHostWorker
  - createDetachedDiagnostic
  - createDiagnosticCollection
  - createDiagnosticForFileFromMessageChain
  - createDiagnosticForNode
  - createDiagnosticForNodeArray
  - createDiagnosticForNodeArrayFromMessageChain
  - createDiagnosticForNodeFromMessageChain
  - createDiagnosticForNodeInSourceFile
  - createDiagnosticForRange
  - createDiagnosticMessageChainFromDiagnostic
  - createDiagnosticReporter
  - createDocumentPositionMapper
  - createDocumentRegistryInternal
  - createEmitHelperFactory
  - createEmptyExports
  - createEvaluator
  - createExpressionForJsxElement
  - createExpressionForJsxFragment
  - createExpressionForObjectLiteralElementLike
  - createExpressionForPropertyName
  - createExpressionFromEntityName
  - createExternalHelpersImportDeclarationIfNeeded
  - createFileDiagnostic
  - createFileDiagnosticFromMessageChain
  - createFlowNode
  - createForOfBindingStatement
  - createFutureSourceFile
  - createGetCanonicalFileName
  - createGetIsolatedDeclarationErrors
  - createGetSourceFile
  - createGetSymbolAccessibilityDiagnosticForNode
  - createGetSymbolAccessibilityDiagnosticForNodeName
  - createGetSymbolWalker
  - createJsxFactoryExpression
  - createMemberAccessForPropertyName
  - createModeAwareCache
  - createModeAwareCacheKey
  - createModeMismatchDetails
  - createModuleNotFoundChain
  - createModuleResolutionLoader
  - createModuleResolutionLoaderUsingGlobalCache
  - createModuleSpecifierResolutionHost
  - createMultiMap
  - createNameResolver
  - createNodeConverters
  - createNodeFactory
  - createOptionNameMap
  - createOverload
  - createPackageJsonImportFilter
  - createPackageJsonInfo
  - createParenthesizerRules
  - createPatternMatcher
  - createPrinterWithDefaults
  - createPrinterWithRemoveComments
  - createPrinterWithRemoveCommentsNeverAsciiEscape
  - createPrinterWithRemoveCommentsOmitTrailingSemicolon
  - createProgramDiagnostics
  - createProgramHost
  - createPropertyNameNodeForIdentifierOrLiteral
  - createQueue
  - createRange
  - createRedirectedBuilderProgram
  - createResolutionCache
  - createRuntimeTypeSerializer
  - createSet
  - createSortedArray
  - createSourceMapGenerator
  - createSuperAccessVariableStatement
  - createSymbolTable
  - createSymlinkCache
  - createSyntacticTypeNodeBuilder
  - createSystemWatchFunctions
  - createTextChange
  - createTextChangeFromStartLength
  - createTextRangeFromNode
  - createTextRangeFromSpan
  - createTextSpanFromNode
  - createTextSpanFromRange
  - createTextSpanFromStringLiteralLikeContent
  - createTextWriter
  - createTokenRange
  - createTypeChecker
  - createTypeReferenceResolutionLoader
  - createWatchCompilerHostOfConfigFile
  - createWatchCompilerHostOfFilesAndCompilerOptions
  - createWatchFactory
  - createWatchHost
  - createWatchStatusReporter
  - createWriteFileMeasuringIO
  - declarationNameToString
  - decodeMappings
  - deduplicate
  - defaultHoverMaximumTruncationLength
  - defaultInitCompilerOptions
  - defaultMaximumTruncationLength
  - diagnosticCategoryName
  - diagnosticToString
  - diagnosticsEqualityComparer
  - directoryProbablyExists
  - directorySeparator
  - displayPart
  - documentSpansEqual
  - dumpTracingLegend
  - elementAt
  - elideNodes
  - emitDetachedComments
  - emitFiles
  - emitFilesAndReportErrors
  - emitFilesAndReportErrorsAndGetExitStatus
  - emitModuleKindIsNonNodeESM
  - emitNewLineBeforeLeadingCommentOfPosition
  - emitResolverSkipsTypeChecking
  - emitSkippedWithNoDiagnostics
  - emptyArray
  - emptyFileSystemEntries
  - emptyMap
  - emptyOptions
  - endsWith
  - ensurePathIsNonModuleName
  - ensureScriptKind
  - ensureTrailingDirectorySeparator
  - entityNameToString
  - enumerateInsertsAndDeletes
  - equalOwnProperties
  - equateStringsCaseInsensitive
  - equateStringsCaseSensitive
  - equateValues
  - escapeJsxAttributeString
  - escapeNonAsciiString
  - escapeSnippetText
  - escapeString
  - escapeTemplateSubstitution
  - evaluatorResult
  - every
  - exclusivelyPrefixedNodeCoreModules
  - executeCommandLine
  - expandPreOrPostfixIncrementOrDecrementExpression
  - explainFiles
  - explainIfFileIsRedirectAndImpliedFormat
  - exportAssignmentIsAlias
  - expressionResultIsUnused
  - extend
  - extensionFromPath
  - extensionIsTS
  - extensionsNotSupportingExtensionlessResolution
  - externalHelpersModuleNameText
  - fileExtensionIs
  - fileExtensionIsOneOf
  - fileIncludeReasonToDiagnostics
  - fileShouldUseJavaScriptRequire
  - filter
  - filterMutate
  - filterSemanticDiagnostics
  - find
  - findBestPatternMatch
  - findChildOfKind
  - findComputedPropertyNameCacheAssignment
  - findConstructorDeclaration
  - findContainingList
  - findDiagnosticForNode
  - findFirstNonJsxWhitespaceToken
  - findIndex
  - findLast
  - findLastIndex
  - findListItemInfo
  - findModifier
  - findNextToken
  - findPackageJson
  - findPackageJsons
  - findPrecedingMatchingToken
  - findPrecedingToken
  - findSuperStatementIndexPath
  - findTokenOnLeftOfPosition
  - findUseStrictPrologue
  - first
  - firstDefined
  - firstDefinedIterator
  - firstIterator
  - firstOrOnly
  - firstOrUndefined
  - firstOrUndefinedIterator
  - fixupCompilerOptions
  - flatMap
  - flatMapIterator
  - flatMapToMutable
  - flatten
  - flattenCommaList
  - flattenDestructuringAssignment
  - flattenDestructuringBinding
  - forEach
  - forEachAncestor
  - forEachAncestorDirectory
  - forEachAncestorDirectoryStoppingAtGlobalCache
  - forEachChildRecursively
  - forEachDynamicImportOrRequireCall
  - forEachEmittedFile
  - forEachEnclosingBlockScopeContainer
  - forEachEntry
  - forEachExternalModuleToImportFrom
  - forEachImportClauseDeclaration
  - forEachKey
  - forEachNameInAccessChainWalkingLeft
  - forEachNameOfDefaultExport
  - forEachOptionsSyntaxByName
  - forEachProjectReference
  - forEachPropertyAssignment
  - forEachResolvedProjectReference
  - forEachReturnStatement
  - forEachRight
  - forEachTsConfigPropArray
  - forEachUnique
  - forEachYieldExpression
  - formatColorAndReset
  - formatGeneratedName
  - formatGeneratedNamePart
  - formatLocation
  - formatMessage
  - formatStringFromArgs
  - formatting
  - generateDjb2Hash
  - generateTSConfig
  - getAdjustedReferenceLocation
  - getAdjustedRenameLocation
  - getAliasDeclarationFromName
  - getAllAccessorDeclarations
  - getAllDecoratorsOfClass
  - getAllDecoratorsOfClassElement
  - getAllKeys
  - getAllProjectOutputs
  - getAllSuperTypeNodes
  - getAllowImportingTsExtensions
  - getAllowJSCompilerOption
  - getAllowSyntheticDefaultImports
  - getAncestor
  - getAnyExtensionFromPath
  - getAreDeclarationMapsEnabled
  - getAssignedExpandoInitializer
  - getAssignedName
  - getAssignmentDeclarationKind
  - getAssignmentDeclarationPropertyAccessKind
  - getAssignmentTargetKind
  - getBaseFileName
  - getBinaryOperatorPrecedence
  - getBuildInfo
  - getBuildInfoFileVersionMap
  - getBuildInfoText
  - getBuildOrderFromAnyBuildOrder
  - getBuilderCreationParameters
  - getBuilderFileEmit
  - getCanonicalDiagnostic
  - getCheckFlags
  - getClassExtendsHeritageElement
  - getClassLikeDeclarationOfSymbol
  - getCombinedLocalAndExportSymbolFlags
  - getCombinedNodeFlagsAlwaysIncludeJSDoc
  - getCommonSourceDirectory
  - getCommonSourceDirectoryOfConfig
  - getCompilerOptionValue
  - getConditions
  - getContainerFlags
  - getContainerNode
  - getContainingClass
  - getContainingClassExcludingClassDecorators
  - getContainingClassStaticBlock
  - getContainingFunction
  - getContainingFunctionDeclaration
  - getContainingFunctionOrClassStaticBlock
  - getContainingNodeArray
  - getContainingObjectLiteralElement
  - getContextualTypeFromParent
  - getContextualTypeFromParentOrAncestorTypeNode
  - getDeclarationDiagnostics
  - getDeclarationEmitExtensionForPath
  - getDeclarationEmitOutputFilePath
  - getDeclarationEmitOutputFilePathWorker
  - getDeclarationFileExtension
  - getDeclarationFromName
  - getDeclarationModifierFlagsFromSymbol
  - getDeclarationOfKind
  - getDeclarationsOfKind
  - getDeclaredExpandoInitializer
  - getDefaultLikeExportInfo
  - getDefaultLikeExportNameFromDeclaration
  - getDefaultResolutionModeForFileWorker
  - getDiagnosticText
  - getDiagnosticsWithinSpan
  - getDirectoryPath
  - getDirectoryToWatchFailedLookupLocation
  - getDirectoryToWatchFailedLookupLocationFromTypeRoot
  - getDocumentPositionMapper
  - getDocumentSpansEqualityComparer
  - getESModuleInterop
  - getEditsForFileRename
  - getEffectiveBaseTypeNode
  - getEffectiveContainerForJSDocTemplateTag
  - getEffectiveImplementsTypeNodes
  - getEffectiveInitializer
  - getEffectiveJSDocHost
  - getEffectiveModifierFlags
  - getEffectiveModifierFlagsAlwaysIncludeJSDoc
  - getEffectiveModifierFlagsNoCache
  - getEffectiveReturnTypeNode
  - getEffectiveSetAccessorTypeAnnotationNode
  - getEffectiveTypeAnnotationNode
  - getElementOrPropertyAccessArgumentExpressionOrName
  - getElementOrPropertyAccessName
  - getElementsOfBindingOrAssignmentPattern
  - getEmitDeclarations
  - getEmitFlags
  - getEmitModuleDetectionKind
  - getEmitModuleFormatOfFileWorker
  - getEmitModuleKind
  - getEmitModuleResolutionKind
  - getEmitScriptTarget
  - getEmitStandardClassFields
  - getEnclosingBlockScopeContainer
  - getEnclosingContainer
  - getEncodedSemanticClassifications
  - getEncodedSyntacticClassifications
  - getEndLinePosition
  - getEntityNameFromTypeNode
  - getEntrypointsFromPackageJsonInfo
  - getErrorCountForSummary
  - getErrorSpanForNode
  - getErrorSummaryText
  - getEscapedTextOfIdentifierOrLiteral
  - getEscapedTextOfJsxAttributeName
  - getEscapedTextOfJsxNamespacedName
  - getExpandoInitializer
  - getExportAssignmentExpression
  - getExportInfoMap
  - getExportNeedsImportStarHelper
  - getExpressionAssociativity
  - getExpressionPrecedence
  - getExternalHelpersModuleName
  - getExternalModuleImportEqualsDeclarationExpression
  - getExternalModuleName
  - getExternalModuleNameFromDeclaration
  - getExternalModuleNameFromPath
  - getExternalModuleNameLiteral
  - getExternalModuleRequireArgument
  - getFallbackOptions
  - getFileEmitOutput
  - getFileMatcherPatterns
  - getFileNamesFromConfigSpecs
  - getFileWatcherEventKind
  - getFilesInErrorForSummary
  - getFirstConstructorWithBody
  - getFirstIdentifier
  - getFirstNonSpaceCharacterPosition
  - getFirstProjectOutput
  - getFixableErrorSpanExpression
  - getFormatCodeSettingsForWriting
  - getFullWidth
  - getFunctionFlags
  - getHeritageClause
  - getHostSignatureFromJSDoc
  - getIdentifierAutoGenerate
  - getIdentifierGeneratedImportReference
  - getIdentifierTypeArguments
  - getImmediatelyInvokedFunctionExpression
  - getImpliedNodeFormatForEmitWorker
  - getImpliedNodeFormatForFileWorker
  - getImportNeedsImportDefaultHelper
  - getImportNeedsImportStarHelper
  - getIndentString
  - getInferredLibraryNameResolveFrom
  - getInitializedVariables
  - getInitializerOfBinaryExpression
  - getInitializerOfBindingOrAssignmentElement
  - getInterfaceBaseTypeNodes
  - getInternalEmitFlags
  - getInvokedExpression
  - getIsFileExcluded
  - getIsolatedModules
  - getJSDocCommentRanges
  - getJSDocDeprecatedTagNoCache
  - getJSDocHost
  - getJSDocOverloadTags
  - getJSDocParameterTagsNoCache
  - getJSDocPrivateTagNoCache
  - getJSDocProtectedTagNoCache
  - getJSDocPublicTagNoCache
  - getJSDocReadonlyTagNoCache
  - getJSDocRoot
  - getJSDocSatisfiesExpressionType
  - getJSDocTypeAliasName
  - getJSDocTypeAssertionType
  - getJSDocTypeParameterDeclarations
  - getJSDocTypeParameterTagsNoCache
  - getJSXImplicitImportBase
  - getJSXRuntimeImport
  - getJSXTransformEnabled
  - getKeyForCompilerOptions
  - getLanguageVariant
  - getLastChild
  - getLeadingCommentRangesOfNode
  - getLeftmostAccessExpression
  - getLeftmostExpression
  - getLibFileNameFromLibReference
  - getLibNameFromLibReference
  - getLibraryNameFromLibFileName
  - getLineInfo
  - getLineOfLocalPosition
  - getLineStartPositionForPosition
  - getLineStarts
  - getLinesBetweenPositionAndNextNonWhitespaceCharacter
  - getLinesBetweenPositionAndPrecedingNonWhitespaceCharacter
  - getLinesBetweenPositions
  - getLinesBetweenRangeEndAndRangeStart
  - getLinesBetweenRangeEndPositions
  - getLiteralText
  - getLocalNameForExternalImport
  - getLocalSymbolForExportDefault
  - getLocaleSpecificMessage
  - getLocaleTimeString
  - getMappedContextSpan
  - getMappedDocumentSpan
  - getMappedLocation
  - getMatchedFileSpec
  - getMatchedIncludeSpec
  - getMeaningFromDeclaration
  - getMeaningFromLocation
  - getMembersOfDeclaration
  - getModifiedTime
  - getModuleInstanceState
  - getModuleNameStringLiteralAt
  - getModuleSpecifierEndingPreference
  - getModuleSpecifierResolverHost
  - getNameForExportedSymbol
  - getNameFromImportAttribute
  - getNameFromIndexInfo
  - getNameFromPropertyName
  - getNameOfAccessExpression
  - getNameOfCompilerOptionValue
  - getNameOfExpando
  - getNameOfScriptTarget
  - getNameOrArgument
  - getNameTable
  - getNamespaceDeclarationNode
  - getNewLineCharacter
  - getNewLineKind
  - getNewLineOrDefaultFromHost
  - getNewTargetContainer
  - getNextJSDocCommentLocation
  - getNodeChildren
  - getNodeForGeneratedName
  - getNodeId
  - getNodeKind
  - getNodeModifiers
  - getNodeModulePathParts
  - getNonAssignedNameOfDeclaration
  - getNonAssignmentOperatorForCompoundAssignment
  - getNonAugmentationDeclaration
  - getNonDecoratorTokenPosOfNode
  - getNonIncrementalBuildInfoRoots
  - getNonModifierTokenPosOfNode
  - getNormalizedAbsolutePath
  - getNormalizedAbsolutePathWithoutRoot
  - getNormalizedPathComponents
  - getObjectFlags
  - getOperatorAssociativity
  - getOperatorPrecedence
  - getOptionFromName
  - getOptionsForLibraryResolution
  - getOptionsNameMap
  - getOptionsSyntaxByArrayElementValue
  - getOptionsSyntaxByValue
  - getOrCreateEmitNode
  - getOrUpdate
  - getOriginalNodeId
  - getOutputDeclarationFileName
  - getOutputDeclarationFileNameWorker
  - getOutputExtension
  - getOutputJSFileNameWorker
  - getOutputPathsFor
  - getOwnEmitOutputFilePath
  - getOwnKeys
  - getOwnValues
  - getPackageJsonTypesVersionsPaths
  - getPackageNameFromTypesPackageName
  - getPackageScopeForPath
  - getParameterSymbolFromJSDoc
  - getParentNodeInSpan
  - getPathComponents
  - getPathFromPathComponents
  - getPathUpdater
  - getPathsBasePath
  - getPatternFromSpec
  - getPendingEmitKindWithSeen
  - getPossibleGenericSignatures
  - getPossibleOriginalInputExtensionForExtension
  - getPossibleOriginalInputPathWithoutChangingExt
  - getPossibleTypeArgumentsInfo
  - getPrecedingNonSpaceCharacterPosition
  - getPrivateIdentifier
  - getProperties
  - getProperty
  - getPropertyAssignmentAliasLikeExpression
  - getPropertyNameForPropertyNameNode
  - getPropertyNameFromType
  - getPropertyNameOfBindingOrAssignmentElement
  - getPropertySymbolFromBindingElement
  - getPropertySymbolsFromContextualType
  - getQuoteFromPreference
  - getQuotePreference
  - getRangesWhere
  - getRefactorContextSpan
  - getReferencedFileLocation
  - getRegexFromPattern
  - getRegularExpressionForWildcard
  - getRegularExpressionsForWildcards
  - getRelativePathFromDirectory
  - getRelativePathFromFile
  - getRelativePathToDirectoryOrUrl
  - getRenameLocation
  - getReplacementSpanForContextToken
  - getResolutionDiagnostic
  - getResolutionModeOverride
  - getResolveJsonModule
  - getResolvePackageJsonExports
  - getResolvePackageJsonImports
  - getResolvedExternalModuleName
  - getResolvedModuleFromResolution
  - getResolvedTypeReferenceDirectiveFromResolution
  - getRestIndicatorOfBindingOrAssignmentElement
  - getRestParameterElementType
  - getRightMostAssignedExpression
  - getRootDeclaration
  - getRootDirectoryOfResolutionCache
  - getRootLength
  - getScriptKind
  - getScriptKindFromFileName
  - getScriptTargetFeatures
  - getSelectedEffectiveModifierFlags
  - getSelectedSyntacticModifierFlags
  - getSemanticClassifications
  - getSemanticJsxChildren
  - getSetAccessorTypeAnnotationNode
  - getSetAccessorValueParameter
  - getSetExternalModuleIndicator
  - getSingleVariableOfVariableStatement
  - getSnapshotText
  - getSnippetElement
  - getSourceFileOfModule
  - getSourceFileOfNode
  - getSourceFilePathInNewDir
  - getSourceFileVersionAsHashFromText
  - getSourceFilesToEmit
  - getSourceMapper
  - getSourceTextOfNodeFromSourceFile
  - getSpanOfTokenAtPosition
  - getSpellingSuggestion
  - getStartPositionOfLine
  - getStartPositionOfRange
  - getStartsOnNewLine
  - getStaticPropertiesAndClassStaticBlock
  - getStrictOptionValue
  - getStringComparer
  - getSubPatternFromSpec
  - getSuperCallFromStatement
  - getSuperContainer
  - getSupportedExtensions
  - getSupportedExtensionsWithJsonIfResolveJsonModule
  - getSwitchedType
  - getSymbolId
  - getSymbolNameForPrivateIdentifier
  - getSymbolTarget
  - getSyntacticClassifications
  - getSyntacticModifierFlags
  - getSyntacticModifierFlagsNoCache
  - getSynthesizedDeepClone
  - getSynthesizedDeepCloneWithReplacements
  - getSynthesizedDeepClones
  - getSynthesizedDeepClonesWithReplacements
  - getTargetLabel
  - getTargetOfBindingOrAssignmentElement
  - getTemporaryModuleResolutionState
  - getTextOfConstantValue
  - getTextOfIdentifierOrLiteral
  - getTextOfJsxAttributeName
  - getTextOfJsxNamespacedName
  - getTextOfNode
  - getTextOfNodeFromSourceText
  - getTextOfPropertyName
  - getThisContainer
  - getThisParameter
  - getTokenAtPosition
  - getTokenPosOfNode
  - getTouchingPropertyName
  - getTouchingToken
  - getTrailingSemicolonDeferringWriter
  - getTransformers
  - getTsConfigObjectLiteralExpression
  - getTsConfigPropArrayElementValue
  - getTypeAnnotationNode
  - getTypeArgumentOrTypeParameterList
  - getTypeKeywordOfTypeOnlyImport
  - getTypeNode
  - getTypeNodeIfAccessible
  - getTypeParameterFromJsDoc
  - getTypesPackageName
  - getUILocale
  - getUniqueName
  - getUniqueSymbolId
  - getUseDefineForClassFields
  - getWatchErrorSummaryDiagnosticMessage
  - getWatchFactory
  - group
  - groupBy
  - guessIndentation
  - handleNoEmitOptions
  - handleWatchOptionsConfigDirTemplateSubstitution
  - hasAbstractModifier
  - hasAccessorModifier
  - hasAmbientModifier
  - hasChangesInResolutions
  - hasContextSensitiveParameters
  - hasDecorators
  - hasDocComment
  - hasDynamicName
  - hasEffectiveModifier
  - hasEffectiveModifiers
  - hasEffectiveReadonlyModifier
  - hasExtension
  - hasImplementationTSFileExtension
  - hasIndexSignature
  - hasInferredType
  - hasInitializer
  - hasInvalidEscape
  - hasJSDocNodes
  - hasJSFileExtension
  - hasJsonModuleEmitEnabled
  - hasOverrideModifier
  - hasPossibleExternalModuleReference
  - hasProperty
  - hasPropertyAccessExpressionWithName
  - hasQuestionToken
  - hasRecordedExternalHelpers
  - hasResolutionModeOverride
  - hasScopeMarker
  - hasStaticModifier
  - hasSyntacticModifier
  - hasSyntacticModifiers
  - hasTSFileExtension
  - hasTabstop
  - hasTrailingDirectorySeparator
  - hasType
  - hasTypeArguments
  - hasZeroOrOneAsteriskCharacter
  - hostGetCanonicalFileName
  - hostUsesCaseSensitiveFileNames
  - identifierIsThisKeyword
  - identity
  - identitySourceMapConsumer
  - ignoreSourceNewlines
  - ignoredPaths
  - importFromModuleSpecifier
  - importSyntaxAffectsModuleResolution
  - indexOfAnyCharCode
  - indexOfNode
  - indicesOf
  - inferredTypesContainingFile
  - injectClassNamedEvaluationHelperBlockIfMissing
  - injectClassThisAssignmentIfMissing
  - insertImports
  - insertSorted
  - insertStatementAfterCustomPrologue
  - insertStatementAfterStandardPrologue
  - insertStatementsAfterCustomPrologue
  - insertStatementsAfterStandardPrologue
  - intersperse
  - intrinsicTagNameToString
  - introducesArgumentsExoticObject
  - inverseJsxOptionMap
  - isAbstractConstructorSymbol
  - isAbstractModifier
  - isAccessExpression
  - isAccessibilityModifier
  - isAccessorModifier
  - isAliasableExpression
  - isAmbientModule
  - isAmbientPropertyDeclaration
  - isAnyDirectorySeparator
  - isAnyImportOrBareOrAccessedRequire
  - isAnyImportOrReExport
  - isAnyImportOrRequireStatement
  - isAnyImportSyntax
  - isAnySupportedFileExtension
  - isApplicableVersionedTypesKey
  - isArgumentExpressionOfElementAccess
  - isArray
  - isArrayBindingOrAssignmentElement
  - isArrayBindingOrAssignmentPattern
  - isArrayLiteralOrObjectLiteralDestructuringPattern
  - isAssignmentDeclaration
  - isAssignmentExpression
  - isAssignmentOperator
  - isAssignmentPattern
  - isAssignmentTarget
  - isAsyncFunction
  - isAsyncModifier
  - isBinaryLogicalOperator
  - isBindableObjectDefinePropertyCall
  - isBindableStaticAccessExpression
  - isBindableStaticElementAccessExpression
  - isBindableStaticNameExpression
  - isBindingElementOfBareOrAccessedRequire
  - isBindingOrAssignmentElement
  - isBindingOrAssignmentPattern
  - isBindingPattern
  - isBlockLike
  - isBlockOrCatchScoped
  - isBlockScope
  - isBlockScopedContainerTopLevel
  - isBooleanLiteral
  - isBuildInfoFile
  - isBuilderProgram
  - isCallExpressionTarget
  - isCallLikeOrFunctionLikeExpression
  - isCallOrNewExpressionTarget
  - isCallToHelper
  - isCaseKeyword
  - isCatchClauseVariableDeclaration
  - isCatchClauseVariableDeclarationOrBindingElement
  - isCheckJsEnabledForFile
  - isCircularBuildOrder
  - isClassInstanceProperty
  - isClassMemberModifier
  - isClassNamedEvaluationHelperBlock
  - isClassThisAssignmentBlock
  - isCommaExpression
  - isCommaSequence
  - isCommaToken
  - isComment
  - isCommonJsExportPropertyAssignment
  - isCommonJsExportedExpression
  - isCompoundAssignment
  - isComputedNonLiteralName
  - isConstAssertion
  - isContextualKeyword
  - isCustomPrologue
  - isDeclaration
  - isDeclarationBindingElement
  - isDeclarationFileName
  - isDeclarationName
  - isDeclarationNameOfEnumOrNamespace
  - isDeclarationReadonly
  - isDeclarationWithTypeParameterChildren
  - isDeclarationWithTypeParameters
  - isDecoratorTarget
  - isDefaultImport
  - isDefaultModifier
  - isDefaultedExpandoInitializer
  - isDeleteTarget
  - isDeprecatedDeclaration
  - isDestructuringAssignment
  - isDiskPathRoot
  - isDocumentRegistryEntry
  - isDottedName
  - isDynamicName
  - isEffectiveExternalModule
  - isEffectiveStrictModeSourceFile
  - isEmittedFileOfProgram
  - isEmptyArrayLiteral
  - isEmptyObjectLiteral
  - isEmptyStringLiteral
  - isEntityNameExpression
  - isEnumConst
  - isEqualityOperatorKind
  - isExcludedFile
  - isExclusivelyTypeOnlyImportOrExport
  - isExpandoPropertyDeclaration
  - isExportModifier
  - isExportName
  - isExportNamespaceAsDefaultDeclaration
  - isExportOrDefaultModifier
  - isExportsIdentifier
  - isExportsOrModuleExportsOrAlias
  - isExpressionNode
  - isExpressionOfExternalModuleImportEqualsDeclaration
  - isExpressionOfOptionalChainRoot
  - isExpressionWithTypeArgumentsInClassExtendsClause
  - isExternalModuleAugmentation
  - isExternalModuleImportEqualsDeclaration
  - isExternalModuleIndicator
  - isExternalModuleSymbol
  - isExternalOrCommonJsModule
  - isFileLevelReservedGeneratedIdentifier
  - isFileLevelUniqueName
  - isFileProbablyExternalModule
  - isFirstDeclarationOfSymbolParameter
  - isFixablePromiseHandler
  - isForInOrOfStatement
  - isFullSourceFile
  - isFunctionBlock
  - isFunctionBody
  - isFunctionExpressionOrArrowFunction
  - isFunctionLikeDeclaration
  - isFunctionLikeKind
  - isFunctionLikeOrClassStaticBlockDeclaration
  - isFunctionOrModuleBlock
  - isFunctionSymbol
  - isGeneratedIdentifier
  - isGeneratedPrivateIdentifier
  - isGetOrSetAccessorDeclaration
  - isGlobalScopeAugmentation
  - isGlobalSourceFile
  - isGrammarError
  - isHoistedFunction
  - isHoistedVariableStatement
  - isIdentifierANonContextualKeyword
  - isIdentifierName
  - isIdentifierText
  - isIdentifierTypePredicate
  - isIdentifierTypeReference
  - isIgnoredFileFromWildCardWatching
  - isImplicitGlob
  - isImportCall
  - isImportKeyword
  - isImportMeta
  - isImportOrExportSpecifierName
  - isImportable
  - isInComment
  - isInCompoundLikeAssignment
  - isInExpressionContext
  - isInJSDoc
  - isInJSFile
  - isInJSXText
  - isInJsonFile
  - isInNonReferenceComment
  - isInReferenceComment
  - isInRightSideOfInternalImportEqualsDeclaration
  - isInString
  - isInTemplateString
  - isInTopLevelContext
  - isInTypeQuery
  - isIncrementalBuildInfo
  - isIncrementalBundleEmitBuildInfo
  - isIncrementalCompilation
  - isInfinityOrNaNString
  - isInitializedProperty
  - isInitializedVariable
  - isInsideJsxElement
  - isInsideJsxElementOrAttribute
  - isInsideNodeModules
  - isInsideTemplateLiteral
  - isInstanceOfExpression
  - isInstantiatedModule
  - isInternalModuleImportEqualsDeclaration
  - isInternalName
  - isIntrinsicJsxName
  - isJSDocConstructSignature
  - isJSDocIndexSignature
  - isJSDocLikeText
  - isJSDocNamespaceBody
  - isJSDocNode
  - isJSDocOptionalParameter
  - isJSDocSatisfiesExpression
  - isJSDocTag
  - isJSDocTypeAlias
  - isJSDocTypeAssertion
  - isJSXTagName
  - isJsonEqual
  - isJsonSourceFile
  - isJsxAttributeName
  - isJsxOpeningLikeElementTagName
  - isJumpStatementTarget
  - isKeyword
  - isKeywordOrPunctuation
  - isKnownSymbol
  - isLabelName
  - isLabelOfLabeledStatement
  - isLateVisibilityPaintedStatement
  - isLet
  - isLiteralComputedPropertyDeclarationName
  - isLiteralExpressionOfObject
  - isLiteralImportTypeNode
  - isLiteralKind
  - isLiteralNameOfPropertyDeclarationOrIndexAccess
  - isLocalName
  - isLogicalOperator
  - isLogicalOrCoalescingAssignmentExpression
  - isLogicalOrCoalescingAssignmentOperator
  - isLogicalOrCoalescingBinaryExpression
  - isLogicalOrCoalescingBinaryOperator
  - isMethodOrAccessor
  - isMissingPackageJsonInfo
  - isModifierKind
  - isModuleAugmentationExternal
  - isModuleExportsAccessExpression
  - isModuleIdentifier
  - isModuleOrEnumDeclaration
  - isModuleSpecifierLike
  - isModuleWithStringLiteralName
  - isNameOfFunctionDeclaration
  - isNameOfModuleDeclaration
  - isNamedDeclaration
  - isNamedEvaluation
  - isNamedEvaluationSource
  - isNamedImportsOrExports
  - isNamespaceBody
  - isNamespaceReexportDeclaration
  - isNewExpressionTarget
  - isNewScopeNode
  - isNodeArray
  - isNodeArrayMultiLine
  - isNodeDescendantOf
  - isNodeKind
  - isNodeLikeSystem
  - isNodeModulesDirectory
  - isNodeWithPossibleHoistedDeclaration
  - isNonContextualKeyword
  - isNonGlobalAmbientModule
  - isNonNullAccess
  - isNonStaticMethodOrAccessorWithPrivateName
  - isNumber
  - isNumericLiteralName
  - isObjectBindingElementWithoutPropertyName
  - isObjectBindingOrAssignmentElement
  - isObjectBindingOrAssignmentPattern
  - isObjectLiteralMethod
  - isObjectLiteralOrClassExpressionMethodOrAccessor
  - isObjectTypeDeclaration
  - isOptionalChainRoot
  - isOptionalDeclaration
  - isOptionalJSDocPropertyLikeTag
  - isOuterExpression
  - isOutermostOptionalChain
  - isOverrideModifier
  - isPackageJsonInfo
  - isPackedArrayLiteral
  - isParameterPropertyModifier
  - isPartOfParameterDeclaration
  - isPartOfTypeQuery
  - isPatternMatch
  - isPinnedComment
  - isPlainJsFile
  - isPossiblyTypeArgumentPosition
  - isPrimitiveLiteralValue
  - isPrivateIdentifierClassElementDeclaration
  - isPrivateIdentifierPropertyAccessExpression
  - isPrivateIdentifierSymbol
  - isProgramUptoDate
  - isPrologueDirective
  - isPropertyAccessEntityNameExpression
  - isPropertyAccessOrQualifiedNameOrImportTypeNode
  - isPropertyNameLiteral
  - isPrototypeAccess
  - isPrototypePropertyAssignment
  - isPunctuation
  - isPushOrUnshiftIdentifier
  - isReadonlyKeyword
  - isRecognizedTripleSlashComment
  - isReferenceFileLocation
  - isReferencedFile
  - isRequireCall
  - isRequireVariableStatement
  - isReturnStatementWithFixablePromiseHandler
  - isRightSideOfAccessExpression
  - isRightSideOfInstanceofExpression
  - isRightSideOfPropertyAccess
  - isRightSideOfQualifiedName
  - isRightSideOfQualifiedNameOrPropertyAccess
  - isRightSideOfQualifiedNameOrPropertyAccessOrJSDocMemberName
  - isRootedDiskPath
  - isSameEntityName
  - isShiftOperatorOrHigher
  - isShorthandAmbientModuleSymbol
  - isSideEffectImport
  - isSignedNumericLiteral
  - isSimpleCopiableExpression
  - isSimpleInlineableExpression
  - isSimpleParameterList
  - isSingleOrDoubleQuote
  - isSolutionConfig
  - isSourceElement
  - isSourceFileFromLibrary
  - isSourceFileJS
  - isSourceFileNotJson
  - isSourceMapping
  - isSpecialPropertyDeclaration
  - isStatementButNotDeclaration
  - isStatementOrBlock
  - isStatementWithLocals
  - isStatic
  - isStaticModifier
  - isString
  - isStringANonContextualKeyword
  - isStringAndEmptyAnonymousObjectIntersection
  - isStringDoubleQuoted
  - isStringLiteralOrTemplate
  - isStringOrNumericLiteralLike
  - isStringOrRegularExpressionOrTemplateLiteral
  - isSuperCall
  - isSuperKeyword
  - isSuperProperty
  - isSupportedSourceFileName
  - isSyntaxList
  - isSyntheticReference
  - isTagName
  - isTaggedTemplateTag
  - isTemplateLiteralKind
  - isTextWhiteSpaceLike
  - isThis
  - isThisContainerOrFunctionBlock
  - isThisIdentifier
  - isThisInTypeQuery
  - isThisInitializedDeclaration
  - isThisInitializedObjectBindingExpression
  - isThisProperty
  - isThisTypeParameter
  - isThisTypePredicate
  - isTraceEnabled
  - isTransientSymbol
  - isTrivia
  - isTypeAlias
  - isTypeDeclaration
  - isTypeKeyword
  - isTypeKeywordTokenOrIdentifier
  - isTypeNodeKind
  - isTypeReferenceType
  - isTypeUsableAsPropertyName
  - isUMDExportSymbol
  - isUnaryExpression
  - isUnaryExpressionWithWrite
  - isUnicodeIdentifierStart
  - isUrl
  - isValidBigIntString
  - isValidESSymbolDeclaration
  - isValidTypeOnlyAliasUseSite
  - isValueSignatureDeclaration
  - isVarAwaitUsing
  - isVarConst
  - isVarConstLike
  - isVarUsing
  - isVariableDeclarationInVariableStatement
  - isVariableDeclarationInitializedToBareOrAccessedRequire
  - isVariableDeclarationInitializedToRequire
  - isVariableLike
  - isWatchSet
  - isWriteAccess
  - isWriteOnlyAccess
  - jsxModeNeedsExplicitImport
  - keywordPart
  - last
  - lastOrUndefined
  - length
  - libMap
  - libs
  - lineBreakPart
  - loadModuleFromGlobalCache
  - loadWithModeAwareCache
  - makeIdentifierFromModuleName
  - makeImport
  - makeStringLiteral
  - mangleScopedPackageName
  - map
  - mapAllOrFail
  - mapDefined
  - mapDefinedIterator
  - mapEntries
  - mapIterator
  - mapOneOrMany
  - mapToDisplayParts
  - matchFiles
  - matchPatternOrExact
  - matchedText
  - matchesExclude
  - matchesExcludeWorker
  - maxBy
  - maybeBind
  - maybeSetLocalizedDiagnosticMessages
  - memoize
  - memoizeOne
  - min
  - minAndMax
  - missingFileModifiedTime
  - modifierToFlag
  - modifiersToFlags
  - moduleExportNameIsDefault
  - moduleExportNameTextEscaped
  - moduleExportNameTextUnescaped
  - moduleOptionDeclaration
  - moduleResolutionIsEqualTo
  - moduleResolutionNameAndModeGetter
  - moduleResolutionOptionDeclarations
  - moduleResolutionSupportsPackageJsonExportsAndImports
  - moduleResolutionUsesNodeModules
  - moduleSpecifierToValidIdentifier
  - moduleSpecifiers
  - moduleSupportsImportAttributes
  - moduleSymbolToValidIdentifier
  - moveRangeEnd
  - moveRangePastDecorators
  - moveRangePastModifiers
  - moveRangePos
  - mutateMap
  - mutateMapSkippingNewValues
  - needsParentheses
  - needsScopeMarker
  - newCaseClauseTracker
  - newPrivateEnvironment
  - noEmitNotification
  - noEmitSubstitution
  - noTransformers
  - noTruncationMaximumTruncationLength
  - nodeCanBeDecorated
  - nodeCoreModules
  - nodeHasName
  - nodeIsDecorated
  - nodeIsMissing
  - nodeIsPresent
  - nodeIsSynthesized
  - nodeModulesPathPart
  - nodeNextJsonConfigResolver
  - nodeOrChildIsDecorated
  - nodeOverlapsWithStartEnd
  - nodePosToString
  - nodeSeenTracker
  - nodeStartsNewLexicalEnvironment
  - noop
  - noopFileWatcher
  - normalizePath
  - normalizeSlashes
  - normalizeSpans
  - not
  - notImplemented
  - notImplementedResolver
  - nullNodeConverters
  - nullParenthesizerRules
  - nullTransformationContext
  - objectAllocator
  - operatorPart
  - optionDeclarations
  - optionMapToObject
  - optionsAffectingProgramStructure
  - optionsForBuild
  - optionsForWatch
  - optionsHaveChanges
  - or
  - orderedRemoveItem
  - orderedRemoveItemAt
  - packageIdToPackageName
  - packageIdToString
  - parameterIsThisKeyword
  - parameterNamePart
  - parseBaseNodeFactory
  - parseBigInt
  - parseCommandLineWorker
  - parseConfigFileWithSystem
  - parseConfigHostFromCompilerHostLike
  - parseCustomTypeOption
  - parseIsolatedJSDocComment
  - parseJSDocTypeExpressionForTests
  - parseListTypeOption
  - parseNodeFactory
  - parseNodeModuleFromPath
  - parsePackageName
  - parsePseudoBigInt
  - parseValidBigInt
  - pasteEdits
  - patchWriteFileEnsuringDirectory
  - pathContainsNodeModules
  - pathIsAbsolute
  - pathIsBareSpecifier
  - pathIsRelative
  - patternText
  - performIncrementalCompilation
  - performance
  - positionBelongsToNode
  - positionIsASICandidate
  - positionIsSynthesized
  - positionsAreOnSameLine
  - probablyUsesSemicolons
  - processCommentPragmas
  - processPragmasIntoFields
  - processTaggedTemplateExpression
  - programContainsEsModules
  - programContainsModules
  - projectReferenceIsEqualTo
  - propertyNamePart
  - pseudoBigIntToString
  - punctuationPart
  - pushIfUnique
  - quote
  - quotePreferenceFromString
  - rangeContainsPosition
  - rangeContainsPositionExclusive
  - rangeContainsRange
  - rangeContainsRangeExclusive
  - rangeContainsStartEnd
  - rangeEndIsOnSameLineAsRangeStart
  - rangeEndPositionsAreOnSameLine
  - rangeEquals
  - rangeIsOnSingleLine
  - rangeOfNode
  - rangeOfTypeParameters
  - rangeOverlapsWithStartEnd
  - rangeStartIsOnSameLineAsRangeEnd
  - rangeStartPositionsAreOnSameLine
  - readJson
  - readJsonOrUndefined
  - reduceLeft
  - reduceLeftIterator
  - reducePathComponents
  - refactor
  - regExpEscape
  - regularExpressionFlagToCharacterCode
  - relativeComplement
  - removeAllComments
  - removeExtension
  - removeFileExtension
  - removeIgnoredPath
  - removeMinAndVersionNumbers
  - removePrefix
  - removeSuffix
  - removeTrailingDirectorySeparator
  - repeatString
  - replaceElement
  - replaceFirstStar
  - resolutionExtensionIsTSOrJson
  - resolveConfigFileProjectName
  - resolveJSModule
  - resolveLibrary
  - resolvePackageNameToPackageJson
  - resolvePath
  - resolvingEmptyArray
  - returnFalse
  - returnNoopFileWatcher
  - returnTrue
  - returnUndefined
  - returnsPromise
  - rewriteModuleSpecifier
  - sameFlatMap
  - sameMap
  - sameMapping
  - scanTokenAtPosition
  - scanner
  - semanticDiagnosticsOptionDeclarations
  - serializeCompilerOptions
  - setConfigFileInOptions
  - setGetSourceFileAsHashVersioned
  - setIdentifierAutoGenerate
  - setIdentifierGeneratedImportReference
  - setIdentifierTypeArguments
  - setInternalEmitFlags
  - setLocalizedDiagnosticMessages
  - setNodeChildren
  - setNodeFlags
  - setObjectAllocator
  - setParent
  - setParentRecursive
  - setPrivateIdentifier
  - setSnippetElement
  - setStackTraceLimit
  - setStartsOnNewLine
  - setSys
  - setSysLog
  - setTextRangeEnd
  - setTextRangePos
  - setTextRangePosEnd
  - setTextRangePosWidth
  - setTypeNode
  - setUILocale
  - setValueDeclaration
  - shouldAllowImportingTsExtension
  - shouldPreserveConstEnums
  - shouldRewriteModuleSpecifier
  - shouldUseUriStyleNodeCoreModules
  - showModuleSpecifier
  - signatureHasRestParameter
  - signatureToDisplayParts
  - single
  - singleElementArray
  - singleIterator
  - singleOrMany
  - singleOrUndefined
  - skipAlias
  - skipConstraint
  - skipOuterExpressions
  - skipParentheses
  - skipTrivia
  - skipTypeChecking
  - skipTypeCheckingIgnoringNoCheck
  - skipTypeParentheses
  - skipWhile
  - sliceAfter
  - some
  - sortAndDeduplicate
  - sourceFileAffectingCompilerOptions
  - sourceFileMayBeEmitted
  - sourceMapCommentRegExp
  - sourceMapCommentRegExpDontCareLineStart
  - spacePart
  - spanMap
  - startEndContainsRange
  - startEndOverlapsWithStartEnd
  - startOnNewLine
  - startTracing
  - startsWith
  - startsWithDirectory
  - startsWithUnderscore
  - startsWithUseStrict
  - stringContainsAt
  - stringToToken
  - stripQuotes
  - supportedDeclarationExtensions
  - supportedJSExtensionsFlat
  - supportedLocaleDirectories
  - supportedTSExtensionsFlat
  - supportedTSImplementationExtensions
  - suppressLeadingAndTrailingTrivia
  - suppressLeadingTrivia
  - suppressTrailingTrivia
  - symbolEscapedNameNoDefault
  - symbolNameNoDefault
  - symbolToDisplayParts
  - sysLog
  - tagNamesAreEquivalent
  - takeWhile
  - targetOptionDeclaration
  - targetToLibMap
  - testFormatSettings
  - textChanges
  - textOrKeywordPart
  - textPart
  - textRangeContainsPositionInclusive
  - textRangeContainsTextSpan
  - textRangeIntersectsWithTextSpan
  - textSpanContainsTextRange
  - textSpansEqual
  - textToKeywordObj
  - timestamp
  - toArray
  - toBuilderFileEmit
  - toBuilderStateFileInfoForMultiEmit
  - toFileNameLowerCase
  - toPath
  - toProgramEmitPending
  - toSorted
  - tokenIsIdentifierOrKeyword
  - tokenIsIdentifierOrKeywordOrGreaterThan
  - trace
  - tracing
  - tracingEnabled
  - transferSourceFileChildren
  - transformClassFields
  - transformDeclarations
  - transformECMAScriptModule
  - transformES2015
  - transformES2016
  - transformES2017
  - transformES2018
  - transformES2019
  - transformES2020
  - transformES2021
  - transformESDecorators
  - transformESNext
  - transformGenerators
  - transformImpliedNodeFormatDependentModule
  - transformJsx
  - transformLegacyDecorators
  - transformModule
  - transformNamedEvaluation
  - transformNodes
  - transformSystemModule
  - transformTypeScript
  - transpileOptionValueCompilerOptions
  - tryAddToSet
  - tryAndIgnoreErrors
  - tryCast
  - tryDirectoryExists
  - tryExtractTSExtension
  - tryFileExists
  - tryGetClassExtendingExpressionWithTypeArguments
  - tryGetClassImplementingOrExtendingExpressionWithTypeArguments
  - tryGetDirectories
  - tryGetExtensionFromPath
  - tryGetImportFromModuleSpecifier
  - tryGetJSDocSatisfiesTypeNode
  - tryGetModuleNameFromFile
  - tryGetModuleSpecifierFromDeclaration
  - tryGetNativePerformanceHooks
  - tryGetPropertyAccessOrIdentifierToString
  - tryGetPropertyNameOfBindingOrAssignmentElement
  - tryGetSourceMappingURL
  - tryGetTextOfPropertyName
  - tryParseJson
  - tryParsePattern
  - tryParsePatterns
  - tryParseRawSourceMap
  - tryReadDirectory
  - tryReadFile
  - tryRemoveDirectoryPrefix
  - tryRemoveExtension
  - tryRemovePrefix
  - tryRemoveSuffix
  - tscBuildOption
  - typeAcquisitionDeclarations
  - typeAliasNamePart
  - typeDirectiveIsEqualTo
  - typeKeywords
  - typeParameterNamePart
  - typeToDisplayParts
  - unchangedPollThresholds
  - unmangleScopedPackageName
  - unorderedRemoveItem
  - unprefixedNodeCoreModules
  - unreachableCodeIsError
  - unsetNodeChildren
  - unusedLabelIsError
  - unwrapInnermostStatementOfLabel
  - unwrapParenthesizedExpression
  - updateErrorForNoInputFiles
  - updateMissingFilePathsWatch
  - updateResolutionField
  - updateSharedExtendedConfigFileWatcher
  - updateWatchingWildcardDirectories
  - usingSingleLineStringWriter
  - utf16EncodeAsString
  - visitArray
  - walkUpOuterExpressions
  - walkUpParenthesizedExpressions
  - walkUpParenthesizedTypes
  - walkUpParenthesizedTypesAndGetParentAndChild
  - whitespaceOrMapCommentRegExp
  - writeCommentRange
  - writeFile
  - writeFileEnsuringDirectories
  - zipWith
