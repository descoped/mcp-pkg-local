# @babel/types Overview

## 📦 Package Information
name: @babel/types
version: 7.28.2
type: Babel Types is a Lodash-esque utility library for AST nodes
main: ./lib/index.js
license: MIT
package_manager: npm
type_system: dynamically typed
type_definitions: ./lib/index-legacy.d.ts

## 🔧 Configuration
build_system: npm
environment_variables:
  - BABEL_TYPES_8_BREAKING

## 🏗️ Core Components

### 1. assertNode()
purpose: Function implementation
parameters: node: any
returns: void

### 2. buildUndefinedNode()
purpose: Function implementation
returns: any

### 3. validateNode()
purpose: Function implementation
parameters: node: any
returns: any

### 4. clone()
purpose: Function implementation
parameters: node: any
returns: any

### 5. cloneDeep()
purpose: Function implementation
parameters: node: any
returns: any

### 6. cloneDeepWithoutLoc()
purpose: Function implementation
parameters: node: any
returns: any

### 7. cloneNode()
purpose: Function implementation
parameters: node: any, deep?: boolean, withoutLoc?: boolean
returns: any

### 8. cloneWithoutLoc()
purpose: Function implementation
parameters: node: any
returns: any

### 9. addComment()
purpose: Function implementation
parameters: node: any, type: any, content: any, line: any
returns: any

### 10. addComments()
purpose: Function implementation
parameters: node: any, type: any, comments: any
returns: any

### 11. inheritInnerComments()
purpose: Function implementation
parameters: child: any, parent: any
returns: void

### 12. inheritLeadingComments()
purpose: Function implementation
parameters: child: any, parent: any
returns: void

### 13. inheritsComments()
purpose: Function implementation
parameters: child: any, parent: any
returns: any

### 14. inheritTrailingComments()
purpose: Function implementation
parameters: child: any, parent: any
returns: void

### 15. removeComments()
purpose: Function implementation
parameters: node: any
returns: any

### 16. ensureBlock()
purpose: Function implementation
parameters: node: any, key?: string
returns: any

### 17. gatherSequenceExpressions()
purpose: Function implementation
parameters: nodes: any, declars: any
returns: any

### 18. toBindingIdentifierName()
purpose: Function implementation
parameters: name: any
returns: any

### 19. toComputedKey()
purpose: Function implementation
parameters: node: any, key?: any
returns: any

### 20. toExpression()
purpose: Function implementation
parameters: node: any
returns: any

### 21. toIdentifier()
purpose: Function implementation
parameters: input: any
returns: string

### 22. toKeyAlias()
purpose: Function implementation
parameters: node: any, key?: any
returns: any

### 23. toSequenceExpression()
purpose: Function implementation
parameters: nodes: any, scope: any
returns: any

### 24. toStatement()
purpose: Function implementation
parameters: node: any, ignore: any
returns: any

### 25. valueToNode()
purpose: Function implementation
parameters: value: any
returns: any

### 26. validate()
purpose: Function implementation
parameters: validate: any
returns: { validate: any; }

### 27. validateType()
purpose: Function implementation
parameters: ...typeNames?: any[]
returns: { validate: any; }

### 28. validateOptional()
purpose: Function implementation
parameters: validate: any
returns: { validate: any; optional: boolean; }

### 29. validateOptionalType()
purpose: Function implementation
parameters: ...typeNames?: any[]
returns: { validate: { (node: any, key: any, val: any): void; oneOfNodeTypes: any[]; }; optional: boolean; }

### 30. arrayOf()
purpose: Function implementation
parameters: elementType: any
returns: { (...args: any[]): void; chainOf: any[]; }

### 31. arrayOfType()
purpose: Function implementation
parameters: ...typeNames?: any[]
returns: { (...args: any[]): void; chainOf: any[]; }

### 32. validateArrayOfType()
purpose: Function implementation
parameters: ...typeNames?: any[]
returns: { validate: any; }

### 33. assertEach()
purpose: Function implementation
parameters: callback: any
returns: { (node: any, key: any, val: any): void; each: any; }

### 34. assertOneOf()
purpose: Function implementation
parameters: ...values?: any[]
returns: { (node: any, key: any, val: any): void; oneOf: any[]; }

### 35. assertNodeType()
purpose: Function implementation
parameters: ...types?: any[]
returns: { (node: any, key: any, val: any): void; oneOfNodeTypes: any[]; }

### 36. assertNodeOrValueType()
purpose: Function implementation
parameters: ...types?: any[]
returns: { (node: any, key: any, val: any): void; oneOfNodeOrValueTypes: any[]; }

### 37. assertValueType()
purpose: Function implementation
parameters: type: any
returns: { (node: any, key: any, val: any): void; type: any; }

### 38. assertShape()
purpose: Function implementation
parameters: shape: any
returns: { (node: any, key: any, val: any): void; shapeOf: any; }

### 39. assertOptionalChainStart()
purpose: Function implementation
returns: (node: any) => void

### 40. chain()
purpose: Function implementation
parameters: ...fns?: any[]
returns: { (...args: any[]): void; chainOf: any[]; }

### 41. defineAliasedType()
purpose: Function implementation
parameters: ...aliases?: any[]
returns: (type: any, opts?: {}) => void

### 42. defineType()
purpose: Function implementation
parameters: type: any, opts?: {}
returns: void

### 43. appendToMemberExpression()
purpose: Function implementation
parameters: member: any, append: any, computed?: boolean
returns: any

### 44. inherits()
purpose: Function implementation
parameters: child: any, parent: any
returns: any

### 45. prependToMemberExpression()
purpose: Function implementation
parameters: member: any, prepend: any
returns: any

### 46. removeProperties()
purpose: Function implementation
parameters: node: any, opts?: {}
returns: void

### 47. removePropertiesDeep()
purpose: Function implementation
parameters: tree: any, opts: any
returns: any

### 48. getAssignmentIdentifiers()
purpose: Function implementation
parameters: node: any
returns: any

### 49. getBindingIdentifiers()
purpose: Function implementation
parameters: node: any, duplicates: any, outerOnly: any, newBindingsOnly: any
returns: any

### 50. getFunctionName()
purpose: Function implementation
parameters: node: any, parent: any
returns: { name: any; originalNode: any; }

### 51. getOuterBindingIdentifiers()
purpose: Function implementation
parameters: node: any, duplicates: any
returns: any

### 52. traverse()
purpose: Function implementation
parameters: node: any, handlers: any, state: any
returns: void

### 53. traverseFast()
purpose: Function implementation
parameters: node: any, enter: any, opts: any
returns: boolean

### 54. deprecationWarning()
purpose: Function implementation
parameters: oldName: any, newName: any, prefix?: string, cacheKey?: any
returns: void

### 55. inherit()
purpose: Function implementation
parameters: key: any, child: any, parent: any
returns: void

### 56. shallowEqual()
purpose: Function implementation
parameters: actual: any, expected: any
returns: boolean

### 57. buildMatchMemberExpression()
purpose: Function implementation
parameters: match: any, allowPartial: any
returns: (member: any) => boolean

### 58. is()
purpose: Function implementation
parameters: type: any, node: any, opts: any
returns: boolean

### 59. isBinding()
purpose: Function implementation
parameters: node: any, parent: any, grandparent: any
returns: boolean

### 60. isBlockScoped()
purpose: Function implementation
parameters: node: any
returns: any

### 61. isImmutable()
purpose: Function implementation
parameters: node: any
returns: boolean

### 62. isLet()
purpose: Function implementation
parameters: node: any
returns: any

### 63. isNode()
purpose: Function implementation
parameters: node: any
returns: boolean

### 64. isNodesEquivalent()
purpose: Function implementation
parameters: a: any, b: any
returns: boolean

### 65. isPlaceholderType()
purpose: Function implementation
parameters: placeholderType: any, targetType: any
returns: boolean

### 66. isReferenced()
purpose: Function implementation
parameters: node: any, parent: any, grandparent: any
returns: boolean

### 67. isScope()
purpose: Function implementation
parameters: node: any, parent: any
returns: boolean

### 68. isSpecifierDefault()
purpose: Function implementation
parameters: specifier: any
returns: boolean

### 69. isType()
purpose: Function implementation
parameters: nodeType: any, targetType: any
returns: boolean

### 70. isValidES3Identifier()
purpose: Function implementation
parameters: name: any
returns: boolean

### 71. isValidIdentifier()
purpose: Function implementation
parameters: name: any, reserved?: boolean
returns: any

### 72. isVar()
purpose: Function implementation
parameters: node: any
returns: boolean

### 73. matchesPattern()
purpose: Function implementation
parameters: member: any, match: any, allowPartial: any
returns: boolean

### 74. validate()
purpose: Function implementation
parameters: node: any, key: any, val: any
returns: void

### 75. validateInternal()
purpose: Function implementation
parameters: field: any, node: any, key: any, val: any, maybeNode: any
returns: void

### 76. validateField()
purpose: Function implementation
parameters: node: any, key: any, val: any, field: any
returns: void

### 77. validateChild()
purpose: Function implementation
parameters: node: any, key: any, val: any
returns: void

