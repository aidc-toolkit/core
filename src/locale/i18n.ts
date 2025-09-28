import type { i18n, LanguageDetectorModule, Resource } from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import I18nextCLILanguageDetector from "i18next-cli-language-detector";

/**
 * Locale strings type for generic manipulation.
 */
export interface LocaleStrings {
    [key: string]: LocaleStrings | string;
}

/**
 * Internationalization operating environment.
 */
export enum I18nEnvironment {
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

/**
 * Assert that language resources are a type match for English (default) resources.
 *
 * @param enResources
 * English resources.
 *
 * @param lng
 * Language.
 *
 * @param lngResources
 * Language resources.
 *
 * @param parent
 * Parent key name (set recursively).
 */
export function i18nAssertValidResources(enResources: object, lng: string, lngResources: object, parent?: string): void {
    const enResourcesMap = new Map<string, object>(Object.entries(enResources));
    const lngResourcesMap = new Map<string, object>(Object.entries(lngResources));

    const isLocale = lng.includes("-");

    for (const [enKey, enValue] of enResourcesMap) {
        const lngValue = lngResourcesMap.get(enKey);

        if (lngValue !== undefined) {
            const enValueType = typeof enValue;
            const lngValueType = typeof lngValue;

            if (lngValueType !== enValueType) {
                throw new Error(`Invalid value type ${lngValueType} for key ${parent === undefined ? "" : `${parent}.`}${enKey} in ${lng} resources`);
            }

            if (enValueType === "object") {
                i18nAssertValidResources(enValue, lng, lngValue, `${parent === undefined ? "" : `${parent}.`}${enKey}`);
            }
        // Locale falls back to raw language so ignore if missing.
        } else if (!isLocale) {
            throw new Error(`Missing key ${parent === undefined ? "" : `${parent}.`}${enKey} from ${lng} resources`);
        }
    }

    for (const [lngKey] of lngResourcesMap) {
        if (!enResourcesMap.has(lngKey)) {
            throw new Error(`Extraneous key ${parent === undefined ? "" : `${parent}.`}${lngKey} in ${lng} resources`);
        }
    }
}

/**
 * Convert a string to lower case, skipping words that are all upper case.
 *
 * @param s
 * String.
 *
 * @returns
 * Lower case string.
 */
function toLowerCase(s: string): string {
    // Words with no lower case letters are preserved as they are likely mnemonics.
    return s.split(" ").map(word => /[a-z]/.test(word) ? word.toLowerCase() : word).join(" ");
}

/**
 * Initialize internationalization.
 *
 * @param i18next
 * Internationalization object. As multiple objects exists, this parameter represents the one for the module for which
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
 * @param resources
 * Resources.
 *
 * @returns
 * Void promise.
 */
export async function i18nCoreInit(i18next: i18n, environment: I18nEnvironment, debug: boolean, defaultNS: string, ...resources: Resource[]): Promise<void> {
    // Initialization may be called more than once.
    if (!i18next.isInitialized) {
        const mergedResource: Resource = {};

        // Merge resources.
        for (const resource of resources) {
            // Merge languages.
            for (const [language, resourceLanguage] of Object.entries(resource)) {
                if (!(language in mergedResource)) {
                    mergedResource[language] = {};
                }

                const mergedResourceLanguage = mergedResource[language];

                // Merge namespaces.
                for (const [namespace, resourceKey] of Object.entries(resourceLanguage)) {
                    mergedResourceLanguage[namespace] = resourceKey;
                }
            }
        }

        let module: Parameters<typeof i18next.use>[0];

        switch (environment) {
            case I18nEnvironment.CLI:
                // TODO Refactor when https://github.com/neet/i18next-cli-language-detector/issues/281 resolved.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Per above.
                module = I18nextCLILanguageDetector as unknown as LanguageDetectorModule;
                break;

            case I18nEnvironment.Browser:
                module = I18nextBrowserLanguageDetector;
                break;

            default:
                throw new Error("Not supported");
        }

        await i18next.use(module).init({
            debug,
            resources: mergedResource,
            fallbackLng: "en",
            defaultNS
        }).then(() => {
            // Add toLowerCase function.
            i18next.services.formatter?.add("toLowerCase", value => typeof value === "string" ? toLowerCase(value) : String(value));
        });
    }
}
