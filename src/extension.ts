import * as vscode from 'vscode';

let panel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {

    // Register the command to show the webview
    context.subscriptions.push(
        vscode.commands.registerCommand('mini-extension.start', () => {
            // Create and show a new webview
            panel = vscode.window.createWebviewPanel(
                'mini-extension', // Identifies the type of the webview. Used internally
                'Coding Affirmations', // Title of the panel displayed to the user
                vscode.ViewColumn.One, // Editor column to show the new webview panel in
                { enableScripts: true } // Enable scripts in the webview
            );
            panel.webview.html = getWebviewContent();

            // Handle messages from the webview
            panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'createAPICall':
                            await createAPICall();
                            return;
                    }
                },
                undefined,
                context.subscriptions
            );
        })
    );
}

function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Coding Affirmations</title>
	  <style>
		body {
			font-family: Arial, sans-serif;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 100vh;
			margin: 0
		}
		h1 {
			color: #fff;
		}
		button {
			background-color: white;
			color: black;
			padding: 10px 20px;
			border: none;
			border-radius: 5px;
			cursor: pointer;
		}
		button:hover {
			background-color: gray;
		}
		#affirmation {
			margin-top: 20px;
			padding: 10px;
			font-size: 1.5em;
			color: #fff;
			text-align: center;
		}
	  </style>
    </head>
    <body>
      <h1>be your best coder!</h1>
      <button id="getAffirmation">get affirmation</button>
      <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('getAffirmation').addEventListener('click', () => {
          vscode.postMessage({ command: 'createAPICall' });
        });
		window.addEventListener('message', event => {
          const message = event.data; // The JSON data sent from the extension

          if (message.command === 'displayAffirmation') {
            // Update the div with the response
            document.getElementById('affirmation').textContent = message.affirmation;
          }
        });
      </script>
	  <div id="affirmation"></div>
    </body>
    </html>`;
}

interface AffirmationsResponse {
    affirmation: string;
}

async function createAPICall() {
	const response = await fetch('http://localhost:5000/api/affirmations');
	const data = await response.json() as AffirmationsResponse;
	if (panel) {
		panel.webview.postMessage({
			command: 'displayAffirmation',
			affirmation: data.affirmation
		});
	}
	
}

export function deactivate() { }
