import { FC, ReactNode } from 'react'

import { Box } from '../../Box'
import { Icon } from '../../Icon'
import { Text } from '../../Text'

interface MessageProps {
  error?: ReactNode
  info?: ReactNode
  withPaddingTop?: boolean
}

export const Message: FC<MessageProps> = ({ error, info, withPaddingTop }) => {
  if (!error && !info) {
    return null
  }

  return (
    <Box display="block" paddingTop={withPaddingTop ? '$space40' : undefined}>
      <div
        style={{
          display: 'inline-block',
          paddingRight: 4,
          transform: 'translateY(3px)',
        }}
      >
        <Icon src="info" size={16} color={error ? '$red200' : '$gray10'} />
      </div>
      <Text
        size="$size80"
        color={error ? '$red100' : '$gray11'}
        renderAs="span"
        lineHeight="$lineHeight200"
      >
        {error || info}
      </Text>
    </Box>
  )
}
