export const formatPrice = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--'
  }

  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
