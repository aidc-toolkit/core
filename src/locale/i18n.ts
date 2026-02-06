import i18next, {
    type DefaultNamespace,
    type i18n,
    type LanguageDetectorModule,
    type Namespace,
    type Newable,
    type NewableModule,
    type ParseKeys,
    type Resource,
    type TOptions
} from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import I18nextCLILanguageDetector from "i18next-cli-language-detector";
import enLocaleResources from "./en/locale-resources.js";
import frLocaleResources from "./fr/locale-resources.js";

/**
 * Locale strings type for generic manipulation.
 */
export interface LocaleResources {
    [key: string]: LocaleResources | string | undefined;
}

/**
 * Internationalization language detectors.
 */
export const I18nLanguageDetectors = {
    /**
     * Command-line interface (e.g., unit tests).
     */
    // TODO Refactor when https://github.com/neet/i18next-cli-language-detector/issues/281 resolved.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Per above.
    CLI: I18nextCLILanguageDetector as unknown as LanguageDetectorModule,

    /**
     * Web browser.
     */
    Browser: I18nextBrowserLanguageDetector as Newable<LanguageDetectorModule>
} as const;

/**
 * Internationalization language detector.
 */
export type I18nLanguageDetector =
    LanguageDetectorModule | Newable<LanguageDetectorModule> | NewableModule<LanguageDetectorModule>;

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

/**
 * Determine if a key exists.
 *
 * @param i18next
 * Internationalization object.
 *
 * @param key
 * Key to check.
 *
 * @param options
 * Options.
 *
 * @returns
 * True if key exists in the specified namespace with the given options.
 */
export function isI18nParseKey<
    TNamespace extends Namespace = DefaultNamespace,
    TNamespaceOptions extends TOptions = TNamespace extends DefaultNamespace ?
        {
            ns?: DefaultNamespace;
        } :
        {
            ns: TNamespace;
        }
>(i18next: i18n, key: string, options?: TNamespaceOptions): key is ParseKeys<TNamespace, TNamespaceOptions> {
    return i18next.exists(key, options);
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
 * @param languageDetector
 * Language detector.
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
export async function i18nInit(i18next: i18n, languageDetector: I18nLanguageDetector, debug: boolean, defaultNS: string, defaultResourceBundle: Resource, ...i18nDependencyInits: Array<(languageDetector: I18nLanguageDetector, debug: boolean) => Promise<Resource>>): Promise<Resource> {
    let initAll: Promise<void> | undefined = undefined;

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

        // Build chain to initialize dependencies and merge their resource bundles.
        for (const i18nDependencyInit of i18nDependencyInits) {
            const initDependency = i18nDependencyInit(languageDetector, debug).then(mergeResourceBundle);

            initAll = initAll === undefined ? initDependency : initAll.then(async () => initDependency);
        }

        const initThis = i18next.use(languageDetector).init({
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

        initAll = initAll === undefined ? initThis : initAll.then(async () => initThis);
    }

    return initAll !== undefined ? initAll.then(() => defaultResourceBundle) : defaultResourceBundle;
}

/**
 * Initialize internationalization.
 *
 * @param languageDetector
 * Language detector.
 *
 * @param debug
 * Debug setting.
 *
 * @returns
 * Core resource bundle.
 */
export async function i18nCoreInit(languageDetector: I18nLanguageDetector, debug = false): Promise<Resource> {
    return i18nInit(i18nextCore, languageDetector, debug, coreNS, coreResourceBundle);
}
