/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useState } from 'react';
import { Container, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import RestoreAccountWizard from './restore-delete-account-wizard';
import { doRestoreDeleteAccount } from '../../../../services/restore-delete-account-service';

const RestoreDeleteAccount: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [showRestoreAccountWizard, setShowRestoreAccountWizard] = useState<boolean>(false);
	const restoreAccountRequest = useCallback(
		(
			name,
			id,
			createDate,
			status,
			copyAccount,
			dateTime,
			lastAvailableStatus,
			hsmApply,
			dataSource,
			notificationReceiver
		) => {
			const body: any = {
				srcAccountName: id,
				obeyHSM: hsmApply,
				restoreDatasources: dataSource
			};
			if (notificationReceiver !== '') {
				body.notificationMails = [notificationReceiver];
			}
			if (copyAccount !== '') {
				body.dstAccountName = copyAccount;
			}
			doRestoreDeleteAccount(body)
				.then((response) => response.json())
				.then((data) => {
					const error = data?.error?.details?.cause;
					if (error) {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: error,
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
				});
		},
		[createSnackbar]
	);

	return (
		<Container background="gray5" mainAlignment="flex-start">
			<Container
				orientation="column"
				background="gray5"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Container
					orientation="column"
					background="gray6"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
				>
					<RestoreAccountWizard
						setShowRestoreAccountWizard={setShowRestoreAccountWizard}
						restoreAccountRequest={restoreAccountRequest}
					/>
				</Container>
			</Container>
		</Container>
	);
};
export default RestoreDeleteAccount;
