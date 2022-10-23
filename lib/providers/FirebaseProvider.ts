import { FirebaseApp } from 'firebase/app'
import { Auth, getAuth, User } from 'firebase/auth'

import { AuthServiceProvider, AuthToken } from '../AuthServiceProvider'

/**
 * The Firebase token lasts 1h, but to take into account some
 * contingency, the refresh is done a bit before the expiration
 */
const CREDENTIALS_DURATION_SECS = 59 * 60

export class FirebaseProvider extends AuthServiceProvider<User> {
  private firebaseAuth: Auth

  constructor (firebaseApp: FirebaseApp){
    super()

    this.firebaseAuth = getAuth(firebaseApp)
    this.firebaseAuth.onAuthStateChanged(this.renewCredentialsOuter.bind(this))
  }

  async signOut () {
    await this.firebaseAuth.signOut()
  }

  async isAuthenticated () {
    return !!this.firebaseAuth.currentUser
  }

  async getUser () {
    return this.firebaseAuth.currentUser
  }

  async renewCredentials () {
    const user = this.firebaseAuth.currentUser
    let token: AuthToken | undefined

    if (user) {
      token = {
        token: await user.getIdToken(true),
        expiresAt: this.getNextTokenExpiration(CREDENTIALS_DURATION_SECS),
        expiresIn: CREDENTIALS_DURATION_SECS
      }
    }

    this.setLoaded()

    return token
  }
}
