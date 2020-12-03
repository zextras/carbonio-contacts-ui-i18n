/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2020 Zextras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import faker from 'faker';
import { Contact } from '../types/contact';

export function populateContactSlice(parent: string, contactsNumber: number, id?: string): { [k: string]: Contact[]} {
	const contacts = [];
	for (let i = 0; i < contactsNumber; i += 1) {
		contacts.push({
			parent,
			id: id || faker.random.uuid(),
			address: {},
			company: faker.company.companyName(),
			department: faker.commerce.department(),
			email: {},
			firstName: faker.name.firstName(),
			middleName: '',
			lastName: faker.name.lastName(),
			nickName: faker.internet.userName(),
			image: '',
			jobTitle: '',
			notes: '',
			phone: {},
			nameSuffix: faker.name.suffix(),
			namePrefix: faker.name.prefix(),
			URL: {}
		});
	}
	return { [parent]: contacts };
}
