/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2020 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import { useMemo } from 'react';
import { trim } from 'lodash';

export const useDisplayName = (contact) => useMemo(
	() => {
		if (contact) {
			if (contact.firstName || contact.lastName) {
				return trim(`${
					contact.namePrefix || ''
				} ${
					contact.firstName || ''
				} ${
					contact.middleName || ''
				} ${
					contact.lastName || ''
				} ${
					contact.nameSuffix || ''
				}`);
			}
			if (contact.email.length > 0) return `<No Name> ${contact.email[0].mail}`;
		}
		return '<No Data>';
	},
	[contact]
);