### 78. assertArrayExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 79. assertAssignmentExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 80. assertBinaryExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 81. assertInterpreterDirective()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 82. assertDirective()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 83. assertDirectiveLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 84. assertBlockStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 85. assertBreakStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 86. assertCallExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 87. assertCatchClause()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 88. assertConditionalExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 89. assertContinueStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 90. assertDebuggerStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 91. assertDoWhileStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 92. assertEmptyStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 93. assertExpressionStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 94. assertFile()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 95. assertForInStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 96. assertForStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 97. assertFunctionDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 98. assertFunctionExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 99. assertIdentifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 100. assertIfStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 101. assertLabeledStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 102. assertStringLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 103. assertNumericLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 104. assertNullLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 105. assertBooleanLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 106. assertRegExpLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 107. assertLogicalExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 108. assertMemberExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 109. assertNewExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 110. assertProgram()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 111. assertObjectExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 112. assertObjectMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 113. assertObjectProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 114. assertRestElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 115. assertReturnStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 116. assertSequenceExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 117. assertParenthesizedExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 118. assertSwitchCase()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 119. assertSwitchStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 120. assertThisExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 121. assertThrowStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 122. assertTryStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 123. assertUnaryExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 124. assertUpdateExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 125. assertVariableDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 126. assertVariableDeclarator()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 127. assertWhileStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 128. assertWithStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 129. assertAssignmentPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 130. assertArrayPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 131. assertArrowFunctionExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 132. assertClassBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 133. assertClassExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 134. assertClassDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 135. assertExportAllDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 136. assertExportDefaultDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 137. assertExportNamedDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 138. assertExportSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 139. assertForOfStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 140. assertImportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 141. assertImportDefaultSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 142. assertImportNamespaceSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 143. assertImportSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 144. assertImportExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 145. assertMetaProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 146. assertClassMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 147. assertObjectPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 148. assertSpreadElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 149. assertSuper()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 150. assertTaggedTemplateExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 151. assertTemplateElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 152. assertTemplateLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 153. assertYieldExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 154. assertAwaitExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 155. assertImport()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 156. assertBigIntLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 157. assertExportNamespaceSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 158. assertOptionalMemberExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 159. assertOptionalCallExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 160. assertClassProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 161. assertClassAccessorProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 162. assertClassPrivateProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 163. assertClassPrivateMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 164. assertPrivateName()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 165. assertStaticBlock()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 166. assertImportAttribute()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 167. assertAnyTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 168. assertArrayTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 169. assertBooleanTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 170. assertBooleanLiteralTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 171. assertNullLiteralTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 172. assertClassImplements()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 173. assertDeclareClass()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 174. assertDeclareFunction()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 175. assertDeclareInterface()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 176. assertDeclareModule()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 177. assertDeclareModuleExports()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 178. assertDeclareTypeAlias()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 179. assertDeclareOpaqueType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 180. assertDeclareVariable()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 181. assertDeclareExportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 182. assertDeclareExportAllDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 183. assertDeclaredPredicate()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 184. assertExistsTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 185. assertFunctionTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 186. assertFunctionTypeParam()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 187. assertGenericTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 188. assertInferredPredicate()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 189. assertInterfaceExtends()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 190. assertInterfaceDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 191. assertInterfaceTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 192. assertIntersectionTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 193. assertMixedTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 194. assertEmptyTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 195. assertNullableTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 196. assertNumberLiteralTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 197. assertNumberTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 198. assertObjectTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 199. assertObjectTypeInternalSlot()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 200. assertObjectTypeCallProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 201. assertObjectTypeIndexer()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 202. assertObjectTypeProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 203. assertObjectTypeSpreadProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 204. assertOpaqueType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 205. assertQualifiedTypeIdentifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 206. assertStringLiteralTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 207. assertStringTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 208. assertSymbolTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 209. assertThisTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 210. assertTupleTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 211. assertTypeofTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 212. assertTypeAlias()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 213. assertTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 214. assertTypeCastExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 215. assertTypeParameter()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 216. assertTypeParameterDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 217. assertTypeParameterInstantiation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 218. assertUnionTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 219. assertVariance()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 220. assertVoidTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 221. assertEnumDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 222. assertEnumBooleanBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 223. assertEnumNumberBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 224. assertEnumStringBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 225. assertEnumSymbolBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 226. assertEnumBooleanMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 227. assertEnumNumberMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 228. assertEnumStringMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 229. assertEnumDefaultedMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 230. assertIndexedAccessType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 231. assertOptionalIndexedAccessType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 232. assertJSXAttribute()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 233. assertJSXClosingElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 234. assertJSXElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 235. assertJSXEmptyExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 236. assertJSXExpressionContainer()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 237. assertJSXSpreadChild()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 238. assertJSXIdentifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 239. assertJSXMemberExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 240. assertJSXNamespacedName()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 241. assertJSXOpeningElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 242. assertJSXSpreadAttribute()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 243. assertJSXText()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 244. assertJSXFragment()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 245. assertJSXOpeningFragment()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 246. assertJSXClosingFragment()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 247. assertNoop()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 248. assertPlaceholder()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 249. assertV8IntrinsicIdentifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 250. assertArgumentPlaceholder()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 251. assertBindExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 252. assertDecorator()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 253. assertDoExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 254. assertExportDefaultSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 255. assertRecordExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 256. assertTupleExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 257. assertDecimalLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 258. assertModuleExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 259. assertTopicReference()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 260. assertPipelineTopicExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 261. assertPipelineBareFunction()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 262. assertPipelinePrimaryTopicReference()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 263. assertVoidPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 264. assertTSParameterProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 265. assertTSDeclareFunction()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 266. assertTSDeclareMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 267. assertTSQualifiedName()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 268. assertTSCallSignatureDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 269. assertTSConstructSignatureDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 270. assertTSPropertySignature()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 271. assertTSMethodSignature()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 272. assertTSIndexSignature()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 273. assertTSAnyKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 274. assertTSBooleanKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 275. assertTSBigIntKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 276. assertTSIntrinsicKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 277. assertTSNeverKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 278. assertTSNullKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 279. assertTSNumberKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 280. assertTSObjectKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 281. assertTSStringKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 282. assertTSSymbolKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 283. assertTSUndefinedKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 284. assertTSUnknownKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 285. assertTSVoidKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 286. assertTSThisType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 287. assertTSFunctionType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 288. assertTSConstructorType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 289. assertTSTypeReference()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 290. assertTSTypePredicate()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 291. assertTSTypeQuery()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 292. assertTSTypeLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 293. assertTSArrayType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 294. assertTSTupleType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 295. assertTSOptionalType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 296. assertTSRestType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 297. assertTSNamedTupleMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 298. assertTSUnionType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 299. assertTSIntersectionType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 300. assertTSConditionalType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 301. assertTSInferType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 302. assertTSParenthesizedType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 303. assertTSTypeOperator()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 304. assertTSIndexedAccessType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 305. assertTSMappedType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 306. assertTSTemplateLiteralType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 307. assertTSLiteralType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 308. assertTSExpressionWithTypeArguments()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 309. assertTSInterfaceDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 310. assertTSInterfaceBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 311. assertTSTypeAliasDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 312. assertTSInstantiationExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 313. assertTSAsExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 314. assertTSSatisfiesExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 315. assertTSTypeAssertion()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 316. assertTSEnumBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 317. assertTSEnumDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 318. assertTSEnumMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 319. assertTSModuleDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 320. assertTSModuleBlock()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 321. assertTSImportType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 322. assertTSImportEqualsDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 323. assertTSExternalModuleReference()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 324. assertTSNonNullExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 325. assertTSExportAssignment()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 326. assertTSNamespaceExportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 327. assertTSTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 328. assertTSTypeParameterInstantiation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 329. assertTSTypeParameterDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 330. assertTSTypeParameter()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 331. assertStandardized()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 332. assertExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 333. assertBinary()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 334. assertScopable()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 335. assertBlockParent()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 336. assertBlock()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 337. assertStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 338. assertTerminatorless()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 339. assertCompletionStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 340. assertConditional()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 341. assertLoop()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 342. assertWhile()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 343. assertExpressionWrapper()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 344. assertFor()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 345. assertForXStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 346. assertFunction()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 347. assertFunctionParent()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 348. assertPureish()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 349. assertDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 350. assertFunctionParameter()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 351. assertPatternLike()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 352. assertLVal()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 353. assertTSEntityName()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 354. assertLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 355. assertImmutable()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 356. assertUserWhitespacable()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 357. assertMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 358. assertObjectMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 359. assertProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 360. assertUnaryLike()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 361. assertPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 362. assertClass()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 363. assertImportOrExportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 364. assertExportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 365. assertModuleSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 366. assertAccessor()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 367. assertPrivate()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 368. assertFlow()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 369. assertFlowType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 370. assertFlowBaseAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 371. assertFlowDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 372. assertFlowPredicate()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 373. assertEnumBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 374. assertEnumMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 375. assertJSX()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 376. assertMiscellaneous()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 377. assertTypeScript()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 378. assertTSTypeElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 379. assertTSType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 380. assertTSBaseType()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 381. assertNumberLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 382. assertRegexLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 383. assertRestProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 384. assertSpreadProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 385. assertModuleDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: void

### 386. createFlowUnionType()
purpose: Function implementation
parameters: types: any
returns: any

### 387. createTypeAnnotationBasedOnTypeof()
purpose: Function implementation
parameters: type: any
returns: any

### 388. bigIntLiteral()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 389. arrayExpression()
purpose: Function implementation
parameters: elements?: any[]
returns: { type: string; elements: any[]; }

### 390. assignmentExpression()
purpose: Function implementation
parameters: operator: any, left: any, right: any
returns: { type: string; operator: any; left: any; right: any; }

### 391. binaryExpression()
purpose: Function implementation
parameters: operator: any, left: any, right: any
returns: { type: string; operator: any; left: any; right: any; }

### 392. interpreterDirective()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 393. directive()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 394. directiveLiteral()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 395. blockStatement()
purpose: Function implementation
parameters: body: any, directives?: any[]
returns: { type: string; body: any; directives: any[]; }

### 396. breakStatement()
purpose: Function implementation
parameters: label?: any
returns: { type: string; label: any; }

### 397. callExpression()
purpose: Function implementation
parameters: callee: any, _arguments: any
returns: { type: string; callee: any; arguments: any; }

### 398. catchClause()
purpose: Function implementation
parameters: param?: any, body: any
returns: { type: string; param: any; body: any; }

### 399. conditionalExpression()
purpose: Function implementation
parameters: test: any, consequent: any, alternate: any
returns: { type: string; test: any; consequent: any; alternate: any; }

### 400. continueStatement()
purpose: Function implementation
parameters: label?: any
returns: { type: string; label: any; }

### 401. debuggerStatement()
purpose: Function implementation
returns: { type: string; }

### 402. doWhileStatement()
purpose: Function implementation
parameters: test: any, body: any
returns: { type: string; test: any; body: any; }

### 403. emptyStatement()
purpose: Function implementation
returns: { type: string; }

### 404. expressionStatement()
purpose: Function implementation
parameters: expression: any
returns: { type: string; expression: any; }

### 405. file()
purpose: Function implementation
parameters: program: any, comments?: any, tokens?: any
returns: { type: string; program: any; comments: any; tokens: any; }

### 406. forInStatement()
purpose: Function implementation
parameters: left: any, right: any, body: any
returns: { type: string; left: any; right: any; body: any; }

### 407. forStatement()
purpose: Function implementation
parameters: init?: any, test?: any, update?: any, body: any
returns: { type: string; init: any; test: any; update: any; body: any; }

### 408. functionDeclaration()
purpose: Function implementation
parameters: id?: any, params: any, body: any, generator?: boolean, async?: boolean
returns: { type: string; id: any; params: any; body: any; generator: boolean; async: boolean; }

### 409. functionExpression()
purpose: Function implementation
parameters: id?: any, params: any, body: any, generator?: boolean, async?: boolean
returns: { type: string; id: any; params: any; body: any; generator: boolean; async: boolean; }

### 410. identifier()
purpose: Function implementation
parameters: name: any
returns: { type: string; name: any; }

### 411. ifStatement()
purpose: Function implementation
parameters: test: any, consequent: any, alternate?: any
returns: { type: string; test: any; consequent: any; alternate: any; }

### 412. labeledStatement()
purpose: Function implementation
parameters: label: any, body: any
returns: { type: string; label: any; body: any; }

### 413. stringLiteral()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 414. numericLiteral()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 415. nullLiteral()
purpose: Function implementation
returns: { type: string; }

### 416. booleanLiteral()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 417. regExpLiteral()
purpose: Function implementation
parameters: pattern: any, flags?: string
returns: { type: string; pattern: any; flags: string; }

### 418. logicalExpression()
purpose: Function implementation
parameters: operator: any, left: any, right: any
returns: { type: string; operator: any; left: any; right: any; }

### 419. memberExpression()
purpose: Function implementation
parameters: object: any, property: any, computed?: boolean, optional?: any
returns: { type: string; object: any; property: any; computed: boolean; optional: any; }

### 420. newExpression()
purpose: Function implementation
parameters: callee: any, _arguments: any
returns: { type: string; callee: any; arguments: any; }

### 421. program()
purpose: Function implementation
parameters: body: any, directives?: any[], sourceType?: string, interpreter?: any
returns: { type: string; body: any; directives: any[]; sourceType: string; interpreter: any; }

### 422. objectExpression()
purpose: Function implementation
parameters: properties: any
returns: { type: string; properties: any; }

### 423. objectMethod()
purpose: Function implementation
parameters: kind?: string, key: any, params: any, body: any, computed?: boolean, generator?: boolean, async?: boolean
returns: { type: string; kind: string; key: any; params: any; body: any; computed: boolean; generator: boolean; async: boolean; }

### 424. objectProperty()
purpose: Function implementation
parameters: key: any, value: any, computed?: boolean, shorthand?: boolean, decorators?: any
returns: { type: string; key: any; value: any; computed: boolean; shorthand: boolean; decorators: any; }

### 425. restElement()
purpose: Function implementation
parameters: argument: any
returns: { type: string; argument: any; }

### 426. returnStatement()
purpose: Function implementation
parameters: argument?: any
returns: { type: string; argument: any; }

### 427. sequenceExpression()
purpose: Function implementation
parameters: expressions: any
returns: { type: string; expressions: any; }

### 428. parenthesizedExpression()
purpose: Function implementation
parameters: expression: any
returns: { type: string; expression: any; }

### 429. switchCase()
purpose: Function implementation
parameters: test?: any, consequent: any
returns: { type: string; test: any; consequent: any; }

### 430. switchStatement()
purpose: Function implementation
parameters: discriminant: any, cases: any
returns: { type: string; discriminant: any; cases: any; }

### 431. thisExpression()
purpose: Function implementation
returns: { type: string; }

### 432. throwStatement()
purpose: Function implementation
parameters: argument: any
returns: { type: string; argument: any; }

### 433. tryStatement()
purpose: Function implementation
parameters: block: any, handler?: any, finalizer?: any
returns: { type: string; block: any; handler: any; finalizer: any; }

### 434. unaryExpression()
purpose: Function implementation
parameters: operator: any, argument: any, prefix?: boolean
returns: { type: string; operator: any; argument: any; prefix: boolean; }

### 435. updateExpression()
purpose: Function implementation
parameters: operator: any, argument: any, prefix?: boolean
returns: { type: string; operator: any; argument: any; prefix: boolean; }

### 436. variableDeclaration()
purpose: Function implementation
parameters: kind: any, declarations: any
returns: { type: string; kind: any; declarations: any; }

### 437. variableDeclarator()
purpose: Function implementation
parameters: id: any, init?: any
returns: { type: string; id: any; init: any; }

### 438. whileStatement()
purpose: Function implementation
parameters: test: any, body: any
returns: { type: string; test: any; body: any; }

### 439. withStatement()
purpose: Function implementation
parameters: object: any, body: any
returns: { type: string; object: any; body: any; }

### 440. assignmentPattern()
purpose: Function implementation
parameters: left: any, right: any
returns: { type: string; left: any; right: any; }

### 441. arrayPattern()
purpose: Function implementation
parameters: elements: any
returns: { type: string; elements: any; }

### 442. arrowFunctionExpression()
purpose: Function implementation
parameters: params: any, body: any, async?: boolean
returns: { type: string; params: any; body: any; async: boolean; expression: any; }

### 443. classBody()
purpose: Function implementation
parameters: body: any
returns: { type: string; body: any; }

