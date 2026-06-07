# Requirements Document

## Introduction

Kiro IDE Workspace Configuration System, geliştiricilerin workspace'lerini optimal performans ve verimlilik için yapılandırmalarını sağlayan kapsamlı bir sistem sunar. Bu sistem MCP (Model Context Protocol) entegrasyonu, proje dokümantasyonu, karar takibi, steering rules ve custom skills yönetimini içerir.

## Glossary

- **Workspace**: Kullanıcının aktif olarak çalıştığı proje dizini
- **MCP_Server**: Model Context Protocol standardını uygulayan harici araç sunucusu
- **Configuration_System**: Tüm workspace ayarlarını yöneten merkezi sistem
- **Steering_Rule**: Kiro'nun davranışını koşullu veya sürekli olarak yönlendiren kural
- **Skill**: Tekrar eden görevler için özel ajan yetenekleri
- **Project_Context_Manager**: Proje dokümantasyonunu ve mimarisini yöneten bileşen
- **Decision_Tracker**: ADR formatında mimari kararları kaydeden bileşen
- **Auto_Approve_List**: Otomatik onaylanan güvenilir MCP araçlarının listesi
- **Context_Window**: Kiro'nun aynı anda işleyebileceği maksimum token miktarı
- **File_Match_Rule**: Belirli dosya pattern'lerine göre aktive olan steering rule
- **Always_Included_Rule**: Her zaman aktif olan steering rule

## Requirements

### Requirement 1: MCP Server Configuration Management

**User Story:** As a developer, I want to configure and manage MCP servers, so that I can extend Kiro's capabilities with external tools.

#### Acceptance Criteria

1. THE Configuration_System SHALL provide a JSON-based configuration file for MCP_Server definitions with maximum size of 10MB and maximum 100 server definitions per file
2. WHEN a MCP_Server configuration is added, THE Configuration_System SHALL validate the configuration schema including required fields (name, command) and optional fields (arguments, environment variables)
3. IF a MCP_Server configuration fails schema validation, THEN THE Configuration_System SHALL reject the configuration and display an error message indicating the validation failure reason
4. THE Configuration_System SHALL support connection parameters including command (string), arguments (array of strings with maximum 50 elements), and environment variables (key-value pairs with maximum 100 entries) for each MCP_Server
5. THE Configuration_System SHALL limit command strings to 1000 characters, argument strings to 500 characters each, and environment variable keys and values to 500 characters each
6. WHEN a MCP_Server disconnects, THE Configuration_System SHALL attempt reconnection with exponential backoff starting at 1 second and doubling with each attempt up to 5 attempts with maximum delay of 32 seconds
7. IF all reconnection attempts are exhausted, THEN THE Configuration_System SHALL mark the MCP_Server as unavailable and display a notification to the user
8. THE Configuration_System SHALL log all MCP_Server connection attempts with timestamp in ISO 8601 format and status (connecting, connected, disconnected, failed)

### Requirement 2: Auto-Approve Settings for Trusted Tools

**User Story:** As a developer, I want to auto-approve trusted MCP tools, so that I can work without interruptions for safe operations.

#### Acceptance Criteria

1. THE Configuration_System SHALL load the Auto_Approve_List from a configuration file at system startup
2. WHEN a tool execution request is received, THE Configuration_System SHALL compare the tool identifier against entries in the Auto_Approve_List using exact string matching or wildcard pattern matching
3. WHEN a tool identifier exactly matches an entry in the Auto_Approve_List OR matches a wildcard pattern in the Auto_Approve_List, THE Configuration_System SHALL execute the tool without prompting the user
4. THE Configuration_System SHALL support wildcard patterns in the Auto_Approve_List using single trailing asterisk syntax (e.g., "filesystem:read_*" matches "filesystem:read_file" and "filesystem:read_directory")
5. WHEN the configuration file is modified, THE Configuration_System SHALL reload the Auto_Approve_List within 5 seconds of file modification
6. IF the configuration file contains invalid syntax or unreadable content, THEN THE Configuration_System SHALL use an empty Auto_Approve_List and log an error message indicating the configuration load failure
7. WHEN a tool is not in the Auto_Approve_List, THE Configuration_System SHALL display an approval prompt to the user before execution
8. IF the user does not respond to the approval prompt within 60 seconds, THEN THE Configuration_System SHALL deny execution and log a timeout event
9. WHEN the user responds to the approval prompt, THE Configuration_System SHALL execute the tool if approved OR deny execution if rejected

