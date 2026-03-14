// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const GRAPHQL_URL = 'https://api.github.com/graphql'

function makeGraphQLSuccess(username: string) {
  return {
    data: {
      user: {
        login: username,
        name: 'Test User',
        avatarUrl: `https://avatars.githubusercontent.com/u/1`,
        bio: 'Developer',
        followers: { totalCount: 100 },
        following: { totalCount: 50 },
        createdAt: new Date(Date.now() - 2 * 365.25 * 86400000).toISOString(),
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 500,
            weeks: Array.from({ length: 52 }, () => ({
              contributionDays: Array.from({ length: 7 }, (_, i) => ({
                contributionCount: i % 3 === 0 ? 2 : 0,
                date: '2023-06-01',
              })),
            })),
          },
        },
        repositories: {
          nodes: [
            {
              name: 'my-project',
              description: 'A test project' as string | null,
              url: `https://github.com/${username}/my-project`,
              primaryLanguage: { name: 'TypeScript', color: '#3178C6' },
              stargazerCount: 42,
              forkCount: 5,
              issues: { totalCount: 3 },
              licenseInfo: { spdxId: 'MIT' } as { spdxId: string } | null,
              object: { byteSize: 1024 } as { byteSize: number } | null,
              defaultBranchRef: {
                target: {
                  history: { totalCount: 100 },
                  committedDate: new Date(
                    Date.now() - 10 * 86400000,
                  ).toISOString(),
                },
              },
              pushedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
              createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
              isArchived: false,
              isFork: false,
            },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: null as string | null,
          } as { hasNextPage: boolean; endCursor: string | null },
        },
      },
    },
  }
}

const server = setupServer(
  http.post(GRAPHQL_URL, async ({ request }) => {
    const body = (await request.json()) as { variables?: { username?: string } }
    const username = body.variables?.username

    if (username === 'notfound-user-xyz') {
      return HttpResponse.json({
        data: { user: null },
        errors: [{ message: 'Not Found', type: 'NOT_FOUND' }],
      })
    }

    if (username === 'rate-limited-user') {
      return new HttpResponse(null, { status: 403 })
    }

    return HttpResponse.json(makeGraphQLSuccess(username ?? 'testuser'))
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('fetchGitHubData integration', () => {
  it('should fetch user and repos successfully', async () => {
    const { fetchGitHubData } = await import('@/lib/github/client')
    const { user, repos } = await fetchGitHubData('testuser')

    expect(user.login).toBe('testuser')
    expect(user.contributionCalendar.totalContributions).toBe(500)
    expect(repos).toHaveLength(1)
    expect(repos[0]?.name).toBe('my-project')
    expect(repos[0]?.language).toBe('TypeScript')
  })

  it('should throw GitHubError USER_NOT_FOUND for missing user', async () => {
    const { fetchGitHubData, GitHubError } = await import('@/lib/github/client')

    await expect(fetchGitHubData('notfound-user-xyz')).rejects.toThrow(
      GitHubError,
    )

    try {
      await fetchGitHubData('notfound-user-xyz')
    } catch (e) {
      if (e instanceof GitHubError) {
        expect(e.code).toBe('USER_NOT_FOUND')
        expect(e.statusCode).toBe(404)
      }
    }
  })

  it('should throw GitHubError RATE_LIMITED on 403', async () => {
    const { fetchGitHubData, GitHubError } = await import('@/lib/github/client')

    try {
      await fetchGitHubData('rate-limited-user')
    } catch (e) {
      if (e instanceof GitHubError) {
        expect(e.code).toBe('RATE_LIMITED')
      }
    }
  })
})

describe('fetchGitHubUser integration', () => {
  it('should fetch user with contributionCalendar', async () => {
    const { fetchGitHubUser } = await import('@/lib/github/client')
    const user = await fetchGitHubUser('testuser')

    expect(user.login).toBe('testuser')
    expect(user.followers).toBe(100)
    expect(user.contributionCalendar.totalContributions).toBe(500)
    expect(user.contributionCalendar.weeks).toHaveLength(52)
  })
})

describe('fetchAllRepos integration', () => {
  it('should fetch repos and return array', async () => {
    const { fetchAllRepos } = await import('@/lib/github/client')
    const repos = await fetchAllRepos('testuser')

    expect(repos).toHaveLength(1)
    expect(repos[0]?.name).toBe('my-project')
    expect(repos[0]?.totalCommits).toBe(100)
    expect(repos[0]?.hasReadme).toBe(true)
  })

  it('should paginate when hasNextPage is true', async () => {
    // Override handler for pagination test
    const repoNode = {
      name: 'page2-repo',
      description: null,
      url: 'https://github.com/paginated/page2-repo',
      primaryLanguage: { name: 'Go', color: '#00ADD8' },
      stargazerCount: 5,
      forkCount: 0,
      issues: { totalCount: 0 },
      licenseInfo: null,
      object: null,
      defaultBranchRef: {
        target: {
          history: { totalCount: 20 },
          committedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
      },
      pushedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 100 * 86400000).toISOString(),
      isArchived: false,
      isFork: false,
    }

    let callCount = 0
    server.use(
      http.post(GRAPHQL_URL, async ({ request }) => {
        const body = (await request.json()) as {
          variables?: { after?: string | null }
        }
        callCount++
        const isPage2 = body.variables?.after === 'cursor-end'
        const base = makeGraphQLSuccess('paginated')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        base.data.user.repositories.nodes = [repoNode] as any
        base.data.user.repositories.pageInfo = (
          isPage2
            ? { hasNextPage: false, endCursor: null }
            : { hasNextPage: true, endCursor: 'cursor-end' }
        ) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any
        return HttpResponse.json(base)
      }),
    )

    const { fetchAllRepos } = await import('@/lib/github/client')
    const repos = await fetchAllRepos('paginated')

    expect(repos).toHaveLength(2) // 2 pages × 1 repo each
    expect(callCount).toBe(2)
  })
})

describe('mapToAquariumData integration', () => {
  it('should produce valid AquariumData from fetched data', async () => {
    const { fetchGitHubData } = await import('@/lib/github/client')
    const { mapToAquariumData } = await import('@/lib/aquarium/mapper')

    const { user, repos } = await fetchGitHubData('chamdom')
    const aquarium = mapToAquariumData(user, repos)

    expect(aquarium.user.username).toBe('chamdom')
    expect(aquarium.fish).toHaveLength(1)
    expect(aquarium.stats.totalFish).toBe(1)
    expect(aquarium.fish[0]?.species).toBe('manta')
    expect(aquarium.environment.tankSize).toBeDefined()
    expect(aquarium.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
