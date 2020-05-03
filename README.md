[![CircleCI](https://circleci.com/gh/SAP/yeoman-ui.svg?style=svg)](https://circleci.com/gh/SAP/yeoman-ui)
![GitHub license](https://img.shields.io/badge/license-Apache_2.0-blue.svg)

# Yeoman UI

![](screenshot.png)

## Description
Provide a rich user experience for Yeoman generators using a VS Code extension or the browser.
The repository contains three main packages:
* **Frontend** - The Yeoman UI as a standalone 'vue.js' application.
* **Backend** - The backend part which communicates with Yeoman and the system. Runs as a VS Code extension or node.js application.
* **Yeoman sample generator** - Sample generator to show usage and test the platform.

## Requirements
* [node.js](https://www.npmjs.com/package/node) version 10 or higher.
* [VSCode](https://code.visualstudio.com/) version 1.39.2 or higher or [Theia](https://www.theia-ide.org/) version 0.12 or higher.

## Download and Installation
To test run the framework, build and install the backend package which will automatically build and run the UI.
### Installation
1. Clone this repository.
2. cd to the backend folder.
    ```bash
    cd backend
    ```
3. Compile and prepare the static resources and run the following commands:
    ```bash
    npm run backend
    npm run frontend
    ```
### Usage and Development
#### Run the dev mode
The Dev mode allows you to run the framework in the browser, using vue cli for fast development cycles, and easy debug tools.

1. In the backend folder, run webpack or webpack-dev and then run the server.
    ```bash
    npm run webpack-dev
    npm run ws:run
    ```
2. In the frontend folder, run serve.
    ```bash
    npm run serve
    ```
3. Open the broswer on localhost:8080 to access the framework.

#### Run the VS Code extension
1. Start VS Code on your local machine and choose **Open Workspace**. 
2. Select this repo folder.
3. On the Debug panel, choose **Run Extension** and then **Run**.

#### Advanced scenarios
To develop and contribute, you can build and install each package seperatly. See the instructions for each package in the relevant 'readme.md' file.
* [Build & install the client](frontend/README.md)
* [Build & install the backend](backend/README.md)
* [Build & install the yeoman example generator](generator-foodq/README.md)

## Known issues
* 'inquirer.js' plugins are not supported.
* the 'transformer' function is not supported.

## How to obtain support
To get more help, support and information, open a GitHub [issue](https://github.com/SAP/yeoman-ui/issues).

## Contributing
Contributing information can be found in the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## TODO
* Implement the ability for yeoman-ui to call methods in VS Code extensions.
    * Support hook for executing commands after finish.
    * Support 'Open readme.md file' by default (with turn off setting).

* Support extensible question type custom user interfaces for complex operations (for example, Choose odata source).
* Support inquirer plugins (for example, date/time).


## License
Copyright (c) 2019 SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE]() file.
