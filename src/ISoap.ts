export type ISoapContactObj = {
	id: string;
	l: string;
	rev: number;
	_attrs: {
		jobTitle?: string;
		firstName?: string;
		lastName?: string;
		nameSuffix?: string;
		mobilePhone?: string;
		workPhone?: string;
		otherPhone?: string;
		department?: string;
		email?: string;
		notes?: string;
		company?: string;
		otherStreet?: string;
		otherPostalCode?: string;
		otherCity?: string;
		otherState?: string;
		otherCountry?: string;
		image?: {
			part: string;
			ct: string;
			s: number;
			filename: string;
		};
		fullName?: string;
	};
};
