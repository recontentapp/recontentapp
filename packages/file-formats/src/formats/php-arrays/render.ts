import { Renderer } from '../../types'

export const renderPHPArrays: Renderer = data => {
  const result: string[] = ['<?php', '']

  for (const key in data) {
    result.push(`$lang["${key}"] = "${data[key]}";`)
  }

  result.push('')

  return Promise.resolve(Buffer.from(result.join('\n')))
}
