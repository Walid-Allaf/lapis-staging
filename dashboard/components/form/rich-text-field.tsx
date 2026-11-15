'use client'

import React from 'react'
import { getIn, useField, useFormikContext, type FormikValues } from 'formik'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Lock, Unlock, Heading as HeadingIcon } from 'lucide-react'

import { Button } from '@/dashboard/components/shadcn-ui/button'
import { Separator } from '@/dashboard/components/shadcn-ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/dashboard/components/shadcn-ui/select'
import { FormLabel } from '../titles/form-label'
import { cn } from '@/dashboard/lib/utils'

type Direction = 'ltr' | 'rtl'

type RichTextProps =
  {
    name: string
    label: string
    dir?: Direction
  }

export const RichTextField: React.FC<RichTextProps> =
  (
    {
      name,
      label,
      dir = 'ltr'
    }
  ) => {
    const [isEditable, setIsEditable] =
      React.useState(false)

    const [isShowControls, setIsShowControls] =
      React.useState(true)

    const [field] =
      useField<string>(name)

    const
      {
        setFieldValue,
        errors,
        touched
      } =
        useFormikContext<FormikValues>()

    const editor =
      useEditor(
        {
          immediatelyRender: false,
          extensions: [
            StarterKit
          ],
          content: field.value || '',
          editable: isEditable,
          onUpdate: ({ editor }) => {
            const html =
              editor.getHTML()

            setFieldValue(name, html)
          }
        }
      )

    React.useEffect(
      () => {
        if (!editor) return

        editor.setEditable(isEditable)
      },
      [
        editor,
        isEditable
      ]
    )

    React.useEffect(
      () => {
        if (!editor) return

        const currentHtml =
          editor.getHTML()

        const nextHtml =
          field.value || ''

        if (currentHtml !== nextHtml) {
          editor.commands.setContent(nextHtml, { emitUpdate: false })
        }
      },
      [
        editor,
        field.value
      ]
    )

    const headingValue =
      () => {
        if (!editor) return 'p'

        if (editor.isActive('heading', { level: 1 })) return 'h1'
        if (editor.isActive('heading', { level: 2 })) return 'h2'
        if (editor.isActive('heading', { level: 3 })) return 'h3'

        return 'p'
      }

    const setHeading =
      (val: string) => {
        if (!editor) return

        if (val === 'p') {
          editor
            .chain()
            .focus()
            .setParagraph()
            .run()

          return
        }

        type Level = 1 | 2 | 3 | 4 | 5 | 6

        const level: Level =
          Number(val.replace('h', '')) as Level

        editor
          .chain()
          .focus()
          .toggleHeading({ level })
          .run()
      }

    // ---------- Same idea: support nested paths like title[ar] ----------
    const fieldError =
      getIn(errors, name)


    const fieldTouched =
      getIn(touched, name)

    const hasError =
      Boolean(fieldError) && Boolean(fieldTouched)

    const errorText =
      hasError
        ? String(fieldError)
        : ''
        
    const isRtl =
      dir === 'rtl'

    return (
      <div className="space-y-2" dir={dir}>
        <FormLabel
          title={label}
          error={hasError}
        />

        <div
          className={cn(
            'rounded-md border bg-background',
            hasError && 'border-destructive'
          )}
        >
          {
            isShowControls && (
              <div
                className={[
                  'flex flex-wrap items-center gap-2 border-b bg-muted/30 px-2 py-2',
                  isRtl ? 'justify-start' : 'justify-start'
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <HeadingIcon className="h-4 w-4 opacity-70" />

                  <Select
                    value={headingValue()}
                    onValueChange={setHeading}
                    disabled={!editor}
                  >
                    <SelectTrigger className={'h-8 w-[130px]'}>
                      <SelectValue placeholder="Heading" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="p">Paragraph</SelectItem>
                      <SelectItem value="h1">Heading 1</SelectItem>
                      <SelectItem value="h2">Heading 2</SelectItem>
                      <SelectItem value="h3">Heading 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <Button
                  type="button"
                  variant={editor?.isActive('bold') ? 'default' : 'outline'}
                  size="sm"
                  className={'h-8'}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  disabled={!editor}
                >
                  <Bold className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant={editor?.isActive('italic') ? 'default' : 'outline'}
                  size="sm"
                  className={'h-8'}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  disabled={!editor}
                >
                  <Italic className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant={editor?.isActive('orderedList') ? 'default' : 'outline'}
                  size="sm"
                  className={'h-8'}
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  disabled={!editor}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant={editor?.isActive('bulletList') ? 'default' : 'outline'}
                  size="sm"
                  className={'h-8'}
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  disabled={!editor}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )
          }

          <div className="min-h-[180px] px-3 py-3">
            <EditorContent
              editor={editor}
              dir={dir}
              className={cn(
                'tiptap prose prose-sm max-w-none dark:prose-invert',
                isRtl ? 'text-right' : 'text-left'
                // hasError && 'focus-visible:outline-none'
              )}
            />
          </div>

          <div
            className={'flex items-center gap-2 border-t bg-muted/30 px-2 py-2'}
          >
            <Button
              type="button"
              variant={isEditable ? 'outline' : 'default'}
              size="sm"
              className={'h-8'}
              onClick={() => setIsEditable((s) => !s)}
            >
              {
                isEditable
                  ? <Lock className="h-4 w-4" />
                  : <Unlock className="h-4 w-4" />
              }
            </Button>

            <Button
              type="button"
              variant={isShowControls ? 'default' : 'outline'}
              size="sm"
              className={'h-8'}
              onClick={() => setIsShowControls((s) => !s)}
            >
              <HeadingIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {
          errorText && (
            <p className="text-sm text-destructive">
              {errorText}
            </p>
          )
        }
      </div>
    )
  }
