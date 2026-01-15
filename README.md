# Core Package

**Copyright © 2024-2025 Dolphin Data Development Ltd. and AIDC Toolkit contributors**

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## Overview

> [!WARNING]
> 
> **This software is in beta**, with production release is scheduled for 2025Q4. To follow the status of this and other projects, go to the AIDC Toolkit [projects](https://github.com/orgs/aidc-toolkit/projects) page.

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

Packages install their resources as follows in `i18n.ts` or similar. Note that "dependency1" and "dependency2" are placeholders for the names of the packages on which the package depends, and "package" is the package itself.

```typescript
import { i18nCoreInit, type I18nEnvironment, i18nInit } from "@aidc-toolkit/core";
import { i18nDependency1Init } from "@aidc-toolkit/dependency1";
import { i18nDependency2Init } from "@aidc-toolkit/dependency2";
import i18next, { type i18n, type Resource } from "i18next";
import enLocaleResources from "./en/locale-resources.js";
import frLocaleResources from "./fr/locale-resources.js";

const packageNS = "aidct_package";

/**
 * Locale strings type is extracted from the English locale strings object.
 */
export type PackageLocaleResources = typeof enLocaleResources;

/**
 * Package resource bundle.
 */
const packageResourceBundle = {
  en: {
    aidct_package: enLocaleResources
  },
  fr: {
    aidct_package: frLocaleResources
  }
};

// Explicit type is necessary because type can't be inferred without additional references.
export const i18nextPackage: i18n = i18next.createInstance();

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
 * Package resource bundle.
 */
export async function i18nPackageInit(environment: I18nEnvironment, debug = false): Promise<Resource> {
  return i18nInit(i18nextPackage, environment, debug, packageNS, packageResourceBundle, i18nCoreInit, i18nDependency2Init, i18nDependency1Init);
}
```

The resource types are declared in `i18next.d.ts` or similar:

```typescript
import type { CoreLocaleResources } from "@aidc-toolkit/core";
import type { Dependency1LocaleStrings } from "@aidc-toolkit/dependency1";
import type { Dependency2LocaleStrings } from "@aidc-toolkit/dependency2";
import type { PackageLocaleStrings } from "./i18n";

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
            aidct_core: CoreLocaleResources;
            aidct_dependency1: Dependency1LocaleStrings;
            aidct_dependency2: Dependency2LocaleStrings;
            aidct_package: PackageLocaleStrings;
        };
    }
}
```

The declaration in `i18next.d.ts` exposes the resources of the dependencies to the package. The initialization process merges all the resources into a single resource bundle matching the declaration.

Support is available for the following environments:

- [Command-line interface](#command-line-interface)
  - Unit tests
  - Command-line or helper applications
- Web server - **NOT YET IMPLEMENTED**
- [Web browser](#web-browser)

### Command-Line Interface

Initializing internationalization for a command-line interface application is straightforward:

```typescript
await i18nPackageInit(I18nEnvironment.CLI);
```

### Web Browser

Initializing internationalization for a web browser requires awaiting the fulfillment of the `Promise` returned by the call to the initialization function before rendering any content. For example, in the React framework, this would be done before creating the root:

```typescript jsx
import { I18nEnvironments } from "@aidc-toolkit/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { i18nPackageInit, i18nextPackage } from "./locale/i18n.js";

i18nPackageInit(I18nEnvironments.Browser).then(() => {
    // Set the page title.
    document.title = i18nextPackage.t("App.title");

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

The application data management functionality in this package provides a simple and consistent mechanism for managing application data. While not suitable for high-volumne or transactional data, it's sufficient for most applications that require simple key-value storage.

The [`AppData`](https://aidc-toolkit.com/api/Core/type-aliases/AppData.html) type alias is a simple constrained type of `string`, `number`, `boolean`, or `object`. An object type must be one of:

- `Date`;
- `Uint8Array`;
- array of `AppData` or `undefined`; or
- object containing only `AppData` or `undefined`

Limitations in TypeScript prevent the use of recursive types and string index signatures, so there is no type enforcement beyond the basic type checks.

Two functions `encodeAppData()` and `decodeAppData()` are provided to convert between `AppData` and JSON. These enhance the normal JSON serialization/deserialization rules by:

- encoding `Date` objects as ISO 8601 strings preceded by the string "dateTime:"; and
- encoding `Uint8Array` objects as [Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) strings preceded by the string "binary:".

The functions are generally not called directly. Rather, they are called automatically by the [`ReadOnlyAppDataStorage`](https://aidc-toolkit.com/api/Core/classes/ReadOnlyAppDataStorage.html) and [`AppDataStorage`](https://aidc-toolkit.com/api/Core/classes/AppDataStorage.html) classes, which are used to manage application data in the AIDC Toolkit packages.

Internally, each storage provider defines whether it supports binary data natively. If so, a request to read binary data will return raw content as `Uint8Array` from the underlying storage mechanism and a request to write binary data will write the `Uint8Array` as-is. This applies only to top-level read and write operations, not to `Uint8Array` values stored in nested objects.

All storage providers take a path argument, which defines an implementation-specific location for the data. The following storage providers are provided by default:

- [`LocalAppDataStorage`](https://aidc-toolkit.com/api/Core/variables/LocalAppDataStorage.html)
  - Not a class, but rather a `Promise` of a constructor to one of the following implementations:
    - File-based storage
      - Supports binary data.
      - Maps the path to an absolute or relative directory.
    - Browser-based storage
      - Does not support binary data.
      - Maps the path by prepending it plus `/` to the key for use in [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
- [`RemoteAppDataStorage`](https://aidc-toolkit.com/api/Core/classes/RemoteAppDataStorage.html)
  - Read-only.
  - Supports binary data.
  - Maps the path to a base URL.

## Caching

The [`Cache`](https://aidc-toolkit.com/api/Core/classes/Cache.html) class provides a simple cache that can be used to maintain synchronization with an external source.
