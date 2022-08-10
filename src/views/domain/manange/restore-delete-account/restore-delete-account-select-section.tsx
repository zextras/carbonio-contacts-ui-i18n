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
	Padding,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ListRow from '../../../list/list-row';
import { searchDirectory } from '../../../../services/search-directory-service';
import { isValidLdapQuery } from '../../../utility/utils';
import Paginig from '../../../components/paging';
import { useDomainStore } from '../../../../store/domain/store';

const RestoreDeleteAccountSelectSection: FC<any> = () => {
	const { t } = useTranslation();
	const [accountRows, setAccountRows] = useState<Array<any>>([]);
	const [selectedAccountRows, setSelectedAccountRows] = useState<Array<any>>([]);
	const [accountOffset, setAccountOffset] = useState<number>(0);
	const domainName = useDomainStore((state) => state.domain?.name);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const accountHeader: any[] = useMemo(
		() => [
			{
				id: 'account',
				label: t('label.account', 'Account'),
				width: '30%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '20%',
				bold: true
			},
			{
				id: 'creat_date',
				label: t('label.creation_date', 'Creation Date'),
				width: '20%',
				bold: true
			},
			{
				id: 'delete_date',
				label: t('label.deletion_date', 'Deletion Date'),
				width: '20%',
				bold: true
			}
		],
		[t]
	);

	const getBackupAccounts = useCallback(() => {
		fetch(
			`/service/extension/zextras_admin/backup/getBackupAccounts?page=0&pageSize=5&domains=${domainName}&targetServers=all_server`,
			{
				method: 'GET',
				credentials: 'include'
			}
		)
			.then((response) => response.json())
			.then((data) => {
				console.log('$$$$$', data);
				const error = data?.all_server?.error?.message;
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
	}, [domainName, createSnackbar]);
	useEffect(() => {
		getBackupAccounts();
	}, [accountOffset, getBackupAccounts]);
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
						<Container>
							<Input
								backgroundColor="gray5"
								label={t('label.filter_account_list', 'Filter Account List')}
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="primary" />}
							/>
						</Container>
						<ListRow>
							<Table
								rows={accountRows}
								headers={accountHeader}
								showCheckbox={false}
								selectedRows={selectedAccountRows}
								onSelectionChange={(selected: any): void => setSelectedAccountRows(selected)}
							/>
						</ListRow>
						<ListRow>
							<Paginig totalItem={1} pageSize={10} setOffset={setAccountOffset} />
						</ListRow>
					</Row>
				</Container>
			</Row>
		</Container>
	);
};
export default RestoreDeleteAccountSelectSection;
