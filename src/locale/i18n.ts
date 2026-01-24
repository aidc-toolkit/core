import i18next, {
    type i18n,
    type LanguageDetectorModule,
    type Module,
    type Newable,
    type NewableModule,
    type Resource
} from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import I18nextCLILanguageDetector from "i18next-cli-language-detector";
import enLocaleResources from "./en/locale-resources.js";
import frLocaleResources from "./fr/locale-resources.js";

/**
 * Locale strings type for generic manipulation.
 */
export interface LocaleResources {
    [key: string]: LocaleResources | string;
}

/**
 * Internationalization operating environments.
 */
export const I18nEnvironments = {
    /**
     * Command-line interface (e.g., unit tests).
     */
    CLI: 0,

    /**
     * Web server.
     */
    Server: 1,

    /**
     * Web browser.
     */
    Browser: 2
} as const;

/**
 * Internationalization operating environment key.
 */
export type I18nEnvironmentKey = keyof typeof I18nEnvironments;

/**
 * Internationalization operating environment.
 */
export type I18nEnvironment = typeof I18nEnvironments[I18nEnvironmentKey];

/**
 * Convert a string to lower case, skipping words that are all upper case.
 *
 * @param value
 * Value.
 *
 * @returns
 * Lower case string if value is a string. If not, value is returned as a string but not converted to lower case.
 */
function toLowerCase(value: unknown): string {
    return typeof value === "string" ?
        // Words with no lower case letters are preserved as they are likely mnemonics.
        value.split(" ").map(word => /[a-z]/u.test(word) ? word.toLowerCase() : word).join(" ") :
        String(value);
}

export const coreNS = "aidct_core";

/**
 * Locale resources type is extracted from the English locale resources object.
 */
export type CoreLocaleResources = typeof enLocaleResources;

/**
 * Core resource bundle.
 */
export const coreResourceBundle: Resource = {
    en: {
        aidct_core: enLocaleResources
    },
    fr: {
        aidct_core: frLocaleResources
    }
};

// Explicit type is necessary because type can't be inferred without additional references.
export const i18nextCore: i18n = i18next.createInstance();

/**
 * Initialize internationalization.
 *
 * @param i18next
 * Internationalization object. As multiple objects exist, this parameter represents the one for the module for which
 * internationalization is being initialized.
 *
 * @param environment
 * Environment in which the application is running.
 *
 * @param debug
 * Debug setting.
 *
 * @param defaultNS
 * Default namespace.
 *
 * @param defaultResourceBundle
 * Default resource bundle.
 *
 * @param i18nDependencyInits
 * Dependency internationalization initialization functions.
 *
 * @returns
 * Default resource bundle.
 */
export async function i18nInit(i18next: i18n, environment: I18nEnvironment, debug: boolean, defaultNS: string, defaultResourceBundle: Resource, ...i18nDependencyInits: Array<(environment: I18nEnvironment, debug: boolean) => Promise<Resource>>): Promise<Resource> {
    // Initialization may be called more than once.
    if (!i18next.isInitialized) {
        const mergedResourceBundle: Resource = {};

        /**
         * Merge a package resource bundle into the merged resource bundle.
         *
         * @param resourceBundle
         * Package resource bundle.
         */
        function mergeResourceBundle(resourceBundle: Resource): void {
            // Merge languages.
            for (const [language, languageResourceBundle] of Object.entries(resourceBundle)) {
                if (!(language in mergedResourceBundle)) {
                    mergedResourceBundle[language] = {};
                }

                const mergedLanguageResourceBundle = mergedResourceBundle[language];

                // Merge namespaces.
                for (const [namespace, resourceKey] of Object.entries(languageResourceBundle)) {
                    if (namespace in mergedLanguageResourceBundle) {
                        // Error prior to internationalization initialization; no localization possible.
                        throw new Error(`Duplicate namespace ${namespace} in merged resource bundle for language ${language}`);
                    }

                    mergedLanguageResourceBundle[namespace] = resourceKey;
                }
            }
        }

        mergeResourceBundle(defaultResourceBundle);

        // Initialize dependencies and merge their resource bundles.
        for (const i18nDependencyInit of i18nDependencyInits) {
            // eslint-disable-next-line no-await-in-loop -- Dependencies must initialized first.
            await i18nDependencyInit(environment, debug).then(mergeResourceBundle);
        }

        let module: Module | Newable<Module> | NewableModule<Module>;

        switch (environment) {
            case I18nEnvironments.CLI:
                // TODO Refactor when https://github.com/neet/i18next-cli-language-detector/issues/281 resolved.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Per above.
                module = I18nextCLILanguageDetector as unknown as LanguageDetectorModule;
                break;

            case I18nEnvironments.Browser:
                module = I18nextBrowserLanguageDetector;
                break;

            default:
                throw new Error("Not supported");
        }

        await i18next.use(module).init({
            debug,
            defaultNS,
            resources: mergedResourceBundle,
            // Allow fallback by removing variant code then country code until match is found.
            nonExplicitSupportedLngs: true,
            // Fallback to first language defined.
            fallbackLng: Object.keys(mergedResourceBundle)[0],
            detection: {
                // Disabling cache allows read but requires explicit saving of i18nextLng attribute (e.g., via UI).
                caches: []
            }
        }).then(() => {
            // Add toLowerCase formatter.
            i18next.services.formatter?.add("toLowerCase", toLowerCase);
        });
    }

    return defaultResourceBundle;
}

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
 * Core resource bundle.
 */
export async function i18nCoreInit(environment: I18nEnvironment, debug = false): Promise<Resource> {
    return i18nInit(i18nextCore, environment, debug, coreNS, coreResourceBundle);
}
