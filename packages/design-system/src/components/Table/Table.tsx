import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ForwardedRef,
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'

import { styled } from '../../stitches'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Icon } from '../Icon'
import { Stack } from '../Stack'
import { TableProps, TableRef } from './types'

const Container = styled('table', {
  width: '100%',
  tableLayout: 'fixed',
  // CSS trick to allow div within cells to take 100% height
  height: 1,
  '& thead': {
    height: 34,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: '$white',
    'tr > th:last-child': {
      borderRight: 'none',
    },
    '& th': {
      backgroundColor: '$white',
    },
  },
})

const Row = styled('tr', {})

const THeader = styled('thead', {
  height: 34,
  'tr > th:last-child': {
    borderRight: 'none',
  },
})

const THeaderCell = styled('th', {
  verticalAlign: 'middle',
  textAlign: 'left',
  borderBottom: '1px solid $gray7',
  borderTop: '1px solid $gray7',
  borderRight: '1px solid $gray7',
  paddingLeft: '$space60',
  color: '$gray9',
  fontWeight: 500,
  fontSize: '$size80',
})

const TBody = styled('tbody', {
  'tr > td:last-child': {
    borderRight: 'none',
  },
})

const TCell = styled('td', {
  position: 'relative',
  borderBottom: '1px solid $gray7',
  borderRight: '1px solid $gray7',
  verticalAlign: 'middle',
  fontWeight: 500,
  fontSize: '$size80',
  color: '$gray14',
  variants: {
    withoutPadding: {
      true: {},
      false: {
        paddingTop: '$space60',
        paddingBottom: '$space60',
        paddingLeft: '$space60',
        paddingRight: '$space60',
      },
    },
  },
  '.primary-action button': {
    opacity: 0,
    pointerEvents: 'none',
    '&:focus,&:active': {
      display: 'inline-flex',
      opacity: 1,
      pointerEvents: 'all',
    },
  },
  '&:hover,&:focus': {
    '.primary-action button': {
      display: 'inline-flex',
      opacity: 1,
      pointerEvents: 'all',
    },
  },
})

const FooterButton = styled('button', {
  width: '100%',
  paddingLeft: '$space60',
  paddingTop: '$space60',
  paddingBottom: '$space60',
  fontWeight: 500,
  fontSize: '$size80',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$space20',
  cursor: 'pointer',
  color: '$gray9',
  outline: 'none',
  textAlign: 'left',
  transition: 'all 0.2s ease-in-out',
  '&:hover,&:focus': {
    backgroundColor: '$gray3',
  },
  '&:active': {
    backgroundColor: '$gray5',
  },
})

const PrimaryActionContainer = styled('div', {
  position: 'absolute',
  right: '$space60',
  top: '50%',
  transform: 'translateY(-50%)',
})

const TFooter = styled('tfoot', {
  position: 'sticky',
  bottom: 0,
  zIndex: 1,
})

const TFooterRow = styled('tr', {
  td: {
    backgroundColor: '$purple800',
    borderTopLeftRadius: '$radius100',
    borderTopRightRadius: '$radius100',
  },
})

