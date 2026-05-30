"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_vscode3 = __toESM(require("vscode"));

// src/utils/get-configuration.ts
var vscode = __toESM(require("vscode"));
var getConfiguration = (group, keys) => {
  const settings = vscode.workspace.getConfiguration(group, null);
  const editor = vscode.window.activeTextEditor;
  const language = editor?.document?.languageId;
  const languageSettings = language ? vscode.workspace.getConfiguration(void 0, null).get(`[${language}]`) : void 0;
  return keys.reduce((acc, k) => {
    acc[k] = languageSettings?.[`${group}.${k}`];
    if (acc[k] == null) acc[k] = settings.get(k);
    return acc;
  }, {});
};

// src/core/save-image.ts
var import_vscode = __toESM(require("vscode"));
var import_path2 = __toESM(require("path"));
var import_promises = require("fs/promises");
var import_os = require("os");

// src/core/generate-file-name.ts
var import_path = __toESM(require("path"));
var generateFileName = (editor) => {
  const sourceFile = editor ? import_path.default.basename(editor.document.uri.fsPath, import_path.default.extname(editor.document.uri.fsPath)).replace(/([a-z])([A-Z])/gu, "$1-$2").replace(/_/gu, "-").toLowerCase() : "code";
  return `${sourceFile}.png`;
};

// src/core/save-image.ts
var saveImage = async (data, editor) => {
  const configuredDir = import_vscode.default.workspace.getConfiguration("shotly").get("outDir");
  const saveMode = import_vscode.default.workspace.getConfiguration("shotly").get("saveMode");
  const resolveOutDir = (dir) => {
    if (!dir?.trim()) return import_path2.default.join((0, import_os.homedir)(), "Pictures", "Shotly");
    if (dir.startsWith("~")) return import_path2.default.join((0, import_os.homedir)(), dir.slice(1));
    if (import_path2.default.isAbsolute(dir)) return dir;
    return import_path2.default.join((0, import_os.homedir)(), dir);
  };
  const outDir = resolveOutDir(configuredDir);
  await (0, import_promises.mkdir)(outDir, { recursive: true });
  if (saveMode === "auto") {
    const filePath = import_path2.default.resolve(outDir, generateFileName(editor));
    await (0, import_promises.writeFile)(filePath, Buffer.from(data, "base64"));
    import_vscode.default.window.showInformationMessage(`Shotly \u{1F4F8}: Saved to ${filePath}`);
    return;
  }
  const defaultUri = import_vscode.default.Uri.file(
    import_path2.default.resolve(outDir, generateFileName(editor))
  );
  const uri = await import_vscode.default.window.showSaveDialog({
    filters: { Images: ["png"] },
    defaultUri
  });
  if (uri) {
    await (0, import_promises.mkdir)(import_path2.default.dirname(uri.fsPath), { recursive: true });
    await (0, import_promises.writeFile)(uri.fsPath, Buffer.from(data, "base64"));
  }
};

// src/core/create-panel.ts
var import_vscode2 = __toESM(require("vscode"));

// src/utils/read-html.ts
var import_promises2 = require("fs/promises");
var vscode3 = __toESM(require("vscode"));
var path3 = __toESM(require("path"));
var read_html_default = async (htmlPath, panel, shutterSoundUri) => {
  const html = await (0, import_promises2.readFile)(htmlPath, "utf-8");
  return html.replace(/%CSP_SOURCE%/gu, panel.webview.cspSource).replace(/%SAVE_ICON%/gu, "").replace(/%COPY_ICON%/gu, "").replace(
    /(src|href)="([^"]*)"/gu,
    (_, type, src) => {
      if (src === "%SHUTTER_SOUND%") return `${type}="${shutterSoundUri.toString()}"`;
      if (src.startsWith("vscode-webview-resource")) return `${type}="${src}"`;
      return `${type}="${panel.webview.asWebviewUri(vscode3.Uri.file(path3.resolve(htmlPath, "..", src)))}"`;
    }
  );
};

