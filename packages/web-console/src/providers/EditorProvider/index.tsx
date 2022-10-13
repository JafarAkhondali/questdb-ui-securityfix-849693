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
  QuestDBLanguageName,
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
  setActiveBuffer: (buffer: Buffer) => Promise<void>
  addBuffer: (
    buffer?: Partial<Buffer>,
    options?: { shouldSelectAll?: boolean },
  ) => Promise<Buffer>
  deleteBuffer: (id: number) => Promise<void>
  updateBuffer: (id: number, buffer?: Partial<Buffer>) => Promise<void>
  editorReadyTrigger: (editor: IStandaloneCodeEditor) => void
}

const defaultValues = {
  editorRef: { current: null },
  monacoRef: { current: null },
  insertTextAtCursor: () => undefined,
  appendQuery: () => undefined,
  buffers: [],
  activeBuffer: fallbackBuffer,
  setActiveBuffer: () => Promise.resolve(),
  addBuffer: () => Promise.resolve(fallbackBuffer),
  deleteBuffer: () => Promise.resolve(),
  updateBuffer: () => Promise.resolve(),
  editorReadyTrigger: () => undefined,
}

const EditorContext = createContext<ContextProps>(defaultValues)

export const EditorProvider = ({ children }: PropsWithChildren<{}>) => {
  const editorRef = useRef<IStandaloneCodeEditor>(null)
  const monacoRef = useRef<Monaco>(null)
  const buffers = useLiveQuery(() => db.buffers.toArray(), [])
  const activeBufferId = useLiveQuery(
    () => bufferStore.getActiveId(),
    [],
  )?.value

  const [activeBuffer, setActiveBufferState] = useState<Buffer>(fallbackBuffer)

  const ranOnce = useRef(false)
  // this effect should run only once, after mount and after `buffers` and `activeBufferId` are ready from the db
  useEffect(() => {
    if (!ranOnce.current && buffers && activeBufferId) {
      const buffer =
        buffers?.find((buffer) => buffer.id === activeBufferId) ?? buffers[0]
      setActiveBufferState(buffer)
      ranOnce.current = true
    }
  }, [buffers, activeBufferId])

  if (!buffers || !activeBufferId || activeBuffer === fallbackBuffer) {
    return null
  }

  const setActiveBuffer = async (buffer: Buffer) => {
    // save current buffer before switching
    await updateBuffer(activeBuffer.id as number)

    await bufferStore.setActiveId(buffer.id as number)
    setActiveBufferState(buffer)
    editorRef.current?.focus()
    if (editorRef.current && monacoRef.current && buffer.value) {
      const model = monacoRef.current?.editor.createModel(
        buffer.value,
        QuestDBLanguageName,
      )
      editorRef.current.setModel(model)
    }
    if (buffer.editorViewState) {
      editorRef.current?.restoreViewState(buffer.editorViewState)
    }
  }

  const addBuffer: ContextProps["addBuffer"] = async (
    newBuffer,
    { shouldSelectAll = false } = {},
  ) => {
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
      ...newBuffer,
      label: newBuffer?.label ?? `${fallbackBuffer.label} ${nextNumber()}`,
    })
    const id = await db.buffers.add(buffer)
    await setActiveBuffer(buffer)
    if (editorRef.current && monacoRef.current && buffer.value) {
      const model = monacoRef.current?.editor.createModel(
        buffer.value,
        QuestDBLanguageName,
      )
      editorRef.current.setModel(model)

      if (shouldSelectAll) {
        editorRef.current?.setSelection(model.getFullModelRange())
      }
    }

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
    await bufferStore.delete(id)
    const nextActive = await db.buffers.toCollection().last()
    await setActiveBuffer(nextActive ?? fallbackBuffer)
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
        editorReadyTrigger: (editor) => {
          editor.focus()
          if (activeBuffer.editorViewState) {
            editor.restoreViewState(activeBuffer.editorViewState)
          }
        },
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export const useEditor = () => useContext(EditorContext)
