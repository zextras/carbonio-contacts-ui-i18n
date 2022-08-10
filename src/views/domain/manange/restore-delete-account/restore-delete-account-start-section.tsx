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

const RestoreDeleteAccountStartSection: FC<any> = () => {
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
							<Container>
								<Input backgroundColor="gray5" label={t('label.account', 'Account')} />
							</Container>
							<Container>
								<Input
									backgroundColor="gray5"
									label={t('label.destination_account', 'Destination Account')}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container>
								<Input
									backgroundColor="gray5"
									label={t('label.use_last_available_status', 'Use last available status')}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container>
								<Input backgroundColor="gray5" label={t('label.date_and_hour', 'Date & Hour')} />
							</Container>
						</ListRow>
						<ListRow>
							<Container>
								<Input backgroundColor="gray5" label={t('label.hsm_apply', 'HSM Apply')} />
							</Container>
							<Container>
								<Input
									backgroundColor="gray5"
									label={t('label.restore_data_source', 'Restore Data Source')}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container>
								<Input
									backgroundColor="gray5"
									label={t('label.mail_notifications', 'Email Notifications')}
								/>
							</Container>
						</ListRow>
					</Row>
				</Container>
			</Row>
		</Container>
	);
};
export default RestoreDeleteAccountStartSection;
