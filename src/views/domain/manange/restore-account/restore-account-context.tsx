/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

type RestoreAccountContext = {
	restoreAccountDetail: any;
	setRestoreAccountDetail: (arg: any) => void;
};
export const RestoreAccountContext = createContext({} as RestoreAccountContext);
