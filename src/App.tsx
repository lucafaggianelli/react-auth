import { FirebaseApp, FirebaseError, initializeApp } from 'firebase/app'
import { GoogleAuthProvider } from 'firebase/auth'
import React, { useContext, useEffect, useState } from 'react'

import { AuthContext, AuthProvider } from '../lib/AuthContext'
import { DummyProvider } from '../lib/providers/DummyProvider'
import { FirebaseProvider } from '../lib/providers/FirebaseProvider'

export let firebaseApp: FirebaseApp

try {
  firebaseApp = initializeApp({
  })
} catch (err) {
  if ((err as FirebaseError).code !== 'app/duplicate-app') {
    throw err
  }
}

const authProvider = new FirebaseProvider(firebaseApp!)
// const authProvider = new DummyProvider()

const Page = () => {
  const { isAuthenticated, currentUser, signIn, signOut } = useContext(AuthContext)

  return (
    <div>
      {isAuthenticated ? 'You\'re logged-in!' : 'You\'re not logged-in'}

      {!isAuthenticated
        ? <button onClick={() => {
          signIn({ provider: new GoogleAuthProvider() })
        }}>Sign in</button>
        : <button onClick={() => {
          signOut()
        }}>Sign out</button>
      }

      {isAuthenticated && <div>
          <pre style={{overflow:'auto'}}>
            <code>
              {JSON.stringify(currentUser, null, 2)}
            </code>
          </pre>
        </div>
      }
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider provider={authProvider}>
      <Page />
    </AuthProvider>
  )
}

export default App
