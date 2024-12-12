The AIDC Toolkit `core` package contains artefacts to support other AIDC Toolkit packages; it does not itself provide
any of the functionality of the AIDC Toolkit. It is a required dependency for all AIDC Toolkit packages.

## Localization

All AIDC Toolkit packages require localization. The localization functionality in this package simplifies initialization
and allows packages to share a common internationalization engine, whose initialization is the responsibility of the
client application. Each package requires its own internationalization object and each is responsible for initializing
those of its dependencies.

Packages install their resources as follows in `i18n.ts` or similar:

```typescript
import { i18nAssertValidResources, i18nCoreInit, type I18NEnvironment } from "@aidc-toolkit/core";
import { i18nDependency1Init, dependency1Resources } from "@aidc-toolkit/dependency1";
import { i18nDependency2Init, dependency2Resources } from "@aidc-toolkit/dependency2";
import i18next from "i18next";
import { localeStrings as enLocaleStrings } from "./en/locale-strings.js";
import { localeStrings as frLocaleStrings } from "./fr/locale-strings.js";

export const packageNS = "aidct_package";

/**
 * Locale strings type is extracted from the English locale strings object.
 */
export type PackageLocaleStrings = typeof enLocaleStrings;

i18nAssertValidResources(enLocaleStrings, "fr", frLocaleStrings);

/**
 * Package resources.
 */
export const packageResources = {
    en: {
        aidct_package: enLocaleStrings
    },
    fr: {
        aidct_package: frLocaleStrings
    }
};

export const i18nextPackage = i18next.createInstance();

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
 * Void promise.
 */
export async function i18nPackageInit(environment: I18NEnvironment, debug = false): Promise<void> {
    await i18nDependency1Init(environment, debug);
    await i18nDependency2Init(environment, debug);
    await i18nCoreInit(i18nextPackage, environment, debug, packageNS, dependency1Resources, dependency2Resources, packageResources);
}
```

The resource types are declared in `i18next.d.ts` or similar:

```typescript
import type { Dependency1LocaleStrings } from "@aidc-toolkit/dependency1";
import type { Dependency2LocaleStrings } from "@aidc-toolkit/dependency2";
import type { PackageLocaleStrings } from "./i18n.js";

/**
 * Internationalization module.
 */
declare module "i18next" {
    /**
     * Custom type options for this package.
     */
    interface CustomTypeOptions {
        defaultNS: "aidct_package";
        resources: {
            aidct_dependency1: Dependency1LocaleStrings;
            aidct_dependency2: Dependency2LocaleStrings;
            aidct_package: PackageLocaleStrings;
        };
    }
}
```

## Resources

The `resource` folder contains common resources (e.g., AIDC Toolkit icon) usable by all AIDC Toolkit packages.
