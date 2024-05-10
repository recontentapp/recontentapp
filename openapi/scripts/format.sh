#!/bin/bash

openapi-format ./openapi/private-api.yml -o ./openapi/private-api.yml
openapi-format ./openapi/public-api.yml -o ./openapi/public-api.yml
openapi-format ./openapi/figma-plugin-api.yml -o ./openapi/figma-plugin-api.yml
