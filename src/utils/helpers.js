import fp from 'lodash/fp'

export const parseQueryString = string =>
  fp.compose(
    JSON.parse,
    JSON.stringify,
    fp.reduce((acc, part) => {
      const [name, value] = part.split('=')
      acc[name] = decodeURIComponent(value || '')
      return acc
    }, {}),
    str => (str ? str.split('&') : []),
    fp.replace('?', '')
  )(string)

export const jsonToQueryString = obj => {
  const pairs = []
  obj &&
    Object.keys(obj).forEach(key => {
      if (obj[key]) {
        const value = encodeURIComponent(obj[key])
        value && pairs.push(`${key}=${value}`)
      }
    })

  return pairs.length ? `?${pairs.join('&')}` : ''
}

export const truncate = (input, len = 100) => {
  let str = (input || '').replace(/<[^>]+>/g, '')
  if (str && str.length > len) {
    return `${str.substring(0, len)}...`
  } else {
    return str
  }
}

export const capitalize = str =>
  typeof str === 'string' && str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : str

export const getFullName = person => `${person.firstName} ${person.lastName}`

export const bindCallbackToPromise = () => {
  let _resolve
  const promise = () => {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
  const cb = args => _resolve(args)

  return {
    promise,
    cb
  }
}

// a little function to help us with reordering the result
export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}
