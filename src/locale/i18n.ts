import i18next from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import I18nextCLILanguageDetector from "i18next-cli-language-detector";

export default i18next;

/**
 * Internal type to maintain resource bundles added before initialization.
 */
interface ResourceBundle {
    lng: string;
    ns: string;
    resources: object;
}

/**
 * Internal array to maintain resource bundles added before initialization.
 */
let pendingResourceBundles: ResourceBundle[] | undefined = [];

/**
 * Internationalization operating environment.
 */
export enum I18NEnvironment {
    /**
     * Command-line interface (e.g., unit tests).
     */
    CLI,

    /**
     * Web server.
     */
    Server,

    /**
     * Web browser.
     */
    Browser
}

let i18nInitPending = true;

/**
 * Initialize internationalization.
 *
 * @param environment
 * Environment in which the application is running.
 *
 * @param debug
 * Debug setting.
 *
 * @returns
 * True if initialization was completed, false if skipped (already initialized).
 */
export async function i18nInit(environment: I18NEnvironment, debug = false): Promise<boolean> {
    const initialized = i18nInitPending;

    // Skip if initialization is not pending.
    if (i18nInitPending) {
        i18nInitPending = false;

        let module: object;

        switch (environment) {
            case I18NEnvironment.CLI:
                module = I18nextCLILanguageDetector;
                break;

            case I18NEnvironment.Browser:
                module = I18nextBrowserLanguageDetector;
                break;

            default:
                throw new Error("Not supported");
        }

        await i18next.use(module as never).init({
            fallbackLng: "en",
            debug,
            resources: {}
        }).then(() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const initResourceBundles = pendingResourceBundles!;

            // No need to manage pending resource bundles past this point.
            pendingResourceBundles = undefined;

            // Add pending resource bundles.
            for (const initResourceBundle of initResourceBundles) {
                i18nAddResourceBundle(initResourceBundle.lng, initResourceBundle.ns, initResourceBundle.resources);
            }
        });
    }

    return initialized;
}

/**
 * Add a resource bundle.
 *
 * @param lng
 * Language.
 *
 * @param ns
 * Namespace.
 *
 * @param resources
 * Resources.
 */
export function i18nAddResourceBundle(lng: string, ns: string, resources: object): void {
    if (pendingResourceBundles !== undefined) {
        pendingResourceBundles.push({
            lng,
            ns,
            resources
        });
    } else {
        i18next.addResourceBundle(lng, ns, resources);
    }
}
