export type AvatarVariation =
  | 'pixel'
  | 'bauhaus'
  | 'ring'
  | 'beam'
  | 'sunset'
  | 'initials'
  | 'marble'

export interface AvatarProps {
  name: string
  size: number
  variation: AvatarVariation
  colors?: string[]
  squared?: boolean
}
