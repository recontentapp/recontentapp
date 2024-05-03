import { testDict } from '../../testHelpers'
import { renderPHPArrays } from './render'

describe('phpArrays', () => {
  it('matches snapshot', async () => {
    const result = await renderPHPArrays(testDict)
    expect(result.toString()).toMatchSnapshot()
  })
})
