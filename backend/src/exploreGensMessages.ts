export default {
    auto_update_started: "Updating the installed generators...",
    auto_update_finished: "Update of the installed generators completed",
    failed_to_install: (genName: string) => `Could not install the ${genName} generator`,
    failed_to_uninstall: (genName: string) => `Could not uninstall the ${genName} generator`,
    uninstalling: (genName: string) => `Uninstalling the ${genName} generator ...`,
    uninstalled: (genName: string) => `The ${genName} generator has been uninstalled`,
    installing: (genName: string) => `Installing the latest version of the ${genName} generator ...`,
    installed: (genName: string) => `The ${genName} generator has been installed`,
    failed_to_get: (gensQueryUrl: string) => `Could not get generators with the ${gensQueryUrl} queryUrl`
}; 
