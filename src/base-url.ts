import { LocalAppDataStorage } from "./local-app-data-storage.js";
import { parseVersion } from "./parse-version.js";

/**
 * Default alpha URL (Vite development URL) if no local resources file is found.
 */
const DEFAULT_ALPHA_BASE_URL = "http://localhost:5173";

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
    alphaBaseURL: string;
}

/**
 * Alpha base URL. Reads from local application storage, path "config", key "resources.local", if present, otherwise
 * defaults to the Vite server URL.
 */
export const ALPHA_BASE_URL = LocalAppDataStorage.then(async LocalAppDataStorage =>
    new LocalAppDataStorage(CONFIGURATION_PATH).read(LOCAL_RESOURCES_KEY)
).then(resources =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Fallback works regardless of type.
    (resources as (LocalResources | undefined))?.alphaBaseURL ?? DEFAULT_ALPHA_BASE_URL
);

/**
 * AIDC Toolkit base URL.
 */
export const AIDC_TOOLKIT_BASE_URL = "https://aidc-toolkit.com";

/**
 * Determine the base URL for the phase based on the package version.
 *
 * @param version
 * Package version.
 *
 * @param alphaBaseURL
 * Alpha base URL.
 *
 * @param nonAlphaRelativeURL
 * Non-alpha URL, relative to non-alpha base URL and optionally the pre-release identifier and version.
 *
 * @returns
 * Fully-formed base URL for the phase.
 */
export function baseURL(version: string, alphaBaseURL: string, nonAlphaRelativeURL?: string): string {
    const parsedVersion = parseVersion(version);
    const preReleaseIdentifier = parsedVersion.preReleaseIdentifier;

    let url: string;

    if (preReleaseIdentifier === "alpha") {
        // Alpha base URL is absolute.
        url = alphaBaseURL;
    } else {
        const relativeURL = nonAlphaRelativeURL !== undefined && nonAlphaRelativeURL !== "" ? `/${nonAlphaRelativeURL}` : "";

        if (preReleaseIdentifier !== undefined) {
            // Non-alpha base URL is relative to AIDC Toolkit base URL plus pre-release identifier and version.
            url = `${AIDC_TOOLKIT_BASE_URL}/${preReleaseIdentifier}/v${parsedVersion.majorVersion}.${parsedVersion.minorVersion}${relativeURL}`;
        } else {
            // Production base URL is relative to AIDC Toolkit base URL.
            url = `${AIDC_TOOLKIT_BASE_URL}${relativeURL}`;
        }
    }

    return url;
}
