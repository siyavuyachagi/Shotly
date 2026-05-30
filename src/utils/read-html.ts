import { readFile } from "fs/promises";
import * as vscode from "vscode";
import * as path from "path";

export default async (htmlPath: string, panel: vscode.WebviewPanel, shutterSoundUri: vscode.Uri): Promise<string> => {
    const html = await readFile(htmlPath, 'utf-8');
    return html
        .replace(/%CSP_SOURCE%/gu, panel.webview.cspSource)
        .replace(
            /(src|href)="([^"]*)"/gu,
            (_, type, src) => {
                if (src === '%SHUTTER_SOUND%') return `${type}="${shutterSoundUri.toString()}"`;
                if (src.startsWith('vscode-webview-resource')) return `${type}="${src}"`;
                return `${type}="${panel.webview.asWebviewUri(vscode.Uri.file(path.resolve(htmlPath, '..', src)))}"`;
            }
        );
};