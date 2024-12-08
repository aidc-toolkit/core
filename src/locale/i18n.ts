import i18next, { type LanguageDetectorModule } from "i18next";
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
    let initialized: boolean;

    // Skip if initialization is not pending.
    if (pendingResourceBundles !== undefined) {
        initialized = true;
        
        let module: Parameters<typeof i18next.use>[0];

        switch (environment) {
            case I18NEnvironment.CLI:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Pending resolution of https://github.com/neet/i18next-cli-language-detector/issues/281.
                module = I18nextCLILanguageDetector as unknown as LanguageDetectorModule;
                break;

            case I18NEnvironment.Browser:
                module = I18nextBrowserLanguageDetector;
                break;

            default:
                throw new Error("Not supported");
        }

        const initResourceBundles = pendingResourceBundles;

        // No need to manage pending resource bundles past this point.
        pendingResourceBundles = undefined;

        await i18next.use(module).init({
            fallbackLng: "en",
            debug,
            resources: {}
        }).then(() => {
            // Add toLowerCase function.
            i18next.services.formatter?.add("toLowerCase", value => typeof value === "string" ? toLowerCase(value) : String(value));

            // Add pending resource bundles.
            for (const initResourceBundle of initResourceBundles) {
                i18nAddResourceBundle(initResourceBundle.lng, initResourceBundle.ns, initResourceBundle.resources);
            }
        });
    } else {
        initialized = false;
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
        // Already initialized; add resource bundle directly.
        i18next.addResourceBundle(lng, ns, resources);
    }
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
