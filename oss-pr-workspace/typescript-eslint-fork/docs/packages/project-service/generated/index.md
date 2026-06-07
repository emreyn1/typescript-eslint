## Functions

### createProjectService()

```ts
function createProjectService(settings?): ProjectServiceAndMetadata;
```

Defined in: createProjectService.ts:100

Creates a new Project Service instance, as well as metadata on its creation.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `settings` | [`CreateProjectServiceSettings`](#createprojectservicesettings) | Settings to create a new Project Service instance. |

#### Returns

[`ProjectServiceAndMetadata`](#projectserviceandmetadata)

A new Project Service instance, as well as metadata on its creation.

#### Example

```ts
import { createProjectService } from '@typescript-eslint/project-service';

const { service } = createProjectService();

service.openClientFile('index.ts');
```

## Interfaces

### CreateProjectServiceSettings

Defined in: createProjectService.ts:63

Settings to create a new Project Service instance with [createProjectService](#createprojectservice).

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="host"></a> `host?` | `Partial`\<`ServerHost`\> | Custom project service host. **Default** `ts.sys` with stub watchers | createProjectService.ts:84 |
| <a id="jsdocparsingmode"></a> `jsDocParsingMode?` | `JSDocParsingMode` | How aggressively (and slowly) to parse JSDoc comments. | createProjectService.ts:72 |
| <a id="options"></a> `options?` | `ProjectServiceOptions` | Granular options to configure the project service. | createProjectService.ts:67 |
| <a id="tsconfigrootdir"></a> `tsconfigRootDir?` | `string` | Root directory for the tsconfig.json file, if not the current directory. | createProjectService.ts:77 |

***

### ProjectServiceAndMetadata

Defined in: createProjectService.ts:38

A created Project Service instance, as well as metadata on its creation.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="allowdefaultproject"></a> `allowDefaultProject` | `string`[] \| `undefined` | Files allowed to be loaded from the default project, if any were specified. | createProjectService.ts:42 |
| <a id="lastreloadtimestamp"></a> `lastReloadTimestamp` | `number` | The performance.now() timestamp of the last reload of the project service. | createProjectService.ts:47 |
| <a id="maximumdefaultprojectfilematchcount"></a> `maximumDefaultProjectFileMatchCount` | `number` | The maximum number of files that can be matched by the default project. | createProjectService.ts:52 |
| <a id="service"></a> `service` | `ProjectService` | The created TypeScript Project Service instance. | createProjectService.ts:57 |

## Type Aliases

### TypeScriptProjectService

```ts
type TypeScriptProjectService = ts.server.ProjectService;
```

Defined in: createProjectService.ts:33

Shortcut type to refer to TypeScript's server ProjectService.
