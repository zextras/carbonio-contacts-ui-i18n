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

function searchContactResponse() {
	return {
		Body: {
			SearchResponse: {
				cn: [
					{
						d: 1604674171000,
						fileAsStr: 'fsfas',
						rev: 5700,
						sf: 'fsfas0000002821',
						id: '2821',
						l: '7',
						_attrs: {
							email: faker.internet.email(),
							company: faker.company.companyName(),
							firstName: faker.name.firstName(),
							lastName: faker.name.lastName(),
							workCity: faker.address.city(),
							workCountry: faker.address.country(),
							workPostalCode: faker.address.zipCode(),
							workState: faker.address.state(),
							workStreet: faker.address.streetName()
						}
					}
				],
				more: false,
				offset: 0,
				sortBy: 'nameAsc'
			}
		}
	};
}
export function handleSearchRequest(req, res, ctxt) {
	switch (req.body.Body.SearchRequest.types) {
		case 'contact':
			return res(
				ctxt.json(
					searchContactResponse()
				)
			);
		default:
			return res(
				ctxt.json(
					searchContactResponse()
				)
			);
	}
}
