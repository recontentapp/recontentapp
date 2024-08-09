/**
 * MJML types are copied from the MJML project
 * as `mjml` & `mjml-browser` need to be installed depending on the environment
 */

export type MJMLFunction = (
  input: string,
  options?: MJMLParsingOptions,
) => MJMLParseResults

export interface MJMLParsingOptions {
  /**
   * Default fonts imported in the HTML rendered by HTML
   * ie. { 'Open Sans': 'https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700' }
   *
   * default: @see https://github.com/mjmlio/mjml/blob/master/packages/mjml-core/src/index.js
   */
  fonts?: { [key: string]: string } | undefined

  /**
   * Option to keep comments in the HTML output
   * default: true
   */
  keepComments?: boolean | undefined

  /**
   * @deprecated use js-beautify directly after processing the MJML
   *
   * Option to beautify the HTML output
   * default: false
   */
  beautify?: boolean | undefined

  /**
   * @deprecated use html-minifier directly after processing the MJML
   *
   * Option to minify the HTML output
   *
   * default: false
   */
  minify?: boolean | undefined
  /**
   * @deprecated @see minify
   *
   * Options for html minifier, see mjml-cli documentation for more info
   * Passed directly to html-minifier as options
   *
   * default: @see htmlMinify usage in mjml-core/src/index.js
   */
  minifyOptions?: MJMLMinifyOptions | undefined

  /**
   * How to validate your MJML
   *
   * skip: your document is rendered without going through validation
   * soft: your document is going through validation and is rendered, even if it has errors
   * strict: your document is going through validation and is not rendered if it has any error
   *
   * default: soft
   */
  validationLevel?: 'strict' | 'soft' | 'skip' | undefined

  /**
   * Full path of the specified file to use when resolving paths from mj-include components
   * default: '.'
   */
  filePath?: string | undefined
  /**
   * The path or directory of the .mjmlconfig file
   * default: process.cwd()
   */
  mjmlConfigPath?: string | undefined

  /**
   * Use the config attribute defined in the .mjmlconfig file.
   * The config passed into mjml2html overrides the .mjmlconfig.
   * default: false
   */
  useMjmlConfigOptions?: boolean | undefined

  /**
   * optional setting when inlining css, see mjml-cli documentation for more info
   */
  juicePreserveTags?:
    | { [index: string]: { start: string; end: string } }
    | undefined
  juiceOptions?: any

  /**
   * undocumented
   * a function returning html skeleton
   * default: see mjml-core/src/helpers/skeleton.js
   */
  skeleton?: string | (() => string) | undefined

  actualPath?: string | undefined
  /**
   * undocumented
   * ignore mj-include elements
   * default: false
   */
  ignoreIncludes?: any
  /**
   * see mjml-parser-xml
   */
  preprocessors?: Array<(xml: string) => string> | undefined

  /**
   * Add media queries specific to printer when converting mjml into html. When enabling this option,
   * the html might not be compatible with all email clients anymore.
   */
  printerSupport?: boolean | undefined
}

export interface MJMLMinifyOptions {
  collapseWhitespace?: boolean | undefined
  minifyCSS?: boolean | undefined
  removeEmptyAttributes?: boolean | undefined
}

export interface MJMLParseResults {
  html: string
  errors: MJMLParseError[]
}

export interface MJMLParseError {
  line: number
  message: string
  tagName: string
  formattedMessage: string
}
