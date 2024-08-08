import { Portal } from '@reach/portal'
import { Command } from 'cmdk'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box } from 'design-system'
import { useListProjects } from '../../../../generated/reactQuery'
import { useCurrentWorkspace, useHasAbility } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { keyframes, styled } from '../../../../theme'
import { useModals } from '../../hooks/modals'
import { useKBarContext } from './context'

const fadeIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'scale(.99)',
  },
  '50%': { opacity: 1, transform: 'scale(1.005)' },
  '100%': { opacity: 1, transform: 'scale(1)' },
})

const ContextTitle = styled('span', {
  backgroundColor: '$gray3',
  color: '$gray11',
  fontSize: '$size60',
  borderRadius: '$radius100',
  lineHeight: 1,
  paddingX: '$space60',
  paddingY: '$space40',
  maxWidth: '60%',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
})

const Container = styled('div', {
  position: 'fixed',
  top: '13vh',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 99,
  '[cmdk-root]': {
    width: 600,
    backgroundColor: '$white',
    borderRadius: '$radius300',
    boxShadow: '$shadow500',
    background: '#ffffff',
    overflow: 'hidden',
    border: '1px solid $gray4',
    transition: 'transform 100ms ease',
    animation: `${fadeIn} ease-out 200ms forwards`,
  },
  '[cmdk-input]': {
    paddingX: '$space200',
    paddingY: 20,
    width: '100%',
    boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
    outline: 'none',
    border: 'none',
    borderBottom: '1px solid $gray4',
    color: '$gray14',
    fontSize: '$size200',
    fontWeight: 500,
    borderRadius: 0,
    '&::placeholder': {
      color: '$gray8',
    },
  },
  '[cmdk-list]': {
    paddingTop: '$space40',
    paddingBottom: '$space80',
    paddingX: '$space60',
    height: ' min(330px, calc(var(--cmdk-list-height)))',
    maxHeight: '400px',
    overflow: 'auto',
    overscrollBehavior: 'contain',
    transition: '100ms ease',
    transitionProperty: 'height',
  },
  '[cmdk-item]': {
    contentVisibility: 'auto',
    cursor: 'pointer',
    height: '48px',
    borderRadius: '8px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 16px',
    color: '$gray14',
    userSelect: 'none',
    willChange: 'background, color',
    transition: 'all 150ms ease',
    transitionProperty: 'none',

    '&[aria-selected="true"]': {
      background: '$gray2',
    },

    '&[aria-disabled="true"]': {
      color: 'var(--gray8)',
      cursor: 'not-allowed',
    },

    '&:active': {
      transitionProperty: 'background',
      background: '$gray5',
      color: '$purple800',
    },

    '& + [cmdk-item]': {
      marginTop: 4,
    },

    svg: {
      width: 18,
      height: 18,
    },
  },

  '[cmdk-separator]': {
    height: 1,
    width: '100%',
    background: 'var(--gray5)',
    margin: '4px 0',
  },

  '*:not([hidden]) + [cmdk-group]': {
    marginTop: '8px',
  },

  '[cmdk-group-heading]': {
    userSelect: 'none',
    fontSize: '12px',
    color: '$gray11',
    paddingX: '$space60',
    paddingY: '$space40',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },

  '[cmdk-empty]': {
    paddingTop: '$space200',
    paddingBottom: '$space300',
    fontSize: '$size80',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'pre-wrap',
    color: '$gray11',
  },
})

interface Action {
  label: string
  onSelect: () => void
}

