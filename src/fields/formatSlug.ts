import slugify from 'slugify'

export const formatSlug = (fallbackField: string) => {
  return ({ data, value }: { data?: Record<string, unknown>; value?: string | null }) => {
    if (typeof value === 'string' && value.trim()) {
      return slugify(value, { lower: true, strict: true })
    }

    const fallback = data?.[fallbackField]

    if (typeof fallback === 'string' && fallback.trim()) {
      return slugify(fallback, { lower: true, strict: true })
    }

    return value
  }
}
