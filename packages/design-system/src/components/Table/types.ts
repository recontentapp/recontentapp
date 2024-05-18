import { ReactNode } from 'react'

import { IconName } from '../Icon'

export interface ColumnConfig<ItemShape, ColumnKey extends string> {
  key: ColumnKey
  isPrimary?: boolean
  headerCell: string | ReactNode
  width?: number
  withoutPadding?: boolean
  bodyCell: (item: ItemShape, index: number) => ReactNode
}

export interface TableProps<ItemShape, ColumnKey extends string> {
  primaryAction?: {
    label: string
    icon?: IconName
    onAction: (item: ItemShape, index: number) => void
  }
  isLoading?: boolean
  columns: Array<ColumnConfig<ItemShape, ColumnKey>>
  items: ItemShape[]
  footerLoadMore?: () => void
  footerAddOnAction?: () => void
  footerAdd?: (options: { requestClose: () => void }) => ReactNode
  onSelectionChange?: (selectedItems: ItemShape[]) => void
  Footer?: ReactNode
  SelectionFooter?: ReactNode
}

export interface TableRef {
  resetSelection: () => void
}
