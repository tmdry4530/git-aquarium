export type GitHubErrorCode =
  | 'USER_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'SERVER_ERROR'

export class GitHubError extends Error {
  constructor(
    public readonly code: GitHubErrorCode,
    public readonly statusCode: number,
  ) {
    super(`GitHub API error: ${code}`)
    this.name = 'GitHubError'
  }
}
