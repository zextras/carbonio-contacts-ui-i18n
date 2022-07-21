/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const renameAccountRequest = async (id: string, newName: string): Promise<any> => {
	const request: any = {
		RenameAccountRequest: {
			_jsns: 'urn:zimbraAdmin',
			id,
			newName
		}
	};

	return fetch(`/service/admin/soap/RenameAccountRequest`, {
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
