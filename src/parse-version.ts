import { i18nextCoreT } from "./locale/i18n.js";

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
    readonly preReleaseDateTime: Date | undefined;
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
    const parsedVersionGroups = /^(?<majorVersion>\d+)\.(?<minorVersion>\d+)\.(?<patchVersion>\d+)(?:-(?<preReleaseIdentifier>alpha|beta)(?:\.(?<preReleaseDateTime>\d{12}))?)?$/u.exec(version)?.groups;

    if (parsedVersionGroups === undefined) {
        throw new RangeError(i18nextCoreT("ParseVersion.invalidVersionString", {
            version
        }));
    }

    let preReleaseDateTime;

    const preReleaseDateTimeString = parsedVersionGroups["preReleaseDateTime"];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- preReleaseDateTime is optional.
    if (preReleaseDateTimeString !== undefined) {
        const preReleaseDateTimeString = parsedVersionGroups["preReleaseDateTime"];

        preReleaseDateTime = new Date(`${preReleaseDateTimeString.substring(0, 4)}-${preReleaseDateTimeString.substring(4, 6)}-${preReleaseDateTimeString.substring(6, 8)}T${preReleaseDateTimeString.substring(8, 10)}:${preReleaseDateTimeString.substring(10, 12)}Z`);
    } else {
        preReleaseDateTime = undefined;
    }

    let preReleaseDateTime;

    const preReleaseDateTimeString = parsedVersionGroups["preReleaseDateTime"];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- preReleaseDateTime is optional.
    if (preReleaseDateTimeString !== undefined) {
        const preReleaseDateTimeString = parsedVersionGroups["preReleaseDateTime"];

        preReleaseDateTime = new Date(`${preReleaseDateTimeString.substring(0, 4)}-${preReleaseDateTimeString.substring(4, 6)}-${preReleaseDateTimeString.substring(6, 8)}T${preReleaseDateTimeString.substring(8, 10)}:${preReleaseDateTimeString.substring(10, 12)}Z`);
    } else {
        preReleaseDateTime = undefined;
    }

    return {
        majorVersion: Number(parsedVersionGroups["majorVersion"]),
        minorVersion: Number(parsedVersionGroups["minorVersion"]),
        patchVersion: Number(parsedVersionGroups["patchVersion"]),
        preReleaseIdentifier: parsedVersionGroups["preReleaseIdentifier"],
        preReleaseDateTime
    };
}
