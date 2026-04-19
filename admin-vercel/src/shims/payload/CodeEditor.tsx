'use client'

import * as React from 'react'

type CodeEditorProps = {
  className?: string
  onChange?: (value?: string) => void
  readOnly?: boolean
  value?: string | null
}

export default function CodeEditor(props: CodeEditorProps) {
  const { className, onChange, readOnly, value } = props

  return (
    <textarea
      className={className}
      defaultValue={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
      readOnly={readOnly}
      style={{
        width: '100%',
        minHeight: 180,
        padding: 12,
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        color: 'inherit',
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    />
  )
}
