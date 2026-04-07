/**
 * Proxy all /api/* requests to the FastAPI backend.
 * In production, Nginx handles this routing directly.
 * This proxy is used in local development.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001'

async function handler(request: Request, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/')
  const url = new URL(request.url)
  const targetUrl = `${BACKEND_URL}/${path}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    // @ts-ignore
    duplex: 'half',
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
