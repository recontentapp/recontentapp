# Recontent.app CLI

> Ship localized content faster without loosing engineers time

## Installation

Recontent CLI, or `recontent`, is a command-line interface to Recontent for use in your terminal or your scripts.

It can be installed through `npm`

```sh
yarn add -D @recontentapp/cli
```

## Configuration

Define an environment variable named `RECONTENT_API_KEY` to authenticate with your Recontent workspace.

An API key can be generated from your workspace settings.

## Using the CLI

```sh
# List projects
recontentapp get projects

# List languages
recontentapp get languages

# List languages within a project
recontentapp get languages -p <project_id>

# List email templates within a project
recontentapp get email-templates -p <project_id>
```

```sh
# Export phrases & translations in all languages as JSON files
# Possible formats are json|json_nested
recontentapp export phrases -p <project_id> -f json

# Export phrases & translations for a specific language within a revision
recontentapp export phrases -p <project_id> -l <language_id>,<language_id>

# Export phrases & translations in all languages in a custom directory
recontentapp export phrases -p <project_id> -f json -o './translations/{{ languageName }}{{ fileExtension }}'

# Export an email template
recontentapp export email-templates <email_template_id> -f html -o './{{ key }}/{{ languageName }}{{ fileExtension }}'
```
