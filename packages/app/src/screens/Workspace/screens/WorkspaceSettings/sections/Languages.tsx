import { FC } from 'react'

import { Table } from 'design-system'
import { useListWorkspaceLanguages } from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { styled } from '../../../../../theme'
import { formatRelative } from '../../../../../utils/dates'
import { CopyPaste } from '../../../components/CopyPaste'
import { useReferenceableAccounts } from '../../../hooks/referenceable'
import { AddLanguageForm } from '../components/AddLanguageForm'

const Key = styled('span', {
  fontFamily: '$mono',
  fontSize: '$size60',
  paddingY: '$space40',
  paddingX: '$space60',
  borderRadius: '$radius200',
  backgroundColor: '$gray3',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '$gray4',
  },
})

export const Languages: FC = () => {
  const { id: workspaceId } = useCurrentWorkspace()
  const { getName } = useReferenceableAccounts()
  const { isLoading: areLanguagesLoading, data: languages } =
    useListWorkspaceLanguages({ queryParams: { workspaceId } })

  return (
    <Table
      footerAdd={({ requestClose }) => (
        <AddLanguageForm onClose={requestClose} />
      )}
      isLoading={areLanguagesLoading}
      items={languages ?? []}
      columns={[
        {
          headerCell: 'Name',
          key: 'name',
          width: 300,
          bodyCell: locale => <p>{locale.name}</p>,
        },
        {
          headerCell: 'Locale',
          key: 'locale',
          bodyCell: language => (
            <CopyPaste content={language.locale}>
              <Key>{language.locale}</Key>
            </CopyPaste>
          ),
        },
        {
          headerCell: 'Created by',
          key: 'created_by',
          bodyCell: locale => getName(locale.createdBy),
        },
        {
          headerCell: 'Creation date',
          key: 'created_at',
          bodyCell: locale => formatRelative(new Date(locale.createdAt)),
        },
      ]}
    />
  )
}
