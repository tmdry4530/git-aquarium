export interface ContributionDay {
  contributionCount: number
  date: string
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

export interface GitHubUser {
  login: string
  name: string | null
  avatarUrl: string
  bio: string | null
  followers: number
  following: number
  createdAt: string
  contributionCalendar: ContributionCalendar
}

export interface GitHubRepo {
  name: string
  description: string | null
  url: string
  language: string | null
  languageColor: string | null
  stars: number
  forks: number
  openIssues: number
  hasReadme: boolean
  license: string | null
  totalCommits: number
  lastPushedAt: string
  createdAt: string
}
