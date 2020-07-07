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

export const useDisplayName = (contact) => {
	return useMemo(
		() => {
			if (contact) {
				if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`;
				if (contact.lastName) return contact.lastName;
				if (contact.firstName) return contact.firstName;
				if (contact.mail.length > 0) return contact.mail[0].mail;
			}
			return 'no data';
		},
		[contact]
	);
};
