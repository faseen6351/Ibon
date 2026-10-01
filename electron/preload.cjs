const { contextBridge, ipcRenderer } = require("electron");

const call = async (channel, ...args) => {
  const res = await ipcRenderer.invoke(channel, ...args);
  if (!res.ok) throw new Error(res.error);
  return res.data;
};

contextBridge.exposeInMainWorld("ibon", {
  invoke: call,
  onTabs(cb) {
    const listener = (_e, tabs) => cb(tabs);
    ipcRenderer.on("tabs", listener);
    return () => ipcRenderer.removeListener("tabs", listener);
  },
});
