/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const createGalSyncAccount = async (
	name: string,
	folder: string,
	domainName: string,
	server: string,
	account: Array<any>,
	type: string,
	a?: Array<any>
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		name,
		folder,
		domain: domainName,
		server,
		type,
		account
	};
	if (a) {
		request.a = a;
	}
	return soapFetch(`CreateGalSyncAccount`, {
		...request
	});
};
