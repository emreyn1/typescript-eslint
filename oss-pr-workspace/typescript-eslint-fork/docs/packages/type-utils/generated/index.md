## Functions

### containsAllTypesByName()

```ts
function containsAllTypesByName(
   type, 
   allowAny, 
   allowedNames, 
   matchAnyInstead?): boolean;
```

Defined in: containsAllTypesByName.ts:13

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `type` | `Type` | `undefined` | Type being checked by name. |
| `allowAny` | `boolean` | `undefined` | Whether to consider `any` and `unknown` to match. |
| `allowedNames` | `Set`\<`string`\> | `undefined` | Symbol names checking on the type. |
| `matchAnyInstead` | `boolean` | `false` | Whether to instead just check if any parts match, rather than all parts. |

#### Returns

`boolean`

Whether the type is, extends, or contains the allowed names (or all matches the allowed names, if mustMatchAll is true).

***

### discriminateAnyType()

```ts
function discriminateAnyType(
   type, 
   checker, 
   program, 
   tsNode): AnyType;
```

Defined in: discriminateAnyType.ts:17

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |
| `checker` | `TypeChecker` |
| `program` | `Program` |
| `tsNode` | `Node` |

#### Returns

[`AnyType`](#anytype)

`AnyType.Any` if the type is `any`, `AnyType.AnyArray` if the type is `any[]` or `readonly any[]`, `AnyType.PromiseAny` if the type is `Promise<any>`,
         otherwise it returns `AnyType.Safe`.

***

### getConstrainedTypeAtLocation()

```ts
function getConstrainedTypeAtLocation(services, node): Type;
```

Defined in: getConstrainedTypeAtLocation.ts:16

Resolves the given node's type. Will return the type's generic constraint, if it has one.

Warning - if the type is generic and does _not_ have a constraint, the type will be
returned as-is, rather than returning an `unknown` type. This can be checked
for by checking for the type flag ts.TypeFlags.TypeParameter.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `services` | `ParserServicesWithTypeInformation` |
| `node` | `Node` |

#### Returns

`Type`

#### See

https://github.com/typescript-eslint/typescript-eslint/issues/10438

***

### getContextualType()

```ts
function getContextualType(checker, node): Type | undefined;
```

Defined in: getContextualType.ts:8

Returns the contextual type of a given node.
Contextual type is the type of the target the node is going into.
i.e. the type of a called function's parameter, or the defined type of a variable declaration

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `checker` | `TypeChecker` |
| `node` | `Expression` |

#### Returns

`Type` \| `undefined`

***

### getDeclaration()

```ts
function getDeclaration(services, node): Declaration | null;
```

Defined in: getDeclaration.ts:10

Gets the declaration for the given variable

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `services` | `ParserServicesWithTypeInformation` |
| `node` | `Node` |

#### Returns

`Declaration` \| `null`

***

### ~~getSourceFileOfNode()~~

```ts
function getSourceFileOfNode(node): SourceFile;
```

Defined in: getSourceFileOfNode.ts:7

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | `Node` |

#### Returns

`SourceFile`

#### Deprecated

Gets the source file for a given node

***

### getTypeFlags()

```ts
function getTypeFlags(type): TypeFlags;
```

Defined in: typeFlagUtils.ts:9

Gets all of the type flags in a type, iterating through unions automatically.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |

#### Returns

`TypeFlags`

***

### getTypeName()

```ts
function getTypeName(typeChecker, type): string;
```

Defined in: getTypeName.ts:9

Get the type name of a given type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `typeChecker` | `TypeChecker` | The context sensitive TypeScript TypeChecker. |
| `type` | `Type` | The type to get the name of. |

#### Returns

`string`

***

### getTypeOfPropertyOfName()

```ts
function getTypeOfPropertyOfName(
   checker, 
   type, 
   name, 
   escapedName?): Type | undefined;
```

Defined in: propertyTypes.ts:3

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `checker` | `TypeChecker` |
| `type` | `Type` |
| `name` | `string` |
| `escapedName?` | `__String` |

#### Returns

`Type` \| `undefined`

***

### getTypeOfPropertyOfType()

```ts
function getTypeOfPropertyOfType(
   checker, 
   type, 
   property): Type | undefined;
```

Defined in: propertyTypes.ts:25

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `checker` | `TypeChecker` |
| `type` | `Type` |
| `property` | `Symbol` |

#### Returns

`Type` \| `undefined`

***

### isBuiltinSymbolLike()

```ts
function isBuiltinSymbolLike(
   program, 
   type, 
   symbolName): boolean;
```

Defined in: builtinSymbolLikes.ts:121

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `program` | `Program` |
| `type` | `Type` |
| `symbolName` | `string` \| `string`[] |

#### Returns

`boolean`

***

### isBuiltinSymbolLikeRecurser()

```ts
function isBuiltinSymbolLikeRecurser(
   program, 
   type, 
   predicate): boolean;
```

Defined in: builtinSymbolLikes.ts:147

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `program` | `Program` |
| `type` | `Type` |
| `predicate` | (`subType`) => `boolean` \| `null` |

#### Returns

`boolean`

***

### isBuiltinTypeAliasLike()

```ts
function isBuiltinTypeAliasLike(
   program, 
   type, 
   predicate): boolean;
```

Defined in: builtinSymbolLikes.ts:88

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `program` | `Program` |
| `type` | `Type` |
| `predicate` | (`subType`) => `boolean` |

#### Returns

`boolean`

***

### isErrorLike()

```ts
function isErrorLike(program, type): boolean;
```

Defined in: builtinSymbolLikes.ts:41

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `program` | `Program` |
| `type` | `Type` |

#### Returns

`boolean`

#### Example

```ts
class Foo extends Error {}
new Foo()
//   ^ ErrorLike
```

***

### isNullableType()

```ts
function isNullableType(type): boolean;
```

Defined in: predicates.ts:12

Checks if the given type is (or accepts) nullable

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |

#### Returns

`boolean`

***

### isPromiseConstructorLike()

```ts
function isPromiseConstructorLike(program, type): boolean;
```

Defined in: builtinSymbolLikes.ts:26

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `program` | `Program` |
| `type` | `Type` |

#### Returns

`boolean`

#### Example

```ts
const value = Promise
value.reject
// ^ PromiseConstructorLike
```

***

### isPromiseLike()

```ts
function isPromiseLike(program, type): boolean;
```

Defined in: builtinSymbolLikes.ts:14

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `program` | `Program` |
| `type` | `Type` |

#### Returns

`boolean`

#### Example

```ts
class DerivedClass extends Promise<number> {}
DerivedClass.reject
// ^ PromiseLike
```

***

### isReadonlyErrorLike()

```ts
function isReadonlyErrorLike(program, type): boolean;
```

Defined in: builtinSymbolLikes.ts:52

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `program` | `Program` |
| `type` | `Type` |

#### Returns

`boolean`

#### Example

```ts
type T = Readonly<Error>
//   ^ ReadonlyErrorLike
```

***

### isReadonlyTypeLike()

```ts
function isReadonlyTypeLike(
   program, 
   type, 
   predicate?): boolean;
```

Defined in: builtinSymbolLikes.ts:72

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `program` | `Program` |
| `type` | `Type` |
| `predicate?` | (`subType`) => `boolean` |

#### Returns

`boolean`

#### Example

```ts
type T = Readonly<{ foo: 'bar' }>
//   ^ ReadonlyTypeLike
```

***

### isSymbolFromDefaultLibrary()

```ts
function isSymbolFromDefaultLibrary(program, symbol): boolean;
```

Defined in: isSymbolFromDefaultLibrary.ts:3

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `program` | `Program` |
| `symbol` | `Symbol` \| `undefined` |

#### Returns

`boolean`

***

### isTypeAnyArrayType()

```ts
function isTypeAnyArrayType(type, checker): boolean;
```

Defined in: predicates.ts:88

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |
| `checker` | `TypeChecker` |

#### Returns

`boolean`

true if the type is `any[]`

***

### isTypeAnyType()

```ts
function isTypeAnyType(type): boolean;
```

Defined in: predicates.ts:75

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |

#### Returns

`boolean`

true if the type is `any`

***

### isTypeArrayTypeOrUnionOfArrayTypes()

```ts
function isTypeArrayTypeOrUnionOfArrayTypes(type, checker): boolean;
```

Defined in: predicates.ts:27

Checks if the given type is either an array type,
or a union made up solely of array types.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |
| `checker` | `TypeChecker` |

#### Returns

`boolean`

***

### isTypeBigIntLiteralType()

```ts
function isTypeBigIntLiteralType(type): type is BigIntLiteralType;
```

Defined in: predicates.ts:140

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |

#### Returns

`type is BigIntLiteralType`

***

### isTypeBrandedLiteralLike()

```ts
function isTypeBrandedLiteralLike(type): boolean;
```

Defined in: isTypeBrandedLiteralLike.ts:46

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |

#### Returns

`boolean`

***

### isTypeFlagSet()

```ts
function isTypeFlagSet(
   type, 
   flagsToCheck, 
   isReceiver?): boolean;
```

Defined in: typeFlagUtils.ts:27

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `type` | `Type` | - |
| `flagsToCheck` | `TypeFlags` | The composition of one or more `ts.TypeFlags`. |
| `isReceiver?` | `boolean` | Whether the type is a receiving type (e.g. the type of a called function's parameter). |

#### Returns

`boolean`

#### Remarks

Note that if the type is a union, this function will decompose it into the
parts and get the flags of every union constituent. If this is not desired,
use the `isTypeFlag` function from tsutils.

***

### isTypeNeverType()

```ts
function isTypeNeverType(type): boolean;
```

Defined in: predicates.ts:43

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |

#### Returns

`boolean`

true if the type is `never`

***

### isTypeReadonly()

```ts
function isTypeReadonly(
   program, 
   type, 
   options?): boolean;
```

Defined in: isTypeReadonly.ts:351

Checks if the given type is readonly

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `program` | `Program` | `undefined` |
| `type` | `Type` | `undefined` |
| `options` | [`ReadonlynessOptions`](#readonlynessoptions) | `readonlynessOptionsDefaults` |

#### Returns

`boolean`

***

### isTypeReferenceType()

```ts
function isTypeReferenceType(type): type is TypeReference;
```

Defined in: predicates.ts:64

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |

#### Returns

`type is TypeReference`

***

### isTypeTemplateLiteralType()

```ts
function isTypeTemplateLiteralType(type): type is TemplateLiteralType;
```

Defined in: predicates.ts:146

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |

#### Returns

`type is TemplateLiteralType`

***

### isTypeUnknownArrayType()

```ts
function isTypeUnknownArrayType(type, checker): boolean;
```

Defined in: predicates.ts:101

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |
| `checker` | `TypeChecker` |

#### Returns

`boolean`

true if the type is `unknown[]`

***

### isTypeUnknownType()

```ts
function isTypeUnknownType(type): boolean;
```

Defined in: predicates.ts:50

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |

#### Returns

`boolean`

true if the type is `unknown`

***

### isUnsafeAssignment()

```ts
function isUnsafeAssignment(
   type, 
   receiver, 
   checker, 
   senderNode): 
  | false
  | {
  receiver: Type;
  sender: Type;
};
```

Defined in: isUnsafeAssignment.ts:19

Does a simple check to see if there is an any being assigned to a non-any type.

This also checks generic positions to ensure there's no unsafe sub-assignments.
Note: in the case of generic positions, it makes the assumption that the two types are the same.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |
| `receiver` | `Type` |
| `checker` | `TypeChecker` |
| `senderNode` | `Node` \| `null` |

#### Returns

  \| `false`
  \| \{
  `receiver`: `Type`;
  `sender`: `Type`;
\}

false if it's safe, or an object with the two types if it's unsafe

#### Example

```ts
See tests for examples
```

***

### requiresQuoting()

```ts
function requiresQuoting(name, target?): boolean;
```

Defined in: requiresQuoting.ts:3

* Indicates whether identifiers require the use of quotation marks when accessing property definitions and dot notation.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `name` | `string` | `undefined` |
| `target` | `ScriptTarget` | `ts.ScriptTarget.ESNext` |

#### Returns

`boolean`

***

### typeIsOrHasBaseType()

```ts
function typeIsOrHasBaseType(type, parentType): boolean;
```

Defined in: predicates.ts:114

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |
| `parentType` | `Type` |

#### Returns

`boolean`

Whether a type is an instance of the parent type, including for the parent's base types.

***

### typeMatchesSomeSpecifier()

```ts
function typeMatchesSomeSpecifier(
   type, 
   specifiers?, 
   program): boolean;
```

Defined in: TypeOrValueSpecifier.ts:222

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `type` | `Type` | `undefined` |
| `specifiers` | [`TypeOrValueSpecifier`](#typeorvaluespecifier)[] | `[]` |
| `program` | `Program` | `undefined` |

#### Returns

`boolean`

***

### typeMatchesSpecifier()

```ts
function typeMatchesSpecifier(
   type, 
   specifier, 
   program): boolean;
```

Defined in: TypeOrValueSpecifier.ts:167

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `Type` |
| `specifier` | [`TypeOrValueSpecifier`](#typeorvaluespecifier) |
| `program` | `Program` |

#### Returns

`boolean`

***

### valueMatchesSomeSpecifier()

```ts
function valueMatchesSomeSpecifier(
   node, 
   specifiers?, 
   program, 
   type): boolean;
```

Defined in: TypeOrValueSpecifier.ts:285

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `node` | `Node` | `undefined` |
| `specifiers` | [`TypeOrValueSpecifier`](#typeorvaluespecifier)[] | `[]` |
| `program` | `Program` | `undefined` |
| `type` | `Type` | `undefined` |

#### Returns

`boolean`

***

### valueMatchesSpecifier()

```ts
function valueMatchesSpecifier(
   node, 
   specifier, 
   program, 
   type): boolean;
```

Defined in: TypeOrValueSpecifier.ts:249

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | `Node` |
| `specifier` | [`TypeOrValueSpecifier`](#typeorvaluespecifier) |
| `program` | `Program` |
| `type` | `Type` |

#### Returns

`boolean`

## Variables

### readonlynessOptionsDefaults

```ts
const readonlynessOptionsDefaults: ReadonlynessOptions;
```

Defined in: isTypeReadonly.ts:40

***

### readonlynessOptionsSchema

```ts
const readonlynessOptionsSchema: object;
```

Defined in: isTypeReadonly.ts:29

#### Type Declaration

| Name | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-additionalproperties"></a> `additionalProperties` | `false` | `false` | isTypeReadonly.ts:30 |
| <a id="property-properties"></a> `properties` | `object` | - | isTypeReadonly.ts:31 |
| `properties.allow` | `object` | `typeOrValueSpecifiersSchema` | isTypeReadonly.ts:32 |
| `properties.allow.items` | `object` | - | TypeOrValueSpecifier.ts:73 |
| `properties.allow.items.oneOf` | \[\{ `type`: `"string"`; \}, \{ `additionalProperties`: `false`; `properties`: \{ `from`: \{ `enum`: \[`"file"`\]; `type`: `"string"`; \}; `name`: \{ `oneOf`: \[\{ `type`: `"string"`; \}, \{ `items`: \{ `type`: ...; \}; `minItems`: `1`; `type`: `"array"`; `uniqueItems`: `true`; \}\]; \}; `path`: \{ `type`: `"string"`; \}; \}; `required`: \[`"from"`, `"name"`\]; `type`: `"object"`; \}, \{ `additionalProperties`: `false`; `properties`: \{ `from`: \{ `enum`: \[`"lib"`\]; `type`: `"string"`; \}; `name`: \{ `oneOf`: \[\{ `type`: `"string"`; \}, \{ `items`: \{ `type`: ...; \}; `minItems`: `1`; `type`: `"array"`; `uniqueItems`: `true`; \}\]; \}; \}; `required`: \[`"from"`, `"name"`\]; `type`: `"object"`; \}, \{ `additionalProperties`: `false`; `properties`: \{ `from`: \{ `enum`: \[`"package"`\]; `type`: `"string"`; \}; `name`: \{ `oneOf`: \[\{ `type`: `"string"`; \}, \{ `items`: \{ `type`: ...; \}; `minItems`: `1`; `type`: `"array"`; `uniqueItems`: `true`; \}\]; \}; `package`: \{ `type`: `"string"`; \}; \}; `required`: \[`"from"`, `"name"`, `"package"`\]; `type`: `"object"`; \}\] | - | TypeOrValueSpecifier.ts:74 |
| `properties.allow.type` | `"array"` | `'array'` | TypeOrValueSpecifier.ts:164 |
| `properties.treatMethodsAsReadonly` | `object` | - | isTypeReadonly.ts:33 |
| `properties.treatMethodsAsReadonly.type` | `"boolean"` | `'boolean'` | isTypeReadonly.ts:34 |
| <a id="property-type"></a> `type` | `"object"` | `'object'` | isTypeReadonly.ts:37 |

***

### typeOrValueSpecifiersSchema

```ts
const typeOrValueSpecifiersSchema: object;
```

Defined in: TypeOrValueSpecifier.ts:72

#### Type Declaration

| Name | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-items"></a> `items` | `object` | - | TypeOrValueSpecifier.ts:73 |
| `items.oneOf` | \[\{ `type`: `"string"`; \}, \{ `additionalProperties`: `false`; `properties`: \{ `from`: \{ `enum`: \[`"file"`\]; `type`: `"string"`; \}; `name`: \{ `oneOf`: \[\{ `type`: `"string"`; \}, \{ `items`: \{ `type`: `"string"`; \}; `minItems`: `1`; `type`: `"array"`; `uniqueItems`: `true`; \}\]; \}; `path`: \{ `type`: `"string"`; \}; \}; `required`: \[`"from"`, `"name"`\]; `type`: `"object"`; \}, \{ `additionalProperties`: `false`; `properties`: \{ `from`: \{ `enum`: \[`"lib"`\]; `type`: `"string"`; \}; `name`: \{ `oneOf`: \[\{ `type`: `"string"`; \}, \{ `items`: \{ `type`: `"string"`; \}; `minItems`: `1`; `type`: `"array"`; `uniqueItems`: `true`; \}\]; \}; \}; `required`: \[`"from"`, `"name"`\]; `type`: `"object"`; \}, \{ `additionalProperties`: `false`; `properties`: \{ `from`: \{ `enum`: \[`"package"`\]; `type`: `"string"`; \}; `name`: \{ `oneOf`: \[\{ `type`: `"string"`; \}, \{ `items`: \{ `type`: `"string"`; \}; `minItems`: `1`; `type`: `"array"`; `uniqueItems`: `true`; \}\]; \}; `package`: \{ `type`: `"string"`; \}; \}; `required`: \[`"from"`, `"name"`, `"package"`\]; `type`: `"object"`; \}\] | - | TypeOrValueSpecifier.ts:74 |
| <a id="property-type-1"></a> `type` | `"array"` | `'array'` | TypeOrValueSpecifier.ts:164 |

## Enumerations

### AnyType

Defined in: discriminateAnyType.ts:7

#### Enumeration Members

| Enumeration Member | Value | Defined in |
| ------ | ------ | ------ |
| <a id="enumeration-member-any"></a> `Any` | `0` | discriminateAnyType.ts:8 |
| <a id="enumeration-member-anyarray"></a> `AnyArray` | `2` | discriminateAnyType.ts:10 |
| <a id="enumeration-member-promiseany"></a> `PromiseAny` | `1` | discriminateAnyType.ts:9 |
| <a id="enumeration-member-safe"></a> `Safe` | `3` | discriminateAnyType.ts:11 |

## Interfaces

### FileSpecifier

Defined in: TypeOrValueSpecifier.ts:17

Describes specific types or values declared in local files.
See [TypeOrValueSpecifier > FileSpecifier](/packages/type-utils/type-or-value-specifier#filespecifier).

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="from"></a> `from` | `"file"` | - | TypeOrValueSpecifier.ts:18 |
| <a id="name"></a> `name` | `string` \| `string`[] | Type or value name(s) to match on. | TypeOrValueSpecifier.ts:23 |
| <a id="path"></a> `path?` | `string` | A specific file the types or values must be declared in. | TypeOrValueSpecifier.ts:28 |

***

### LibSpecifier

Defined in: TypeOrValueSpecifier.ts:35

Describes specific types or values declared in TypeScript's built-in lib definitions.
See [TypeOrValueSpecifier > LibSpecifier](/packages/type-utils/type-or-value-specifier#libspecifier).

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="from-1"></a> `from` | `"lib"` | - | TypeOrValueSpecifier.ts:36 |
| <a id="name-1"></a> `name` | `string` \| `string`[] | Type or value name(s) to match on. | TypeOrValueSpecifier.ts:41 |

***

### PackageSpecifier

Defined in: TypeOrValueSpecifier.ts:48

Describes specific types or values imported from packages.
See [TypeOrValueSpecifier > PackageSpecifier](/packages/type-utils/type-or-value-specifier#packagespecifier).

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="from-2"></a> `from` | `"package"` | - | TypeOrValueSpecifier.ts:49 |
| <a id="name-2"></a> `name` | `string` \| `string`[] | Type or value name(s) to match on. | TypeOrValueSpecifier.ts:54 |
| <a id="package"></a> `package` | `string` | Package name the type or value must be declared in. | TypeOrValueSpecifier.ts:59 |

***

### ReadonlynessOptions

Defined in: isTypeReadonly.ts:24

#### Properties

| Property | Modifier | Type | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="allow"></a> `allow?` | `readonly` | [`TypeOrValueSpecifier`](#typeorvaluespecifier)[] | isTypeReadonly.ts:25 |
| <a id="treatmethodsasreadonly"></a> `treatMethodsAsReadonly?` | `readonly` | `boolean` | isTypeReadonly.ts:26 |

## Type Aliases

### TypeOrValueSpecifier

```ts
type TypeOrValueSpecifier = 
  | string
  | FileSpecifier
  | LibSpecifier
  | PackageSpecifier;
```

Defined in: TypeOrValueSpecifier.ts:66

A centralized format for rule options to describe specific _types_ and/or _values_.
See [TypeOrValueSpecifier](/packages/type-utils/type-or-value-specifier).
