type HoursConfiguration = {
	minHour: number,
	maxHour: number
	isTwelveHoursFormat: boolean,
}

type HourType = "hour0_23" | "hour1_24" | "hour0_11" | "hour1_12";

const generateTimeItemsArray = (x: number, step = 1) => {
	const array: Array<string> = [];
	for (let i = 0; i < x; i++) {
		if (i % step === 0) {
			let tempString = i.toString();
			if (tempString.length === 1) {
				tempString = `0${tempString}`;
			}

			array.push(tempString);
		}
	}

	return array;
};

const getHours = (config: HoursConfiguration, max: number | undefined) => {
	let hoursValueArray = [];

	if (config.isTwelveHoursFormat) {
		hoursValueArray = generateTimeItemsArray(max || 12, 1);
	} else {
		hoursValueArray = generateTimeItemsArray(max || 24, 1);
	}

	if (config.minHour === 1) {
		for (let i = 0; i < hoursValueArray.length; i++) {
			const tempValue = parseInt(hoursValueArray[i]) + 1;

			if (tempValue.toString().length === 1) {
				hoursValueArray[i] = `0${tempValue.toString()}`;
			} else {
				hoursValueArray[i] = tempValue.toString();
			}
		}
	}

	return hoursValueArray;
};

const getMinutes = (max: number | undefined, step: number) => {
	return generateTimeItemsArray(max || 60, step);
};

const getSeconds = (max: number | undefined, step: number) => {
	return generateTimeItemsArray(max || 60, step);
};

const getHoursConfigByFormat = (type: HourType) => {
	const config: HoursConfiguration = {
		minHour: 0,
		maxHour: 0,
		isTwelveHoursFormat: false,
	};

	if (type === "hour0_23") {
		config.minHour = 0;
		config.maxHour = 23;
		config.isTwelveHoursFormat = false;
	} else if (type === "hour1_24") {
		config.minHour = 1;
		config.maxHour = 24;
		config.isTwelveHoursFormat = false;
	} else if (type === "hour0_11") {
		config.minHour = 0;
		config.maxHour = 11;
		config.isTwelveHoursFormat = true;
	} else if (type === "hour1_12") {
		config.minHour = 1;
		config.maxHour = 12;
		config.isTwelveHoursFormat = true;
	}

	return config;
};

const getTimeControlsByFormat = (formatArray: Array<{ type: string }>, hoursConfig: HoursConfiguration) => {
	const timeControls = [false, false, false, false]; // hours, minutes, seconds and am/pm

	for (let i = 0; i < formatArray.length; i++) {
		if (hoursConfig.maxHour !== 0) {
			timeControls[0] = true;
		}
		if (hoursConfig.maxHour !== 0 && hoursConfig.isTwelveHoursFormat) {
			timeControls[0] = true;
		}
		if (formatArray[i].type === "minute") {
			timeControls[1] = true;
		}
		if (formatArray[i].type === "second") {
			timeControls[2] = true;
		}
		if (formatArray[i].type === "amPmMarker") {
			timeControls[3] = true;
		}
	}

	return timeControls;
};

export {
	getHours,
	getMinutes,
	getSeconds,
	getHoursConfigByFormat,
	getTimeControlsByFormat,
};

export type {
	HourType,
	HoursConfiguration,
};
