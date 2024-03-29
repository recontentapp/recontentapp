import {
  MdAdd,
  MdAddCircle,
  MdAddCircleOutline,
  MdMerge,
  MdClose,
  MdCloudUpload,
  MdDelete,
  MdDoneAll,
  MdEdit,
  MdOutlineFilterList,
  MdHelp,
  MdInfo,
  MdOpenInFull,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineMoreHoriz,
  MdSettings,
  MdOutlineSettings,
  MdOutlineImportExport,
  MdTranslate,
  MdInsertDriveFile,
  MdOpenInNew,
  MdMenu,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdInbox,
  MdLaunch,
  MdFormatBold,
  MdFormatItalic,
  MdFormatStrikethrough,
  MdLink,
  MdStyle,
  MdCheckCircle,
  MdQuestionAnswer,
  MdLocalOffer,
  MdExitToApp,
  MdChevronRight,
  MdArrowRightAlt,
  MdContentCopy,
  MdTimeline,
} from 'react-icons/md'
import { BiLogoGoogleCloud, BiLogoAws, BiLogoGithub } from 'react-icons/bi'

import { IconName } from './types'
import { IconType } from 'react-icons/lib'

export const iconMap: Record<IconName, IconType> = {
  google_cloud: BiLogoGoogleCloud,
  aws: BiLogoAws,
  github: BiLogoGithub,
  add: MdAdd,
  add_circle: MdAddCircle,
  add_circle_outline: MdAddCircleOutline,
  close: MdClose,
  import_outlined: MdOutlineImportExport,
  copy: MdContentCopy,
  stats: MdTimeline,
  delete: MdDelete,
  edit: MdEdit,
  filter: MdOutlineFilterList,
  help: MdHelp,
  info: MdInfo,
  fullscreen: MdOpenInFull,
  keyboard_arrow_down: MdKeyboardArrowDown,
  keyboard_arrow_up: MdKeyboardArrowUp,
  more: MdOutlineMoreHoriz,
  settings: MdSettings,
  settings_outlined: MdOutlineSettings,
  merge: MdMerge,
  translate: MdTranslate,
  cloud_upload: MdCloudUpload,
  file: MdInsertDriveFile,
  arrow_right: MdArrowRightAlt,
  open_in_new: MdOpenInNew,
  menu: MdMenu,
  keyboard_arrow_left: MdOutlineKeyboardArrowLeft,
  keyboard_arrow_right: MdOutlineKeyboardArrowRight,
  done_all: MdDoneAll,
  inbox: MdInbox,
  launch: MdLaunch,
  format_bold: MdFormatBold,
  format_italic: MdFormatItalic,
  format_strikethrough: MdFormatStrikethrough,
  link: MdLink,
  style: MdStyle,
  check_circle: MdCheckCircle,
  question_answer: MdQuestionAnswer,
  local_offer: MdLocalOffer,
  exit_to_app: MdExitToApp,
  chevron_right: MdChevronRight,
}