const TableWithoutRef = <ItemShape, ColumnKey extends string>(
  {
    columns,
    primaryAction,
    items,
    footerAdd,
    footerAddOnAction,
    footerLoadMore,
    onSelectionChange,
    Footer,
    SelectionFooter,
  }: TableProps<ItemShape, ColumnKey>,
  ref: ForwardedRef<TableRef>,
) => {
  const [isAdding, setIsAdding] = useState(false)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const isAddingRequestClose = () => setIsAdding(false)

  useEffect(() => {
    onSelectionChange?.(
      Object.keys(rowSelection).map(stringIndex => items[Number(stringIndex)]),
    )
  }, [rowSelection])

  const columnsConfig = useMemo<ColumnDef<ItemShape>[]>(() => {
    const cols: ColumnDef<ItemShape>[] = []
    if (onSelectionChange) {
      cols.push({
        id: 'select',
        size: 40,
        header: ({ table }) => (
          <Checkbox
            size="small"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            size="small"
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      })
    }

    columns.forEach(column => {
      cols.push({
        id: column.key,
        header: () => column.headerCell,
        meta: {
          isPrimary: column.isPrimary ?? false,
          withoutPadding: column.withoutPadding ?? false,
        },
        size: column.width,
        cell: ({ row: { original, index } }) =>
          column.bodyCell(original, index),
      })
    })

    return cols
  }, [onSelectionChange, columns])

  const data = useMemo(() => items, [items])
  const table = useReactTable({
    data,
    columns: columnsConfig,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
  })

  useImperativeHandle(ref, () => ({
    resetSelection: () => {
      table.setRowSelection({})
    },
  }))

  const selectionFooterVisible =
    SelectionFooter !== undefined && Object.keys(rowSelection).length > 0
  const regularFooterVisible = Footer !== undefined && !selectionFooterVisible
  const footerVisible = selectionFooterVisible || regularFooterVisible

  return (
    <Stack width="100%" direction="column">
      <Container>
        <THeader>
          {table.getHeaderGroups().map(headerGroup => (
            <Row key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <THeaderCell
                    key={header.id}
                    colSpan={header.colSpan}
                    css={{
                      width: header.column.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </THeaderCell>
                )
              })}
            </Row>
          ))}
        </THeader>

        <TBody>
          {table.getRowModel().rows.map(row => {
            return (
              <Row key={row.id}>
                {row.getVisibleCells().map(cell => {
                  const isPrimaryColumn =
                    (cell.column.columnDef.meta as any | undefined)
                      ?.isPrimary ?? (false as boolean)
                  const withoutPadding =
                    (cell.column.columnDef.meta as any | undefined)
                      ?.withoutPadding ?? (false as boolean)

                  return (
                    <TCell
                      key={cell.id}
                      withoutPadding={withoutPadding}
                      css={{
                        minWidth: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}

                      {isPrimaryColumn && primaryAction && (
                        <PrimaryActionContainer className="primary-action">
                          <Button
                            size="xsmall"
                            variation="secondary"
                            icon={primaryAction.icon}
                            onAction={() =>
                              primaryAction.onAction(
                                cell.row.original as ItemShape,
                                cell.row.index,
                              )
                            }
                          >
                            {primaryAction.label}
                          </Button>
                        </PrimaryActionContainer>
                      )}
                    </TCell>
                  )
                })}
              </Row>
            )
          })}
        </TBody>

        {footerVisible && (
          <TFooter>
            {selectionFooterVisible && (
              <TFooterRow>
                <td colSpan={table.getVisibleFlatColumns().length}>
                  {SelectionFooter}
                </td>
              </TFooterRow>
            )}
            {regularFooterVisible && (
              <TFooterRow>
                <td colSpan={table.getVisibleFlatColumns().length}>{Footer}</td>
              </TFooterRow>
            )}
          </TFooter>
        )}
      </Container>

      {footerLoadMore && (
        <FooterButton onClick={() => footerLoadMore()}>
          <Icon src="keyboard_arrow_down" color="$gray9" size={16} />
          Load more
        </FooterButton>
      )}

      {footerAddOnAction && (
        <FooterButton onClick={footerAddOnAction}>
          <Icon src="add" color="$gray9" size={16} />
          Add
        </FooterButton>
      )}

      {footerAdd && (
        <div>
          {isAdding ? (
            footerAdd({ requestClose: isAddingRequestClose })
          ) : (
            <FooterButton onClick={() => setIsAdding(true)}>
              <Icon src="add" color="$gray9" size={16} />
              Add
            </FooterButton>
          )}
        </div>
      )}
    </Stack>
  )
}

const TableWithRef = forwardRef(TableWithoutRef)

type TableWithRefProps<ItemShape, ColumnKey extends string> = TableProps<
  ItemShape,
  ColumnKey
> & {
  tRef?: Ref<TableRef>
}

export const Table = <ItemShape, ColumnKey extends string>({
  tRef,
  ...props
}: TableWithRefProps<ItemShape, ColumnKey>) => {
  // @ts-expect-error
  return <TableWithRef {...props} ref={tRef} />
}