### 444. classExpression()
purpose: Function implementation
parameters: id?: any, superClass?: any, body: any, decorators?: any
returns: { type: string; id: any; superClass: any; body: any; decorators: any; }

### 445. classDeclaration()
purpose: Function implementation
parameters: id?: any, superClass?: any, body: any, decorators?: any
returns: { type: string; id: any; superClass: any; body: any; decorators: any; }

### 446. exportAllDeclaration()
purpose: Function implementation
parameters: source: any
returns: { type: string; source: any; }

### 447. exportDefaultDeclaration()
purpose: Function implementation
parameters: declaration: any
returns: { type: string; declaration: any; }

### 448. exportNamedDeclaration()
purpose: Function implementation
parameters: declaration?: any, specifiers?: any[], source?: any
returns: { type: string; declaration: any; specifiers: any[]; source: any; }

### 449. exportSpecifier()
purpose: Function implementation
parameters: local: any, exported: any
returns: { type: string; local: any; exported: any; }

### 450. forOfStatement()
purpose: Function implementation
parameters: left: any, right: any, body: any, _await?: boolean
returns: { type: string; left: any; right: any; body: any; await: boolean; }

### 451. importDeclaration()
purpose: Function implementation
parameters: specifiers: any, source: any
returns: { type: string; specifiers: any; source: any; }

### 452. importDefaultSpecifier()
purpose: Function implementation
parameters: local: any
returns: { type: string; local: any; }

### 453. importNamespaceSpecifier()
purpose: Function implementation
parameters: local: any
returns: { type: string; local: any; }

### 454. importSpecifier()
purpose: Function implementation
parameters: local: any, imported: any
returns: { type: string; local: any; imported: any; }

### 455. importExpression()
purpose: Function implementation
parameters: source: any, options?: any
returns: { type: string; source: any; options: any; }

### 456. metaProperty()
purpose: Function implementation
parameters: meta: any, property: any
returns: { type: string; meta: any; property: any; }

### 457. classMethod()
purpose: Function implementation
parameters: kind?: string, key: any, params: any, body: any, computed?: boolean, _static?: boolean, generator?: boolean, async?: boolean
returns: { type: string; kind: string; key: any; params: any; body: any; computed: boolean; static: boolean; generator: boolean; async: boolean; }

### 458. objectPattern()
purpose: Function implementation
parameters: properties: any
returns: { type: string; properties: any; }

### 459. spreadElement()
purpose: Function implementation
parameters: argument: any
returns: { type: string; argument: any; }

### 460. _super()
purpose: Function implementation
returns: { type: string; }

### 461. taggedTemplateExpression()
purpose: Function implementation
parameters: tag: any, quasi: any
returns: { type: string; tag: any; quasi: any; }

### 462. templateElement()
purpose: Function implementation
parameters: value: any, tail?: boolean
returns: { type: string; value: any; tail: boolean; }

### 463. templateLiteral()
purpose: Function implementation
parameters: quasis: any, expressions: any
returns: { type: string; quasis: any; expressions: any; }

### 464. yieldExpression()
purpose: Function implementation
parameters: argument?: any, delegate?: boolean
returns: { type: string; argument: any; delegate: boolean; }

### 465. awaitExpression()
purpose: Function implementation
parameters: argument: any
returns: { type: string; argument: any; }

### 466. _import()
purpose: Function implementation
returns: { type: string; }

### 467. exportNamespaceSpecifier()
purpose: Function implementation
parameters: exported: any
returns: { type: string; exported: any; }

### 468. optionalMemberExpression()
purpose: Function implementation
parameters: object: any, property: any, computed?: boolean, optional: any
returns: { type: string; object: any; property: any; computed: boolean; optional: any; }

### 469. optionalCallExpression()
purpose: Function implementation
parameters: callee: any, _arguments: any, optional: any
returns: { type: string; callee: any; arguments: any; optional: any; }

### 470. classProperty()
purpose: Function implementation
parameters: key: any, value?: any, typeAnnotation?: any, decorators?: any, computed?: boolean, _static?: boolean
returns: { type: string; key: any; value: any; typeAnnotation: any; decorators: any; computed: boolean; static: boolean; }

### 471. classAccessorProperty()
purpose: Function implementation
parameters: key: any, value?: any, typeAnnotation?: any, decorators?: any, computed?: boolean, _static?: boolean
returns: { type: string; key: any; value: any; typeAnnotation: any; decorators: any; computed: boolean; static: boolean; }

### 472. classPrivateProperty()
purpose: Function implementation
parameters: key: any, value?: any, decorators?: any, _static?: boolean
returns: { type: string; key: any; value: any; decorators: any; static: boolean; }

### 473. classPrivateMethod()
purpose: Function implementation
parameters: kind?: string, key: any, params: any, body: any, _static?: boolean
returns: { type: string; kind: string; key: any; params: any; body: any; static: boolean; }

### 474. privateName()
purpose: Function implementation
parameters: id: any
returns: { type: string; id: any; }

### 475. staticBlock()
purpose: Function implementation
parameters: body: any
returns: { type: string; body: any; }

### 476. importAttribute()
purpose: Function implementation
parameters: key: any, value: any
returns: { type: string; key: any; value: any; }

### 477. anyTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 478. arrayTypeAnnotation()
purpose: Function implementation
parameters: elementType: any
returns: { type: string; elementType: any; }

### 479. booleanTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 480. booleanLiteralTypeAnnotation()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 481. nullLiteralTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 482. classImplements()
purpose: Function implementation
parameters: id: any, typeParameters?: any
returns: { type: string; id: any; typeParameters: any; }

### 483. declareClass()
purpose: Function implementation
parameters: id: any, typeParameters?: any, _extends?: any, body: any
returns: { type: string; id: any; typeParameters: any; extends: any; body: any; }

### 484. declareFunction()
purpose: Function implementation
parameters: id: any
returns: { type: string; id: any; }

### 485. declareInterface()
purpose: Function implementation
parameters: id: any, typeParameters?: any, _extends?: any, body: any
returns: { type: string; id: any; typeParameters: any; extends: any; body: any; }

### 486. declareModule()
purpose: Function implementation
parameters: id: any, body: any, kind?: any
returns: { type: string; id: any; body: any; kind: any; }

### 487. declareModuleExports()
purpose: Function implementation
parameters: typeAnnotation: any
returns: { type: string; typeAnnotation: any; }

### 488. declareTypeAlias()
purpose: Function implementation
parameters: id: any, typeParameters?: any, right: any
returns: { type: string; id: any; typeParameters: any; right: any; }

### 489. declareOpaqueType()
purpose: Function implementation
parameters: id: any, typeParameters?: any, supertype?: any
returns: { type: string; id: any; typeParameters: any; supertype: any; }

### 490. declareVariable()
purpose: Function implementation
parameters: id: any
returns: { type: string; id: any; }

### 491. declareExportDeclaration()
purpose: Function implementation
parameters: declaration?: any, specifiers?: any, source?: any, attributes?: any
returns: { type: string; declaration: any; specifiers: any; source: any; attributes: any; }

### 492. declareExportAllDeclaration()
purpose: Function implementation
parameters: source: any, attributes?: any
returns: { type: string; source: any; attributes: any; }

### 493. declaredPredicate()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 494. existsTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 495. functionTypeAnnotation()
purpose: Function implementation
parameters: typeParameters?: any, params: any, rest?: any, returnType: any
returns: { type: string; typeParameters: any; params: any; rest: any; returnType: any; }

### 496. functionTypeParam()
purpose: Function implementation
parameters: name?: any, typeAnnotation: any
returns: { type: string; name: any; typeAnnotation: any; }

### 497. genericTypeAnnotation()
purpose: Function implementation
parameters: id: any, typeParameters?: any
returns: { type: string; id: any; typeParameters: any; }

### 498. inferredPredicate()
purpose: Function implementation
returns: { type: string; }

### 499. interfaceExtends()
purpose: Function implementation
parameters: id: any, typeParameters?: any
returns: { type: string; id: any; typeParameters: any; }

### 500. interfaceDeclaration()
purpose: Function implementation
parameters: id: any, typeParameters?: any, _extends?: any, body: any
returns: { type: string; id: any; typeParameters: any; extends: any; body: any; }

### 501. interfaceTypeAnnotation()
purpose: Function implementation
parameters: _extends?: any, body: any
returns: { type: string; extends: any; body: any; }

### 502. intersectionTypeAnnotation()
purpose: Function implementation
parameters: types: any
returns: { type: string; types: any; }

### 503. mixedTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 504. emptyTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 505. nullableTypeAnnotation()
purpose: Function implementation
parameters: typeAnnotation: any
returns: { type: string; typeAnnotation: any; }

### 506. numberLiteralTypeAnnotation()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 507. numberTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 508. objectTypeAnnotation()
purpose: Function implementation
parameters: properties: any, indexers?: any[], callProperties?: any[], internalSlots?: any[], exact?: boolean
returns: { type: string; properties: any; indexers: any[]; callProperties: any[]; internalSlots: any[]; exact: boolean; }

### 509. objectTypeInternalSlot()
purpose: Function implementation
parameters: id: any, value: any, optional: any, _static: any, method: any
returns: { type: string; id: any; value: any; optional: any; static: any; method: any; }

### 510. objectTypeCallProperty()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; static: any; }

### 511. objectTypeIndexer()
purpose: Function implementation
parameters: id?: any, key: any, value: any, variance?: any
returns: { type: string; id: any; key: any; value: any; variance: any; static: any; }

### 512. objectTypeProperty()
purpose: Function implementation
parameters: key: any, value: any, variance?: any
returns: { type: string; key: any; value: any; variance: any; kind: any; method: any; optional: any; proto: any; static: any; }

### 513. objectTypeSpreadProperty()
purpose: Function implementation
parameters: argument: any
returns: { type: string; argument: any; }

### 514. opaqueType()
purpose: Function implementation
parameters: id: any, typeParameters?: any, supertype?: any, impltype: any
returns: { type: string; id: any; typeParameters: any; supertype: any; impltype: any; }

### 515. qualifiedTypeIdentifier()
purpose: Function implementation
parameters: id: any, qualification: any
returns: { type: string; id: any; qualification: any; }

### 516. stringLiteralTypeAnnotation()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 517. stringTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 518. symbolTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 519. thisTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 520. tupleTypeAnnotation()
purpose: Function implementation
parameters: types: any
returns: { type: string; types: any; }

### 521. typeofTypeAnnotation()
purpose: Function implementation
parameters: argument: any
returns: { type: string; argument: any; }

### 522. typeAlias()
purpose: Function implementation
parameters: id: any, typeParameters?: any, right: any
returns: { type: string; id: any; typeParameters: any; right: any; }

### 523. typeAnnotation()
purpose: Function implementation
parameters: typeAnnotation: any
returns: { type: string; typeAnnotation: any; }

### 524. typeCastExpression()
purpose: Function implementation
parameters: expression: any, typeAnnotation: any
returns: { type: string; expression: any; typeAnnotation: any; }

### 525. typeParameter()
purpose: Function implementation
parameters: bound?: any, _default?: any, variance?: any
returns: { type: string; bound: any; default: any; variance: any; name: any; }

### 526. typeParameterDeclaration()
purpose: Function implementation
parameters: params: any
returns: { type: string; params: any; }

### 527. typeParameterInstantiation()
purpose: Function implementation
parameters: params: any
returns: { type: string; params: any; }

### 528. unionTypeAnnotation()
purpose: Function implementation
parameters: types: any
returns: { type: string; types: any; }

### 529. variance()
purpose: Function implementation
parameters: kind: any
returns: { type: string; kind: any; }

### 530. voidTypeAnnotation()
purpose: Function implementation
returns: { type: string; }

### 531. enumDeclaration()
purpose: Function implementation
parameters: id: any, body: any
returns: { type: string; id: any; body: any; }

### 532. enumBooleanBody()
purpose: Function implementation
parameters: members: any
returns: { type: string; members: any; explicitType: any; hasUnknownMembers: any; }

### 533. enumNumberBody()
purpose: Function implementation
parameters: members: any
returns: { type: string; members: any; explicitType: any; hasUnknownMembers: any; }

### 534. enumStringBody()
purpose: Function implementation
parameters: members: any
returns: { type: string; members: any; explicitType: any; hasUnknownMembers: any; }

### 535. enumSymbolBody()
purpose: Function implementation
parameters: members: any
returns: { type: string; members: any; hasUnknownMembers: any; }

### 536. enumBooleanMember()
purpose: Function implementation
parameters: id: any
returns: { type: string; id: any; init: any; }

### 537. enumNumberMember()
purpose: Function implementation
parameters: id: any, init: any
returns: { type: string; id: any; init: any; }

### 538. enumStringMember()
purpose: Function implementation
parameters: id: any, init: any
returns: { type: string; id: any; init: any; }

