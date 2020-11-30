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

function searchContactResponse(id) {
	switch (id) {
		case '3':
			return {
				Body: {
					SearchResponse: {
						more: false,
						offset: 0,
						sortBy: 'none'
					}
				}
			};
		default:
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
								l: id,
								_attrs: {
									company: faker.company.companyName(),
									firstName: faker.name.firstName(),
									lastName: faker.name.lastName()
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
}
export function handleSearchRequest(req, res, ctxt) {
	switch (req.body.Body.SearchRequest.query._content) {
		case 'inid:"7"':
			return res(
				ctxt.json(
					searchContactResponse('7')
				)
			);
		case 'inid:"3"':
			return res(
				ctxt.json(
					searchContactResponse('3')
				)
			);
		default:
			return res(
				ctxt.json(
					searchContactResponse('7')
				)
			);
	}
}
