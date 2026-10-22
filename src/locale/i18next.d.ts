import type { CoreLocaleResources } from "./i18n.js";

/**
 * Internationalization module.
 */
declare module "i18next" {
    /**
     * Custom type options for this package.
     */
    interface CustomTypeOptions {
        resources: {
            aidct_core: CoreLocaleResources;
        };
    }
}
