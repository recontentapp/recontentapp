import { outputFileSync } from 'fs-extra'

export const writeFile = (outputFilePath: string, fileContent: string) => {
  outputFileSync(outputFilePath, fileContent, 'utf-8')
}
