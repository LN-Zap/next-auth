import type { IncomingMessage } from "http"
import type { LoggerInstance, Session } from ".."

export interface AuthClientConfig {
  baseUrl: string
  basePath: string
  baseUrlServer: string
  basePathServer: string
  /** Stores last session response */
  _session?: Session | null | undefined
  /** Used for timestamp since last sycned (in seconds) */
  _lastSync: number
  /**
   * Stores the `SessionProvider`'s session update method to be able to
   * trigger session updates from places like `signIn` or `signOut`
   */
  _getSession: (...args: any[]) => any
}

export interface CtxOrReq {
  req?: IncomingMessage
  ctx?: { req: IncomingMessage }
}

/**
 * If passed 'appContext' via getInitialProps() in _app.js
 * then get the req object from ctx and use that for the
 * req value to allow `fetchData` to
 * work seemlessly in getInitialProps() on server side
 * pages *and* in _app.js.
 */
export async function fetchData<T = any>(
  path: string,
  __NEXTAUTH: AuthClientConfig,
  logger: LoggerInstance,
  { ctx, req = ctx?.req }: CtxOrReq = {}
): Promise<T | null> {
  const url = `${apiBaseUrl(__NEXTAUTH)}/${path}`
  const logs: object = { "log-1": "Init" }
  try {
    logs["log-2"] = req?.headers;
    const options = req?.headers.cookie
      ? { headers: { cookie: req.headers.cookie } }
      : {}
    
    logs["log-3"] = "Before fetch"
    const res = await fetch(url, options)
    logs["log-4"] = "After fetch"
    logs["log-5"] = `res.ok: ${res?.ok}`
    logs["log-6"] = `res.status: ${res?.status}`
    logs["log-7"] = `res.statusText: ${res?.statusText}`
    logs["log-8"] = `res.type: ${res?.type}`
    const dataAsString = await res.text()
    logs["log-9"] = `response body, as string: ${dataAsString}`
    const data = JSON.parse(dataAsString)
    if (!res.ok) throw data
    return Object.keys(data).length > 0 ? data : null // Return null if data empty
  } catch (error) {
    logger.error("CLIENT_FETCH_ERROR", {
      error: error as Error,
      url,
      errorType: typeof(error),
      errorToString: error.toString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'window=undefined',
      logs: logs,
      logsAsString: JSON.stringify(logs)
    })
    return null
  }
}

export function apiBaseUrl(__NEXTAUTH: AuthClientConfig) {
  if (typeof window === "undefined") {
    // Return absolute path when called server side
    return `${__NEXTAUTH.baseUrlServer}${__NEXTAUTH.basePathServer}`
  }
  // Return relative path when called client side
  return __NEXTAUTH.basePath
}

/** Returns the number of seconds elapsed since January 1, 1970 00:00:00 UTC. */
export function now() {
  return Math.floor(Date.now() / 1000)
}

export interface BroadcastMessage {
  event?: "session"
  data?: { trigger?: "signout" | "getSession" }
  clientId: string
  timestamp: number
}

/**
 * Inspired by [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
 * Only not using it directly, because Safari does not support it.
 *
 * https://caniuse.com/?search=broadcastchannel
 */
export function BroadcastChannel(name = "nextauth.message") {
  return {
    /** Get notified by other tabs/windows. */
    receive(onReceive: (message: BroadcastMessage) => void) {
      const handler = (event: StorageEvent) => {
        if (event.key !== name) return
        const message: BroadcastMessage = JSON.parse(event.newValue ?? "{}")
        if (message?.event !== "session" || !message?.data) return

        onReceive(message)
      }
      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    },
    /** Notify other tabs/windows. */
    post(message: Record<string, unknown>) {
      if (typeof window === "undefined") return
      try {
        localStorage.setItem(
          name,
          JSON.stringify({ ...message, timestamp: now() })
        )
      } catch {
        /**
         * The localStorage API isn't always available.
         * It won't work in private mode prior to Safari 11 for example.
         * Notifications are simply dropped if an error is encountered.
         */
      }
    },
  }
}
