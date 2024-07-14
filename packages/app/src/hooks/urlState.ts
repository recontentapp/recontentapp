import { useState } from 'react'
import { Location, useLocation, useNavigate } from 'react-router-dom'

type StateValue = string | string[] | undefined
type State = Record<string, StateValue>
type UpdateStateFn<S> = (s: S | ((s: S) => S)) => void

interface UseURLStateParams<S extends State> {
  initialState: S
}

const isNull = (value: StateValue) => {
  if (value === undefined || value?.length === 0) {
    return true
  }

  return false
}

const serializeValue = (value: StateValue): string => {
  if (Array.isArray(value)) {
    return value.join(',')
  }

  return value ?? ''
}

const deserializeValue = (
  value: string,
  initialStateValue: unknown,
): StateValue => {
  if (value.length === 0) {
    return undefined
  }

  if (value.indexOf(',') != -1 || Array.isArray(initialStateValue)) {
    return value.split(',')
  }

  return value
}

export const deserializeURLState = <S extends State>(
  queryParams: URLSearchParams,
  initialState: S,
): S => {
  const initial = { ...initialState }

  Object.keys(initialState).forEach(key => {
    const typedKey = key as keyof S
    const queryParam = queryParams.get(key)

    // Only truthy values are actually used
    if (queryParam) {
      initial[typedKey] = deserializeValue(
        queryParam,
        initialState[typedKey],
      ) as S[keyof S]
    }
  })

  return initial
}

const serializeURLState = <S extends State>(
  location: Location,
  state: S,
): URLSearchParams => {
  const searchParams = new URLSearchParams(location.search)

  Object.keys(state).forEach(key => {
    if (isNull(state[key])) {
      searchParams.delete(key)
    } else {
      searchParams.set(key, serializeValue(state[key]))
    }
  })

  return searchParams
}

/**
 * Sync a React state with the URL.
 * @param `initialState` Determines the state's shape if not explicitely defined.
 * @param `deserialize` Can be used for non-primitive types (eg. objects, arrays).
 * @returns Returns a stateful value, and a function to update it.
 */
export const useURLState = <S extends State>({
  initialState,
}: UseURLStateParams<S>): [S, UpdateStateFn<S>] => {
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState<S>(
    deserializeURLState(new URLSearchParams(location.search), initialState),
  )

  const onChange: UpdateStateFn<S> = s => {
    const newState = typeof s === 'function' ? s(state) : s
    setState(newState)
    const searchParams = serializeURLState(location, newState)
    navigate({ pathname: location.pathname, search: searchParams.toString() })
  }

  return [state, onChange]
}
