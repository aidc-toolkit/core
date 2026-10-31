# Core Package

**Copyright © 2024-2026 Dolphin Data Development Ltd. and AIDC Toolkit contributors**

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## Overview

The AIDC Toolkit `core` package contains artefacts to support other AIDC Toolkit packages; it does not itself provide any of the functionality of the AIDC Toolkit. It is a required dependency for all AIDC Toolkit packages.

## Types and Type Helpers

Generic types that go beyond TypeScript's utility types are defined here. The types are designed to provide even greater type safety. There are also helper functions for working with objects (e.g., by picking or omitting properties).

## Hyperlink

A simple interface defining a hyperlink is defined in this package to provide a consistent type across all AIDC Toolkit packages.

## Logger

This is a simple wrapper around [tslog](https://tslog.js.org) to support command-line applications in the AIDC Toolkit build process.

## Internationalization

All AIDC Toolkit packages require internationalization. The localization functionality in this package, built on the robust and popular [`i18next`](https://i18next.com) package, simplifies initialization and allows packages to share a common internationalization engine. Each package, up to and including the client application, is responsible for initializing internationalization for each of the AIDC Toolkit packages on which it depends.

> [!TIP]
> 
> For a complete example, including how to use application-specific resource bundles, see the AIDC Toolkit [demo source](https://github.com/aidc-toolkit/demo/tree/main/src/locale).

### Initialization

Packages initialize their resources as follows in `i18n.ts` or similar. Note that "dependency1" and "dependency2" are placeholders for the names of the packages on which the package depends, and "package" is the package itself.

```typescript
import { i18nCoreInit, i18nInit } from "@aidc-toolkit/core";
import { i18nDependency1Init } from "@aidc-toolkit/dependency1";
import { i18nDependency2Init } from "@aidc-toolkit/dependency2";
import type { i18n, ParseKeys, Resource, TFunction } from "i18next";
import enLocaleResources from "./en/locale-resources.js";
import frLocaleResources from "./fr/locale-resources.js";

/**
 * Package namespace.
 */
export const packageNS = "aidct_package";

/**
 * Locale resources type is extracted from the English locale resources object.
 */
export type PackageLocaleResources = typeof enLocaleResources;

/**
 * Core locale resources augmentation.
 */
declare module "@aidc-toolkit/core" {
    /**
     * Internationalization locale resources.
     */
    export interface I18nLocaleResources {
        /**
         * Package locale resources.
         */
        [packageNS]: PackageLocaleResources;
    }
}

/**
 * Package parse keys.
 */
export type PackageParseKeys = ParseKeys<typeof packageNS>;

/**
 * Package resource bundle.
 */
export const packageResourceBundle: Resource = {
    en: {
        [packageNS]: enLocaleResources
    },
    fr: {
        [packageNS]: frLocaleResources
    }
};

/**
 * Package i18next translator function.
 */
export let i18nextPackageT: TFunction<typeof packageNS>;

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
 * Package resource bundle.
 */
export async function i18nPackageInit(i18next: i18n, debug = false): Promise<Resource> {
    // Bind translator function to i18next.
    i18nextPackageT = i18next.getFixedT(null, packageNS);

    return i18nInit(i18next, debug, packageResourceBundle, i18nCoreInit, i18nDependency1Init, i18nDependency2Init);
}
```

Augmenting the `I18nLocaleResources` interface simplifies the augmentation of `CustomTypeOptions` in `i18next` by eliminating the need to define every resource on which the package depends. Accordingly, the resource types are declared in `i18next.d.ts` or similar as follows:

```typescript
import type { I18nLocaleResources } from "@aidc-toolkit/core";

/**
 * Internationalization module augmentation.
 */
declare module "i18next" {
  /**
   * Custom type options for this package.
   */
  interface CustomTypeOptions {
    /**
     * Resources override.
     */
    resources: I18nLocaleResources;
  }
}
```

The declaration in `i18next.d.ts` is required to ensure that resource keys are property typed when using any of the translation functions (e.g., `i18nextCoreT`, `i18nextDependency1T`, `i18nextDependency2T`, `i18nextPackageT`). The initialization process merges all the resources into a single resource bundle matching the declaration.

### Environment-Specific Language Detection

Language detection is available for the following environments:

- [Command-line interface](#command-line-interface)
  - Unit tests
  - Command-line or helper applications
- [Web browser](#web-browser)

Language detection is not part of the initialization process; the client application is expected to install a language detector prior to initialization.

When the internationalization instance object is initialized, it is configured so that language detection starts with the full locale as provided by the environment then falls back as follows:

- the full locale minus the regional variant if any;
- the full locale minus the regional variant and the region if any; and
- the first locale as defined in the default resource bundle.

Caching (typically via the `i18nextLng` attribute in some form of storage) is disabled. Depending on the detector, this may still allow reading from a cache (e.g., the browser detector from local storage or session storage) but not writing. This leaves it to the application to decide how and when to persist the language setting.

#### Command-Line Interface

Language detection is implemented using [I18nextCLILanguageDetector](https://github.com/neet/i18next-cli-language-detector), which is exposed as [i18nCoreCLILanguageDetector](https://aidc-toolkit.com/v2.0/api/Core/variables/i18nCoreCLILanguageDetector.html).

Initializing internationalization for a command-line interface application is straightforward:

```typescript
import { getLogger, i18nCoreCLILanguageDetector } from "@aidc-toolkit/core";

const logger = getLogger(LogLevels.Info);

await i18nPackageInit(i18next.use(i18nCoreCLILanguageDetector)).then(() => {
    // Run application here.
}).catch((e: unknown) => {
    logger.error("Package failed", e);
    process.exit(1);
});
```

#### Web Browser

Language detection is implemented using [I18nextBrowserLanguageDetector](https://github.com/i18next/i18next-browser-languageDetector), which is exposed as [i18nCoreBrowserLanguageDetector](https://aidc-toolkit.com/v2.0/api/Core/variables/i18nCoreBrowserLanguageDetector.html).

Initializing internationalization for a web browser requires awaiting the fulfillment of the `Promise` returned by the call to the initialization function before rendering any content. For example, in the React framework, this would be done before creating the root:

```typescript jsx
import { i18nCoreBrowserLanguageDetector } from "@aidc-toolkit/core";
import i18next from "i18next";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { i18nPackageInit, i18nextPackageT } from "./locale/i18n.js";

i18nPackageInit(i18next.use(i18nCoreBrowserLanguageDetector)).then(() => {
    document.title = i18nextPackageT("App.title");
  
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
          <App />
        </StrictMode>
    );
}).catch((e: unknown) => {
    console.error(e);

    alert(e);
});
```

## Resources

The `resource` folder contains common resources (e.g., AIDC Toolkit icon) usable by all AIDC Toolkit packages.

## Application Data Management

Parts of the AIDC Toolkit require persistent application data management, but there is no universal way to manage a persistence store:

- Command-line applications use the local file system, which supports data in any format.
- Browser-based applications use local storage, which supports string data only.
- Server-based applications use a database, which may have a strict schema.
- Other applications may use a different mechanism entirely, such as storing content in an XML node in a document.

The application data management functionality in this package provides a simple and consistent mechanism for managing application data. While not suitable for high-volume or transactional data, it's sufficient for most applications that require simple key-value storage.

The [`AppData`](https://aidc-toolkit.com/v2.0/api/Core/type-aliases/AppData.html) type alias is a constrained type of `string`, `number`, `boolean`, `Date`, `Uint8Array`, array of `AppData`, or object consisting of `AppData` properties.

Two functions `encodeAppData()` and `decodeAppData()` are provided to convert between `AppData` and JSON. These enhance the normal JSON serialization/deserialization rules by:

- encoding `Date` objects as ISO 8601 strings preceded by the string "dateTime:"; and
- encoding `Uint8Array` objects as [Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) strings preceded by the string "binary:".

The functions are generally not called directly. Rather, they are called automatically by the [`ReadOnlyAppDataStorage`](https://aidc-toolkit.com/v2.0/api/Core/classes/ReadOnlyAppDataStorage.html) and [`AppDataStorage`](https://aidc-toolkit.com/v2.0/api/Core/classes/AppDataStorage.html) classes, which are used to manage application data in the AIDC Toolkit packages.

Internally, each storage provider defines whether it supports binary data natively. If so, a request to read binary data will return raw content as `Uint8Array` from the underlying storage mechanism and a request to write binary data will write the `Uint8Array` as-is. This applies only to top-level read and write operations, not to `Uint8Array` values stored in nested objects.

All storage providers take a path argument, which defines an implementation-specific location for the data. The following storage providers are provided by default:

- [`LocalAppDataStorage`](https://aidc-toolkit.com/v2.0/api/Core/classes/LocalAppDataStorage.html)
  - Determines an appropriate implementation based on the local environment. One of:
    - Browser-based storage
      - Does not support binary data.
      - Maps the path by prepending it plus `/` to the key for use in [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
    - File-based storage
      - Supports binary data.
      - Maps the path to an absolute or relative directory.
    - No-op storage
      - Swallows all requests without error.
- [`RemoteAppDataStorage`](https://aidc-toolkit.com/v2.0/api/Core/classes/RemoteAppDataStorage.html)
  - Read-only.
  - Supports binary data.
  - Maps the path to a base URL.

## Caching

The [`Cache`](https://aidc-toolkit.com/v2.0/api/Core/classes/Cache.html) class provides a simple cache that can be used to maintain synchronization with an external source.
