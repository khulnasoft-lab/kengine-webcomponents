import { registerFeature } from "../FeaturesRegistry.js";
import { setTheme } from "../config/Theme.js";
import { getCurrentZIndex } from "../util/PopupUtils.js";
import { CLDRData } from "../asset-registries/LocaleData.js";
import type { LegacyDateCalendarCustomizing } from "../features/LegacyDateFormats.js";

type OpenKENGINEPopup = {
	setInitialZIndex: (zIndex: number) => void,
	getNextZIndex: () => number,
};

type OpenKENGINECore = {
	attachInit: (callback: () => void) => void,
	ready: () => Promise<void>,
	attachThemeChanged: (callback: () => void) => void,
	getConfiguration: () => OpenKENGINECoreConfiguration,
};

type OpenKENGINECoreConfiguration = {
	getAnimationMode: () => string,
	getLanguage: () => string,
	getTheme: () => string,
	getThemeRoot: () => string,
	getRTL: () => string,
	getTimezone: () => string,
	getCalendarType: () => string,
	getLocale: () => string,
	getFormatSettings: () => {
		getLegacyDateCalendarCustomizing: () => LegacyDateCalendarCustomizing;
	}
};

type ControlBehavior = {
	getAnimationMode: () => string,
}

type Localization = {
	getLanguage: () => string,
	getLanguageTag: () => string,
	getRTL: () => string,
	getTimezone: () => string,
}

type LocaleData = {
	getInstance: (locale: string) => Locale,
}

type Theming = {
	getThemeRoot: () => string,
	getTheme: () => string,
	attachApplied: (callback: () => void) => void,
}

type Formatting = {
	getCalendarType: () => string,
	getLegacyDateCalendarCustomizing: () => LegacyDateCalendarCustomizing,
}

type CalendarUtils = {
	getWeekConfigurationValues: () => {
		firstDayOfWeek: number | undefined,
	},
}

type Locale = {
	getFirstDayOfWeek: () => number,
	_get: () => CLDRData,
};

class OpenKENGINESupport {
	static isAtLeastVersion116() {
		const version = window.sap.ui!.version as string;
		const parts = version.split(".");
		if (!parts || parts.length < 2) {
			return false;
		}
		return parseInt(parts[0]) > 1 || parseInt(parts[1]) >= 116;
	}

	static isOpenKENGINEDetected() {
		return typeof window.sap?.ui?.require === "function";
	}

	static init() {
		if (!OpenKENGINESupport.isOpenKENGINEDetected()) {
			return Promise.resolve();
		}

		return new Promise<void>(resolve => {
			window.sap.ui.require(["sap/ui/core/Core"], async (Core: OpenKENGINECore) => {
				const callback = () => {
					let deps: Array<string> = ["sap/ui/core/Popup", "sap/ui/core/LocaleData"];
					if (OpenKENGINESupport.isAtLeastVersion116()) { // for versions since 1.116.0 and onward, use the modular core
						deps = [
							...deps,
							"sap/base/i18n/Formatting",
							"sap/base/i18n/Localization",
							"sap/ui/core/ControlBehavior",
							"sap/ui/core/Theming",
							"sap/ui/core/date/CalendarUtils",
						];
					}
					window.sap.ui.require(deps, (Popup: OpenKENGINEPopup) => {
						Popup.setInitialZIndex(getCurrentZIndex());
						resolve();
					});
				};
				if (OpenKENGINESupport.isAtLeastVersion116()) {
					await Core.ready();
					callback();
				} else {
					Core.attachInit(callback);
				}
			});
		});
	}

