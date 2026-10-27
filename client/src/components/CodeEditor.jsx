import Editor from '@monaco-editor/react'

const MONACO_LANG_MAP = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
}

/**
 * CodeEditor
 * Props:
 *   code     – string, controlled value
 *   language – one of: javascript | python | java | cpp
 *   onChange – (newCode: string) => void
 */
export default function CodeEditor({ code, language, onChange }) {
  return (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <Editor
        height="100%"
        theme="vs-dark"
        language={MONACO_LANG_MAP[language] || 'plaintext'}
        value={code}
        onChange={(val) => onChange(val ?? '')}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  )
}
