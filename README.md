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

## Types

Generic types that go beyond TypeScript's utility types are defined here. The types are designed to provide even greater type safety.

## Logger

This is a simple wrapper around [tslog](https://tslog.js.org) to support command-line applications in the AIDC Toolkit build process.

## Internationalization

All AIDC Toolkit packages require internationalization. The localization functionality in this package, built on the robust and popular [`i18next`](https://i18next.com) package, simplifies initialization and allows packages to share a common internationalization engine. Each package, up to and including the client application, is responsible for initializing internationalization for each of the AIDC Toolkit packages on which it depends.

> [!TIP]
> 
> For a complete example, including how to use application-specific resource bundles, see the AIDC Toolkit [demo source](https://github.com/aidc-toolkit/demo).

Packages install their resources as follows in `i18n.ts` or similar:

```typescript
import { i18nCoreInit, type I18nEnvironment } from "@aidc-toolkit/core";
import { dependency1Resources, i18nDependency1Init } from "@aidc-toolkit/dependency1";
import { dependency2Resources, i18nDependency2Init } from "@aidc-toolkit/dependency2";
import i18next, { type i18n, type Resource } from "i18next";
import { localeStrings as enLocaleStrings } from "./en/locale-strings";
import { localeStrings as frLocaleStrings } from "./fr/locale-strings";

export const packageNS = "aidct_package";

/**
 * Locale strings type is extracted from the English locale strings object.
 */
export type PackageLocaleStrings = typeof enLocaleStrings;

/**
 * Package resources.
 */
export const packageResources: Resource = {
    en: {
        aidct_package: enLocaleStrings
    },
    fr: {
        aidct_package: frLocaleStrings
    }
};

// Explicit type is necessary to work around bug in type discovery with linked packages.
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
 * Void promise.
 */
export async function i18nPackageInit(environment: I18nEnvironment, debug = false): Promise<void> {
    await i18nDependency1Init(environment, debug);
    await i18nDependency2Init(environment, debug);
    await i18nCoreInit(i18nextPackage, environment, debug, packageNS, dependency1Resources, dependency2Resources, packageResources);
}
```

The resource types are declared in `i18next.d.ts` or similar:

```typescript
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
            aidct_dependency1: Dependency1LocaleStrings;
            aidct_dependency2: Dependency2LocaleStrings;
            aidct_package: PackageLocaleStrings;
        };
    }
}
```

Support is available for the following environments:

- [Command-line interface](#command-line-interface)
  - Unit tests
  - Batch applications
- Web server - **NOT YET IMPLEMENTED**
- [Web browser](#web-browser)

### Command-Line Interface

Initializing internationalization for a command-line interface application is straightforward:

```typescript
await i18nPackageInit(I18nEnvironment.CLI);
```

### Web Browser

Initializing internationalization for a web browser requires awaiting the fulfillment of the `Promise` returned by the call to the initialization function before rendering any content. For example, in the React framework, this may be accomplished with a component like this:

```typescript jsx
import { I18nEnvironment } from "@aidc-toolkit/core";
import { type ReactElement, type ReactNode, useEffect, useState } from "react";
import { i18nPackageInit, i18nextPackage } from "./locale/i18n";

/**
 * I18n wrapper properties.
 */
export interface I18nProperties {
    /**
     * Children.
     */
    readonly children?: ReactNode | undefined;
}

/**
 * I18n wrapper. Ensures initialization of internationalization regardless of entry point.
 *
 * @param properties
 * Properties.
 *
 * @returns
 * React element.
 */
export function I18n(properties: I18nProperties): ReactElement {
    const [isI18nInitialized, setIsI18nInitialized] = useState<boolean>(i18nextPackage.isInitialized);

    useEffect(() => {
        if (!isI18nInitialized) {
            i18nPackageInit(I18nEnvironment.Browser).then(() => {
                // Force refresh.
                setIsI18nInitialized(true);
            }).catch((e: unknown) => {
                console.error(e);
                alert(e);
            });
        }
    }, [isI18nInitialized]);

    return <>{isI18nInitialized ? properties.children : undefined}</>;
}
```

The component would then wrap the application as follows:

```typescript jsx
import { type ReactElement, StrictMode } from "react";
import { App } from "./App";
import { I18n } from "./I18n";

/**
 * Index.
 *
 * @returns
 * React element.
 */
export default function Index(): ReactElement {
    return <StrictMode>
        <I18n>
            <App />
        </I18n>
    </StrictMode>;
}
```

## Resources

The `resource` folder contains common resources (e.g., AIDC Toolkit icon) usable by all AIDC Toolkit packages.
