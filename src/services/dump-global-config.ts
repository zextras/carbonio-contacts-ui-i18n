/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const dumpGlobalConfig = async (serverName: string): Promise<any> => {
	const request: any = {
		zextras: {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxConfig',
			action: 'dump_global_config',
			targetServers: serverName
		}
	};

	return fetch(`/service/admin/soap/zextras`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Header: {
				context: {
					_jsns: 'urn:zimbra',
					session: {}
				}
			},
			Body: request
		})
	});
};
