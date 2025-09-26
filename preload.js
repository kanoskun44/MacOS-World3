const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    processQuestion: (question) => ipcRenderer.invoke('process-question', question)
});