// src/core/create-panel.ts
var import_path3 = __toESM(require("path"));
var createPanel = async (context) => {
  const panel = import_vscode2.default.window.createWebviewPanel(
    "shotly",
    "Shotly \u{1F4F8}",
    { viewColumn: import_vscode2.default.ViewColumn.Beside, preserveFocus: true },
    {
      enableScripts: true,
      localResourceRoots: [import_vscode2.default.Uri.file(context.extensionPath)]
    }
  );
  const shutterSoundUri = panel.webview.asWebviewUri(
    import_vscode2.default.Uri.joinPath(context.extensionUri, "public", "audio", "shutter.mp3")
  );
  panel.webview.html = await read_html_default(
    import_path3.default.resolve(context.extensionPath, "dist/webview/index.html"),
    panel,
    shutterSoundUri
  );
  return panel;
};

// src/index.ts
var getConfig = () => {
  const editorSettings = getConfiguration("editor", ["fontLigatures", "tabSize"]);
  const editor = import_vscode3.default.window.activeTextEditor;
  if (editor) editorSettings.tabSize = editor.options.tabSize;
  const extensionConfig = getConfiguration("shotly", [
    // Output
    "shutterAction",
    "shutterSound",
    "target",
    // Appearance
    "backgroundColor",
    "boxShadow",
    "containerPadding",
    "roundedCorners",
    "transparentBackground",
    "watermark",
    // Window / UI
    "showWindowControls",
    "showWindowTitle",
    "showLineNumbers",
    "realLineNumbers"
  ]);
  const selection = editor && editor.selection;
  const startLine = extensionConfig.realLineNumbers ? selection ? selection.start.line : 0 : 0;
  let windowTitle = "";
  if (editor && extensionConfig.showWindowTitle) {
    const activeFileName = editor.document.uri.path.split("/").pop();
    windowTitle = `${import_vscode3.default.workspace.name || ""} - ${activeFileName}`.trim().replace(/^-\s*/, "");
  }
  return {
    ...editorSettings,
    ...extensionConfig,
    startLine,
    windowTitle
  };
};
var hasOneSelection = (selections) => selections.length === 1 && !selections[0].isEmpty;
var runCommand = async (context) => {
  const panel = await createPanel(context);
  const activeEditor = import_vscode3.default.window.visibleTextEditors.find(
    (e) => e.viewColumn !== import_vscode3.default.ViewColumn.Beside
  );
  if (!activeEditor) {
    import_vscode3.default.window.showErrorMessage("Shotly \u{1F4F8}: No active text editor found.");
    return;
  }
  const saveIconUri = panel.webview.asWebviewUri(
    import_vscode3.default.Uri.joinPath(context.extensionUri, "public", "icons", "save.png")
  );
  const copyIconUri = panel.webview.asWebviewUri(
    import_vscode3.default.Uri.joinPath(context.extensionUri, "public", "icons", "copy.png")
  );
  const update = async () => {
    await import_vscode3.default.commands.executeCommand("editor.action.clipboardCopyWithSyntaxHighlightingAction");
    panel.webview.postMessage({
      type: "update",
      saveIconUri: saveIconUri.toString(),
      copyIconUri: copyIconUri.toString(),
      ...getConfig()
    });
  };
  const flash = () => panel.webview.postMessage({ type: "flash" });
  panel.webview.onDidReceiveMessage(async ({ type, data }) => {
    if (type === "save") {
      flash();
      await saveImage(data, activeEditor);
    } else {
      import_vscode3.default.window.showErrorMessage(`Shotly \u{1F4F8}: Unknown shutterAction "${type}"`);
    }
  });
  const selectionHandler = import_vscode3.default.window.onDidChangeTextEditorSelection(
    (e) => hasOneSelection(e.selections) && update()
  );
  panel.onDidDispose(() => selectionHandler.dispose());
  const editor = import_vscode3.default.window.activeTextEditor;
  if (editor && hasOneSelection(editor.selections)) update();
};
module.exports.activate = (context) => context.subscriptions.push(
  import_vscode3.default.commands.registerCommand("shotly.start", () => runCommand(context))
);
