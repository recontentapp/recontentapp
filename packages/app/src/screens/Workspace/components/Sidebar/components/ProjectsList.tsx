import { FC } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'

import { Box, Icon, Stack, Tooltip } from 'design-system'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import routes from '../../../../../routing'
import { styled } from '../../../../../theme'

interface ProjectsListItem {
  id: string
  name: string
  revisionId: string
}

interface ProjectsListProps {
  title: string
  items: ProjectsListItem[]
  onAdd?: () => void
}

const Title = styled('h2', {
  fontSize: '$size60',
  fontWeight: 400,
  textTransform: 'uppercase',
  color: '$purple400',
})

const Button = styled('button', {
  cursor: 'pointer',
  outline: 'none',
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  '&:hover,&:focus': {
    backgroundColor: '$purple800',
  },
  '&:active': {
    backgroundColor: '$purple700',
  },
})

const ProjectButton = styled('button', {
  cursor: 'pointer',
  outline: 'none',
  display: 'flex',
  lineHeight: 1.1,
  width: 'calc(100% + 16px)',
  textAlign: 'left',
  color: '$purple100',
  fontSize: '$size80',
  marginLeft: -8,
  marginRight: -8,
  paddingX: '$space60',
  paddingY: '$space60',
  borderRadius: '$radius200',
  transition: 'all 0.2s ease-in-out',
  variants: {
    active: {
      true: {
        backgroundColor: '$purple800',
      },
    },
  },
  '&:hover,&:focus': {
    backgroundColor: '$purple800',
  },
  '&:active': {
    backgroundColor: '$purple700',
  },
})

export const ProjectsList: FC<ProjectsListProps> = ({
  title,
  items,
  onAdd,
}) => {
  const { key: workspaceKey } = useCurrentWorkspace()
  const match = useMatch('/:workspaceKey/projects/:projectId/*')
  const navigate = useNavigate()

  return (
    <Box width="100%" paddingX="$space60">
      <Stack width="100%" direction="column" spacing="$space40">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Title>{title}</Title>

          {onAdd && (
            <Tooltip title="Quickly create a project" position="right">
              <Button onClick={onAdd} aria-label="Quickly create a project">
                <Icon src="add_circle" size={20} color="$purple400" />
              </Button>
            </Tooltip>
          )}
        </Stack>

        <Stack renderAs="ul" direction="column" spacing="$space40">
          {items.map(item => (
            <li key={item.id}>
              <ProjectButton
                active={match !== null && match.params.projectId === item.id}
                onClick={() =>
                  navigate(
                    routes.projectPhrases.url({
                      pathParams: {
                        workspaceKey,
                        projectId: item.id,
                        revisionId: item.revisionId,
                      },
                    }),
                  )
                }
              >
                {item.name}
              </ProjectButton>
            </li>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
