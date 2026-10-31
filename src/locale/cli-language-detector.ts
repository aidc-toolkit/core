import type { LanguageDetectorModule } from "i18next";
import I18nextCLILanguageDetector from "i18next-cli-language-detector";

/**
 * Command-line interface language detector.
 */
// TODO Refactor when https://github.com/neet/i18next-cli-language-detector/issues/281 resolved.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Per above.
export const i18nCoreCLILanguageDetector = I18nextCLILanguageDetector as unknown as LanguageDetectorModule;
