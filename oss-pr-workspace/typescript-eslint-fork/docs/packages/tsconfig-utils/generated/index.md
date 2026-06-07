## Functions

### getParsedConfigFile()

```ts
function getParsedConfigFile(
   tsserver, 
   configFile, 
   projectDirectory?): ParsedCommandLine;
```

Defined in: getParsedConfigFile.ts:14

Parses a TSConfig file using the same logic as tsserver.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tsserver` | *typeof* `ts` | - |
| `configFile` | `string` | the path to the tsconfig.json file, relative to `projectDirectory` |
| `projectDirectory?` | `string` | the project directory to use as the CWD, defaults to `process.cwd()` |

#### Returns

`ParsedCommandLine`

## Variables

### CORE\_COMPILER\_OPTIONS

```ts
const CORE_COMPILER_OPTIONS: object;
```

Defined in: compilerOptions.ts:6

Compiler options required to avoid critical functionality issues

#### Type Declaration

| Name | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-noemit"></a> `noEmit` | `true` | `true` | compilerOptions.ts:8 |
| <a id="property-nounusedlocals"></a> `noUnusedLocals` | `true` | `true` | compilerOptions.ts:11 |
| <a id="property-nounusedparameters"></a> `noUnusedParameters` | `true` | `true` | compilerOptions.ts:12 |
