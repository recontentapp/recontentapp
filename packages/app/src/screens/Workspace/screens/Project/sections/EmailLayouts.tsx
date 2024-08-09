import { FC, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Box,
  ConfirmationModal,
  ConfirmationModalRef,
  DropdownButton,
  Icon,
  Stack,
  Table,
  Text,
} from 'design-system'
import { HorizontalSpinner } from '../../../../../components/HorizontalSpinner'
import {
  useDeleteEmailLayout,
  useGetProject,
} from '../../../../../generated/reactQuery'
import { useFormatter } from '../../../../../hooks/formatter'
import { useURLState } from '../../../../../hooks/urlState'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import routes from '../../../../../routing'
import { formatRelative } from '../../../../../utils/dates'
import { useModals } from '../../../hooks/modals'
import { useReferenceableAccounts } from '../../../hooks/referenceable'
import { Search } from '../components/Search'
import { useInfiniteListEmailLayouts } from '../hooks'

export const EmailLayouts: FC = () => {
  const [state, setState] = useURLState<{
    key: string
  }>({
    initialState: {
      key: '',
    },
  })

  const navigate = useNavigate()
  const params = useParams<'projectId'>()
  const formatter = useFormatter()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const { getName } = useReferenceableAccounts()
  const { key: workspaceKey } = useCurrentWorkspace()
  const { data, fetchNextPage, hasNextPage, refetch, isPending } =
    useInfiniteListEmailLayouts({
      projectId: params.projectId!,
      key: state.key,
    })

  const layouts = useMemo(
    () => data?.pages.map(page => page.items).flat() ?? [],
    [data],
  )

  const { data: project } = useGetProject({
    queryParams: {
      id: params.projectId!,
    },
  })
  const { openCreateEmailLayout } = useModals()
  const { mutateAsync: deleteLayout } = useDeleteEmailLayout({
    onSuccess: () => refetch(),
  })

  const search = useMemo(
    () => ({
      initialValue: state.key,
      onSearch: (query: string) => setState({ key: query }),
      onClear: () => {
        setState(state => ({
          ...state,
          key: '',
        }))
      },
    }),
    [],
  )

  if (!project) {
    return <HorizontalSpinner />
  }

  const layoutsTotalCount = data?.pages.at(0)?.pagination.itemsCount ?? 0

  return (
    <Box width="100%" paddingBottom="$space700">
      <Stack direction="column" spacing="$space80">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing="$space60">
            <Stack direction="row" spacing="$space40" alignItems="center">
              <Icon src="layers" color="$gray12" size={16} />

              <Stack direction="row" spacing="$space40" alignItems="center">
                <Text size="$size80" color="$gray14" variation="bold">
                  {formatter.format(layoutsTotalCount)}
                </Text>
                <Text size="$size80" color="$gray11">
                  {layoutsTotalCount > 1 ? 'email layouts' : 'layout'}
                </Text>
              </Stack>
            </Stack>
          </Stack>

          <Search
            onChange={search.onSearch}
            initialValue={search.initialValue}
          />
        </Stack>

        <Table
          isLoading={isPending}
          primaryAction={{
            label: 'Update',
            icon: 'edit',
            onAction: layout =>
              navigate(
                routes.projectEmailLayoutEditor.url({
                  pathParams: {
                    workspaceKey,
                    projectId: project.id,
                    layoutId: layout.id,
                  },
                }),
              ),
          }}
          footerLoadMore={hasNextPage ? fetchNextPage : undefined}
          footerAddOnAction={() => {
            openCreateEmailLayout(project)
          }}
          items={layouts}
          columns={[
            {
              headerCell: 'Key',
              isPrimary: true,
              width: 320,
              key: 'key',
              bodyCell: layout => (
                <span
                  title={layout.key}
                  style={{
                    maxWidth: 300,
                    display: 'inline-block',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {layout.key}
                </span>
              ),
            },
            {
              headerCell: 'Last updated by',
              key: 'updatedBy',
              bodyCell: layout => (
                <span>{getName(layout.updatedBy ?? layout.createdBy)}</span>
              ),
            },
            {
              headerCell: 'Last updated on',
              width: 130,
              key: 'updatedAt',
              bodyCell: layout => (
                <span>{formatRelative(new Date(layout.updatedAt))}</span>
              ),
            },
            {
              headerCell: 'Actions',
              key: 'actions',
              width: 100,
              bodyCell: layout => (
                <DropdownButton
                  variation="minimal"
                  icon="more"
                  usePortal={false}
                  items={[
                    {
                      label: 'Update',
                      icon: 'edit',
                      onSelect: () =>
                        navigate(
                          routes.projectEmailLayoutEditor.url({
                            pathParams: {
                              workspaceKey,
                              projectId: project.id,
                              layoutId: layout.id,
                            },
                          }),
                        ),
                    },
                    {
                      label: 'Delete',
                      icon: 'delete',
                      variation: 'danger',
                      onSelect: () => {
                        confirmationModalRef.current.confirm().then(res => {
                          if (!res) {
                            return
                          }

                          deleteLayout({ body: { id: layout.id } })
                        })
                      },
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Stack>

      <ConfirmationModal
        variation="danger"
        title="Are you sure about deleting this email layout?"
        description="Once an email layout is deleted, its content cannot be recovered."
        ref={confirmationModalRef}
      />
    </Box>
  )
}
