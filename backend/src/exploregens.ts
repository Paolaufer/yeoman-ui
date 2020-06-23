import * as npmFetch from 'npm-registry-fetch';
import * as _ from 'lodash';
import * as cp from 'child_process';
import { IChildLogger } from "@vscode-logging/logger";
import { IRpc } from "@sap-devx/webview-rpc/out.ext/rpc-common";
import { RpcExtension } from '@sap-devx/webview-rpc/out.ext/rpc-extension';
import * as util from 'util';
import * as vscode from 'vscode';

const NPM = (process.platform === 'win32' ? 'npm.cmd' : 'npm');
const ONE_DAY = 1000 * 60 * 60 * 24;
const GLOBAL_STATE_KEY = "Explore Generators.lastAutoUpdateDate";

export class ExploreGens {
    private logger: IChildLogger;
    private rpc: IRpc;
    private gensBeingHandled: string[];
    private cachedInstalledGeneratorsPromise: Promise<string[]>;

    constructor(context: vscode.ExtensionContext, logger: IChildLogger) {
        this.logger = logger;
        this.gensBeingHandled = [];

        this.doGeneratorsUpdate(context);
    }

    public init(webviewPanel: vscode.WebviewPanel) {
        this.initRpc(new RpcExtension(webviewPanel.webview));
        this.cachedInstalledGeneratorsPromise = this.getAllInstalledGenerators();
    }

    private doGeneratorsUpdate(context: vscode.ExtensionContext) {
        const lastUpdateDate = context.globalState.get(GLOBAL_STATE_KEY, 0);
        const currentDate = Date.now();
        if ((currentDate - lastUpdateDate) > ONE_DAY) {
            context.globalState.update(GLOBAL_STATE_KEY, currentDate);
            this.updateAllInstalledGenerators();
        }
    }

    private async getAllInstalledGenerators(): Promise<string[]> {
        const locationParams = this.getGeneratorsLocationParams();
        const listCommand = `${NPM} list ${locationParams} --depth=0`;

        const gensString = await this.exec(listCommand).then(result => {
            return _.get(result, "stdout", "");
        }).catch(error => {
            return _.get(error, "stdout", "");
        });

        return this.getGenerators(gensString);
    }

    private initRpc(rpc: IRpc) {
        this.rpc = rpc;
        this.rpc.registerMethod({ func: this.getFilteredGenerators, thisArg: this });
        this.rpc.registerMethod({ func: this.install, thisArg: this });
        this.rpc.registerMethod({ func: this.uninstall, thisArg: this });
        this.rpc.registerMethod({ func: this.isInstalled, thisArg: this });
        this.rpc.registerMethod({ func: this.getRecommendedQuery, thisArg: this });
    }

    private async updateAllInstalledGenerators() {
        const autoUpdateEnabled = this.getWsConfig().get("Explore Generators.autoUpdate", true);
        if (autoUpdateEnabled) {
            const installedGenerators: string[] = await this.getAllInstalledGenerators();
            if (!_.isEmpty(installedGenerators)) {
                const updatingMessage = "Auto updating of installed generators...";
                this.logger.debug(updatingMessage);
                const statusBarMessage = vscode.window.setStatusBarMessage(updatingMessage);
                const locationParams = this.getGeneratorsLocationParams();
                const promises = _.map(installedGenerators, genName => {
                    return this.installGenerator(locationParams, genName, false);
                });

                await Promise.all(promises);
                statusBarMessage.dispose();
                vscode.window.setStatusBarMessage("Finished auto updating of installed generators.", 10000);
            }
        }
    }

    private getWsConfig() {
        return vscode.workspace.getConfiguration();
    }

    private async install(gen: any) {
        const genName: string = gen.package.name;
        const locationParams = this.getGeneratorsLocationParams();
        await this.installGenerator(locationParams, genName);
        const installedGens: string[] = await this.cachedInstalledGeneratorsPromise;
        installedGens.push(genName);
        this.cachedInstalledGeneratorsPromise = Promise.resolve(_.uniq(installedGens));
    }

    private async uninstall(gen: any) {
        const genName = gen.package.name;
        const locationParams = this.getGeneratorsLocationParams();
        await this.uninstallGenerator(locationParams, genName);
        const installedGens: string[] = await this.cachedInstalledGeneratorsPromise;
        this.removeFromArray(installedGens, genName);
        this.cachedInstalledGeneratorsPromise = Promise.resolve(installedGens);
    }

