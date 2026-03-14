import type { GitHubUser, GitHubRepo } from '@/types/github'
import { GitHubError } from './types'
import { graphqlFetch } from './graphql'
import { USER_REPOS_QUERY } from './queries'

export { GitHubError } from './types'

// GraphQL response shapes
interface GQLRepo {
  name: string
  description: string | null
  url: string
  primaryLanguage: { name: string; color: string } | null
  stargazerCount: number
  forkCount: number
  issues: { totalCount: number }
  licenseInfo: { spdxId: string } | null
  object: { byteSize: number } | null
  defaultBranchRef: {
    target: {
      history: { totalCount: number }
      committedDate: string
    }
  } | null
  pushedAt: string | null
  createdAt: string
  isArchived: boolean
  isFork: boolean
}

interface GQLUserReposResponse {
  user: {
    login: string
    name: string | null
    avatarUrl: string
    bio: string | null
    followers: { totalCount: number }
    following: { totalCount: number }
    createdAt: string
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number
        weeks: Array<{
          contributionDays: Array<{ contributionCount: number; date: string }>
        }>
      }
    }
    repositories: {
      nodes: GQLRepo[]
      pageInfo: { hasNextPage: boolean; endCursor: string | null }
    }
  } | null
}

function transformRepo(r: GQLRepo): GitHubRepo {
  const lastPushedAt = r.pushedAt ?? r.createdAt
  const totalCommits = r.defaultBranchRef?.target.history.totalCount ?? 0
  const lastCommitDate =
    r.defaultBranchRef?.target.committedDate ?? lastPushedAt

  return {
    name: r.name,
    description: r.description,
    url: r.url,
    language: r.primaryLanguage?.name ?? null,
    languageColor: r.primaryLanguage?.color ?? null,
    stars: r.stargazerCount,
    forks: r.forkCount,
    openIssues: r.issues.totalCount,
    hasReadme: r.object !== null,
    license: r.licenseInfo?.spdxId ?? null,
    totalCommits,
    lastPushedAt: lastCommitDate,
    createdAt: r.createdAt,
  }
}

async function fetchPage(
  username: string,
  after: string | null,
): Promise<{
  user: GQLUserReposResponse['user']
  repos: GitHubRepo[]
  hasNextPage: boolean
  endCursor: string | null
}> {
  const data = await graphqlFetch<GQLUserReposResponse>(USER_REPOS_QUERY, {
    username,
    after,
  })

  if (!data.user) throw new GitHubError('USER_NOT_FOUND', 404)

  const repos = data.user.repositories.nodes.map(transformRepo)
  const { hasNextPage, endCursor } = data.user.repositories.pageInfo

  return { user: data.user, repos, hasNextPage, endCursor }
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const { user } = await fetchPage(username, null)
  if (!user) throw new GitHubError('USER_NOT_FOUND', 404)

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    createdAt: user.createdAt,
    contributionCalendar: user.contributionsCollection.contributionCalendar,
  }
}

export async function fetchAllRepos(
  username: string,
  maxPages = 10,
): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = []
  let cursor: string | null = null

  for (let page = 0; page < maxPages; page++) {
    const { repos, hasNextPage, endCursor } = await fetchPage(username, cursor)
    allRepos.push(...repos)
    if (!hasNextPage) break
    cursor = endCursor
  }

  return allRepos
}

export async function fetchGitHubData(
  username: string,
): Promise<{ user: GitHubUser; repos: GitHubRepo[] }> {
  const allRepos: GitHubRepo[] = []
  let cursor: string | null = null
  let gitHubUser: GitHubUser | null = null

  for (let page = 0; page < 10; page++) {
    const { user, repos, hasNextPage, endCursor } = await fetchPage(
      username,
      cursor,
    )

    if (!gitHubUser && user) {
      gitHubUser = {
        login: user.login,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        followers: user.followers.totalCount,
        following: user.following.totalCount,
        createdAt: user.createdAt,
        contributionCalendar: user.contributionsCollection.contributionCalendar,
      }
    }

    allRepos.push(...repos)
    if (!hasNextPage) break
    cursor = endCursor
  }

  if (!gitHubUser) throw new GitHubError('USER_NOT_FOUND', 404)

  return { user: gitHubUser, repos: allRepos }
}
