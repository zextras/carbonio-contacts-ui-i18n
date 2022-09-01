/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getConfig = async (a: JSON): Promise<any> =>
	fetch(`/service/admin/soap/GetConfigRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				GetConfigRequest: {
					_jsns: 'urn:zimbraAdmin',
					...a
				}
			}
		})
	});
