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
					email: faker.internet.email()
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
					cn: contacts
				}
			}
		})
	);
}
