import { Popover, positionDefault } from '@reach/popover'
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useOutsideClick } from '../../hooks/outsideClick'
import { styled } from '../../theme'
import { MinimalButton } from './MinimalButton'
import { Stack } from './Stack'
import { Text } from './Text'
import { SelectField } from './fields'

export interface FilterProps {
  options: Array<{
    label: string
    value: string
    text: string
    options: Array<{
      label: string
      value: string
    }>
  }>
  onSelect: (
    obj: { firstValue: string; secondValue: string } | undefined,
  ) => void
}

export interface FilterRef {
  setValues: (firstSelect?: string, secondSelect?: string) => void
}

const Container = styled('div', {
  backgroundColor: '$white',
  boxShadow: '$shadow300',
  borderRadius: '$radius200',
  border: '1px solid $gray7',
  paddingX: '$space100',
  paddingY: '$space100',
  variants: {
    hasOption: {
      true: {
        width: 390,
      },
      false: {},
    },
  },
})

export const Filter = forwardRef<FilterRef, FilterProps>(
  ({ options, onSelect }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const buttonRef = useRef<HTMLDivElement>(null!)
    const containerRef = useRef<HTMLDivElement>(null!)
    const [firstSelect, setFirstSelect] = useState<string | undefined>(
      undefined,
    )
    const [secondSelect, setSecondSelect] = useState<string | undefined>(
      undefined,
    )

    useImperativeHandle(ref, () => ({
      setValues: (firstSelect, secondSelect) => {
        setFirstSelect(firstSelect)
        setSecondSelect(secondSelect)
      },
    }))

    const currentFirstOption = useMemo(() => {
      if (!firstSelect) {
        return undefined
      }

      return options.find(option => option.value === firstSelect)!
    }, [firstSelect, options])

    const onLocalSelect = (firstSelect?: string, secondSelect?: string) => {
      if (!firstSelect && !secondSelect) {
        onSelect(undefined)
      }

      if (firstSelect && secondSelect) {
        onSelect({ firstValue: firstSelect, secondValue: secondSelect })
      }
    }

    useOutsideClick(containerRef, () => {
      if (!secondSelect) {
        setFirstSelect(undefined)
      }
      setIsVisible(false)
    })

    const hasFilterOn = !!firstSelect && !!secondSelect

    return (
      <>
        <div ref={buttonRef}>
          <MinimalButton
            variation={hasFilterOn ? 'primary' : 'minimal'}
            icon="filter"
            onAction={() => setIsVisible(true)}
          >
            {hasFilterOn ? 'Filters (1)' : 'Filters'}
          </MinimalButton>
        </div>

        {isVisible && (
          <Popover
            targetRef={buttonRef}
            position={positionDefault}
            style={{ zIndex: 1 }}
          >
            <Container ref={containerRef} hasOption={!!currentFirstOption}>
              {!currentFirstOption ? (
                <MinimalButton
                  icon="add"
                  onAction={() => setFirstSelect(options[0].value)}
                >
                  Add filter
                </MinimalButton>
              ) : (
                <Stack direction="row" alignItems="center" spacing="$space60">
                  <Stack direction="row" alignItems="center" spacing="$space80">
                    <SelectField
                      onChange={option => {
                        setFirstSelect(option?.value ?? undefined)
                        onLocalSelect(option?.value ?? undefined, secondSelect)
                      }}
                      value={currentFirstOption.value}
                      label="Where"
                      hideLabel
                      placeholder="Select Option..."
                      options={options.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />

                    {currentFirstOption.text && (
                      <Text size="$size100" color="$gray14">
                        {currentFirstOption.text}
                      </Text>
                    )}

                    <SelectField
                      onChange={option => {
                        setSecondSelect(option?.value ?? undefined)
                        onLocalSelect(firstSelect, option?.value ?? undefined)
                      }}
                      value={secondSelect}
                      label="Where"
                      hideLabel
                      placeholder="Select Option..."
                      options={currentFirstOption.options.map(
                        ({ label, value }) => ({
                          label,
                          value,
                        }),
                      )}
                    />
                  </Stack>

                  <MinimalButton
                    onAction={() => {
                      setIsVisible(false)
                      setFirstSelect(undefined)
                      setSecondSelect(undefined)
                      onSelect(undefined)
                    }}
                    icon="delete"
                    variation="danger"
                  />
                </Stack>
              )}
            </Container>
          </Popover>
        )}
      </>
    )
  },
)
