import * as vscode from 'vscode';
import { YouiEvents } from "./youi-events";
import { RpcCommon } from "@sap-devx/webview-rpc/out.ext/rpc-common";

export class VSCodeYouiEvents implements YouiEvents {
    private rpc: RpcCommon;
    private webviewPanel: vscode.WebviewPanel;
    public static installing: boolean;

    constructor(rpc : RpcCommon, webviewPanel: vscode.WebviewPanel) {
        this.rpc = rpc; 
        this.webviewPanel = webviewPanel;       
    }

    public doGeneratorDone(success: boolean, message: string, targetPath = ""): void {
        this.doClose();
        if (success) {
            this.showDoneMessage(message, targetPath);
        } else {
            this.showFailureMessage(message);
        }
    }

    public doGeneratorInstall(): void {
        this.doClose();
        this.showInstallMessage();
    }

    private doClose(): void {
        if (this.webviewPanel) {
            this.webviewPanel.dispose();
            this.webviewPanel = null;
        }
    }

    private showInstallMessage(): void {
        VSCodeYouiEvents.installing = true;
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Installing dependencies..."
        },
        async () => {
            await new Promise(resolve => {
                let intervalId = setInterval(() => {
                    if (!VSCodeYouiEvents.installing) {
                        clearInterval(intervalId);
                        resolve(undefined);
                    }
                }, 3000);
            });
            return "installing_dependencies_completed";
        });
    }

    private showDoneMessage(message: string, targetPath: string): void {
        VSCodeYouiEvents.installing = false;
        const OpenWorkspace = 'Open Workspace';
        vscode.window.showInformationMessage('The project has been successfully generated.\nWould you like to open it?', OpenWorkspace).then(selection => {
            if (selection === OpenWorkspace) {
                this.executeCommand("vscode.openFolder", targetPath);
            }
        });
    }

    private showFailureMessage(message: string): void {
        VSCodeYouiEvents.installing = false;
        const startOver = 'Start Over';
        vscode.window.showInformationMessage(message, startOver).then(selection => {
            if (selection === startOver) {
                // TODO: if ext has been launched with options then have to pass options (filter,messages)
                this.executeCommand("loadYeomanUI", undefined);
            }
        });
    }

	private async executeCommand(commandName: string, commandParam: any): Promise<any> {
		if (commandName === "vscode.open" || commandName === "vscode.openFolder") {
			commandParam = vscode.Uri.file(commandParam);
		}
		return vscode.commands.executeCommand(commandName, commandParam).then(success => {
			console.debug(`Execution of command ${commandName} returned ${success}`);
		}, failure => {
			console.debug(`Execution of command ${commandName} returned ${failure}`);
		});
	}
}
