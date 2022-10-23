import { AuthServiceProvider } from '../AuthServiceProvider'

interface User {
  name: string
}

const CREDENTIALS_DURATION_SECS = 10

export class DummyProvider extends AuthServiceProvider<User> {
  currentUser: User | null = null

  constructor () {
    super()
    this.isLoaded = true
  }

  async signIn (name: string) {
    this.currentUser = { name }
    this.isAuthenticated = true
  }

  async signOut () {
    this.currentUser = null
    this.isAuthenticated = false
  }

  async getUser () {
    return this.currentUser
  }

  async renewCredentials () {
    this.isAuthenticated = true
    return {
      token: (Math.random() + 1).toString(36).substring(7),
      expiresAt: this.getNextTokenExpiration(CREDENTIALS_DURATION_SECS),
      expiresIn: CREDENTIALS_DURATION_SECS
    }
  }
}
