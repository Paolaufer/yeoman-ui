[![CircleCI](https://circleci.com/gh/SAP/yeoman-ui.svg?style=svg)](https://circleci.com/gh/SAP/yeoman-ui)
![GitHub license](https://img.shields.io/badge/license-Apache_2.0-blue.svg)

# Yeoman UI

![](screenshot.png)

## Description
Provide a rich user experience for Yeoman generators using VS Code extensions or the browser.
The repository contains 3 main packages:
* **Frontend** - The Yeoman UI as a standalone 'vue.js' application.
* **Backend** - The backend that communicates with Yeoman and the system. Runs as a VS Code extension or 'node.js' application.
* **Yeoman example generator** - A sample generator to show usages and test the platform.

## Requirements
* [node.js](https://www.npmjs.com/package/node) version 10 or higher.
* [VSCode](https://code.visualstudio.com/) 1.39.2 or higher or [Theia](https://www.theia-ide.org/) 0.12 or higher.

## Download and Installation
To test run the framework, you need to build and install the backend package which will automatically build and run the UI.
### Installation
1. Clone this repository.
2. cd to the "Backend" folder.
    ```bash
    cd Backend
    ```
3. To install, compile and prepare the static resources, run the following commands:
    ```bash
    npm run backend
    npm run frontend
    ```
### Usage & Development
#### Run the Dev Mode
The Dev mode allows you to run the framework in the browser using vue cli for fast development cycles and easy debug tools.
To run the Dev mode:
1. In the 'Backend' folder, run 'webpack' or 'webpack-dev', then run the server.
    ```bash
    npm run webpack-dev
    npm run ws:run
    ```
2. In the 'frontend' folder, run 'serve'.
    ```bash
    npm run serve
    ```
3. Open the broswer on `localhost:8080` to access the framework.

#### Run the VS Code Extension
1. Start VS Code on your local machine, and click **Open Workspace**. 
2. Select this repo folder.
3. On the Debug panel, choose **Run Extension**, and click **Run**.

#### Advanced Scenarios
To develop and contribute, you can build and install each package separately. You can find instructions for each package in the dedicated 'readme.md' file.
* [Build & install the client](frontend/README.md)
* [Build & install the backend](backend/README.md)
* [Build & install the yeoman example generator](generator-foodq/README.md)

## Known Issues
* 'inquirer.js' plugins are not supported.
* The 'transformer' function is not supported.

## How to obtain support
To get more help, support, and information, please open a GitHub issue.

## Contributions
Information on how to contribute can be found in the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## TODO
* Provide the Yeoman generator 'Best Practices" guide (also provide an example)
* Use debounce when watching changes to the input fields
* Implement the ability for yeoman-ui to call methods in VS Code extensions
    * Support hooks for executing commands after finish
    * Support **Open 'readme.md** file" by default (with turn off setting)

* Support **Back**
* Enable configuring destination root
* Support custom question rendering: generator set the ui renderer, example: tiles instead of dropdown, radio buttons instead of 
* Support extensible question type custom user interfaces for complex operations (e.g. choose odata source)
* Support inquirer plugins (e.g. date/time)


## License
Copyright (c) 2019 SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE]() file.
