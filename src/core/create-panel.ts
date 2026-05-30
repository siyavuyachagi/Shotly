import vscode from 'vscode';
import readHtml from '../utils/read-html';
import path from 'path';

export const createPanel = async (context: vscode.ExtensionContext): Promise<vscode.WebviewPanel> => {
    const panel = vscode.window.createWebviewPanel(
        'shotly',
        'Shotly 📸',
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