    private async getFilteredGenerators(query = "", author = "") {
        const gensQueryUrl = this.getGensQueryURL(query, author);

        try {
            const res: any = await npmFetch.json(gensQueryUrl);
            const filteredGenerators = _.map(_.get(res, "objects"), gen => {
                gen.disabledToHandle = _.includes(this.gensBeingHandled, gen.package.name) ? true : false;
                return gen;
            });
            return [filteredGenerators, res.total];
        } catch (error) {
            this.showAndLogError(`Failed to get generators with the queryUrl ${gensQueryUrl}`, error);
        }
    }

    private showAndLogError(messagePrefix: string, error: any) {
        const errorMessage = error.toString();
        this.logger.error(errorMessage);
        vscode.window.showErrorMessage(`${messagePrefix}: ${errorMessage}`);
    }

    private getGensQueryURL(query: string, recommended: string) {
        const api_endpoint = "http://registry.npmjs.com/-/v1/search?text=";
        let actualQuery = `${query} ${recommended}`;
        actualQuery = _.replace(actualQuery, new RegExp(" ", "g"), "%20");
        return `${api_endpoint}${actualQuery}%20keywords:yeoman-generator%20&size=25&ranking=popularity`;
    }

    private getRecommendedQuery() {
        const recommended: string[] = this.getWsConfig().get("Explore Generators.searchQuery") || [];
        return _.uniq(recommended);
    }

    private getGeneratorsLocationParams() {
        const location = _.trim(this.getWsConfig().get("Explore Generators.installationLocation"));
        return _.isEmpty(location) ? "-g" : `--prefix ${location}`;
    }

    private async exec(arg: string) {
        return util.promisify(cp.exec)(arg);
    }

    private async installGenerator(locationParams: string, genName: string, isInstall = true) {
        this.gensBeingHandled.push(genName);
        const installingMessage = `Installing the latest version of ${genName} ...`;
        let statusbarMessage;
        if (isInstall) {
            statusbarMessage = vscode.window.setStatusBarMessage(installingMessage);
        }

        try {
            this.logger.debug(installingMessage);
            const installCommand = this.getNpmInstallCommand(locationParams, genName);
            this.updateBeingHandledGenerator(genName, true);
            await this.exec(installCommand);
            const successMessage = `${genName} successfully installed.`;
            this.logger.debug(successMessage);
            if (isInstall) {
                vscode.window.showInformationMessage(successMessage);
            }
        } catch (error) {
            this.showAndLogError(`Failed to install ${genName}`, error);
        } finally {
            this.removeFromArray(this.gensBeingHandled, genName);
            this.updateBeingHandledGenerator(genName, false);
            if (statusbarMessage) {
                statusbarMessage.dispose();
            }
        }
    }

    private async uninstallGenerator(locationParams: string, genName: string) {
        this.gensBeingHandled.push(genName);
        const uninstallingMessage = `Uninstalling ${genName} ...`;
        const statusbarMessage = vscode.window.setStatusBarMessage(uninstallingMessage);

        try {
            this.logger.debug(uninstallingMessage);
            const uninstallCommand = this.getNpmUninstallCommand(locationParams, genName);
            
            await this.exec(uninstallCommand);
            const successMessage = `${genName} successfully uninstalled.`;
            this.logger.debug(successMessage);
            vscode.window.showInformationMessage(successMessage);
        } catch (error) {
            this.showAndLogError(`Failed to uninstall ${genName}`, error);
        } finally {
            this.removeFromArray(this.gensBeingHandled, genName);
            statusbarMessage.dispose();
        }
    }

    private async isInstalled(gen: any) {
        const installedGens: string[] = await this.cachedInstalledGeneratorsPromise;
        return _.includes(installedGens, gen.package.name);
    }

    private getGenerators(gensString: string): string[] {
        const genNames: string[] = gensString.match(/[+--].*?generator-.+?@/gm);
        return _.map(genNames, genName => {
            return genName.substring(4, genName.length - 1);
        });
    }

    private removeFromArray(array: string[], valueToRemove: string) {
        _.remove(array, value => {
            return value === valueToRemove;
        });
    }

    private updateBeingHandledGenerator(genName: string, isBeingHandled: boolean) {
        this.rpc.invoke("updateBeingHandledGenerator", [genName, isBeingHandled]);
    }

    private getNpmInstallCommand(locationParams: string, genName: string) {
        return `${NPM} install ${locationParams} ${genName}@latest`;
    }

    private getNpmUninstallCommand(locationParams: string, genName: string) {
        return `${NPM} uninstall ${locationParams} ${genName}`;
    }
}
