/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getAllConfig = async (): Promise<any> =>
	fetch(`/service/admin/soap/GetAllConfigRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				GetAllConfigRequest: {
					_jsns: 'urn:zimbraAdmin'
				}
			}
		})
	});
