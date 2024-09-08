The AIDC Toolkit `core` package contains artefacts to support other AIDC Toolkit packages; it does not itself provide
any of the functionality of the AIDC Toolkit. It is a required dependency for all AIDC Toolkit packages.

## Localization

All AIDC Toolkit packages require localization. The localization functionality in this package simplifies initialization
and allows packages to share a common internationalization engine, whose initialization is the responsibility of the
client application. Packages install their resources as follows in `i18n.ts` or similar:

```typescript
import { i18nAddResourceBundle, i18next } from "@aidc-toolkit/core";
import { localeStrings as enLocaleStrings } from "./en/locale_strings.js";

export const packageNS = "aidct_package";

i18nAddResourceBundle("en", packageNS, enLocaleStrings);

export default i18next;
```

The resource types are declared in `i18next.d.ts` or similar:

```typescript
import type { localeStrings } from "./en/locale_strings.js";

declare module "i18next" {
    interface CustomTypeOptions {
        resources: {
            // Extract the type from the English locale strings object.
            aidct_package: typeof localeStrings;
        };
    }
}
```

## Resources

The `resource` folder contains common resources (e.g., AIDC Toolkit icon) usable by all AIDC Toolkit packages.
