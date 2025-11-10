/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LANGFLOW_API_KEY?: string
  readonly VITE_LANGFLOW_API_URL?: string
  readonly GEMINI_API_KEY?: string
  readonly LANGFLOW_API_KEY?: string
  readonly LANGFLOW_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

