import { parseVersion } from "./parse-version.js";

const NON_ALPHA_BASE_URL = "https://aidc-toolkit.com";

/**
 * Get the URL for the phase as determined by the package version.
 *
 * @param version
 * Package version.
 *
 * @param alphaURL
 * Alpha URL.
 *
 * @param nonAlphaRelativeURL
 * Non-alpha URL, relative to non-alpha base URL plus optionally the pre-release identifier and version.
 *
 * @returns
 * Fully-formed URL for the phase.
 */
export function phaseURL(version: string, alphaURL: string, nonAlphaRelativeURL?: string): string {
    const parsedVersion = parseVersion(version);
    const preReleaseIdentifier = parsedVersion.preReleaseIdentifier;

    let url: string;

    if (preReleaseIdentifier === "alpha") {
        // Alpha URL is absolute.
        url = alphaURL;
    } else {
        const relativeURL = nonAlphaRelativeURL !== undefined && nonAlphaRelativeURL !== "" ? `/${nonAlphaRelativeURL}` : "";

        if (preReleaseIdentifier !== undefined) {
            // Non-alpha URL is relative to non-alpha base URL plus pre-release identifier and version.
            url = `${NON_ALPHA_BASE_URL}/${preReleaseIdentifier}/v${parsedVersion.majorVersion}.${parsedVersion.minorVersion}${relativeURL}`;
        } else {
            // Production URL is relative to non-alpha base URL.
            url = `${NON_ALPHA_BASE_URL}${relativeURL}`;
        }
    }

    return url;
}
