#!/bin/bash

# API
openapi-kit generate -f ./openapi/private-api.yml -o ./packages/api/src/generated --types
openapi-kit generate -f ./openapi/public-api.yml -o ./packages/api/src/generated/public --types
openapi-kit generate -f ./openapi/figma-plugin-api.yml -o ./packages/api/src/generated/figma-plugin --types

# App
openapi-kit generate -f ./openapi/private-api.yml -o ./packages/app/src/generated

# CLI
openapi-kit generate -f ./openapi/public-api.yml -o ./packages/cli/src/generated --types --apiClient

# Figma plugin
openapi-kit generate -f ./openapi/figma-plugin-api.yml -o ./packages/figma-plugin/ui-src/src/generated
