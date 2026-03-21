import { defineStore } from 'pinia'
import { ref } from 'vue'

export type WorkspaceMode = 'personal' | 'business'

export const useWorkspaceStore = defineStore('workspace', () => {
  const mode = ref<WorkspaceMode>(
    (localStorage.getItem('ws_mode') as WorkspaceMode) ?? 'personal',
  )

  function setMode(m: WorkspaceMode) {
    mode.value = m
    localStorage.setItem('ws_mode', m)
  }

  return { mode, setMode }
})