### 539. enumDefaultedMember()
purpose: Function implementation
parameters: id: any
returns: { type: string; id: any; }

### 540. indexedAccessType()
purpose: Function implementation
parameters: objectType: any, indexType: any
returns: { type: string; objectType: any; indexType: any; }

### 541. optionalIndexedAccessType()
purpose: Function implementation
parameters: objectType: any, indexType: any
returns: { type: string; objectType: any; indexType: any; optional: any; }

### 542. jsxAttribute()
purpose: Function implementation
parameters: name: any, value?: any
returns: { type: string; name: any; value: any; }

### 543. jsxClosingElement()
purpose: Function implementation
parameters: name: any
returns: { type: string; name: any; }

### 544. jsxElement()
purpose: Function implementation
parameters: openingElement: any, closingElement?: any, children: any, selfClosing?: any
returns: { type: string; openingElement: any; closingElement: any; children: any; selfClosing: any; }

### 545. jsxEmptyExpression()
purpose: Function implementation
returns: { type: string; }

### 546. jsxExpressionContainer()
purpose: Function implementation
parameters: expression: any
returns: { type: string; expression: any; }

### 547. jsxSpreadChild()
purpose: Function implementation
parameters: expression: any
returns: { type: string; expression: any; }

### 548. jsxIdentifier()
purpose: Function implementation
parameters: name: any
returns: { type: string; name: any; }

### 549. jsxMemberExpression()
purpose: Function implementation
parameters: object: any, property: any
returns: { type: string; object: any; property: any; }

### 550. jsxNamespacedName()
purpose: Function implementation
parameters: namespace: any, name: any
returns: { type: string; namespace: any; name: any; }

### 551. jsxOpeningElement()
purpose: Function implementation
parameters: name: any, attributes: any, selfClosing?: boolean
returns: { type: string; name: any; attributes: any; selfClosing: boolean; }

### 552. jsxSpreadAttribute()
purpose: Function implementation
parameters: argument: any
returns: { type: string; argument: any; }

### 553. jsxText()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 554. jsxFragment()
purpose: Function implementation
parameters: openingFragment: any, closingFragment: any, children: any
returns: { type: string; openingFragment: any; closingFragment: any; children: any; }

### 555. jsxOpeningFragment()
purpose: Function implementation
returns: { type: string; }

### 556. jsxClosingFragment()
purpose: Function implementation
returns: { type: string; }

### 557. noop()
purpose: Function implementation
returns: { type: string; }

### 558. placeholder()
purpose: Function implementation
parameters: expectedNode: any, name: any
returns: { type: string; expectedNode: any; name: any; }

### 559. v8IntrinsicIdentifier()
purpose: Function implementation
parameters: name: any
returns: { type: string; name: any; }

### 560. argumentPlaceholder()
purpose: Function implementation
returns: { type: string; }

### 561. bindExpression()
purpose: Function implementation
parameters: object: any, callee: any
returns: { type: string; object: any; callee: any; }

### 562. decorator()
purpose: Function implementation
parameters: expression: any
returns: { type: string; expression: any; }

### 563. doExpression()
purpose: Function implementation
parameters: body: any, async?: boolean
returns: { type: string; body: any; async: boolean; }

### 564. exportDefaultSpecifier()
purpose: Function implementation
parameters: exported: any
returns: { type: string; exported: any; }

### 565. recordExpression()
purpose: Function implementation
parameters: properties: any
returns: { type: string; properties: any; }

### 566. tupleExpression()
purpose: Function implementation
parameters: elements?: any[]
returns: { type: string; elements: any[]; }

### 567. decimalLiteral()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 568. moduleExpression()
purpose: Function implementation
parameters: body: any
returns: { type: string; body: any; }

### 569. topicReference()
purpose: Function implementation
returns: { type: string; }

### 570. pipelineTopicExpression()
purpose: Function implementation
parameters: expression: any
returns: { type: string; expression: any; }

### 571. pipelineBareFunction()
purpose: Function implementation
parameters: callee: any
returns: { type: string; callee: any; }

### 572. pipelinePrimaryTopicReference()
purpose: Function implementation
returns: { type: string; }

### 573. voidPattern()
purpose: Function implementation
returns: { type: string; }

### 574. tsParameterProperty()
purpose: Function implementation
parameters: parameter: any
returns: { type: string; parameter: any; }

### 575. tsDeclareFunction()
purpose: Function implementation
parameters: id?: any, typeParameters?: any, params: any, returnType?: any
returns: { type: string; id: any; typeParameters: any; params: any; returnType: any; }

### 576. tsDeclareMethod()
purpose: Function implementation
parameters: decorators?: any, key: any, typeParameters?: any, params: any, returnType?: any
returns: { type: string; decorators: any; key: any; typeParameters: any; params: any; returnType: any; }

### 577. tsQualifiedName()
purpose: Function implementation
parameters: left: any, right: any
returns: { type: string; left: any; right: any; }

### 578. tsCallSignatureDeclaration()
purpose: Function implementation
parameters: typeParameters?: any, parameters: any, typeAnnotation?: any
returns: { type: string; typeParameters: any; parameters: any; typeAnnotation: any; }

### 579. tsConstructSignatureDeclaration()
purpose: Function implementation
parameters: typeParameters?: any, parameters: any, typeAnnotation?: any
returns: { type: string; typeParameters: any; parameters: any; typeAnnotation: any; }

### 580. tsPropertySignature()
purpose: Function implementation
parameters: key: any, typeAnnotation?: any
returns: { type: string; key: any; typeAnnotation: any; }

### 581. tsMethodSignature()
purpose: Function implementation
parameters: key: any, typeParameters?: any, parameters: any, typeAnnotation?: any
returns: { type: string; key: any; typeParameters: any; parameters: any; typeAnnotation: any; kind: any; }

### 582. tsIndexSignature()
purpose: Function implementation
parameters: parameters: any, typeAnnotation?: any
returns: { type: string; parameters: any; typeAnnotation: any; }

### 583. tsAnyKeyword()
purpose: Function implementation
returns: { type: string; }

### 584. tsBooleanKeyword()
purpose: Function implementation
returns: { type: string; }

### 585. tsBigIntKeyword()
purpose: Function implementation
returns: { type: string; }

### 586. tsIntrinsicKeyword()
purpose: Function implementation
returns: { type: string; }

### 587. tsNeverKeyword()
purpose: Function implementation
returns: { type: string; }

### 588. tsNullKeyword()
purpose: Function implementation
returns: { type: string; }

### 589. tsNumberKeyword()
purpose: Function implementation
returns: { type: string; }

### 590. tsObjectKeyword()
purpose: Function implementation
returns: { type: string; }

### 591. tsStringKeyword()
purpose: Function implementation
returns: { type: string; }

### 592. tsSymbolKeyword()
purpose: Function implementation
returns: { type: string; }

### 593. tsUndefinedKeyword()
purpose: Function implementation
returns: { type: string; }

### 594. tsUnknownKeyword()
purpose: Function implementation
returns: { type: string; }

### 595. tsVoidKeyword()
purpose: Function implementation
returns: { type: string; }

### 596. tsThisType()
purpose: Function implementation
returns: { type: string; }

### 597. tsFunctionType()
purpose: Function implementation
parameters: typeParameters?: any, parameters: any, typeAnnotation?: any
returns: { type: string; typeParameters: any; parameters: any; typeAnnotation: any; }

### 598. tsConstructorType()
purpose: Function implementation
parameters: typeParameters?: any, parameters: any, typeAnnotation?: any
returns: { type: string; typeParameters: any; parameters: any; typeAnnotation: any; }

### 599. tsTypeReference()
purpose: Function implementation
parameters: typeName: any, typeParameters?: any
returns: { type: string; typeName: any; typeParameters: any; }

### 600. tsTypePredicate()
purpose: Function implementation
parameters: parameterName: any, typeAnnotation?: any, asserts?: any
returns: { type: string; parameterName: any; typeAnnotation: any; asserts: any; }

### 601. tsTypeQuery()
purpose: Function implementation
parameters: exprName: any, typeParameters?: any
returns: { type: string; exprName: any; typeParameters: any; }

### 602. tsTypeLiteral()
purpose: Function implementation
parameters: members: any
returns: { type: string; members: any; }

### 603. tsArrayType()
purpose: Function implementation
parameters: elementType: any
returns: { type: string; elementType: any; }

### 604. tsTupleType()
purpose: Function implementation
parameters: elementTypes: any
returns: { type: string; elementTypes: any; }

### 605. tsOptionalType()
purpose: Function implementation
parameters: typeAnnotation: any
returns: { type: string; typeAnnotation: any; }

### 606. tsRestType()
purpose: Function implementation
parameters: typeAnnotation: any
returns: { type: string; typeAnnotation: any; }

### 607. tsNamedTupleMember()
purpose: Function implementation
parameters: label: any, elementType: any, optional?: boolean
returns: { type: string; label: any; elementType: any; optional: boolean; }

### 608. tsUnionType()
purpose: Function implementation
parameters: types: any
returns: { type: string; types: any; }

### 609. tsIntersectionType()
purpose: Function implementation
parameters: types: any
returns: { type: string; types: any; }

### 610. tsConditionalType()
purpose: Function implementation
parameters: checkType: any, extendsType: any, trueType: any, falseType: any
returns: { type: string; checkType: any; extendsType: any; trueType: any; falseType: any; }

### 611. tsInferType()
purpose: Function implementation
parameters: typeParameter: any
returns: { type: string; typeParameter: any; }

### 612. tsParenthesizedType()
purpose: Function implementation
parameters: typeAnnotation: any
returns: { type: string; typeAnnotation: any; }

### 613. tsTypeOperator()
purpose: Function implementation
parameters: typeAnnotation: any, operator?: string
returns: { type: string; typeAnnotation: any; operator: string; }

### 614. tsIndexedAccessType()
purpose: Function implementation
parameters: objectType: any, indexType: any
returns: { type: string; objectType: any; indexType: any; }

### 615. tsMappedType()
purpose: Function implementation
parameters: typeParameter: any, typeAnnotation?: any, nameType?: any
returns: { type: string; typeParameter: any; typeAnnotation: any; nameType: any; }

### 616. tsTemplateLiteralType()
purpose: Function implementation
parameters: quasis: any, types: any
returns: { type: string; quasis: any; types: any; }

### 617. tsLiteralType()
purpose: Function implementation
parameters: literal: any
returns: { type: string; literal: any; }

### 618. tsExpressionWithTypeArguments()
purpose: Function implementation
parameters: expression: any, typeParameters?: any
returns: { type: string; expression: any; typeParameters: any; }

### 619. tsInterfaceDeclaration()
purpose: Function implementation
parameters: id: any, typeParameters?: any, _extends?: any, body: any
returns: { type: string; id: any; typeParameters: any; extends: any; body: any; }

### 620. tsInterfaceBody()
purpose: Function implementation
parameters: body: any
returns: { type: string; body: any; }

### 621. tsTypeAliasDeclaration()
purpose: Function implementation
parameters: id: any, typeParameters?: any, typeAnnotation: any
returns: { type: string; id: any; typeParameters: any; typeAnnotation: any; }

### 622. tsInstantiationExpression()
purpose: Function implementation
parameters: expression: any, typeParameters?: any
returns: { type: string; expression: any; typeParameters: any; }

### 623. tsAsExpression()
purpose: Function implementation
parameters: expression: any, typeAnnotation: any
returns: { type: string; expression: any; typeAnnotation: any; }

### 624. tsSatisfiesExpression()
purpose: Function implementation
parameters: expression: any, typeAnnotation: any
returns: { type: string; expression: any; typeAnnotation: any; }

### 625. tsTypeAssertion()
purpose: Function implementation
parameters: typeAnnotation: any, expression: any
returns: { type: string; typeAnnotation: any; expression: any; }

### 626. tsEnumBody()
purpose: Function implementation
parameters: members: any
returns: { type: string; members: any; }

### 627. tsEnumDeclaration()
purpose: Function implementation
parameters: id: any, members: any
returns: { type: string; id: any; members: any; }

### 628. tsEnumMember()
purpose: Function implementation
parameters: id: any, initializer?: any
returns: { type: string; id: any; initializer: any; }

### 629. tsModuleDeclaration()
purpose: Function implementation
parameters: id: any, body: any
returns: { type: string; id: any; body: any; kind: any; }

### 630. tsModuleBlock()
purpose: Function implementation
parameters: body: any
returns: { type: string; body: any; }

### 631. tsImportType()
purpose: Function implementation
parameters: argument: any, qualifier?: any, typeParameters?: any
returns: { type: string; argument: any; qualifier: any; typeParameters: any; }

### 632. tsImportEqualsDeclaration()
purpose: Function implementation
parameters: id: any, moduleReference: any
returns: { type: string; id: any; moduleReference: any; isExport: any; }

### 633. tsExternalModuleReference()
purpose: Function implementation
parameters: expression: any
returns: { type: string; expression: any; }

