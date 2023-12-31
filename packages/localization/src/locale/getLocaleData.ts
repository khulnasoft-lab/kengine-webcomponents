import { fetchCldr } from "@kengine/webcomponents-base/dist/asset-registries/LocaleData.js";
import getLocale from "@kengine/webcomponents-base/dist/locale/getLocale.js";
import type LocaleT from "sap/ui/core/Locale";
import LocaleData from "../LocaleData.js";

const instances = new Map<string, LocaleData>();

/**
 * Fetches and returns а LocaleData object for the required locale
 * For more information on this object's API, please see:
 * https://sdk.kengine.org/api/sap.ui.core.LocaleData
 *
 * @param { string } lang - if left empty, will use the configured/current locale
 * @returns { Promise<LocaleData> }
 */
const getLocaleData = async (lang: string): Promise<LocaleData> => {
	const locale = getLocale(lang);
	const localeLang = locale.getLanguage();

	if (!instances.has(localeLang)) {
		await fetchCldr(locale.getLanguage(), locale.getRegion(), locale.getScript());
		instances.set(localeLang, new LocaleData(locale as unknown as LocaleT));
	}

	return instances.get(localeLang)!;
};

export default getLocaleData;
