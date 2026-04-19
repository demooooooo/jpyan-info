const ORIGIN = 'https://jpyan-info-admin.vercel.app'

function rewriteLocation(value, requestUrl) {
  if (!value) return value

  try {
    const location = new URL(value, ORIGIN)
    const request = new URL(requestUrl)

    if (location.origin === ORIGIN) {
      location.protocol = request.protocol
      location.host = request.host
      return location.toString()
    }
  } catch {
    return value
  }

  return value
}

export default {
  async fetch(request) {
    const incoming = new URL(request.url)
    const upstream = new URL(incoming.pathname + incoming.search, ORIGIN)

    const headers = new Headers(request.headers)
    headers.set('host', upstream.host)
    headers.set('x-forwarded-host', incoming.host)
    headers.set('x-forwarded-proto', incoming.protocol.replace(':', ''))

    const init = {
      method: request.method,
      headers,
      redirect: 'manual',
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    }

    const response = await fetch(new Request(upstream.toString(), init))
    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('location', rewriteLocation(responseHeaders.get('location'), request.url))
    responseHeaders.delete('content-security-policy')
    responseHeaders.delete('content-security-policy-report-only')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  },
}
