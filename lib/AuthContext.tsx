import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AuthServiceProvider } from './AuthServiceProvider'

/**
 *  Axios setup

  useEffect(() => {
    axios.interceptors.response.use(undefined, (err) => {
      const error = err as AxiosError
      if (error.response?.status === 401) {
        console.warn('Intercepted axios 401 response')
      }

      return Promise.reject(error)
    })
  }, [])

  const client = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const useAxios = makeUseAxios({
    axios: client
  })
 */

type Props<UserType> = {
  children?: React.ReactNode
  signInPage?: string
  provider: AuthServiceProvider<UserType>
}

interface ContextType<UserType> {
  signIn: (data: any) => Promise<any>
  signOut: () => Promise<any>
  isAuthenticated: boolean
  currentUser: UserType | null
}

export const AuthContext = React.createContext<ContextType<any>>({
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  isAuthenticated: false,
  currentUser: null,
})

export const AuthProvider: React.FC<Props<any>> = ({ children, provider, signInPage = '/signin' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [ isLoaded, setLoaded ] = useState(provider.isLoaded)
  const [ isAuthenticated, setAuthenticated ] = useState(provider.isAuthenticated)

  const onPageHidden = () => {
    provider.clearTimers()
  }

  const onPageVisible = () => {
    provider.checkCredentials()
  }

  const onDocumentFocusChange = (e: FocusEvent) => {
    if (e.type === 'blur') {
      onPageHidden()
    } else if (e.type === 'focus') {
      onPageVisible()
    }
  }

  const canUserViewPage =
    // Logged-in users can view all pages
    provider.isAuthenticated ||
    // Logged-out users can only see some pages
    location.pathname === signInPage

  useEffect(() => {
    provider.onLoad = () => {
      setAuthenticated(provider.isAuthenticated)
      setLoaded(true)
    }

    // Handle window changes (switch or minimize window) inside the OS and
    // tab changes inside the browser
    window.addEventListener('focus', onDocumentFocusChange, false)
    window.addEventListener('blur', onDocumentFocusChange, false)

    return () => {
      window.removeEventListener('focus', onDocumentFocusChange)
      window.removeEventListener('blur', onDocumentFocusChange)
    }
  })

  useEffect(() => {
    // Redirect to signIn page if the user is signed out,
    // but let's wait for the auth provider to load
    if (!provider.isAuthenticated && isLoaded) {
      navigate(signInPage)
    }
  }, [ navigate, isLoaded ])

  const signIn = async (data: any) => {
    try {
      const result = await provider.signIn(data)
      setAuthenticated(true)
      provider.renewCredentialsOuter()
      return result
    } catch (e) {
      setAuthenticated(false)
      throw e
    }
  }

  const signOut = async () => {
    try {
      const result = await provider.signOut()
      setAuthenticated(false)
      return result
    } catch (e) {
      setAuthenticated(true)
      throw e
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!canUserViewPage) {
    return null
  }

  return (
    <AuthContext.Provider value={{
      signOut,
      isAuthenticated,
      currentUser: provider.currentUser,
      signIn,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
