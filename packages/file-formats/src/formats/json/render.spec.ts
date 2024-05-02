import { testDict } from '../../testHelpers'
import { renderJSON, renderNestedJSON } from './render'

describe('json', () => {
  it('matches snapshot', async () => {
    const result = await renderJSON(testDict)
    expect(result.toString()).toMatchSnapshot()
  })
})

describe('nestedJson', () => {
  it('matches snapshot', async () => {
    const result = await renderNestedJSON(testDict)
    expect(result.toString()).toMatchSnapshot()
  })
})
