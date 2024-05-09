# Command-line interface (CLI)

Recontent.app offers a command-line interface (CLI) to interact with your content.

### Installation

The `recontentapp` CLI is available through [NPM](https://npmjs.com/). To install it, run one of the following command:

```bash
# Install through NPM
npm install -g @recontentapp/cli

# Update CLI to latest version
npm update -g @recontentapp/cli

# Should output CLI version
recontentapp --version
```

### Configuration

In order to authenticate requests made to the Recontent.app API, define a `RECONTENT_API_KEY` environment variable. API keys can be generated from your workspace integrations settings.

If you use a self-hosted version of Recontent.app, make sure to also define a `RECONTENT_API_URL` environment variable (defaults to `https://api.recontent.app`).

### Using the CLI

```sh
# List projects
recontentapp get projects

# List languages
recontentapp get languages

# List languages within a project
recontentapp get languages -p <project_id>
```

```sh
# Export phrases & translations in all languages as JSON files
# Possible formats are json|json_nested
recontentapp export phrases -p <project_id> -f json

# Export phrases & translations for a specific language within a revision
recontentapp export phrases -p <project_id> -l <language_id>

# Export phrases & translations in all languages in a custom directory
recontentapp export phrases -p <project_id> -f json -o translations
```

