export const USER_REPOS_QUERY = `
  query UserAquarium($username: String!, $after: String) {
    user(login: $username) {
      login
      name
      avatarUrl
      bio
      followers { totalCount }
      following { totalCount }
      createdAt
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
      repositories(
        first: 100
        after: $after
        orderBy: { field: UPDATED_AT, direction: DESC }
        ownerAffiliations: OWNER
        privacy: PUBLIC
      ) {
        nodes {
          name
          description
          url
          primaryLanguage { name color }
          stargazerCount
          forkCount
          issues(states: OPEN) { totalCount }
          licenseInfo { spdxId }
          object(expression: "HEAD:README.md") {
            ... on Blob { byteSize }
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history { totalCount }
                committedDate
              }
            }
          }
          pushedAt
          createdAt
          isArchived
          isFork
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`
