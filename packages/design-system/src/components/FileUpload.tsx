import { FC, useEffect, useState } from 'react'
import { Accept, useDropzone } from 'react-dropzone'

import { styled } from '../theme'
import { formatFileSize } from '../utils/files'
import { Icon } from './Icon'
import { MinimalButton } from './MinimalButton'
import { Stack } from './Stack'
import { Text } from './Text'

interface FileUploadProps {
  maxFiles?: number
  minSize?: number
  maxSize?: number
  accept: Accept
  onChange: (files: File[]) => void
}

const Container = styled('div', {
  width: '100%',
  cursor: 'pointer',
  border: '1px dashed $gray9',
  borderRadius: '$radius200',
  padding: '$space100',
  variants: {
    isDisabled: {
      true: {
        cursor: 'not-allowed',
      },
      false: {
        '&:hover, &:focus, &:active, &:focus-visible': {
          borderColor: '$blue500',
          outline: 'none',
        },
      },
    },
  },
})

const FileContainer = styled('li', {
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  paddingY: '$space60',
  paddingX: '$space80',
})

export const FileUpload: FC<FileUploadProps> = ({
  maxFiles,
  minSize,
  maxSize,
  accept,
  onChange,
}) => {
  const [files, setFiles] = useState<File[]>([])
  const disabled = maxFiles ? files.length >= maxFiles : false
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) =>
      setFiles(oldFiles => [...oldFiles, ...acceptedFiles]),
    maxFiles,
    minSize,
    maxSize,
    accept,
    disabled,
  })

  useEffect(() => {
    onChange(files)
  }, [files])

  const acceptedExtensions = Object.values(accept).flat()

  return (
    <Stack direction="column" spacing="$space80">
      <Container {...getRootProps()} isDisabled={disabled}>
        <input {...getInputProps()} />

        <Stack direction="column" alignItems="center" spacing="$space80">
          <Stack direction="column" alignItems="center" spacing="$space60">
            <Stack direction="column" alignItems="center" spacing="$space40">
              <Icon src="cloud_upload" size={24} color="$gray9" />

              <Text
                size="$size80"
                color="$gray11"
                maxWidth={200}
                textAlign="center"
                lineHeight="$lineHeight200"
              >
                {isDragActive
                  ? 'Drop the files here ...'
                  : "Drag 'n' drop some files here, or click to select files"}
              </Text>
            </Stack>

            <Text size="$size60" color="$gray9">
              ({acceptedExtensions.join(', ')})
            </Text>
          </Stack>

          <MinimalButton
            onAction={() => {}}
            variation="primary"
            icon="add_circle"
            isDisabled={disabled}
          >
            Add file
          </MinimalButton>
        </Stack>
      </Container>

      {files.length > 0 && (
        <Stack direction="column" renderAs="ul">
          {files.map((file, index) => (
            <FileContainer key={index}>
              <Stack
                direction="row"
                alignItems="center"
                spacing="$space60"
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" spacing="$space60">
                  <Icon src="file" size={20} color="$gray9" />
                  <Stack direction="row" alignItems="center" spacing="$space40">
                    <Text size="$size80" color="$gray14" variation="bold">
                      {file.name}
                    </Text>
                    <Text size="$size60" color="$gray11">
                      ({formatFileSize(file.size)})
                    </Text>
                  </Stack>
                </Stack>

                <MinimalButton
                  onAction={() => {
                    setFiles(oldFiles => {
                      const newFiles = [...oldFiles]
                      newFiles.splice(index, 1)
                      return newFiles
                    })
                  }}
                  icon="delete"
                />
              </Stack>
            </FileContainer>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
