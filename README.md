# Shotly 📸

Take beautiful screenshots of your code directly in VS Code.

## Features

- Save screenshots of your code with smart filename templating
- Copy screenshots to your clipboard without saving
- Auto-save or manual save dialog (configurable)
- Watermark / branding support
- Background color and gradient presets
- Show/hide line numbers
- Show/hide window controls and title
- Rounded corners and transparent background support
- Highly configurable

## Usage

1. Open the command palette (`Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on macOS) and search for `Shotly`.
2. Select the code you'd like to screenshot.
3. Adjust the width of the screenshot if desired.
4. Click **Shutter** to save, **Copy** to copy to clipboard.

**Tips:**

- You can also start Shotly by selecting code, right-clicking, and clicking **Shotly 📸**
- Bind Shotly to a hotkey by opening keyboard shortcut settings and binding `shotly.start`
- Set `shotly.shutterAction` to `"copy"` to copy to clipboard by default instead of saving

## Configuration

| Setting | Type | Default | Description |
|---|---|---|---|
| `shotly.backgroundColor` | `string` | `#abb8c3` | Background color of the snippet container |
| `shotly.boxShadow` | `string` | `rgba(0,0,0,0.55) 0px 20px 68px` | CSS box-shadow for the snippet |
| `shotly.containerPadding` | `string` | `3em` | Padding for the snippet container |
| `shotly.roundedCorners` | `boolean` | `true` | Use rounded corners for the window |
| `shotly.showWindowControls` | `boolean` | `true` | Show macOS style window controls |
| `shotly.showWindowTitle` | `boolean` | `false` | Show window title with folder/file name |
| `shotly.showLineNumbers` | `boolean` | `true` | Show line numbers |
| `shotly.realLineNumbers` | `boolean` | `false` | Start from the file's real line number |
| `shotly.transparentBackground` | `boolean` | `false` | Use transparent background |
| `shotly.target` | `string` | `container` | `container` or `window` |
| `shotly.shutterAction` | `string` | `save` | `save` or `copy` |

## Acknowledgements

Inspired by [CodeSnap](https://github.com/kufii/CodeSnap) and [Polacode](https://github.com/octref/polacode).

Design inspiration from [Carbon](https://carbon.now.sh/).