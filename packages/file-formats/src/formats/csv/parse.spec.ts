import { testDict } from '../../testHelpers'
import { parseCSV } from './parse'

describe('csv', () => {
  it('returns expected output', async () => {
    const testData = `title,Hello World
dashboard.title,Welcome to your dashboard
dashboard.description,Here you can find all the information you need to get started`

    const result = await parseCSV(Buffer.from(testData))
    expect(result).toEqual(testDict)
  })
})
