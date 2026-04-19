'use client'

import React, { useRef, useState } from 'react'
import type { TextFieldClientComponent } from 'payload'
import { FieldError, FieldLabel, useField } from '@payloadcms/ui'

type UploadResponse = {
  id: number
  url: string
}

const fieldWrapStyle: React.CSSProperties = {
  display: 'grid',
  gap: '0.75rem',
}

const rowStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: '0.75rem',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--theme-elevation-0)',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: '0.5rem',
  color: 'var(--theme-text)',
  flex: 1,
  fontSize: '0.95rem',
  minWidth: 0,
  padding: '0.65rem 0.8rem',
}

const buttonStyle: React.CSSProperties = {
  background: 'var(--theme-success-500)',
  border: 0,
  borderRadius: '999px',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '0.88rem',
  fontWeight: 600,
  lineHeight: 1,
  padding: '0.75rem 1rem',
  whiteSpace: 'nowrap',
}

const previewStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-100)',
  borderRadius: '0.75rem',
  maxHeight: '180px',
  maxWidth: '180px',
  objectFit: 'contain',
  padding: '0.5rem',
}

export const ImageUploadField: TextFieldClientComponent = ({ field, path }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState('')

  const {
    errorMessage,
    path: resolvedPath,
    setValue,
    showError,
    value,
  } = useField<string>({
    path,
  })

  const uploadCategory = field.admin?.custom?.uploadCategory
  const readOnly = field.admin?.readOnly

  const handlePickFile = () => {
    if (readOnly || isUploading) return
    inputRef.current?.click()
  }

  const handleUpload = async (file?: File | null) => {
    if (!file || !uploadCategory) return

    setIsUploading(true)
    setStatus('上传中...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', String(uploadCategory))
      formData.append('alt', typeof field.label === 'string' ? field.label : field.name)

      const response = await fetch('/api/admin/upload-image', {
        body: formData,
        credentials: 'include',
        method: 'POST',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error || '上传失败，请稍后再试。')
      }

      const payload = (await response.json()) as UploadResponse
      setValue(payload.url)
      setStatus('上传成功，图片地址已自动填入。')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '上传失败，请稍后再试。')
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="field-type text" style={fieldWrapStyle}>
      <FieldLabel label={field.label} path={resolvedPath} required={field.required} />
      <FieldError message={errorMessage} showError={showError} />

      <div style={rowStyle}>
        <input
          disabled={readOnly || isUploading}
          onChange={(event) => setValue(event.target.value)}
          placeholder="可直接粘贴图片地址，或点击右侧上传"
          style={inputStyle}
          type="text"
          value={typeof value === 'string' ? value : ''}
        />
        <button onClick={handlePickFile} style={buttonStyle} type="button">
          {isUploading ? '上传中' : '上传图片'}
        </button>
        <input
          accept="image/*"
          hidden
          onChange={(event) => {
            void handleUpload(event.target.files?.[0] || null)
          }}
          ref={inputRef}
          type="file"
        />
      </div>

      {status ? <div style={{ color: 'var(--theme-text)', fontSize: '0.85rem', opacity: 0.8 }}>{status}</div> : null}

      {typeof value === 'string' && value ? (
        <div>
          <img alt={typeof field.label === 'string' ? field.label : field.name} src={value} style={previewStyle} />
        </div>
      ) : null}
    </div>
  )
}

