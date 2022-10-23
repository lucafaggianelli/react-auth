export interface AuthToken {
  token: string
  expiresAt: Date

  /**
   * Token duration in seconds
   */
  expiresIn: number
}

export abstract class AuthServiceProvider<UserType> {
  currentUser: UserType | null = null
  isAuthenticated: boolean = false
  isLoaded: boolean = false
  token: AuthToken | undefined
  protected user: UserType | null = null

  private tokenTimeout: ReturnType<typeof setTimeout> | undefined
  private tokenInterval: ReturnType<typeof setInterval> | undefined

  async signIn (data: any): Promise<any> {}
  abstract signOut(): Promise<any>
  abstract getUser(): Promise<UserType | null>
  abstract renewCredentials?(): Promise<AuthToken | undefined>
  onLoad?: () => any

  checkCredentials () {
    if (!this.token) {
      return false
    }

    if (new Date() > this.token.expiresAt) {
      // The token is already expired, need a new one
      console.debug(`Creds expired ${(new Date().getTime() - this.token.expiresAt.getTime()) / 1000} secs ago`)
      this.renewCredentialsOuter()
    } else {
      // The token is still good, but need to refresh it in a while
      console.debug(`Setting a timer to renew cres in ${(this.token.expiresAt.getTime() - new Date().getTime())/1000} secs`)
      this.tokenTimeout = setTimeout(this.renewCredentialsOuter.bind(this), this.token.expiresAt.getTime() - new Date().getTime())
    }
  }

  getNextTokenExpiration (durationSeconds: number) {
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + durationSeconds)
    return expiration
  }

  async renewCredentialsOuter () {
    if (!this.renewCredentials) {
      return
    }

    this.token = await this.renewCredentials()
    console.debug('Got creds', this.token)

    if (this.token) {
      console.debug(`Setting interval to renew creds in ${this.token.expiresIn} secs`)
      this.clearTimers()

      this.tokenTimeout = setTimeout(this.renewCredentialsOuter.bind(this), this.token.expiresIn * 1000)
    }
  }

  clearTimers () {
    console.debug('Clearing timers')
    if (this.tokenInterval) {
      clearInterval(this.tokenInterval)
    } else {
      console.debug('no interval to clear')
    }

    if (this.tokenTimeout) {
      clearTimeout(this.tokenTimeout)
    } else {
      console.debug('no timeout to clear')
    }
  }

  setLoaded () {
    console.debug('Auth provider loaded')
    this.isLoaded = true

    if (this.onLoad) {
      this.onLoad()
    }
  }
}
