import SearchReplace from '@sereneinserenade/tiptap-search-and-replace'
import Bold from '@tiptap/extension-bold'
import CharacterCount from '@tiptap/extension-character-count'
import Color from '@tiptap/extension-color'
import Dropcursor from '@tiptap/extension-dropcursor'
import Focus from '@tiptap/extension-focus'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextColor from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import type { Editor, Extension } from '@tiptap/vue-3'
import { ColumnsExtension as Columns } from '@tiptap-extend/columns'
import Mathematics from '@tiptap-pro/extension-mathematics'
import NodeRange from '@tiptap-pro/extension-node-range'
import { getHierarchicalIndexes } from '@tiptap-pro/extension-table-of-contents'
import { TableOfContents } from '@tiptap-pro/extension-table-of-contents'

import type { UmoEditorOptions } from '@/types'
import { shortId } from '@/utils/short-id'

import Audio from './audio'
import Bookmark from './bookmark'
import BreakMarks from './break-marks'
import BulletList from './bullet-list'
import Callout from './callout'
import CodeBlock from './code-block'
import Datetime from './datetime'
import Echarts from './echarts'
import File from './file'
import FileHandler from './file-handler'
import FontSize from './font-size'
import FormatPainter from './format-painter'
import Hr from './hr'
import Iframe from './iframe'
import Image from './image'
import Indent from './indent'
import LineHeight from './line-height'
import Link from './link'
import Margin from './margin'
import Mention from './mention'
import getUsersSuggestion from './mention/suggestion'
import NodeAlign from './node-align'
import OrderedList from './ordered-list'
import PageBreak from './page-break'
import Selection from './selection'
import Table from './table'
import TableCell from './table/cell'
import TableHeader from './table/header'
import Tag from './tag'
import TextAlign from './text-align'
import TextBox from './text-box'
import Toc from './toc'
import typeWriter from './type-writer'
import Video from './video'

export const getDefaultExtensions = ({
  container,
  options,
  uploadFileMap,
}: {
  container: string
  options: { value: UmoEditorOptions }
  uploadFileMap: { value: any }
}) => {
  const {
    dicts,
    page,
    document: doc,
    users,
    file,
    disableExtensions,
  } = options.value

  const EXTENSIONS = {
    highlight: Highlight.configure({
      multicolor: true,
    }),
    'ordered-list': OrderedList,
    'bullet-list': BulletList,
    'task-list': [
      TaskItem.configure({ nested: true }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'umo-task-list',
        },
      }),
    ],
    'line-height': LineHeight.configure({
      types: ['heading', 'paragraph'],
      defaultLineHeight:
        dicts?.lineHeights?.find((item: any) => item.default)?.value ??
        undefined,
    }),
    margin: Margin,
    link: Link,
    image: Image,
    video: Video,
    audio: Audio,
    'code-block': CodeBlock,
    symbol: Symbol,
    math: Mathematics,
    tag: Tag,
    columns: Columns,
    callout: Callout,
    mention: Mention.configure({
      suggestion: getUsersSuggestion(users ?? [], container),
    }),
    'date-time': Datetime,
    bookmark: Bookmark.configure({
      class: 'umo-editor-bookmark',
    }),
    'hard-break': BreakMarks.configure({
      visible: page?.showBreakMarks,
    }),
    hr: Hr,
    toc: Toc,
    'text-box': TextBox,
    'web-page': Iframe,
  }

  const extensions = [
    StarterKit.configure({
      bold: false,
      bulletList: false,
      orderedList: false,
      codeBlock: false,
      horizontalRule: false,
      dropcursor: false,
    }),
    Placeholder.configure({
      placeholder: () => String(l(doc?.placeholder ?? '')),
    }),
    Focus.configure({
      className: 'umo-node-focused',
      mode: 'all',
    }),
    FormatPainter,
    FontFamily,
    FontSize,
    Bold.extend({
      renderHTML: ({ HTMLAttributes }) => ['b', HTMLAttributes, 0],
    }),
    Underline,
    Subscript,
    Superscript,
    Color,
    TextColor,
    Indent,
    TextAlign,
    NodeAlign,
    SearchReplace.configure({
      searchResultClass: 'umo-search-result',
    }),

    // 插入
    File,

    // 表格
    Table,
    TableRow,
    TableHeader,
    TableCell,

    // 工具
    Echarts,

    // 页面
    PageBreak,

    // 其他
    Selection,
    NodeRange,
    TableOfContents.configure({
      getIndex: getHierarchicalIndexes,
      scrollParent: () =>
        document.querySelector(
          `${container} .umo-zoomable-container`,
        ) as HTMLElement,
      getId: () => shortId(6),
    }),
    Typography.configure(doc?.typographyRules),
    CharacterCount.configure({
      limit: doc?.characterLimit !== 0 ? doc?.characterLimit : undefined,
    }),
    FileHandler.configure({
      allowedMimeTypes: file?.allowedMimeTypes,
      onPaste(editor: Editor, files: any) {
        // 记录 已有位置
        const pageContainer = document.querySelector(
          `${container} .umo-zoomable-container`,
        ) as HTMLElement
        const scrollTop = pageContainer?.scrollTop || 0
        for (const file of files) {
          editor.commands.insertFile({
            file,
            uploadFileMap: uploadFileMap.value,
            autoType: true,
          })
        }
        // 恢复滚动位置
        if (pageContainer) {
          // 使用 setTimeout 确保 DOM 更新完成后再恢复滚动位置
          setTimeout(() => {
            pageContainer.scrollTop = scrollTop
          }, 0)
        }
      },
      onDrop: (editor: Editor, files: any, pos: number) => {
        for (const file of files) {
          editor.commands.insertFile({
            file,
            uploadFileMap: uploadFileMap.value,
            autoType: true,
            pos,
          })
        }
      },
    }),
    Dropcursor.configure({
      color: 'var(--umo-primary-color)',
    }),
    typeWriter,
  ]

  // 合并扩展
  Object.values(EXTENSIONS).forEach((item: any) => {
    if (!disableExtensions?.includes(item.name)) {
      if (Array.isArray(item)) {
        extensions.push(...item)
        return
      }
      extensions.push(item)
    }
  })

  return extensions
}

export const inputAndPasteRules = (options: any) => {
  let enableRules: boolean | Extension[] = true
  const $document = useState('document', options)
  if (
    !options.value.document?.enableMarkdown ||
    !$document.value?.enableMarkdown
  ) {
    enableRules = [Mathematics, Typography, Image as Extension]
  }
  return enableRules
}
