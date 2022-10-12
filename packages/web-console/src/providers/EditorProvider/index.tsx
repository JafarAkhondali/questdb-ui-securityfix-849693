import React, {
  createContext,
  MutableRefObject,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { editor } from "monaco-editor"
import { Monaco } from "@monaco-editor/react"
import {
  insertTextAtCursor,
  appendQuery,
} from "../../scenes/Editor/Monaco/utils"
import { fallbackBuffer, makeBuffer, bufferStore } from "../../store/buffers"
import { db } from "../../store/db"
import type { Buffer } from "../../store/buffers"

import { useLiveQuery } from "dexie-react-hooks"

type IStandaloneCodeEditor = editor.IStandaloneCodeEditor

type ContextProps = {
  editorRef: MutableRefObject<IStandaloneCodeEditor | null>
  monacoRef: MutableRefObject<Monaco | null>
  insertTextAtCursor: (text: string) => void
  appendQuery: (query: string) => void
  buffers: Buffer[]
  activeBuffer: Buffer
  setActiveBuffer: (buffer: Buffer) => void
  addBuffer: () => Promise<Buffer>
  deleteBuffer: (id: number) => void
  updateBuffer: (id: number, buffer: Partial<Buffer>) => Promise<void>
}

const defaultValues = {
  editorRef: { current: null },
  monacoRef: { current: null },
  insertTextAtCursor: () => undefined,
  appendQuery: () => undefined,
  buffers: [],
  activeBuffer: fallbackBuffer,
  setActiveBuffer: () => undefined,
  addBuffer: () => Promise.resolve(fallbackBuffer),
  deleteBuffer: () => undefined,
  updateBuffer: () => Promise.resolve(),
}

const EditorContext = createContext<ContextProps>(defaultValues)

export const EditorProvider = ({ children }: PropsWithChildren<{}>) => {
  const editorRef = useRef<IStandaloneCodeEditor>(null)
  const monacoRef = useRef<Monaco>(null)
  const buffers = useLiveQuery(() => db.buffers.toArray(), [])
  const activeBufferId = useLiveQuery(() => bufferStore.getActiveId(), [], {
    value: fallbackBuffer.id,
  })?.value

  const [activeBuffer, setActiveBufferState] = useState<Buffer>(fallbackBuffer)

  useEffect(() => {
    setActiveBufferState(
      buffers?.find((buffer) => buffer.id === activeBufferId) || fallbackBuffer,
    )
  }, [buffers, activeBufferId])

  const setActiveBuffer = async (buffer: Buffer) => {
    const currentViewState = editorRef.current?.saveViewState()
    if (currentViewState) {
      await updateBuffer(activeBuffer.id as number, {
        editorViewState: currentViewState,
      })
    }

    await bufferStore.setActiveId(buffer.id as number)
    setActiveBufferState(buffer)
    editorRef.current?.focus()
    if (buffer.editorViewState) {
      editorRef.current?.restoreViewState(buffer.editorViewState)
    }
  }

  const addBuffer: ContextProps["addBuffer"] = async () => {
    const currentDefaultTabNumbers = (
      await db.buffers
        .filter((buffer) => buffer.label.startsWith(fallbackBuffer.label))
        .toArray()
    )
      .map((buffer) =>
        buffer.label.slice(fallbackBuffer.label.length + /* whitespace */ 1),
      )
      .filter(Boolean)
      .map((n) => parseInt(n, 10))
      .sort()

    const nextNumber = () => {
      for (let i = 0; i <= currentDefaultTabNumbers.length; i++) {
        const nextNumber = i + 1
        if (!currentDefaultTabNumbers.includes(nextNumber)) {
          return nextNumber
        }
      }
    }

    const buffer = makeBuffer({
      label: `${fallbackBuffer.label} ${nextNumber()}`,
    })
    const id = await db.buffers.add(buffer)
    await setActiveBuffer(buffer)
    return { id, ...buffer }
  }

  const updateBuffer: ContextProps["updateBuffer"] = async (id, payload) => {
    const editorViewState = editorRef.current?.saveViewState()
    await bufferStore.update(id, {
      ...payload,
      ...(editorViewState ? { editorViewState } : {}),
    })
  }

  const deleteBuffer: ContextProps["deleteBuffer"] = async (id) => {
    editorRef.current?.setValue("")
    await bufferStore.delete(id)
    const nextActive = await db.buffers.toCollection().last()
    await setActiveBuffer(nextActive ?? fallbackBuffer)
  }

  // buffers are available after `useLiveQuery` resolves
  if (!buffers) {
    return null
  }

  return (
    <EditorContext.Provider
      value={{
        editorRef,
        monacoRef,
        insertTextAtCursor: (text) => {
          if (editorRef?.current) {
            insertTextAtCursor(editorRef.current, text)
          }
        },
        appendQuery: (text) => {
          if (editorRef?.current) {
            appendQuery(editorRef.current, text)
          }
        },
        buffers,
        activeBuffer,
        setActiveBuffer,
        addBuffer,
        deleteBuffer,
        updateBuffer,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export const useEditor = () => useContext(EditorContext)