### Requirement 3: Project Context Documentation

**User Story:** As a developer, I want structured project context documentation, so that Kiro can understand my project architecture and make better suggestions.

#### Acceptance Criteria

1. WHEN a developer issues a create project context command, THE Project_Context_Manager SHALL create a file named project-context.md in the workspace root directory
2. IF project-context.md already exists, THEN THE Project_Context_Manager SHALL prompt the developer to confirm overwrite before proceeding
3. THE project-context.md file SHALL include sections titled "Project Overview", "Architecture", "Key Components", "Technical Decisions", and "Development Guidelines"
4. THE Project_Context_Manager SHALL create each section with a level 2 markdown header (##) and placeholder text indicating the section purpose
5. WHEN project-context.md is present in the workspace root directory, THE Configuration_System SHALL load its contents into Kiro's context at session start
6. IF project-context.md exceeds 50KB in size, THEN THE Configuration_System SHALL truncate the content to 50KB and provide a warning message indicating truncation occurred
7. IF project-context.md cannot be loaded due to file system errors, THEN THE Configuration_System SHALL log an error message indicating the failure reason and continue session initialization without the project context
8. THE Project_Context_Manager SHALL preserve markdown formatting elements including headers (# through ######), unordered lists (- or *), ordered lists (1. 2. 3.), fenced code blocks (```), and hyperlinks ([text](url)) when creating or reading project-context.md

### Requirement 4: Architecture Decision Records (ADR) Tracking

**User Story:** As a developer, I want to track architecture decisions with rationale, so that I can understand why technical choices were made.

#### Acceptance Criteria

1. WHEN the Decision_Tracker creates a decisions.md file, IF the file already exists, THEN THE Decision_Tracker SHALL append new decisions to the existing file
2. WHEN a new decision is recorded, THE Decision_Tracker SHALL include sections labeled "Decision ID", "Date", "Status", "Context", "Decision", "Consequences", and "Alternatives"
3. WHEN a new decision is recorded, THE Decision_Tracker SHALL require non-empty content for "Context", "Decision", and "Consequences" sections
4. THE Decision_Tracker SHALL assign sequential numeric IDs to decisions starting from 1 and incrementing by 1 for each new decision
5. THE Decision_Tracker SHALL restrict decision status values to exactly "Proposed", "Accepted", "Deprecated", or "Superseded"
6. IF a decision status is set to a value other than "Proposed", "Accepted", "Deprecated", or "Superseded", THEN THE Decision_Tracker SHALL reject the decision with an error message indicating invalid status
7. WHEN a decision supersedes another decision, THE Decision_Tracker SHALL include the superseded decision's ID in the "Supersedes" field of the superseding decision
8. WHEN a decision supersedes another decision, THE Decision_Tracker SHALL update the superseded decision's status to "Superseded" and add a reference to the superseding decision's ID
9. THE Decision_Tracker SHALL format all dates in ISO 8601 format (YYYY-MM-DD)
10. THE Decision_Tracker SHALL use the system date at the time of decision creation for the "Date" field

### Requirement 5: Always-Included Steering Rules

**User Story:** As a team lead, I want always-included steering rules for team standards, so that all team members follow consistent practices.

#### Acceptance Criteria

1. WHEN Kiro session starts, THE Configuration_System SHALL scan `.kiro/steering/` directory for files with `.md` extension within 10 seconds
2. WHEN an Always_Included_Rule file is found, THE Configuration_System SHALL parse the frontmatter to extract metadata fields (name, description, inclusion type)
3. WHEN an Always_Included_Rule file includes `inclusion: always` in frontmatter, THE Configuration_System SHALL load the file content into Kiro's context within 5 seconds
4. IF an Always_Included_Rule file exceeds 100KB, THEN THE Configuration_System SHALL reject the file and log an error message indicating the file path and size limit violation
5. IF an Always_Included_Rule file contains invalid frontmatter syntax, THEN THE Configuration_System SHALL skip the file and log an error message indicating the file path and syntax error
6. THE Configuration_System SHALL make the content of Always_Included_Rules available to Kiro's decision-making process for all file operations and conversation responses
7. WHEN an Always_Included_Rule is loaded, THE Configuration_System SHALL preserve the rule content in context for the entire duration of the Kiro session
8. THE Configuration_System SHALL limit the total number of Always_Included_Rules to 50 files per workspace
9. IF the total size of all Always_Included_Rules exceeds 2MB, THEN THE Configuration_System SHALL load only the first rules alphabetically by filename until the 2MB limit is reached and log a warning message
10. THE Configuration_System SHALL support markdown frontmatter with YAML syntax including fields: name (string up to 100 characters), description (string up to 500 characters), and inclusion (enum: always, file-match, manual)
11. IF an Always_Included_Rule file is modified during a session, THEN THE Configuration_System SHALL not reload the file until the next session start
12. WHEN multiple Always_Included_Rules conflict (define contradictory guidelines), THE Configuration_System SHALL apply rules in alphabetical order by filename

### Requirement 6: File-Match Conditional Steering Rules

**User Story:** As a developer, I want conditional steering rules based on file patterns, so that context-specific guidelines apply automatically.

#### Acceptance Criteria

1. THE Configuration_System SHALL store File_Match_Rules in `.kiro/steering/` directory with `.md` extension and frontmatter containing `inclusion: file-match` and `filePattern` fields
2. WHEN a file is opened or edited in Kiro, THE Configuration_System SHALL check if the file path matches any File_Match_Rule patterns within 2 seconds
3. WHEN a file path matches a File_Match_Rule pattern, THE Configuration_System SHALL load the corresponding File_Match_Rule content into Kiro's context within 3 seconds
4. THE Configuration_System SHALL support multiple glob patterns per File_Match_Rule by parsing comma-separated values in the `filePattern` frontmatter field with maximum 50 patterns per rule
5. IF a File_Match_Rule contains an invalid glob pattern, THEN THE Configuration_System SHALL skip that specific pattern and log an error message indicating the file path and invalid pattern
6. WHEN no files match a File_Match_Rule pattern during session initialization, THE Configuration_System SHALL not load the File_Match_Rule into context
7. THE Configuration_System SHALL support standard glob patterns including `*` (matches any characters except path separator), `**` (matches any characters including path separator), `?` (matches single character), `[]` (matches character set), and `{}` (matches alternatives)
8. WHEN multiple File_Match_Rules match the same file, THE Configuration_System SHALL load all matching rules into context in alphabetical order by filename

### Requirement 7: Manual Inclusion Steering Rules

**User Story:** As a developer, I want manually activated steering rules for specific workflows, so that I can load specialized guidelines on demand.

#### Acceptance Criteria

1. THE Configuration_System SHALL store manual steering rules in `.kiro/steering/` directory with `.md` extension and frontmatter containing `inclusion: manual`
2. WHEN the Configuration_System scans `.kiro/steering/` directory, IF a file contains `inclusion: manual` in frontmatter, THEN THE Configuration_System SHALL not load the file content at session start
3. THE Configuration_System SHALL provide a command or UI action that allows users to activate a manual steering rule by specifying the rule name
4. WHEN a user activates a manual steering rule, THE Configuration_System SHALL load the file content into Kiro's context within 3 seconds
5. WHEN a manual steering rule is activated, THE Configuration_System SHALL display a confirmation message indicating the rule name and activation status
6. THE Configuration_System SHALL maintain all active manual steering rules in context until the user explicitly deactivates them or the session ends
7. THE Configuration_System SHALL provide a command or UI action that allows users to deactivate a manual steering rule by specifying the rule name
8. WHEN a user deactivates a manual steering rule, THE Configuration_System SHALL remove the rule content from Kiro's context within 2 seconds and display a confirmation message

### Requirement 8: Custom Agent Skills Configuration

**User Story:** As a developer, I want to define custom agent skills for repetitive tasks, so that I can automate workflows efficiently.

#### Acceptance Criteria

1. THE Configuration_System SHALL load and parse custom Skill definition files from `.kiro/skills/` directory with maximum file size of 1MB and maximum 100 skills per workspace
2. THE Skill SHALL include a markdown-based definition with frontmatter metadata including name (max 100 characters), description (max 500 characters), and trigger patterns (max 20 patterns per skill)
3. WHEN a Skill trigger pattern matches user input using case-insensitive substring matching, THE Configuration_System SHALL display the matching Skill name and description to the user
4. THE Skill SHALL include a prompt template section with parameter placeholders using `{{parameter_name}}` syntax and maximum template size of 10KB
5. THE Configuration_System SHALL substitute Skill parameter values into template placeholders when executing a Skill with maximum 50 parameters per skill
6. WHEN the Configuration_System loads the workspace, THE Configuration_System SHALL validate all Skill definitions and display validation errors in the system output including filename and error description
7. IF a Skill definition file contains invalid markdown or missing required frontmatter fields (name, description, trigger patterns), THEN THE Configuration_System SHALL skip loading that Skill and display an error message indicating the filename and validation failure reason
8. IF a Skill template references a parameter that was not provided at execution time, THEN THE Configuration_System SHALL display an error message indicating the missing parameter name and halt Skill execution
9. IF multiple Skills have trigger patterns that match the user input, THEN THE Configuration_System SHALL display all matching Skills in alphabetical order by name

### Requirement 9: Performance Optimization for Context Window

**User Story:** As a developer, I want optimized context window usage, so that Kiro performs efficiently without hitting token limits.

#### Acceptance Criteria

1. THE Configuration_System SHALL track the total byte size of configuration files (project-context.md, steering rules, skills) loaded into context at session start
2. WHEN the total byte size of loaded configuration files exceeds 100KB, THE Configuration_System SHALL display a warning message to the user indicating the total size and the 100KB threshold
3. THE Configuration_System SHALL load configuration files in the following sequential order: project-context.md, always-included steering rules (alphabetically), active file-match steering rules (alphabetically), decisions.md
4. WHEN decisions.md is not explicitly referenced in a user query or command, THE Configuration_System SHALL not load decisions.md into context at session start
5. WHEN decisions.md is explicitly referenced by file path or keyword "decision" in a user query, THE Configuration_System SHALL load decisions.md into context within 3 seconds
6. THE Configuration_System SHALL compress redundant whitespace (multiple consecutive spaces, tabs, or newlines) in loaded markdown files by replacing with a single space or newline
7. WHEN compressing whitespace, THE Configuration_System SHALL preserve all whitespace within fenced code blocks (delimited by triple backticks) without modification

### Requirement 10: .kiro Folder Structure Organization

**User Story:** As a developer, I want a well-organized .kiro folder structure, so that I can easily manage and navigate configuration files.

#### Acceptance Criteria

1. WHEN the Configuration_System initialization is triggered, THE Configuration_System SHALL create a `.kiro/` directory in the workspace root if it does not exist
2. WHEN the Configuration_System creates the `.kiro/` directory, THE Configuration_System SHALL create subdirectories `steering/`, `skills/`, `specs/`, and `mcp/` within `.kiro/`
3. IF the `.kiro/` directory already exists with subdirectories, THEN THE Configuration_System SHALL not modify or recreate existing directories
4. THE Configuration_System SHALL create project-context.md and decisions.md files in the `.kiro/` root directory (not in subdirectories)
5. THE Configuration_System SHALL store MCP server configuration in `.kiro/mcp/settings.json`
6. WHEN the Configuration_System creates the `.kiro/` directory structure, THE Configuration_System SHALL create a `.kiro/README.md` file with content describing the folder structure and purpose of each directory
7. IF file creation fails due to permission errors, THEN THE Configuration_System SHALL log an error message with the file path and permission error details
8. THE Configuration_System SHALL create all directories with read and write permissions for the current user
9. IF a file with the same name as a directory exists (e.g., a file named `steering` when trying to create `steering/` directory), THEN THE Configuration_System SHALL log an error message and skip directory creation

### Requirement 11: Configuration File Validation and Error Reporting

**User Story:** As a developer, I want validation for configuration files, so that I can identify and fix errors quickly.

#### Acceptance Criteria

1. WHEN the Configuration_System loads a configuration file, THE Configuration_System SHALL validate its syntax based on file type: JSON files using JSON schema validation, YAML files using YAML schema validation, and markdown files with frontmatter using YAML frontmatter validation
2. IF a configuration file contains invalid JSON or YAML, THEN THE Configuration_System SHALL report an error message including the file path, line number, column number, and specific syntax error description
3. IF a steering rule is missing the base required frontmatter field `inclusion`, THEN THE Configuration_System SHALL report an error message indicating the file path and the missing `inclusion` field
4. IF a steering rule with `inclusion: file-match` is missing the `filePattern` field, THEN THE Configuration_System SHALL report an error message indicating the file path and the missing `filePattern` field
5. WHEN a configuration file fails validation, THE Configuration_System SHALL skip loading that specific file
6. WHEN a configuration file fails validation, THE Configuration_System SHALL continue loading remaining valid configuration files without interruption
7. WHEN the Configuration_System completes loading all configuration files, THE Configuration_System SHALL provide a summary message listing the total number of files processed, number of successfully loaded files, and number of files with errors
8. THE summary message SHALL include a list of all error file paths and brief error descriptions for each failed file

### Requirement 12: Workspace Configuration Initialization

**User Story:** As a developer, I want automated workspace initialization, so that I can quickly set up new projects with optimal configuration.

#### Acceptance Criteria

1. WHEN Kiro session starts, IF no `.kiro/` directory exists in the workspace root, THEN THE Configuration_System SHALL display a prompt asking the developer to initialize the workspace
2. THE initialization prompt SHALL provide two options: "Initialize" (create configuration structure) and "Skip" (do not create configuration structure)
3. WHEN the developer selects "Initialize", THE Configuration_System SHALL create the `.kiro/` directory structure including subdirectories `steering/`, `skills/`, `specs/`, and `mcp/`
4. WHEN the Configuration_System creates the directory structure, THE Configuration_System SHALL create example configuration files with commented templates for MCP servers in `.kiro/mcp/settings.json.example`, steering rules in `.kiro/steering/example-rule.md`, and skills in `.kiro/skills/example-skill.md`
5. WHEN the Configuration_System creates example files, IF a file with the same name already exists, THEN THE Configuration_System SHALL skip creating that file and continue with remaining files
6. THE Configuration_System SHALL detect the project type by checking for the presence of package manager files: `package.json` for Node.js, `requirements.txt` or `pyproject.toml` for Python, `go.mod` for Go, `Cargo.toml` for Rust
7. WHEN a project type is detected, THE Configuration_System SHALL include project-type-specific example configurations in the template files (e.g., Node.js-specific steering rules for JavaScript files)
8. IF directory or file creation fails due to filesystem errors, THEN THE Configuration_System SHALL log an error message with the file path and error details and continue with remaining initialization steps
9. WHEN the developer selects "Skip", THE Configuration_System SHALL not create any configuration files and continue with session initialization

### Requirement 13: Multi-Language Support for Documentation

**User Story:** As a Turkish-speaking developer, I want configuration templates in Turkish, so that I can work in my preferred language.

#### Acceptance Criteria

1. THE Configuration_System SHALL support Turkish and English languages for template files and documentation
2. THE Configuration_System SHALL read user language preference from `.kiro/settings.json` file in the `language` field with values "tr" (Turkish) or "en" (English)
3. WHEN the `language` field is present in `.kiro/settings.json`, THE Configuration_System SHALL use the specified language for all template generation
4. WHEN the `language` field is absent or `.kiro/settings.json` does not exist, THE Configuration_System SHALL detect the system locale and extract the language code (first 2 characters)
5. IF the system locale language code is "tr", THEN THE Configuration_System SHALL use Turkish templates; otherwise THE Configuration_System SHALL use English templates
6. THE Configuration_System SHALL load template files from `.kiro/templates/tr/` directory for Turkish and `.kiro/templates/en/` directory for English
7. IF a template file is not found in the language-specific directory, THEN THE Configuration_System SHALL load the corresponding template file from `.kiro/templates/en/` directory as fallback
8. WHEN Turkish language is selected and generating an ADR record, THE Configuration_System SHALL format dates as DD.MM.YYYY (e.g., 05.06.2026)
9. WHEN English language is selected or used as fallback and generating an ADR record, THE Configuration_System SHALL format dates as YYYY-MM-DD (e.g., 2026-06-05)

### Requirement 14: Configuration Export and Import

**User Story:** As a developer, I want to export and import workspace configurations, so that I can share setups across projects and teams.

#### Acceptance Criteria

1. THE Configuration_System SHALL provide an export function that creates a ZIP file containing configuration files from `.kiro/steering/`, `.kiro/skills/`, `.kiro/mcp/`, project-context.md, and decisions.md within 30 seconds or 10MB file size limit
2. WHEN exporting configuration, THE Configuration_System SHALL exclude files containing sensitive data patterns: strings matching "password", "token", "key", "secret", "credential", "certificate" (case-insensitive), and local file system paths starting with "/" or drive letters (e.g., "C:\")
3. THE exported ZIP file SHALL include a manifest.json file in the root containing configuration version (semantic version string), export timestamp in ISO 8601 format, and a list of included files with relative paths
4. WHEN importing a configuration bundle, THE Configuration_System SHALL first validate that the bundle is a valid ZIP file with a manifest.json file and all listed files present
5. WHEN importing a configuration bundle, THE Configuration_System SHALL validate that each configuration file has valid syntax according to Requirement 11 before applying any changes
6. WHEN importing a configuration bundle, IF a configuration file already exists in the target workspace, THEN THE Configuration_System SHALL preserve the existing file without modification
7. WHEN importing a configuration bundle, THE Configuration_System SHALL copy only new files (files not present in the target workspace) from the bundle to the workspace
8. IF export fails due to file system errors or timeout, THEN THE Configuration_System SHALL display an error message indicating the failure reason and partial export file path if applicable
9. IF import fails due to invalid ZIP format or missing manifest, THEN THE Configuration_System SHALL display an error message indicating the validation failure reason and not modify any workspace files
10. WHEN import completes, THE Configuration_System SHALL display a summary message indicating the number of files imported, number of files skipped (already existing), and any validation errors encountered

### Requirement 15: Kiro-Specific Settings Integration

**User Story:** As a developer, I want Kiro-specific settings for behavior customization, so that I can tailor the IDE to my workflow.

#### Acceptance Criteria

1. THE Configuration_System SHALL read and parse a `.kiro/settings.json` file for Kiro-specific preferences at session start
2. THE settings.json SHALL include options for `autoSave` (boolean: true for enabled, false for disabled), `diagnosticLevel` (string enum: "error", "warning", "info"), and `suggestionFrequency` (integer: 1-10 representing suggestions per minute)
3. WHEN settings.json is modified during a session, THE Configuration_System SHALL detect the file change within 2 seconds and reload settings without requiring workspace restart
4. THE Configuration_System SHALL validate settings.json against a JSON schema that defines valid keys, value types, and ranges for all settings
5. IF settings.json contains invalid values (e.g., `diagnosticLevel` set to "critical" instead of valid enum values), THEN THE Configuration_System SHALL log an error message with the setting key and expected valid values
6. IF settings.json is absent, THEN THE Configuration_System SHALL use default values: `autoSave: true`, `diagnosticLevel: "warning"`, `suggestionFrequency: 5`
7. IF settings.json contains unknown keys not defined in the schema, THEN THE Configuration_System SHALL ignore those keys and log a warning message indicating the unknown key names