### 634. tsNonNullExpression()
purpose: Function implementation
parameters: expression: any
returns: { type: string; expression: any; }

### 635. tsExportAssignment()
purpose: Function implementation
parameters: expression: any
returns: { type: string; expression: any; }

### 636. tsNamespaceExportDeclaration()
purpose: Function implementation
parameters: id: any
returns: { type: string; id: any; }

### 637. tsTypeAnnotation()
purpose: Function implementation
parameters: typeAnnotation: any
returns: { type: string; typeAnnotation: any; }

### 638. tsTypeParameterInstantiation()
purpose: Function implementation
parameters: params: any
returns: { type: string; params: any; }

### 639. tsTypeParameterDeclaration()
purpose: Function implementation
parameters: params: any
returns: { type: string; params: any; }

### 640. tsTypeParameter()
purpose: Function implementation
parameters: constraint?: any, _default?: any, name: any
returns: { type: string; constraint: any; default: any; name: any; }

### 641. NumberLiteral()
purpose: Function implementation
parameters: value: any
returns: { type: string; value: any; }

### 642. RegexLiteral()
purpose: Function implementation
parameters: pattern: any, flags?: string
returns: { type: string; pattern: any; flags: string; }

### 643. RestProperty()
purpose: Function implementation
parameters: argument: any
returns: { type: string; argument: any; }

### 644. SpreadProperty()
purpose: Function implementation
parameters: argument: any
returns: { type: string; argument: any; }

### 645. buildChildren()
purpose: Function implementation
parameters: node: any
returns: any[]

### 646. createTSUnionType()
purpose: Function implementation
parameters: typeAnnotations: any
returns: any

### 647. removeTypeDuplicates()
purpose: Function implementation
parameters: nodesIn: any
returns: any[]

### 648. removeTypeDuplicates()
purpose: Function implementation
parameters: nodesIn: any
returns: any[]

### 649. cleanJSXElementLiteralChild()
purpose: Function implementation
parameters: child: any, args: any
returns: void

### 650. isArrayExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 651. isAssignmentExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 652. isBinaryExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 653. isInterpreterDirective()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 654. isDirective()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 655. isDirectiveLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 656. isBlockStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 657. isBreakStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 658. isCallExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 659. isCatchClause()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 660. isConditionalExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 661. isContinueStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 662. isDebuggerStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 663. isDoWhileStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 664. isEmptyStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 665. isExpressionStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 666. isFile()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 667. isForInStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 668. isForStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 669. isFunctionDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 670. isFunctionExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 671. isIdentifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 672. isIfStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 673. isLabeledStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 674. isStringLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 675. isNumericLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 676. isNullLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 677. isBooleanLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 678. isRegExpLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 679. isLogicalExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 680. isMemberExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 681. isNewExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 682. isProgram()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 683. isObjectExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 684. isObjectMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 685. isObjectProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 686. isRestElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 687. isReturnStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 688. isSequenceExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 689. isParenthesizedExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 690. isSwitchCase()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 691. isSwitchStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 692. isThisExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 693. isThrowStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 694. isTryStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 695. isUnaryExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 696. isUpdateExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 697. isVariableDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 698. isVariableDeclarator()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 699. isWhileStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 700. isWithStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 701. isAssignmentPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 702. isArrayPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 703. isArrowFunctionExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 704. isClassBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 705. isClassExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 706. isClassDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 707. isExportAllDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 708. isExportDefaultDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 709. isExportNamedDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 710. isExportSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 711. isForOfStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 712. isImportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 713. isImportDefaultSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 714. isImportNamespaceSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 715. isImportSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 716. isImportExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 717. isMetaProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 718. isClassMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 719. isObjectPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 720. isSpreadElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 721. isSuper()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 722. isTaggedTemplateExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 723. isTemplateElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 724. isTemplateLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 725. isYieldExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 726. isAwaitExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 727. isImport()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 728. isBigIntLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 729. isExportNamespaceSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 730. isOptionalMemberExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 731. isOptionalCallExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 732. isClassProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 733. isClassAccessorProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 734. isClassPrivateProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 735. isClassPrivateMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 736. isPrivateName()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 737. isStaticBlock()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 738. isImportAttribute()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 739. isAnyTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 740. isArrayTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 741. isBooleanTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 742. isBooleanLiteralTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 743. isNullLiteralTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 744. isClassImplements()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 745. isDeclareClass()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 746. isDeclareFunction()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 747. isDeclareInterface()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 748. isDeclareModule()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 749. isDeclareModuleExports()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 750. isDeclareTypeAlias()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 751. isDeclareOpaqueType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 752. isDeclareVariable()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 753. isDeclareExportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 754. isDeclareExportAllDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 755. isDeclaredPredicate()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 756. isExistsTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 757. isFunctionTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 758. isFunctionTypeParam()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 759. isGenericTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 760. isInferredPredicate()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 761. isInterfaceExtends()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 762. isInterfaceDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 763. isInterfaceTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 764. isIntersectionTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 765. isMixedTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 766. isEmptyTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 767. isNullableTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 768. isNumberLiteralTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 769. isNumberTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 770. isObjectTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 771. isObjectTypeInternalSlot()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 772. isObjectTypeCallProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 773. isObjectTypeIndexer()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 774. isObjectTypeProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 775. isObjectTypeSpreadProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 776. isOpaqueType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 777. isQualifiedTypeIdentifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 778. isStringLiteralTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 779. isStringTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 780. isSymbolTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 781. isThisTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 782. isTupleTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 783. isTypeofTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 784. isTypeAlias()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 785. isTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 786. isTypeCastExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 787. isTypeParameter()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 788. isTypeParameterDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 789. isTypeParameterInstantiation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 790. isUnionTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 791. isVariance()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 792. isVoidTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 793. isEnumDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 794. isEnumBooleanBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 795. isEnumNumberBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 796. isEnumStringBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 797. isEnumSymbolBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 798. isEnumBooleanMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 799. isEnumNumberMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 800. isEnumStringMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 801. isEnumDefaultedMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 802. isIndexedAccessType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 803. isOptionalIndexedAccessType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 804. isJSXAttribute()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 805. isJSXClosingElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 806. isJSXElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 807. isJSXEmptyExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 808. isJSXExpressionContainer()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 809. isJSXSpreadChild()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 810. isJSXIdentifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 811. isJSXMemberExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 812. isJSXNamespacedName()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 813. isJSXOpeningElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 814. isJSXSpreadAttribute()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 815. isJSXText()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 816. isJSXFragment()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 817. isJSXOpeningFragment()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 818. isJSXClosingFragment()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 819. isNoop()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 820. isPlaceholder()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 821. isV8IntrinsicIdentifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 822. isArgumentPlaceholder()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 823. isBindExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 824. isDecorator()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 825. isDoExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 826. isExportDefaultSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 827. isRecordExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 828. isTupleExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 829. isDecimalLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 830. isModuleExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 831. isTopicReference()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 832. isPipelineTopicExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 833. isPipelineBareFunction()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 834. isPipelinePrimaryTopicReference()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 835. isVoidPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 836. isTSParameterProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 837. isTSDeclareFunction()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 838. isTSDeclareMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 839. isTSQualifiedName()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 840. isTSCallSignatureDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 841. isTSConstructSignatureDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 842. isTSPropertySignature()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 843. isTSMethodSignature()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 844. isTSIndexSignature()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 845. isTSAnyKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 846. isTSBooleanKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 847. isTSBigIntKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 848. isTSIntrinsicKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 849. isTSNeverKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 850. isTSNullKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 851. isTSNumberKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 852. isTSObjectKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 853. isTSStringKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 854. isTSSymbolKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 855. isTSUndefinedKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 856. isTSUnknownKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 857. isTSVoidKeyword()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 858. isTSThisType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 859. isTSFunctionType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 860. isTSConstructorType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 861. isTSTypeReference()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 862. isTSTypePredicate()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 863. isTSTypeQuery()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 864. isTSTypeLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 865. isTSArrayType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 866. isTSTupleType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 867. isTSOptionalType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 868. isTSRestType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 869. isTSNamedTupleMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 870. isTSUnionType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 871. isTSIntersectionType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 872. isTSConditionalType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 873. isTSInferType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 874. isTSParenthesizedType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 875. isTSTypeOperator()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 876. isTSIndexedAccessType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 877. isTSMappedType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 878. isTSTemplateLiteralType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 879. isTSLiteralType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 880. isTSExpressionWithTypeArguments()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 881. isTSInterfaceDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 882. isTSInterfaceBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 883. isTSTypeAliasDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 884. isTSInstantiationExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 885. isTSAsExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 886. isTSSatisfiesExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 887. isTSTypeAssertion()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 888. isTSEnumBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 889. isTSEnumDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 890. isTSEnumMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 891. isTSModuleDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 892. isTSModuleBlock()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 893. isTSImportType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 894. isTSImportEqualsDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 895. isTSExternalModuleReference()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 896. isTSNonNullExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 897. isTSExportAssignment()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 898. isTSNamespaceExportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 899. isTSTypeAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 900. isTSTypeParameterInstantiation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 901. isTSTypeParameterDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 902. isTSTypeParameter()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 903. isStandardized()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 904. isExpression()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 905. isBinary()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 906. isScopable()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 907. isBlockParent()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 908. isBlock()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 909. isStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 910. isTerminatorless()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 911. isCompletionStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 912. isConditional()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 913. isLoop()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 914. isWhile()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 915. isExpressionWrapper()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 916. isFor()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 917. isForXStatement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 918. isFunction()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 919. isFunctionParent()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 920. isPureish()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 921. isDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 922. isFunctionParameter()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 923. isPatternLike()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 924. isLVal()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 925. isTSEntityName()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 926. isLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 927. isImmutable()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 928. isUserWhitespacable()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 929. isMethod()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 930. isObjectMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 931. isProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 932. isUnaryLike()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 933. isPattern()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 934. isClass()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 935. isImportOrExportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 936. isExportDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 937. isModuleSpecifier()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 938. isAccessor()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 939. isPrivate()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 940. isFlow()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 941. isFlowType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 942. isFlowBaseAnnotation()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 943. isFlowDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 944. isFlowPredicate()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 945. isEnumBody()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 946. isEnumMember()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 947. isJSX()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 948. isMiscellaneous()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 949. isTypeScript()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 950. isTSTypeElement()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 951. isTSType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 952. isTSBaseType()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 953. isNumberLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 954. isRegexLiteral()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 955. isRestProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 956. isSpreadProperty()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 957. isModuleDeclaration()
purpose: Function implementation
parameters: node: any, opts: any
returns: boolean

### 958. isCompatTag()
purpose: Function implementation
parameters: tagName: any
returns: boolean

