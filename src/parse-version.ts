/**
 * Parsed version.
 */
export interface ParsedVersion {
    /**
     * Major version.
     */
    readonly majorVersion: number;

    /**
     * Minor version.
     */
    readonly minorVersion: number;

    /**
     * Patch version.
     */
    readonly patchVersion: number;

    /**
     * Pre-release identifier.
     */
    readonly preReleaseIdentifier: string | undefined;

    /**
     * Date/time included with pre-release identifier.
     */
    readonly dateTime: string | undefined;
}

/**
 * Parse version.
 *
 * @param version
 * Version, typically from package.json.
 *
 * @returns
 * Parsed version.
 */
export function parseVersion(version: string): ParsedVersion {
    const parsedVersionGroups = /^(?<majorVersion>\d+)\.(?<minorVersion>\d+)\.(?<patchVersion>\d+)(?:-(?<preReleaseIdentifier>alpha|beta)(?:\.(?<dateTime>\d{12}))?)?$/u.exec(version)?.groups;

    if (parsedVersionGroups === undefined) {
        throw new Error(`Invalid package version ${version}`);
    }

    return {
        majorVersion: Number(parsedVersionGroups["majorVersion"]),
        minorVersion: Number(parsedVersionGroups["minorVersion"]),
        patchVersion: Number(parsedVersionGroups["patchVersion"]),
        preReleaseIdentifier: parsedVersionGroups["preReleaseIdentifier"],
        dateTime: parsedVersionGroups["dateTime"]
    };
}
