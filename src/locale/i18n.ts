import i18next, {
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
 * Default language.
 */
export const DEFAULT_LANGUAGE = "en";

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
 * Core namespace.
 */
export const coreNS = "aidct_core";

/**
 * Core parse keys.
 */
export type CoreParseKeys = ParseKeys<typeof coreNS>;

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

/**
 * Shared i18next instance.
 */
export const i18nextInstance = i18next.createInstance();

/**
 * Determine if a key exists.
 *
 * @param ns
 * Namespace.
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
    TNamespace extends Namespace,
    TNamespaceOptions extends TOptions = {}
>(ns: TNamespace, key: string, options?: TNamespaceOptions): key is ParseKeys<TNamespace, TNamespaceOptions> {
    return i18nextInstance.exists(key, {
        ns,
        ...options
    });
}

/**
 * Core i18next translator function.
 */
export const i18nextCoreT = i18nextInstance.getFixedT(null, coreNS);

/**
 * Initialize internationalization.
 *
 * @param languageDetector
 * Language detector.
 *
 * @param debug
 * Debug setting.
 *
 * @param resourceBundle
 * Resource bundle.
 *
 * @param i18nDependencyInits
 * Dependency internationalization initialization functions.
 *
 * @returns
 * Default resource bundle.
 */
export async function i18nInit(languageDetector: I18nLanguageDetector, debug: boolean, resourceBundle: Resource, ...i18nDependencyInits: Array<(languageDetector: I18nLanguageDetector, debug: boolean) => Promise<Resource>>): Promise<Resource> {
    let result;

    // Initialization may be called more than once.
    if (!i18nextInstance.isInitialized) {
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

        mergeResourceBundle(resourceBundle);

        let initDependencies: Promise<void> | undefined = undefined;

        // Build chain to initialize dependencies and merge their resource bundles.
        for (const i18nDependencyInit of i18nDependencyInits) {
            const initDependency = i18nDependencyInit(languageDetector, debug).then(mergeResourceBundle);

            initDependencies = initDependencies === undefined ? initDependency : initDependencies.then(async () => initDependency);
        }

        const initThis = i18nextInstance.use(languageDetector).init({
            debug,
            resources: mergedResourceBundle,
            // Allow fallback by removing variant code then country code until match is found.
            nonExplicitSupportedLngs: true,
            // Fallback to default language.
            fallbackLng: DEFAULT_LANGUAGE,
            detection: {
                // Disabling cache allows read but requires explicit saving of i18nextLng attribute (e.g., via UI).
                caches: []
            }
        }).then(() => {
            // Add toLowerCase formatter.
            i18nextInstance.services.formatter?.add("toLowerCase", toLowerCase);
        }).then(() => resourceBundle);

        result = initDependencies === undefined ? initThis : initDependencies.then(async () => initThis);
    } else {
        result = resourceBundle;
    }

    return result;
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
    return i18nInit(languageDetector, debug, coreResourceBundle);
}
