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
import { reduce } from 'lodash';
import faker from 'faker';

export function handleGetContactsRequest(req, res, ctxt) {
	const contacts = reduce(
		req.body.Body.GetContactsRequest.cn,
		(acc, { id }) => {
			acc.push({
				l: '7',
				id,
				_attrs: {
					company: faker.company.companyName(),
					firstName: faker.name.firstName(),
					lastName: faker.name.lastName(),
					workCity: faker.address.city(),
					workCountry: faker.address.country(),
					workPostalCode: faker.address.zipCode(),
					workState: faker.address.state(),
					workStreet: faker.address.streetName()
				}
			});
			return acc;
		},
		[]
	);
	return res(
		ctxt.json({
			Body: {
				GetContactsResponse: {
					cn: contacts,
					_sns: 'urn:zimbraMail'
				}
			}
		})
	);
}
