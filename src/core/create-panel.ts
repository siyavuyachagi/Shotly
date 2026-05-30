import vscode from 'vscode';
import readHtml from '../utils/read-html';
import path from 'path';
import pkg from '../../package.json' assert { type: 'json' };
const { name, displayName } = pkg;

export const createPanel = async (context: vscode.ExtensionContext): Promise<vscode.WebviewPanel> => {
    const panel = vscode.window.createWebviewPanel(
        name, // internal identifier, not user-facing
        `${displayName} 📸`, // User-facing title
        { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        }
    );

    const shutterSoundUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'public', 'audio', 'shutter.mp3')
    );

    panel.webview.html = await readHtml(
        path.resolve(context.extensionPath, 'dist/webview/index.html'),
        panel,
        shutterSoundUri
    );

    return panel;
};