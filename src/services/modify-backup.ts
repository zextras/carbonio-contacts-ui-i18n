/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const modifyBackupRequest = async (modifiedData: any): Promise<any> => {
	// const attrList: { attribute: string; value: string }[] = [];
	const request: any = {};
	Object.keys(modifiedData).forEach((ele: any): void => {
		request[ele] = {
			value: modifiedData[ele],
			configType: 'global'
		};
	});
	return fetch(`/service/extension/zextras_admin/core/attribute/set`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(request)
	});
};
