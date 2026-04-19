'use client'

import * as React from 'react'

type DatePickerProps = {
  id?: string
  onChange?: (value: Date | null) => void
  placeholder?: string
  readOnly?: boolean
  value?: Date | string | null
}

const toInputValue = (value?: Date | string | null) => {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const pad = (part: number) => String(part).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function DatePicker(props: DatePickerProps) {
  const { id, onChange, placeholder, readOnly, value } = props

  return (
    <input
      defaultValue={toInputValue(value)}
      id={id}
      onChange={(event) => {
        const next = event.target.value
        onChange?.(next ? new Date(next) : null)
      }}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: '100%',
        minHeight: 40,
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        color: 'inherit',
      }}
      type="datetime-local"
    />
  )
}
