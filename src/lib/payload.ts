import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const getPayloadClient = async () => {
  const config = await configPromise
  return getPayload({ config })
}
