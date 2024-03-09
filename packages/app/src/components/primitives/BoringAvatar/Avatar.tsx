import { FC } from 'react'

import { Bauhaus } from './components/Bauhaus'
import { Beam } from './components/Beam'
import { Initials } from './components/Initials'
import { Marble } from './components/Marble'
import { Pixel } from './components/Pixel'
import { Ring } from './components/Ring'
import { Sunset } from './components/Sunset'
import { AvatarProps } from './types'

export const Avatar: FC<AvatarProps> = props => {
  switch (props.variation) {
    case 'initials':
      return <Initials {...props} />
    case 'bauhaus':
      return <Bauhaus {...props} />
    case 'beam':
      return <Beam {...props} />
    case 'marble':
      return <Marble {...props} />
    case 'pixel':
      return <Pixel {...props} />
    case 'ring':
      return <Ring {...props} />
    case 'sunset':
      return <Sunset {...props} />
  }
}
