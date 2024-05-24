# Recontent.app file formats

> Support IO operations for multiple file formats (used in CLI & API)

This package exposed a set of renderers & parsers for multiple file formats.

They are used to import & export data to/from Recontent.app represented as dicts.

```ts
import { renderAndroidXML } from '@recontentapp/file-formats'

/**
 * <?xml version="1.0" encoding="utf-8"?>
 * <resources>
 *   <string name="title">Hello World</string>
 *   <string name="dashboard.title">Welcome to your dashboard</string>
 *   <string name="dashboard.description">Here you can find all the information you need to get started</string>
 * </resources>
 */
renderAndroidXML({
  title: 'Hello World',
  'dashboard.title': 'Welcome to your dashboard',
  'dashboard.description':
    'Here you can find all the information you need to get started',
})
```
