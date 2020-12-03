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

export function handleModifyContactRequest(req, res, ctxt) {
	const _attrs = reduce(
		req.body.Body.ModifyContactRequest.cn.a,
		(r, v) => {
			r[v.n] = v._content;
			return r;
		},
		{}
	);
	return res(
		ctxt.json(
			{
				Body: {
					ModifyContactResponse: {
						_jsns: 'urn:zimbraMail',
						cn: [
							{
								id: req.body.Body.ModifyContactRequest.cn.id,
								l: '7',
								meta: [{}],
								t: '',
								tn: '',
								_attrs
							}
						]
					}
				}
			},
		)
	);
}
