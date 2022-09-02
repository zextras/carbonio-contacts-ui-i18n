/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const accountListDirectory = async (
	attr: string,
	type: string,
	domainName: string | undefined,
	query: string,
	offset: number,
	limit: number
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		offset,
		limit,
		sortAscending: '1',
		applyCos: 'false',
		applyConfig: 'false',
		attrs: attr,
		types: type
	};
	if (domainName && domainName !== '') {
		request.domain = domainName;
	}
	if (query !== '') {
		request.query = query;
	}

	return soapFetch(`SearchDirectory`, {
		...request
	});
};

export const getMailboxQuota = async (id: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		mbox: {
			id
		}
	};
	return soapFetch(`GetMailbox`, {
		...request
	});
};
