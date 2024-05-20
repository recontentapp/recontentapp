# Figma plugin

> Sync Figma text nodes with Recontent.app

## Getting started

1. Make sure to run `yarn setup` at the root of the repository
2. Run `yarn build` in this folder or `yarn workspace figma-plugin build` at the root of the repository
3. Open a Figma file in the Figma app (not website)
4. Right click > Plugins > Development > Import plugin from manifest...
5. Select `manifest.json` in `packages/figma-plugin/dist`
6. You should now be able to use the plugin

To continuously make updates to the plugin's source code, use `yarn start:figma-plugin` at the root of the repository.

## Relevant links

- https://www.figma.com/plugin-docs/
