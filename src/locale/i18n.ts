import i18next, {
    type i18n,
    type Namespace,
    type ParseKeys,
    type Resource,
    type TFunction,
    type TOptions
} from "i18next";
import enLocaleResources from "./en/locale-resources.js";
import frLocaleResources from "./fr/locale-resources.js";

/**
 * Default language.
 */
export const DEFAULT_LANGUAGE = "en";

/**
 * Locale resources type for generic manipulation.
 */
export interface LocaleResources {
    [key: string]: LocaleResources | string | undefined;
}

/**
 * Core namespace.
 */
export const coreNS = "aidct_core";

/**
 * Locale resources type is extracted from the English locale resources object.
 */
export type CoreLocaleResources = typeof enLocaleResources;

/**
 * Internationalization locale resources. Declares package-specific locale resources, which will be merged with
 * declarations in downstream packages that also provide internationalization.
 */
export interface I18nLocaleResources {
    /**
     * Core locale resources.
     */
    [coreNS]: CoreLocaleResources;
}

/**
 * Core parse keys.
 */
export type CoreParseKeys = ParseKeys<typeof coreNS>;

/**
 * Core resource bundle.
 */
export const coreResourceBundle: Resource = {
    en: {
        [coreNS]: enLocaleResources
    },
    fr: {
        [coreNS]: frLocaleResources
    }
};

/**
 * Internationalization instance.
 */
let i18nextInstance = i18next;

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
 * Initialize internationalization.
 *
 * @param i18next
 * Internationalization instance.
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
 * Resource bundle.
 */
export async function i18nInit(i18next: i18n, debug: boolean, resourceBundle: Resource, ...i18nDependencyInits: Array<(i18next: i18n, debug: boolean) => Promise<Resource>>): Promise<Resource> {
    let result;

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

        mergeResourceBundle(resourceBundle);

        let initDependencies;

        // Build chain to initialize dependencies and merge their resource bundles.
        for (const i18nDependencyInit of i18nDependencyInits) {
            const initDependency = i18nDependencyInit(i18next, debug).then(mergeResourceBundle);

            initDependencies = initDependencies === undefined ? initDependency : initDependencies.then(async () => initDependency);
        }

        const initThis = i18next.init({
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
            i18next.services.formatter?.add("toLowerCase", toLowerCase);
        }).then(() => resourceBundle);

        result = initDependencies === undefined ? initThis : initDependencies.then(async () => initThis);
    } else {
        result = resourceBundle;
    }

    return result;
}

/**
 * Core i18next translator function.
 */
export let i18nextCoreT: TFunction<typeof coreNS>;

/**
 * Initialize internationalization.
 *
 * @param i18next
 * Internationalization instance.
 *
 * @param debug
 * Debug setting.
 *
 * @returns
 * Core resource bundle.
 */
export async function i18nCoreInit(i18next: i18n, debug = false): Promise<Resource> {
    // Bind instance.
    i18nextInstance = i18next;

    // Bind translator function to i18next.
    i18nextCoreT = i18next.getFixedT(null, coreNS);

    return i18nInit(i18next, debug, coreResourceBundle);
}
