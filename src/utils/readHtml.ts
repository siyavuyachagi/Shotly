import { readFile } from "fs/promises";
import * as vscode from "vscode";
import * as path from "path";

export default async (htmlPath: string, panel: vscode.WebviewPanel, shutterSoundUri: vscode.Uri): Promise<string> => {
    const html = await readFile(htmlPath, 'utf-8');
    return html
        .replace(/%CSP_SOURCE%/gu, panel.webview.cspSource)
        .replace(
            /(src|href)="([^"]*)"/gu,
            (_, type, src) =>
                `${type}="${panel.webview.asWebviewUri(
                    vscode.Uri.file(path.resolve(htmlPath, '..', src))
                )}"`
        )
        .replace('%SHUTTER_SOUND%', shutterSoundUri.toString());
};