import { homeGalleryPositions, type HomeGalleryPosition } from './generated/template-home-positions'

export type { HomeGalleryPosition }

export const getHomeGalleryPositions = (): HomeGalleryPosition[] => homeGalleryPositions
