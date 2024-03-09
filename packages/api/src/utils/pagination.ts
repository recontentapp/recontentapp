import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common'
import { Request } from 'express'

export interface PaginationParams {
  page: number
  pageSize: number
  limit: number
  offset: number
}

export interface PaginationResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    pagesCount: number
    itemsCount: number
  }
}

export const Pagination = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    const { page, pageSize } = request.query

    const finalParams: PaginationParams = {
      page: 1,
      pageSize: 50,
      limit: 0,
      offset: 0,
    }

    if (page && typeof page === 'string' && !isNaN(parseInt(page, 10))) {
      finalParams.page = parseInt(page, 10)
    }

    if (
      pageSize &&
      typeof pageSize === 'string' &&
      !isNaN(parseInt(pageSize, 10))
    ) {
      finalParams.pageSize = parseInt(pageSize, 10)
    }

    finalParams.offset = (finalParams.page - 1) * finalParams.pageSize
    finalParams.limit = finalParams.pageSize

    if (finalParams.limit < 0 || finalParams.offset < 0) {
      throw new BadRequestException('Invalid pagination params')
    }

    if (finalParams.limit > 100) {
      throw new BadRequestException('Invalid pagination params')
    }

    return finalParams
  },
)
