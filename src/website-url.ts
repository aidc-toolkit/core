import { LocalAppDataStorage } from "./local-app-data-storage.js";
import { parseVersion } from "./parse-version.js";

/**
 * Default alpha URL (Vite development server URL) if no local resources found.
 */
const DEFAULT_ALPHA_URL = "http://localhost:5173";

/**
 * Configuration path, expected to be present in development but not necessarily in production.
 */
const CONFIGURATION_PATH = "config";

/**
 * Key to local resources, expected to be present in development but not necessarily in production.
 */
const LOCAL_RESOURCES_KEY = "resources.local";

/**
 * Local resources.
 */
interface LocalResources {
    alphaURL: string;
}

/**
 * Alpha URL. Reads from local application storage, path "config", key "resources.local", if present, otherwise defaults
 * to Vite development server URL.
 */
export const ALPHA_URL = LocalAppDataStorage.then(async LocalAppDataStorage =>
    new LocalAppDataStorage(CONFIGURATION_PATH).read(LOCAL_RESOURCES_KEY)
).then(resources =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Fallback works regardless of type.
    (resources as (LocalResources | undefined))?.alphaURL ?? DEFAULT_ALPHA_URL
);

/**
 * AIDC Toolkit website base URL.
 */
export const WEBSITE_BASE_URL = "https://aidc-toolkit.com";

/**
 * Determine the website URL based on the package version.
 *
 * @param version
 * Package version.
 *
 * @param includeVersionInProduction
 * If true, the version is included in the URL in production.
 *
 * @param alphaURL
 * URL if pre-release identifier is "alpha".
 *
 * @param nonAlphaRelativeURL
 * Non-alpha URL, relative to website base URL plus pre-release identifier (optional) and version.
 *
 * @returns
 * Fully-formed website URL based on the package version.
 */
export function websiteURL(version: string, includeVersionInProduction: boolean, alphaURL: string, nonAlphaRelativeURL?: string): string {
    const parsedVersion = parseVersion(version);
    const preReleaseIdentifier = parsedVersion.preReleaseIdentifier;

    let url: string;

    if (preReleaseIdentifier === "alpha") {
        // Alpha base URL is absolute.
        url = alphaURL;
    } else {
        const preReleaseIdentifierPath = preReleaseIdentifier !== undefined ? `/${preReleaseIdentifier}` : "";
        const versionPath = preReleaseIdentifier !== undefined || includeVersionInProduction ? `/v${parsedVersion.majorVersion}.${parsedVersion.minorVersion}` : "";
        const relativeURL = nonAlphaRelativeURL !== undefined && nonAlphaRelativeURL !== "" ? `/${nonAlphaRelativeURL}` : "";

        url = `${WEBSITE_BASE_URL}${preReleaseIdentifierPath}${versionPath}${relativeURL}`;
    }

    return url;
}
