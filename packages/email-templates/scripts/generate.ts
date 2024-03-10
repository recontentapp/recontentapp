import fs from 'fs'
import mjml from 'mjml'
import path from 'path'

/**
 * Compile all `.mjml` email template files
 * to `.html` files that can be used
 */
const run = (): void => {
  const distPath = path.resolve(__dirname, '..', 'dist')
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true })
  }

  fs.readdirSync(path.resolve(__dirname, '..', 'src')).forEach(
    (fileName: string) => {
      const filePath = path.resolve(__dirname, '..', 'src', fileName)

      const content = fs.readFileSync(filePath)
      const result = mjml(content.toString())

      if (result.errors.length > 0) {
        throw new Error(`Could not compile mjml template "${fileName}"`)
      }

      fs.writeFileSync(
        path.resolve(
          __dirname,
          '..',
          'dist',
          fileName.replace('.mjml', '.html'),
        ),
        result.html,
      )
    },
  )
}

run()