## 🔌 Exports
main_export: default
named_exports:
  - __esModule
  - __internal__deprecationWarning
  - addComment
  - addComments
  - appendToMemberExpression
  - assertNode
  - buildMatchMemberExpression
  - clone
  - cloneDeep
  - cloneDeepWithoutLoc
  - cloneNode
  - cloneWithoutLoc
  - createFlowUnionType
  - createTSUnionType
  - createTypeAnnotationBasedOnTypeof
  - createUnionTypeAnnotation
  - ensureBlock
  - getAssignmentIdentifiers
  - getBindingIdentifiers
  - getFunctionName
  - getOuterBindingIdentifiers
  - inheritInnerComments
  - inheritLeadingComments
  - inheritTrailingComments
  - inherits
  - inheritsComments
  - is
  - isBinding
  - isBlockScoped
  - isImmutable
  - isLet
  - isNode
  - isNodesEquivalent
  - isPlaceholderType
  - isReferenced
  - isScope
  - isSpecifierDefault
  - isType
  - isValidES3Identifier
  - isValidIdentifier
  - isVar
  - matchesPattern
  - prependToMemberExpression
  - removeComments
  - removeProperties
  - removePropertiesDeep
  - removeTypeDuplicates
  - shallowEqual
  - toBindingIdentifierName
  - toBlock
  - toComputedKey
  - toExpression
  - toIdentifier
  - toKeyAlias
  - toStatement
  - traverse
  - traverseFast
  - validate
  - valueToNode
  - react
  - toSequenceExpression
  - buildUndefinedNode
  - STATEMENT_OR_BLOCK_KEYS
  - FLATTENABLE_KEYS
  - FOR_INIT_KEYS
  - COMMENT_KEYS
  - LOGICAL_OPERATORS
  - UPDATE_OPERATORS
  - BOOLEAN_NUMBER_BINARY_OPERATORS
  - EQUALITY_BINARY_OPERATORS
  - COMPARISON_BINARY_OPERATORS
  - BOOLEAN_BINARY_OPERATORS
  - NUMBER_BINARY_OPERATORS
  - BINARY_OPERATORS
  - ASSIGNMENT_OPERATORS
  - BOOLEAN_UNARY_OPERATORS
  - NUMBER_UNARY_OPERATORS
  - STRING_UNARY_OPERATORS
  - UNARY_OPERATORS
  - INHERIT_KEYS
  - BLOCK_SCOPED_SYMBOL
  - NOT_LOCAL_BINDING
  - functionCommon
  - functionTypeAnnotationCommon
  - functionDeclarationCommon
  - patternLikeCommon
  - importAttributes
  - classMethodOrPropertyCommon
  - classMethodOrDeclareMethodCommon
  - DEPRECATED_ALIASES
  - ALIAS_KEYS
  - BUILDER_KEYS
  - DEPRECATED_KEYS
  - FLIPPED_ALIAS_KEYS
  - NODE_FIELDS
  - NODE_PARENT_VALIDATIONS
  - PLACEHOLDERS
  - PLACEHOLDERS_ALIAS
  - PLACEHOLDERS_FLIPPED_ALIAS
  - VISITOR_KEYS
  - TYPES
  - arrayOf
  - arrayOfType
  - assertEach
  - assertNodeOrValueType
  - assertNodeType
  - assertOneOf
  - assertOptionalChainStart
  - assertShape
  - assertValueType
  - chain
  - defineAliasedType
  - validateArrayOfType
  - validateOptional
  - validateOptionalType
  - validateType
  - allExpandedTypes
  - validateChild
  - validateField
  - validateInternal
  - assertAccessor
  - assertAnyTypeAnnotation
  - assertArgumentPlaceholder
  - assertArrayExpression
  - assertArrayPattern
  - assertArrayTypeAnnotation
  - assertArrowFunctionExpression
  - assertAssignmentExpression
  - assertAssignmentPattern
  - assertAwaitExpression
  - assertBigIntLiteral
  - assertBinary
  - assertBinaryExpression
  - assertBindExpression
  - assertBlock
  - assertBlockParent
  - assertBlockStatement
  - assertBooleanLiteral
  - assertBooleanLiteralTypeAnnotation
  - assertBooleanTypeAnnotation
  - assertBreakStatement
  - assertCallExpression
  - assertCatchClause
  - assertClass
  - assertClassAccessorProperty
  - assertClassBody
  - assertClassDeclaration
  - assertClassExpression
  - assertClassImplements
  - assertClassMethod
  - assertClassPrivateMethod
  - assertClassPrivateProperty
  - assertClassProperty
  - assertCompletionStatement
  - assertConditional
  - assertConditionalExpression
  - assertContinueStatement
  - assertDebuggerStatement
  - assertDecimalLiteral
  - assertDeclaration
  - assertDeclareClass
  - assertDeclareExportAllDeclaration
  - assertDeclareExportDeclaration
  - assertDeclareFunction
  - assertDeclareInterface
  - assertDeclareModule
  - assertDeclareModuleExports
  - assertDeclareOpaqueType
  - assertDeclareTypeAlias
  - assertDeclareVariable
  - assertDeclaredPredicate
  - assertDecorator
  - assertDirective
  - assertDirectiveLiteral
  - assertDoExpression
  - assertDoWhileStatement
  - assertEmptyStatement
  - assertEmptyTypeAnnotation
  - assertEnumBody
  - assertEnumBooleanBody
  - assertEnumBooleanMember
  - assertEnumDeclaration
  - assertEnumDefaultedMember
  - assertEnumMember
  - assertEnumNumberBody
  - assertEnumNumberMember
  - assertEnumStringBody
  - assertEnumStringMember
  - assertEnumSymbolBody
  - assertExistsTypeAnnotation
  - assertExportAllDeclaration
  - assertExportDeclaration
  - assertExportDefaultDeclaration
  - assertExportDefaultSpecifier
  - assertExportNamedDeclaration
  - assertExportNamespaceSpecifier
  - assertExportSpecifier
  - assertExpression
  - assertExpressionStatement
  - assertExpressionWrapper
  - assertFile
  - assertFlow
  - assertFlowBaseAnnotation
  - assertFlowDeclaration
  - assertFlowPredicate
  - assertFlowType
  - assertFor
  - assertForInStatement
  - assertForOfStatement
  - assertForStatement
  - assertForXStatement
  - assertFunction
  - assertFunctionDeclaration
  - assertFunctionExpression
  - assertFunctionParameter
  - assertFunctionParent
  - assertFunctionTypeAnnotation
  - assertFunctionTypeParam
  - assertGenericTypeAnnotation
  - assertIdentifier
  - assertIfStatement
  - assertImmutable
  - assertImport
  - assertImportAttribute
  - assertImportDeclaration
  - assertImportDefaultSpecifier
  - assertImportExpression
  - assertImportNamespaceSpecifier
  - assertImportOrExportDeclaration
  - assertImportSpecifier
  - assertIndexedAccessType
  - assertInferredPredicate
  - assertInterfaceDeclaration
  - assertInterfaceExtends
  - assertInterfaceTypeAnnotation
  - assertInterpreterDirective
  - assertIntersectionTypeAnnotation
  - assertJSX
  - assertJSXAttribute
  - assertJSXClosingElement
  - assertJSXClosingFragment
  - assertJSXElement
  - assertJSXEmptyExpression
  - assertJSXExpressionContainer
  - assertJSXFragment
  - assertJSXIdentifier
  - assertJSXMemberExpression
  - assertJSXNamespacedName
  - assertJSXOpeningElement
  - assertJSXOpeningFragment
  - assertJSXSpreadAttribute
  - assertJSXSpreadChild
  - assertJSXText
  - assertLVal
  - assertLabeledStatement
  - assertLiteral
  - assertLogicalExpression
  - assertLoop
  - assertMemberExpression
  - assertMetaProperty
  - assertMethod
  - assertMiscellaneous
  - assertMixedTypeAnnotation
  - assertModuleDeclaration
  - assertModuleExpression
  - assertModuleSpecifier
  - assertNewExpression
  - assertNoop
  - assertNullLiteral
  - assertNullLiteralTypeAnnotation
  - assertNullableTypeAnnotation
  - assertNumberLiteral
  - assertNumberLiteralTypeAnnotation
  - assertNumberTypeAnnotation
  - assertNumericLiteral
  - assertObjectExpression
  - assertObjectMember
  - assertObjectMethod
  - assertObjectPattern
  - assertObjectProperty
  - assertObjectTypeAnnotation
  - assertObjectTypeCallProperty
  - assertObjectTypeIndexer
  - assertObjectTypeInternalSlot
  - assertObjectTypeProperty
  - assertObjectTypeSpreadProperty
  - assertOpaqueType
  - assertOptionalCallExpression
  - assertOptionalIndexedAccessType
  - assertOptionalMemberExpression
  - assertParenthesizedExpression
  - assertPattern
  - assertPatternLike
  - assertPipelineBareFunction
  - assertPipelinePrimaryTopicReference
  - assertPipelineTopicExpression
  - assertPlaceholder
  - assertPrivate
  - assertPrivateName
  - assertProgram
  - assertProperty
  - assertPureish
  - assertQualifiedTypeIdentifier
  - assertRecordExpression
  - assertRegExpLiteral
  - assertRegexLiteral
  - assertRestElement
  - assertRestProperty
  - assertReturnStatement
  - assertScopable
  - assertSequenceExpression
  - assertSpreadElement
  - assertSpreadProperty
  - assertStandardized
  - assertStatement
  - assertStaticBlock
  - assertStringLiteral
  - assertStringLiteralTypeAnnotation
  - assertStringTypeAnnotation
  - assertSuper
  - assertSwitchCase
  - assertSwitchStatement
  - assertSymbolTypeAnnotation
  - assertTSAnyKeyword
  - assertTSArrayType
  - assertTSAsExpression
  - assertTSBaseType
  - assertTSBigIntKeyword
  - assertTSBooleanKeyword
  - assertTSCallSignatureDeclaration
  - assertTSConditionalType
  - assertTSConstructSignatureDeclaration
  - assertTSConstructorType
  - assertTSDeclareFunction
  - assertTSDeclareMethod
  - assertTSEntityName
  - assertTSEnumBody
  - assertTSEnumDeclaration
  - assertTSEnumMember
  - assertTSExportAssignment
  - assertTSExpressionWithTypeArguments
  - assertTSExternalModuleReference
  - assertTSFunctionType
  - assertTSImportEqualsDeclaration
  - assertTSImportType
  - assertTSIndexSignature
  - assertTSIndexedAccessType
  - assertTSInferType
  - assertTSInstantiationExpression
  - assertTSInterfaceBody
  - assertTSInterfaceDeclaration
  - assertTSIntersectionType
  - assertTSIntrinsicKeyword
  - assertTSLiteralType
  - assertTSMappedType
  - assertTSMethodSignature
  - assertTSModuleBlock
  - assertTSModuleDeclaration
  - assertTSNamedTupleMember
  - assertTSNamespaceExportDeclaration
  - assertTSNeverKeyword
  - assertTSNonNullExpression
  - assertTSNullKeyword
  - assertTSNumberKeyword
  - assertTSObjectKeyword
  - assertTSOptionalType
  - assertTSParameterProperty
  - assertTSParenthesizedType
  - assertTSPropertySignature
  - assertTSQualifiedName
  - assertTSRestType
  - assertTSSatisfiesExpression
  - assertTSStringKeyword
  - assertTSSymbolKeyword
  - assertTSTemplateLiteralType
  - assertTSThisType
  - assertTSTupleType
  - assertTSType
  - assertTSTypeAliasDeclaration
  - assertTSTypeAnnotation
  - assertTSTypeAssertion
  - assertTSTypeElement
  - assertTSTypeLiteral
  - assertTSTypeOperator
  - assertTSTypeParameter
  - assertTSTypeParameterDeclaration
  - assertTSTypeParameterInstantiation
  - assertTSTypePredicate
  - assertTSTypeQuery
  - assertTSTypeReference
  - assertTSUndefinedKeyword
  - assertTSUnionType
  - assertTSUnknownKeyword
  - assertTSVoidKeyword
  - assertTaggedTemplateExpression
  - assertTemplateElement
  - assertTemplateLiteral
  - assertTerminatorless
  - assertThisExpression
  - assertThisTypeAnnotation
  - assertThrowStatement
  - assertTopicReference
  - assertTryStatement
  - assertTupleExpression
  - assertTupleTypeAnnotation
  - assertTypeAlias
  - assertTypeAnnotation
  - assertTypeCastExpression
  - assertTypeParameter
  - assertTypeParameterDeclaration
  - assertTypeParameterInstantiation
  - assertTypeScript
  - assertTypeofTypeAnnotation
  - assertUnaryExpression
  - assertUnaryLike
  - assertUnionTypeAnnotation
  - assertUpdateExpression
  - assertUserWhitespacable
  - assertV8IntrinsicIdentifier
  - assertVariableDeclaration
  - assertVariableDeclarator
  - assertVariance
  - assertVoidPattern
  - assertVoidTypeAnnotation
  - assertWhile
  - assertWhileStatement
  - assertWithStatement
  - assertYieldExpression
  - anyTypeAnnotation
  - argumentPlaceholder
  - arrayExpression
  - arrayPattern
  - arrayTypeAnnotation
  - arrowFunctionExpression
  - assignmentExpression
  - assignmentPattern
  - awaitExpression
  - bigIntLiteral
  - binaryExpression
  - bindExpression
  - blockStatement
  - booleanLiteral
  - booleanLiteralTypeAnnotation
  - booleanTypeAnnotation
  - breakStatement
  - callExpression
  - catchClause
  - classAccessorProperty
  - classBody
  - classDeclaration
  - classExpression
  - classImplements
  - classMethod
  - classPrivateMethod
  - classPrivateProperty
  - classProperty
  - conditionalExpression
  - continueStatement
  - debuggerStatement
  - decimalLiteral
  - declareClass
  - declareExportAllDeclaration
  - declareExportDeclaration
  - declareFunction
  - declareInterface
  - declareModule
  - declareModuleExports
  - declareOpaqueType
  - declareTypeAlias
  - declareVariable
  - declaredPredicate
  - decorator
  - directive
  - directiveLiteral
  - doExpression
  - doWhileStatement
  - emptyStatement
  - emptyTypeAnnotation
  - enumBooleanBody
  - enumBooleanMember
  - enumDeclaration
  - enumDefaultedMember
  - enumNumberBody
  - enumNumberMember
  - enumStringBody
  - enumStringMember
  - enumSymbolBody
  - existsTypeAnnotation
  - exportAllDeclaration
  - exportDefaultDeclaration
  - exportDefaultSpecifier
  - exportNamedDeclaration
  - exportNamespaceSpecifier
  - exportSpecifier
  - expressionStatement
  - file
  - forInStatement
  - forOfStatement
  - forStatement
  - functionDeclaration
  - functionExpression
  - functionTypeAnnotation
  - functionTypeParam
  - genericTypeAnnotation
  - identifier
  - ifStatement
  - import
  - importAttribute
  - importDeclaration
  - importDefaultSpecifier
  - importExpression
  - importNamespaceSpecifier
  - importSpecifier
  - indexedAccessType
  - inferredPredicate
  - interfaceDeclaration
  - interfaceExtends
  - interfaceTypeAnnotation
  - interpreterDirective
  - intersectionTypeAnnotation
  - jSXAttribute
  - jsxAttribute
  - jSXClosingElement
  - jsxClosingElement
  - jSXClosingFragment
  - jsxClosingFragment
  - jSXElement
  - jsxElement
  - jSXEmptyExpression
  - jsxEmptyExpression
  - jSXExpressionContainer
  - jsxExpressionContainer
  - jSXFragment
  - jsxFragment
  - jSXIdentifier
  - jsxIdentifier
  - jSXMemberExpression
  - jsxMemberExpression
  - jSXNamespacedName
  - jsxNamespacedName
  - jSXOpeningElement
  - jsxOpeningElement
  - jSXOpeningFragment
  - jsxOpeningFragment
  - jSXSpreadAttribute
  - jsxSpreadAttribute
  - jSXSpreadChild
  - jsxSpreadChild
  - jSXText
  - jsxText
  - labeledStatement
  - logicalExpression
  - memberExpression
  - metaProperty
  - mixedTypeAnnotation
  - moduleExpression
  - newExpression
  - noop
  - nullLiteral
  - nullLiteralTypeAnnotation
  - nullableTypeAnnotation
  - numberLiteral
  - numberLiteralTypeAnnotation
  - numberTypeAnnotation
  - numericLiteral
  - objectExpression
  - objectMethod
  - objectPattern
  - objectProperty
  - objectTypeAnnotation
  - objectTypeCallProperty
  - objectTypeIndexer
  - objectTypeInternalSlot
  - objectTypeProperty
  - objectTypeSpreadProperty
  - opaqueType
  - optionalCallExpression
  - optionalIndexedAccessType
  - optionalMemberExpression
  - parenthesizedExpression
  - pipelineBareFunction
  - pipelinePrimaryTopicReference
  - pipelineTopicExpression
  - placeholder
  - privateName
  - program
  - qualifiedTypeIdentifier
  - recordExpression
  - regExpLiteral
  - regexLiteral
  - restElement
  - restProperty
  - returnStatement
  - sequenceExpression
  - spreadElement
  - spreadProperty
  - staticBlock
  - stringLiteral
  - stringLiteralTypeAnnotation
  - stringTypeAnnotation
  - super
  - switchCase
  - switchStatement
  - symbolTypeAnnotation
  - taggedTemplateExpression
  - templateElement
  - templateLiteral
  - thisExpression
  - thisTypeAnnotation
  - throwStatement
  - topicReference
  - tryStatement
  - tSAnyKeyword
  - tsAnyKeyword
  - tSArrayType
  - tsArrayType
  - tSAsExpression
  - tsAsExpression
  - tSBigIntKeyword
  - tsBigIntKeyword
  - tSBooleanKeyword
  - tsBooleanKeyword
  - tSCallSignatureDeclaration
  - tsCallSignatureDeclaration
  - tSConditionalType
  - tsConditionalType
  - tSConstructSignatureDeclaration
  - tsConstructSignatureDeclaration
  - tSConstructorType
  - tsConstructorType
  - tSDeclareFunction
  - tsDeclareFunction
  - tSDeclareMethod
  - tsDeclareMethod
  - tSEnumBody
  - tsEnumBody
  - tSEnumDeclaration
  - tsEnumDeclaration
  - tSEnumMember
  - tsEnumMember
  - tSExportAssignment
  - tsExportAssignment
  - tSExpressionWithTypeArguments
  - tsExpressionWithTypeArguments
  - tSExternalModuleReference
  - tsExternalModuleReference
  - tSFunctionType
  - tsFunctionType
  - tSImportEqualsDeclaration
  - tsImportEqualsDeclaration
  - tSImportType
  - tsImportType
  - tSIndexSignature
  - tsIndexSignature
  - tSIndexedAccessType
  - tsIndexedAccessType
  - tSInferType
  - tsInferType
  - tSInstantiationExpression
  - tsInstantiationExpression
  - tSInterfaceBody
  - tsInterfaceBody
  - tSInterfaceDeclaration
  - tsInterfaceDeclaration
  - tSIntersectionType
  - tsIntersectionType
  - tSIntrinsicKeyword
  - tsIntrinsicKeyword
  - tSLiteralType
  - tsLiteralType
  - tSMappedType
  - tsMappedType
  - tSMethodSignature
  - tsMethodSignature
  - tSModuleBlock
  - tsModuleBlock
  - tSModuleDeclaration
  - tsModuleDeclaration
  - tSNamedTupleMember
  - tsNamedTupleMember
  - tSNamespaceExportDeclaration
  - tsNamespaceExportDeclaration
  - tSNeverKeyword
  - tsNeverKeyword
  - tSNonNullExpression
  - tsNonNullExpression
  - tSNullKeyword
  - tsNullKeyword
  - tSNumberKeyword
  - tsNumberKeyword
  - tSObjectKeyword
  - tsObjectKeyword
  - tSOptionalType
  - tsOptionalType
  - tSParameterProperty
  - tsParameterProperty
  - tSParenthesizedType
  - tsParenthesizedType
  - tSPropertySignature
  - tsPropertySignature
  - tSQualifiedName
  - tsQualifiedName
  - tSRestType
  - tsRestType
  - tSSatisfiesExpression
  - tsSatisfiesExpression
  - tSStringKeyword
  - tsStringKeyword
  - tSSymbolKeyword
  - tsSymbolKeyword
  - tSTemplateLiteralType
  - tsTemplateLiteralType
  - tSThisType
  - tsThisType
  - tSTupleType
  - tsTupleType
  - tSTypeAliasDeclaration
  - tsTypeAliasDeclaration
  - tSTypeAnnotation
  - tsTypeAnnotation
  - tSTypeAssertion
  - tsTypeAssertion
  - tSTypeLiteral
  - tsTypeLiteral
  - tSTypeOperator
  - tsTypeOperator
  - tSTypeParameter
  - tsTypeParameter
  - tSTypeParameterDeclaration
  - tsTypeParameterDeclaration
  - tSTypeParameterInstantiation
  - tsTypeParameterInstantiation
  - tSTypePredicate
  - tsTypePredicate
  - tSTypeQuery
  - tsTypeQuery
  - tSTypeReference
  - tsTypeReference
  - tSUndefinedKeyword
  - tsUndefinedKeyword
  - tSUnionType
  - tsUnionType
  - tSUnknownKeyword
  - tsUnknownKeyword
  - tSVoidKeyword
  - tsVoidKeyword
  - tupleExpression
  - tupleTypeAnnotation
  - typeAlias
  - typeAnnotation
  - typeCastExpression
  - typeParameter
  - typeParameterDeclaration
  - typeParameterInstantiation
  - typeofTypeAnnotation
  - unaryExpression
  - unionTypeAnnotation
  - updateExpression
  - v8IntrinsicIdentifier
  - variableDeclaration
  - variableDeclarator
  - variance
  - voidPattern
  - voidTypeAnnotation
  - whileStatement
  - withStatement
  - yieldExpression
  - ArrayExpression
  - AssignmentExpression
  - BinaryExpression
  - InterpreterDirective
  - Directive
  - DirectiveLiteral
  - BlockStatement
  - BreakStatement
  - CallExpression
  - CatchClause
  - ConditionalExpression
  - ContinueStatement
  - DebuggerStatement
  - DoWhileStatement
  - EmptyStatement
  - ExpressionStatement
  - File
  - ForInStatement
  - ForStatement
  - FunctionDeclaration
  - FunctionExpression
  - Identifier
  - IfStatement
  - LabeledStatement
  - StringLiteral
  - NumericLiteral
  - NullLiteral
  - BooleanLiteral
  - RegExpLiteral
  - LogicalExpression
  - MemberExpression
  - NewExpression
  - Program
  - ObjectExpression
  - ObjectMethod
  - ObjectProperty
  - RestElement
  - ReturnStatement
  - SequenceExpression
  - ParenthesizedExpression
  - SwitchCase
  - SwitchStatement
  - ThisExpression
  - ThrowStatement
  - TryStatement
  - UnaryExpression
  - UpdateExpression
  - VariableDeclaration
  - VariableDeclarator
  - WhileStatement
  - WithStatement
  - AssignmentPattern
  - ArrayPattern
  - ArrowFunctionExpression
  - ClassBody
  - ClassExpression
  - ClassDeclaration
  - ExportAllDeclaration
  - ExportDefaultDeclaration
  - ExportNamedDeclaration
  - ExportSpecifier
  - ForOfStatement
  - ImportDeclaration
  - ImportDefaultSpecifier
  - ImportNamespaceSpecifier
  - ImportSpecifier
  - ImportExpression
  - MetaProperty
  - ClassMethod
  - ObjectPattern
  - SpreadElement
  - Super
  - TaggedTemplateExpression
  - TemplateElement
  - TemplateLiteral
  - YieldExpression
  - AwaitExpression
  - Import
  - BigIntLiteral
  - ExportNamespaceSpecifier
  - OptionalMemberExpression
  - OptionalCallExpression
  - ClassProperty
  - ClassAccessorProperty
  - ClassPrivateProperty
  - ClassPrivateMethod
  - PrivateName
  - StaticBlock
  - ImportAttribute
  - AnyTypeAnnotation
  - ArrayTypeAnnotation
  - BooleanTypeAnnotation
  - BooleanLiteralTypeAnnotation
  - NullLiteralTypeAnnotation
  - ClassImplements
  - DeclareClass
  - DeclareFunction
  - DeclareInterface
  - DeclareModule
  - DeclareModuleExports
  - DeclareTypeAlias
  - DeclareOpaqueType
  - DeclareVariable
  - DeclareExportDeclaration
  - DeclareExportAllDeclaration
  - DeclaredPredicate
  - ExistsTypeAnnotation
  - FunctionTypeAnnotation
  - FunctionTypeParam
  - GenericTypeAnnotation
  - InferredPredicate
  - InterfaceExtends
  - InterfaceDeclaration
  - InterfaceTypeAnnotation
  - IntersectionTypeAnnotation
  - MixedTypeAnnotation
  - EmptyTypeAnnotation
  - NullableTypeAnnotation
  - NumberLiteralTypeAnnotation
  - NumberTypeAnnotation
  - ObjectTypeAnnotation
  - ObjectTypeInternalSlot
  - ObjectTypeCallProperty
  - ObjectTypeIndexer
  - ObjectTypeProperty
  - ObjectTypeSpreadProperty
  - OpaqueType
  - QualifiedTypeIdentifier
  - StringLiteralTypeAnnotation
  - StringTypeAnnotation
  - SymbolTypeAnnotation
  - ThisTypeAnnotation
  - TupleTypeAnnotation
  - TypeofTypeAnnotation
  - TypeAlias
  - TypeAnnotation
  - TypeCastExpression
  - TypeParameter
  - TypeParameterDeclaration
  - TypeParameterInstantiation
  - UnionTypeAnnotation
  - Variance
  - VoidTypeAnnotation
  - EnumDeclaration
  - EnumBooleanBody
  - EnumNumberBody
  - EnumStringBody
  - EnumSymbolBody
  - EnumBooleanMember
  - EnumNumberMember
  - EnumStringMember
  - EnumDefaultedMember
  - IndexedAccessType
  - OptionalIndexedAccessType
  - JSXAttribute
  - JSXClosingElement
  - JSXElement
  - JSXEmptyExpression
  - JSXExpressionContainer
  - JSXSpreadChild
  - JSXIdentifier
  - JSXMemberExpression
  - JSXNamespacedName
  - JSXOpeningElement
  - JSXSpreadAttribute
  - JSXText
  - JSXFragment
  - JSXOpeningFragment
  - JSXClosingFragment
  - Noop
  - Placeholder
  - V8IntrinsicIdentifier
  - ArgumentPlaceholder
  - BindExpression
  - Decorator
  - DoExpression
  - ExportDefaultSpecifier
  - RecordExpression
  - TupleExpression
  - DecimalLiteral
  - ModuleExpression
  - TopicReference
  - PipelineTopicExpression
  - PipelineBareFunction
  - PipelinePrimaryTopicReference
  - VoidPattern
  - TSParameterProperty
  - TSDeclareFunction
  - TSDeclareMethod
  - TSQualifiedName
  - TSCallSignatureDeclaration
  - TSConstructSignatureDeclaration
  - TSPropertySignature
  - TSMethodSignature
  - TSIndexSignature
  - TSAnyKeyword
  - TSBooleanKeyword
  - TSBigIntKeyword
  - TSIntrinsicKeyword
  - TSNeverKeyword
  - TSNullKeyword
  - TSNumberKeyword
  - TSObjectKeyword
  - TSStringKeyword
  - TSSymbolKeyword
  - TSUndefinedKeyword
  - TSUnknownKeyword
  - TSVoidKeyword
  - TSThisType
  - TSFunctionType
  - TSConstructorType
  - TSTypeReference
  - TSTypePredicate
  - TSTypeQuery
  - TSTypeLiteral
  - TSArrayType
  - TSTupleType
  - TSOptionalType
  - TSRestType
  - TSNamedTupleMember
  - TSUnionType
  - TSIntersectionType
  - TSConditionalType
  - TSInferType
  - TSParenthesizedType
  - TSTypeOperator
  - TSIndexedAccessType
  - TSMappedType
  - TSTemplateLiteralType
  - TSLiteralType
  - TSExpressionWithTypeArguments
  - TSInterfaceDeclaration
  - TSInterfaceBody
  - TSTypeAliasDeclaration
  - TSInstantiationExpression
  - TSAsExpression
  - TSSatisfiesExpression
  - TSTypeAssertion
  - TSEnumBody
  - TSEnumDeclaration
  - TSEnumMember
  - TSModuleDeclaration
  - TSModuleBlock
  - TSImportType
  - TSImportEqualsDeclaration
  - TSExternalModuleReference
  - TSNonNullExpression
  - TSExportAssignment
  - TSNamespaceExportDeclaration
  - TSTypeAnnotation
  - TSTypeParameterInstantiation
  - TSTypeParameterDeclaration
  - TSTypeParameter
  - NumberLiteral
  - RegexLiteral
  - RestProperty
  - SpreadProperty
  - STANDARDIZED_TYPES
  - EXPRESSION_TYPES
  - BINARY_TYPES
  - SCOPABLE_TYPES
  - BLOCKPARENT_TYPES
  - BLOCK_TYPES
  - STATEMENT_TYPES
  - TERMINATORLESS_TYPES
  - COMPLETIONSTATEMENT_TYPES
  - CONDITIONAL_TYPES
  - LOOP_TYPES
  - WHILE_TYPES
  - EXPRESSIONWRAPPER_TYPES
  - FOR_TYPES
  - FORXSTATEMENT_TYPES
  - FUNCTION_TYPES
  - FUNCTIONPARENT_TYPES
  - PUREISH_TYPES
  - DECLARATION_TYPES
  - FUNCTIONPARAMETER_TYPES
  - PATTERNLIKE_TYPES
  - LVAL_TYPES
  - TSENTITYNAME_TYPES
  - LITERAL_TYPES
  - IMMUTABLE_TYPES
  - USERWHITESPACABLE_TYPES
  - METHOD_TYPES
  - OBJECTMEMBER_TYPES
  - PROPERTY_TYPES
  - UNARYLIKE_TYPES
  - PATTERN_TYPES
  - CLASS_TYPES
  - IMPORTOREXPORTDECLARATION_TYPES
  - EXPORTDECLARATION_TYPES
  - MODULESPECIFIER_TYPES
  - ACCESSOR_TYPES
  - PRIVATE_TYPES
  - FLOW_TYPES
  - FLOWTYPE_TYPES
  - FLOWBASEANNOTATION_TYPES
  - FLOWDECLARATION_TYPES
  - FLOWPREDICATE_TYPES
  - ENUMBODY_TYPES
  - ENUMMEMBER_TYPES
  - JSX_TYPES
  - MISCELLANEOUS_TYPES
  - TYPESCRIPT_TYPES
  - TSTYPEELEMENT_TYPES
  - TSTYPE_TYPES
  - TSBASETYPE_TYPES
  - MODULEDECLARATION_TYPES
  - isAccessor
  - isAnyTypeAnnotation
  - isArgumentPlaceholder
  - isArrayExpression
  - isArrayPattern
  - isArrayTypeAnnotation
  - isArrowFunctionExpression
  - isAssignmentExpression
  - isAssignmentPattern
  - isAwaitExpression
  - isBigIntLiteral
  - isBinary
  - isBinaryExpression
  - isBindExpression
  - isBlock
  - isBlockParent
  - isBlockStatement
  - isBooleanLiteral
  - isBooleanLiteralTypeAnnotation
  - isBooleanTypeAnnotation
  - isBreakStatement
  - isCallExpression
  - isCatchClause
  - isClass
  - isClassAccessorProperty
  - isClassBody
  - isClassDeclaration
  - isClassExpression
  - isClassImplements
  - isClassMethod
  - isClassPrivateMethod
  - isClassPrivateProperty
  - isClassProperty
  - isCompletionStatement
  - isConditional
  - isConditionalExpression
  - isContinueStatement
  - isDebuggerStatement
  - isDecimalLiteral
  - isDeclaration
  - isDeclareClass
  - isDeclareExportAllDeclaration
  - isDeclareExportDeclaration
  - isDeclareFunction
  - isDeclareInterface
  - isDeclareModule
  - isDeclareModuleExports
  - isDeclareOpaqueType
  - isDeclareTypeAlias
  - isDeclareVariable
  - isDeclaredPredicate
  - isDecorator
  - isDirective
  - isDirectiveLiteral
  - isDoExpression
  - isDoWhileStatement
  - isEmptyStatement
  - isEmptyTypeAnnotation
  - isEnumBody
  - isEnumBooleanBody
  - isEnumBooleanMember
  - isEnumDeclaration
  - isEnumDefaultedMember
  - isEnumMember
  - isEnumNumberBody
  - isEnumNumberMember
  - isEnumStringBody
  - isEnumStringMember
  - isEnumSymbolBody
  - isExistsTypeAnnotation
  - isExportAllDeclaration
  - isExportDeclaration
  - isExportDefaultDeclaration
  - isExportDefaultSpecifier
  - isExportNamedDeclaration
  - isExportNamespaceSpecifier
  - isExportSpecifier
  - isExpression
  - isExpressionStatement
  - isExpressionWrapper
  - isFile
  - isFlow
  - isFlowBaseAnnotation
  - isFlowDeclaration
  - isFlowPredicate
  - isFlowType
  - isFor
  - isForInStatement
  - isForOfStatement
  - isForStatement
  - isForXStatement
  - isFunction
  - isFunctionDeclaration
  - isFunctionExpression
  - isFunctionParameter
  - isFunctionParent
  - isFunctionTypeAnnotation
  - isFunctionTypeParam
  - isGenericTypeAnnotation
  - isIdentifier
  - isIfStatement
  - isImport
  - isImportAttribute
  - isImportDeclaration
  - isImportDefaultSpecifier
  - isImportExpression
  - isImportNamespaceSpecifier
  - isImportOrExportDeclaration
  - isImportSpecifier
  - isIndexedAccessType
  - isInferredPredicate
  - isInterfaceDeclaration
  - isInterfaceExtends
  - isInterfaceTypeAnnotation
  - isInterpreterDirective
  - isIntersectionTypeAnnotation
  - isJSX
  - isJSXAttribute
  - isJSXClosingElement
  - isJSXClosingFragment
  - isJSXElement
  - isJSXEmptyExpression
  - isJSXExpressionContainer
  - isJSXFragment
  - isJSXIdentifier
  - isJSXMemberExpression
  - isJSXNamespacedName
  - isJSXOpeningElement
  - isJSXOpeningFragment
  - isJSXSpreadAttribute
  - isJSXSpreadChild
  - isJSXText
  - isLVal
  - isLabeledStatement
  - isLiteral
  - isLogicalExpression
  - isLoop
  - isMemberExpression
  - isMetaProperty
  - isMethod
  - isMiscellaneous
  - isMixedTypeAnnotation
  - isModuleDeclaration
  - isModuleExpression
  - isModuleSpecifier
  - isNewExpression
  - isNoop
  - isNullLiteral
  - isNullLiteralTypeAnnotation
  - isNullableTypeAnnotation
  - isNumberLiteral
  - isNumberLiteralTypeAnnotation
  - isNumberTypeAnnotation
  - isNumericLiteral
  - isObjectExpression
  - isObjectMember
  - isObjectMethod
  - isObjectPattern
  - isObjectProperty
  - isObjectTypeAnnotation
  - isObjectTypeCallProperty
  - isObjectTypeIndexer
  - isObjectTypeInternalSlot
  - isObjectTypeProperty
  - isObjectTypeSpreadProperty
  - isOpaqueType
  - isOptionalCallExpression
  - isOptionalIndexedAccessType
  - isOptionalMemberExpression
  - isParenthesizedExpression
  - isPattern
  - isPatternLike
  - isPipelineBareFunction
  - isPipelinePrimaryTopicReference
  - isPipelineTopicExpression
  - isPlaceholder
  - isPrivate
  - isPrivateName
  - isProgram
  - isProperty
  - isPureish
  - isQualifiedTypeIdentifier
  - isRecordExpression
  - isRegExpLiteral
  - isRegexLiteral
  - isRestElement
  - isRestProperty
  - isReturnStatement
  - isScopable
  - isSequenceExpression
  - isSpreadElement
  - isSpreadProperty
  - isStandardized
  - isStatement
  - isStaticBlock
  - isStringLiteral
  - isStringLiteralTypeAnnotation
  - isStringTypeAnnotation
  - isSuper
  - isSwitchCase
  - isSwitchStatement
  - isSymbolTypeAnnotation
  - isTSAnyKeyword
  - isTSArrayType
  - isTSAsExpression
  - isTSBaseType
  - isTSBigIntKeyword
  - isTSBooleanKeyword
  - isTSCallSignatureDeclaration
  - isTSConditionalType
  - isTSConstructSignatureDeclaration
  - isTSConstructorType
  - isTSDeclareFunction
  - isTSDeclareMethod
  - isTSEntityName
  - isTSEnumBody
  - isTSEnumDeclaration
  - isTSEnumMember
  - isTSExportAssignment
  - isTSExpressionWithTypeArguments
  - isTSExternalModuleReference
  - isTSFunctionType
  - isTSImportEqualsDeclaration
  - isTSImportType
  - isTSIndexSignature
  - isTSIndexedAccessType
  - isTSInferType
  - isTSInstantiationExpression
  - isTSInterfaceBody
  - isTSInterfaceDeclaration
  - isTSIntersectionType
  - isTSIntrinsicKeyword
  - isTSLiteralType
  - isTSMappedType
  - isTSMethodSignature
  - isTSModuleBlock
  - isTSModuleDeclaration
  - isTSNamedTupleMember
  - isTSNamespaceExportDeclaration
  - isTSNeverKeyword
  - isTSNonNullExpression
  - isTSNullKeyword
  - isTSNumberKeyword
  - isTSObjectKeyword
  - isTSOptionalType
  - isTSParameterProperty
  - isTSParenthesizedType
  - isTSPropertySignature
  - isTSQualifiedName
  - isTSRestType
  - isTSSatisfiesExpression
  - isTSStringKeyword
  - isTSSymbolKeyword
  - isTSTemplateLiteralType
  - isTSThisType
  - isTSTupleType
  - isTSType
  - isTSTypeAliasDeclaration
  - isTSTypeAnnotation
  - isTSTypeAssertion
  - isTSTypeElement
  - isTSTypeLiteral
  - isTSTypeOperator
  - isTSTypeParameter
  - isTSTypeParameterDeclaration
  - isTSTypeParameterInstantiation
  - isTSTypePredicate
  - isTSTypeQuery
  - isTSTypeReference
  - isTSUndefinedKeyword
  - isTSUnionType
  - isTSUnknownKeyword
  - isTSVoidKeyword
  - isTaggedTemplateExpression
  - isTemplateElement
  - isTemplateLiteral
  - isTerminatorless
  - isThisExpression
  - isThisTypeAnnotation
  - isThrowStatement
  - isTopicReference
  - isTryStatement
  - isTupleExpression
  - isTupleTypeAnnotation
  - isTypeAlias
  - isTypeAnnotation
  - isTypeCastExpression
  - isTypeParameter
  - isTypeParameterDeclaration
  - isTypeParameterInstantiation
  - isTypeScript
  - isTypeofTypeAnnotation
  - isUnaryExpression
  - isUnaryLike
  - isUnionTypeAnnotation
  - isUpdateExpression
  - isUserWhitespacable
  - isV8IntrinsicIdentifier
  - isVariableDeclaration
  - isVariableDeclarator
  - isVariance
  - isVoidPattern
  - isVoidTypeAnnotation
  - isWhile
  - isWhileStatement
  - isWithStatement
  - isYieldExpression

## 🔗 Dependencies
  - @babel/helper-string-parser: ^7.27.1
  - @babel/helper-validator-identifier: ^7.27.1

### Development Dependencies
  - @babel/generator: ^7.28.0
  - @babel/parser: ^7.28.0
  - glob: ^7.2.0
