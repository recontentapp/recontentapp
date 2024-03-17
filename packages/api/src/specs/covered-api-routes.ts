import * as fs from 'fs'
import * as path from 'path'

import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ApiModule } from '../adapters/api/api.module'
import * as yaml from 'yaml'

interface Route {
  path: string
  method: string
}

interface NestedRouteStack {
  path: undefined
  keys: []
  regexp: RegExp
  method: string
}

interface RouteStack {
  regexp: RegExp
  route?: { path: string; stack: NestedRouteStack[]; methods: any[] }
}

const getRoutes = async () => {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule, {
    logger: false,
  })
  await app.listen(3000)
  const server = app.getHttpServer()
  // @ts-expect-error Unexposed Router
  const router = server._events.request._router.stack as RouteStack[]
  await app.close()

  const routes: Route[] = []

  for (const route of router) {
    const path = route.route?.path ?? null
    const method = route.route?.stack.at(0)?.method ?? null

    if (!path || !method) {
      continue
    }

    routes.push({
      path,
      method,
    })
  }

  return routes
}

interface OpenAPIFile {
  openapi: string
  info: object
  paths: Record<string, Record<string, object>>
}

describe('private-api', () => {
  it('covers all routes', async () => {
    const routes = await getRoutes()

    const privateAPI = fs.readFileSync(
      path.join(__dirname, '../../../../openapi/private-api.yml'),
      'utf8',
    )
    const openAPIFile: OpenAPIFile = yaml.parse(privateAPI)

    const uncovered: Route[] = []
    const allCovered = Object.keys(openAPIFile.paths).every(path => {
      const prefixedPath = `/private-api${path}`
      const methods = Object.keys(openAPIFile.paths[path])

      const covered = methods.every(method => {
        return routes.some(route => {
          return route.path === prefixedPath && route.method === method
        })
      })

      if (!covered) {
        uncovered.push({
          path: prefixedPath,
          method: methods.join(', '),
        })
      }

      return covered
    })

    if (!allCovered) {
      console.log('Uncovered routes:', uncovered)
    }
    expect(allCovered).toBe(true)
  })
})
