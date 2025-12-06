export const nextSearchParamsToObj = (searchParams: URLSearchParams): Record<string, string | string[]> => {
  const obj: Record<string, string | string[]> = {}

  for (const key of new Set(searchParams.keys())) {
    const all = searchParams.getAll(key)

    obj[key] = all.length > 1 ? all : all[0]
  }

  return obj
}

export const objectToSearchParams = ({
  obj = {},
  overrides = {}
}: {
  obj: { [key: string]: string | string[] | number[] | number | undefined | null }
  overrides?: { [key: string]: string | string[] | number[] | number | undefined | null }
}): string => {
  const params = new URLSearchParams()

  const newObj = { ...obj, ...overrides }

  for (const [key, value] of Object.entries(newObj)) {
    if (value == null || value === '') continue

    if (Array.isArray(value)) {
      value.forEach(v => {
        if (v != null && v !== '') {
          params.append(key, String(v))
        }
      })
    } else {
      params.set(key, String(value))
    }
  }

  return params.toString()
}
