import { styled } from '../theme'

interface Tab<T> {
  label: string
  value: T
}

interface TabsProps<T> {
  label: string
  tabs: Tab<T>[]
  currentTab: string
  onSelect: (tab: T) => void
}

const TabList = styled('ul', {
  display: 'flex',
  gap: '$space40',
  padding: 0,
  margin: 0,
  listStyle: 'none',
})

const Tab = styled('li', {
  button: {
    cursor: 'pointer',
    fontWeight: 500,
    position: 'relative',
    display: 'inline-block',
    appearance: 'none',
    textDecoration: 'none',
    color: '$gray11',
    transition: 'all 0.2s ease-in-out',
    borderBottom: '2px solid transparent',
    marginLeft: '$space60',
    borderRadius: 0,
    margin: 0,
    paddingY: '$space40',
    paddingX: '$space60',
    fontSize: '$size80',
    textAlign: 'center',
    '&:hover,&:focus': {
      color: '$gray14',
    },
  },
  variants: {
    selected: {
      true: {
        button: {
          color: '$purple800',
          borderBottomColor: '$purple800',
          '&:hover,&:focus': {
            color: '$purple700',
            borderBottomColor: '$purple700',
          },
        },
      },
    },
  },
})

export const Tabs = <T extends string>({
  label,
  tabs,
  currentTab,
  onSelect,
}: TabsProps<T>) => {
  return (
    <TabList role="tablist" aria-label={label}>
      {tabs.map(tab => (
        <Tab key={tab.value} selected={tab.value === currentTab}>
          <button
            onClick={() => onSelect(tab.value)}
            role="tab"
            aria-selected={tab.value === currentTab}
          >
            {tab.label}
          </button>
        </Tab>
      ))}
    </TabList>
  )
}
