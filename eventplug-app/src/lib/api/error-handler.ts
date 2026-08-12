import { NextResponse } from 'next/server'
import { AppError } from '@/lib/errors'

export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode })
      }
      console.error('Unexpected error', err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
