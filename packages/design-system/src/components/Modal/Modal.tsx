import { DialogContent, DialogOverlay } from '@reach/dialog'
import {
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { globalCss, keyframes, styled } from '../../stitches'
import { Icon } from '../Icon'

interface ModalProps {
  size?: 'medium' | 'large'
  children: ReactNode
  onClose?: () => void
}

export interface ModalRef {
  open: () => void
  close: () => void
}

const ANIMATION_DURATION = 200

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
})

const overlayHide = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
})

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'scale(.99)' },
  '50%': { opacity: 1, transform: 'scale(1.01)' },
  '100%': { opacity: 1, transform: 'scale(1)' },
})

const contentHide = keyframes({
  '0%': { opacity: 1, transform: 'scale(1)' },
  '50%': { opacity: 1, transform: 'scale(1.01)' },
  '100%': { opacity: 0, transform: 'scale(.99)' },
})

export const globalStyles = globalCss({
  '.modal[data-reach-dialog-overlay]': {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 4,
    backgroundColor: 'rgba(53, 52, 49, 0.3)',
    display: 'flex',
    alignItems: 'flex-start',
    padding: '12vh 16px 16px',
    justifyContent: 'center',
    overflow: 'auto',
    inset: 0,
    animation: `${overlayShow} 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
    '&.modal--hidden': {
      animation: `${overlayHide} ${
        ANIMATION_DURATION - 50
      }ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important`,
    },
  },
  '.modal__content[data-reach-dialog-content]': {
    position: 'relative',
    transformOrigin: 'center',
    backgroundColor: '$white',
    borderRadius: '$radius200',
    width: '100%',
    boxShadow:
      'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
    animation: `${contentShow} 250ms cubic-bezier(0.16, 1, 0.3, 1)`,
    willChange: 'transform',
    '&:focus': { outline: 'none' },
    '&.modal__content--hidden': {
      animation: `${contentHide} ${
        ANIMATION_DURATION - 50
      }ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important`,
    },
    '& .modal__inner': {
      width: '100%',
      maxHeight: '76vh',
    },
    '&.modal__content--medium': {
      maxWidth: 500,
    },
    '&.modal__content--large': {
      maxWidth: 700,
    },
  },
})

const CloseButton = styled('button', {
  position: 'absolute',
  top: 18,
  right: 24,
  cursor: 'pointer',
  width: 28,
  height: 28,
  marginTop: -6,
  marginRight: -7,
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
  justifyContent: 'center',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  '&:hover,&:focus': {
    backgroundColor: '$gray3',
  },
  '&:active': {
    backgroundColor: '$gray6',
  },
})

export const Modal = forwardRef<ModalRef, ModalProps>(
  ({ onClose, size = 'large', children }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [visibilityState, setVisibilityState] = useState(false)
    const timeoutRef = useRef()

    const onRequestClose = () => {
      if (visibilityState === false) {
        return
      }

      setVisibilityState(false)
      // @ts-expect-error
      timeoutRef.current = setTimeout(() => {
        onClose?.()
        setIsOpen(false)
      }, ANIMATION_DURATION)
    }

    useImperativeHandle(ref, () => ({
      open: () => {
        clearTimeout(timeoutRef.current)
        setIsOpen(true)
        setVisibilityState(true)
      },
      close: () => onRequestClose(),
    }))

    if (!isOpen) {
      return null
    }

    return (
      <DialogOverlay
        className={`modal ${!visibilityState ? 'modal--hidden' : ''}`}
        isOpen={isOpen}
        onDismiss={onRequestClose}
        dangerouslyBypassFocusLock
      >
        <DialogContent
          className={`modal__content modal__content--${size} ${
            !visibilityState ? 'modal__content--hidden' : ''
          }`}
        >
          <CloseButton
            onClick={onRequestClose}
            type="button"
            aria-label="Close"
          >
            <Icon src="close" color="$gray10" size={20} />
          </CloseButton>

          <div>{children}</div>
        </DialogContent>
      </DialogOverlay>
    )
  },
)