export const KBar = () => {
  const navigate = useNavigate()
  const { key: workspaceKey, id: workspaceId } = useCurrentWorkspace()
  const { setIsOpen, isOpen, project } = useKBarContext()
  const { data: projectsData } = useListProjects({
    queryParams: {
      workspaceId,
      page: 1,
      pageSize: 50,
    },
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    closeAll,
    openCreatePhrase,
    openCreateTag,
    openCreateProject,
    openCreateDestination,
    openCreateEmailLayout,
    openCreateEmailTemplate,
  } = useModals()
  const canManageLanguages = useHasAbility('languages:manage')
  const canManageMembers = useHasAbility('members:manage')
  const canManageIntegrations = useHasAbility('integrations:manage')
  const canManageProjectDestination = useHasAbility(
    'projects:destinations:manage',
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        closeAll()
        setIsOpen(!isOpen)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [closeAll, isOpen, setIsOpen])

  const doAndClose = useCallback(
    (fn: () => void) => {
      return () => {
        fn()
        setIsOpen(false)
      }
    },
    [setIsOpen],
  )

  const navigationItems = useMemo(() => {
    return [
      {
        label: 'Go to Dashboard',
        path: routes.dashboard.url({ pathParams: { workspaceKey } }),
      },
      ...(canManageMembers
        ? [
            {
              label: 'Go to Members settings',
              path: routes.workspaceSettingsMembers.url({
                pathParams: { workspaceKey },
              }),
            },
          ]
        : []),
      ...(canManageLanguages
        ? [
            {
              label: 'Go to Languages settings',
              path: routes.workspaceSettingsLanguages.url({
                pathParams: { workspaceKey },
              }),
            },
          ]
        : []),
      ...(canManageIntegrations
        ? [
            {
              label: 'Go to Integrations settings',
              path: routes.workspaceSettingsIntegrations.url({
                pathParams: { workspaceKey },
              }),
            },
          ]
        : []),
      {
        label: 'Go to User settings',
        path: routes.userSettings.url({ pathParams: { workspaceKey } }),
      },
    ]
  }, [
    workspaceKey,
    canManageLanguages,
    canManageIntegrations,
    canManageMembers,
  ])

  const actionsItems = useMemo(() => {
    const actions: Action[] = []

    if (project) {
      actions.push(
        ...[
          {
            label: 'Create a phrase',
            onSelect: () => {
              openCreatePhrase(project, project.masterRevisionId)
            },
          },
          {
            label: 'Create a tag',
            onSelect: () => {
              openCreateTag(project)
            },
          },
          {
            label: 'Create an email layout',
            onSelect: () => {
              openCreateEmailLayout(project)
            },
          },
          {
            label: 'Create an email template',
            onSelect: () => {
              openCreateEmailTemplate(project)
            },
          },
          ...(canManageProjectDestination
            ? [
                {
                  label: 'Create a destination',
                  onSelect: () => {
                    openCreateDestination(project)
                  },
                },
              ]
            : []),
        ],
      )
    }

    actions.push({
      label: 'Create a project',
      onSelect: () => {
        openCreateProject()
      },
    })

    return actions
  }, [
    project,
    openCreateProject,
    openCreatePhrase,
    openCreateTag,
    openCreateDestination,
    openCreateEmailLayout,
    openCreateEmailTemplate,
    canManageProjectDestination,
  ])

  const projectItems = useMemo(() => {
    if (!project) {
      return []
    }

    return [
      {
        label: 'Go to Project phrases',
        path: routes.projectPhrases.url({
          pathParams: {
            workspaceKey,
            projectId: project.id,
            revisionId: project.masterRevisionId,
          },
        }),
      },
      {
        label: 'Go to Project Import',
        path: routes.projectImport.url({
          pathParams: { workspaceKey, projectId: project.id },
        }),
      },
      {
        label: 'Go to Project Export',
        path: routes.projectExport.url({
          pathParams: { workspaceKey, projectId: project.id },
        }),
      },
      {
        label: 'Go to Project settings',
        path: routes.projectSettings.url({
          pathParams: { workspaceKey, projectId: project.id },
        }),
      },
    ]
  }, [workspaceKey, project])

  return (
    <>
      <Portal>
        <Container ref={containerRef} />
      </Portal>
      <Command.Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        label="Global Command Menu"
        container={containerRef.current ?? undefined}
      >
        {project && (
          <Box paddingX="$space200" paddingTop="$space100">
            <ContextTitle>{project.name}</ContextTitle>
          </Box>
        )}
        <Command.Input placeholder="Type a command or search..." />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>

          <Command.Group heading="Actions">
            {actionsItems.map(item => (
              <Command.Item
                key={item.label}
                onSelect={doAndClose(item.onSelect)}
              >
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>

          {project && (
            <Command.Group heading="Project">
              {projectItems.map(item => (
                <Command.Item
                  key={item.label}
                  onSelect={doAndClose(() => {
                    navigate(item.path)
                  })}
                >
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Projects">
            {projectsData?.items.map(project => (
              <Command.Item
                key={project.id}
                onSelect={doAndClose(() =>
                  navigate(
                    routes.projectPhrases.url({
                      pathParams: {
                        workspaceKey,
                        projectId: project.id,
                        revisionId: project.masterRevisionId,
                      },
                    }),
                  ),
                )}
              >
                {project.name}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Navigation">
            {navigationItems.map(item => (
              <Command.Item
                key={item.label}
                onSelect={doAndClose(() => {
                  navigate(item.path)
                })}
              >
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  )
}
