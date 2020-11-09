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
import { rest } from 'msw';
import { generateEmptySync, InitialSync } from './sync-response';
import { handleGetContactsRequest } from './handle-get-contacts-request';

const handlers = [
	rest.post('/service/soap/SyncRequest', (req, res, ctxt) => {
		if (!req.body.Body.SyncRequest.token) {
			return res(
				ctxt.json(
					InitialSync
				)
			);
		}
		switch (req.body.Body.SyncRequest.token) {
			case '0':
				return res(
					ctxt.json(
						generateEmptySync('1')
					)
				);
			default:
				return res(
					ctxt.json(
						generateEmptySync(req.body.Body.SyncRequest.token)
					)
				);
		}
	}),
	rest.post('/service/soap/GetContactsRequest', handleGetContactsRequest)
];

export default handlers;