	static getConfigurationSettingsObject() {
		if (!OpenKENGINESupport.isOpenKENGINEDetected()) {
			return {};
		}

		if (OpenKENGINESupport.isAtLeastVersion116()) {
			const ControlBehavior = window.sap.ui.require("sap/ui/core/ControlBehavior") as ControlBehavior;
			const Localization = window.sap.ui.require("sap/base/i18n/Localization") as Localization;
			const Theming = window.sap.ui.require("sap/ui/core/Theming") as Theming;
			const Formatting = window.sap.ui.require("sap/base/i18n/Formatting") as Formatting;
			const CalendarUtils = window.sap.ui.require("sap/ui/core/date/CalendarUtils") as CalendarUtils;

			return {
				animationMode: ControlBehavior.getAnimationMode(),
				language: Localization.getLanguage(),
				theme: Theming.getTheme(),
				themeRoot: Theming.getThemeRoot(),
				rtl: Localization.getRTL(),
				timezone: Localization.getTimezone(),
				calendarType: Formatting.getCalendarType(),
				formatSettings: {
					firstDayOfWeek: CalendarUtils.getWeekConfigurationValues().firstDayOfWeek,
					legacyDateCalendarCustomizing: Formatting.getLegacyDateCalendarCustomizing(),
				},
			};
		}

		const Core = window.sap.ui.require("sap/ui/core/Core") as OpenKENGINECore;
		const config = Core.getConfiguration();
		const LocaleData = window.sap.ui.require("sap/ui/core/LocaleData") as LocaleData;

		return {
			animationMode: config.getAnimationMode(),
			language: config.getLanguage(),
			theme: config.getTheme(),
			themeRoot: config.getThemeRoot(),
			rtl: config.getRTL(),
			timezone: config.getTimezone(),
			calendarType: config.getCalendarType(),
			formatSettings: {
				firstDayOfWeek: LocaleData ? LocaleData.getInstance(config.getLocale()).getFirstDayOfWeek() : undefined,
				legacyDateCalendarCustomizing: config.getFormatSettings().getLegacyDateCalendarCustomizing(),
			},
		};
	}

	static getLocaleDataObject() {
		if (!OpenKENGINESupport.isOpenKENGINEDetected()) {
			return;
		}

		const LocaleData = window.sap.ui.require("sap/ui/core/LocaleData") as LocaleData;

		if (OpenKENGINESupport.isAtLeastVersion116()) {
			const Localization = window.sap.ui.require("sap/base/i18n/Localization") as Localization;
			return LocaleData.getInstance(Localization.getLanguageTag())._get();
		}

		const Core = window.sap.ui.require("sap/ui/core/Core") as OpenKENGINECore;
		const config = Core.getConfiguration();
		return LocaleData.getInstance(config.getLocale())._get();
	}

	static _listenForThemeChange() {
		if (OpenKENGINESupport.isAtLeastVersion116()) {
			const Theming: Theming = window.sap.ui.require("sap/ui/core/Theming");
			Theming.attachApplied(() => {
				setTheme(Theming.getTheme());
			});
		} else {
			const Core = window.sap.ui.require("sap/ui/core/Core") as OpenKENGINECore;
			const config = Core.getConfiguration();
			Core.attachThemeChanged(() => {
				setTheme(config.getTheme());
			});
		}
	}

	static attachListeners() {
		if (!OpenKENGINESupport.isOpenKENGINEDetected()) {
			return;
		}

		OpenKENGINESupport._listenForThemeChange();
	}

	static cssVariablesLoaded() {
		if (!OpenKENGINESupport.isOpenKENGINEDetected()) {
			return;
		}

		const link = [...document.head.children].find(el => el.id === "sap-ui-theme-sap.ui.core") as HTMLLinkElement; // more reliable than querySelector early
		if (!link) {
			return false;
		}

		return !!link.href.match(/\/css(-|_)variables\.css/);
	}

	static getNextZIndex() {
		if (!OpenKENGINESupport.isOpenKENGINEDetected()) {
			return;
		}

		const Popup = window.sap.ui.require("sap/ui/core/Popup") as OpenKENGINEPopup;

		if (!Popup) {
			console.warn(`The OpenKENGINESupport feature hasn't been initialized properly. Make sure you import the "@kengine/webcomponents-base/dist/features/OpenKENGINESupport.js" module before all components' modules.`); // eslint-disable-line
		}

		return Popup.getNextZIndex();
	}

	static setInitialZIndex() {
		if (!OpenKENGINESupport.isOpenKENGINEDetected()) {
			return;
		}

		const Popup = window.sap.ui.require("sap/ui/core/Popup") as OpenKENGINEPopup;
		Popup.setInitialZIndex(getCurrentZIndex());
	}
}

registerFeature("OpenKENGINESupport", OpenKENGINESupport);

export default OpenKENGINESupport;
