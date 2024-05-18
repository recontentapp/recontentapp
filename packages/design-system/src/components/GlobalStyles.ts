import { FC } from 'react'

import { globalStyles as globalStylesDropdownMenu } from './DropdownButton'
import { globalStyles as globalStylesModal } from './Modal'
import { globalStyles as globalStylesTooltip } from './Tooltip'
import { globalStyles as globalStylesComboboxField } from './fields/ComboboxField'
import { globalStyles as globalStylesDateField } from './fields/DateField'
import { globalStyles as globalStylesSelectField } from './fields/SelectField'

export const GlobalStyles: FC = () => {
  globalStylesTooltip()
  globalStylesComboboxField()
  globalStylesSelectField()
  globalStylesModal()
  globalStylesDropdownMenu()
  globalStylesDateField()

  return null
}
