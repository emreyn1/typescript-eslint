## Functions

### schemaToTypes()

```ts
function schemaToTypes(schema): string;
```

Defined in: index.ts:17

Converts rule options schema(s) to the equivalent TypeScript type string.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `schema` | `JSONSchema4` \| readonly `JSONSchema4`[] | Original rule schema(s) as declared in `meta.schema`. |

#### Returns

`string`

Stringified TypeScript type(s) equivalent to the options schema(s).
