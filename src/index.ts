import update from './handler'

export async function handleRequest(
  request: Request,
  env: Env
): Promise<Response> {
  if (
    request.headers.get('Authorization') !== `${env.WEBHOOK_ID} ${env.WEBHOOK_TOKEN}`
  ) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const url = new URL(request.url)
  switch (url.pathname) {
    case '/':
      return new Response('Ok')

    case '/update':
      return await update(env);
    default:
      return new Response('Not Found', { status: 404 })
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return await handleRequest(request, env);
  },

  async scheduled(controller_: ScheduledController, env: Env) {
    return await update(env);
  }
};