/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Button,
	Text,
	SnackbarManagerContext,
	Input,
	Select,
	Padding,
	Divider
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import RestoreAccountWizard from './restore-account-wizard';

const RestoreAccount: FC = () => {
	const [t] = useTranslation();
	const [showRestoreAccountWizard, setShowRestoreAccountWizard] = useState<boolean>(false);
	const restoreAccountRequest = useCallback(() => {
		console.log('xxxx');
	}, []);
	return (
		<Container background="gray5" mainAlignment="flex-start">
			<Container
				orientation="column"
				background="gray5"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				{/* <Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container
						background="gray6"
						orientation="vertical"
						mainAlignment="space-around"
						height="56px"
					>
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="100%"
								crossAlignment="flex-start"
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.restore_account', 'Restore Account')}
								</Text>
							</Row>
						</Row>
					</Container>
				</Row> */}
				<Container
					orientation="column"
					background="gray6"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="calc(100% - 70px)"
					style={{ overflow: 'auto' }}
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
export default RestoreAccount;
