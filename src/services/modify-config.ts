/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const modifyConfig = async (a: Array<any>): Promise<any> =>
	fetch(`/service/admin/soap/ModifyConfigRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				ModifyConfigRequest: {
					_jsns: 'urn:zimbraAdmin',
					a
				}
			}
		})
	});
