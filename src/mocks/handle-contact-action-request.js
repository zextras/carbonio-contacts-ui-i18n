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

export function handleContactActionRequest(req, res, ctxt) {
	return res(
		ctxt.json({
			Body: {
				ContactActionResponse: {
					action: {
						id: req.body.Body.ContactActionRequest.action.id,
						op: req.body.Body.ContactActionRequest.action.op,
						// l: req.body.Body.ContactActionRequest.action.l
					},
					_jsns: 'urn:zimbraMail'
				}
			}
		})
	);
}
