import { GitHubError } from './types'

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = process.env['GITHUB_TOKEN']
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

interface GraphQLResponse<T> {
  data: T
  errors?: Array<{ message: string; type?: string }>
}

export async function graphqlFetch<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, variables }),
    })
  } catch {
    throw new GitHubError('SERVER_ERROR', 503)
  }

  if (response.status === 401) throw new GitHubError('UNAUTHORIZED', 401)
  if (response.status === 403) throw new GitHubError('RATE_LIMITED', 403)
  if (!response.ok) throw new GitHubError('SERVER_ERROR', response.status)

  const json = (await response.json()) as GraphQLResponse<T>

  if (json.errors?.[0]?.type === 'NOT_FOUND')
    throw new GitHubError('USER_NOT_FOUND', 404)
  if (json.errors && json.errors.length > 0)
    throw new GitHubError('SERVER_ERROR', 500)

  return json.data
}
