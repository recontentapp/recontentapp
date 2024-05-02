import { testDict } from '../../testHelpers'
import { renderCSV } from './render'

describe('csv', () => {
  it('matches snapshot', async () => {
    const result = await renderCSV(testDict)
    expect(result.toString()).toMatchSnapshot()
  })
})
