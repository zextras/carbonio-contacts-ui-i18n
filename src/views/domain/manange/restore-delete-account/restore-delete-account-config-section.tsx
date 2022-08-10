/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Text,
	Input,
	Row,
	Switch,
	Icon,
	Table,
	Padding
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ListRow from '../../../list/list-row';
import { searchDirectory } from '../../../../services/search-directory-service';
import { isValidLdapQuery } from '../../../utility/utils';

const RestoreDeleteAccountConfigSection: FC<any> = () => {
	const { t } = useTranslation();
	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="100%"
			padding={{ top: 'extralarge' }}
		>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container height="fit" crossAlignment="flex-start" background="gray6">
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="fill"
						padding={{ bottom: 'large' }}
					>
						<ListRow>
							<Input
								backgroundColor="gray5"
								label={t(
									'label.account_data_copy_to_account',
									'The account data will be copied to this account'
								)}
							/>
						</ListRow>
						<ListRow>
							<Switch
								value
								label={t('label.use_last_available_status', 'Use last available status')}
							/>
						</ListRow>
						<ListRow>
							<Container>xx</Container>
							<Container>yyyy</Container>
						</ListRow>
						<ListRow>
							<Switch value label={t('label.hsm_apply', 'HSM Apply')} />
						</ListRow>
						<ListRow>
							<Switch value label={t('label.restore_data_source', 'Restore Data Source')} />
						</ListRow>
						<ListRow>
							<Switch value label={t('label.email_notification', 'E-mail Notifications')} />
						</ListRow>
						<ListRow>
							<Input
								backgroundColor="gray5"
								label={t('label.who_needs_receive_this_email', 'Who needs to receive this email?')}
							/>
						</ListRow>
					</Row>
				</Container>
			</Row>
		</Container>
	);
};
export default RestoreDeleteAccountConfigSection;
