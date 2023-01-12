/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, useEffect, useCallback } from 'react';
import {
	Container,
	Input,
	Row,
	Select,
	Text,
	Icon,
	Dropdown,
	Divider,
	Radio,
	RadioGroup
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { useDomainStore } from '../../../../../../store/domain/store';
import { accountListDirectory } from '../../../../../../services/account-list-directory-service';

import { delegateRightsType, delegateWhereToStore } from '../../../../../utility/utils';
import { AccountContext } from '../../account-context';

const SelectItem = styled(Row)``;
const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

import { MAX_DELEGATE_ACCOUNT_DISPLAY } from '../../../../../../constants';

const DelegateSetRightsSection: FC = () => {
	const domainName = useDomainStore((state) => state.domain?.name);

	const [t] = useTranslation();
	const [delegateAccountList, setDelegateAccountList] = useState<any[]>([
		{ id: 'a1', label: 'aa' },
		{ id: 'a2', label: 'bb' }
	]);
	const [searchDelegateAccountName, setSearchDelegateAccountName] = useState('');
	const [sendingOption, setSendingOption] = useState('');
	const [isDelegateAccountListExpand, setIsDelegateAccountListExpand] = useState(false);
	const [isDelegateSelect, setIsDelegateSelect] = useState(false);
	const DELEGETES_RIGHTS_TYPE = useMemo(() => delegateRightsType(t), [t]);
	const DELEGETES_WHERE_TO_STORE = useMemo(() => delegateWhereToStore(t), [t]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(20);
	const conext = useContext(AccountContext);
	const { deligateDetail, setDeligateDetail } = conext;

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAccountList = useCallback(
		debounce((searchText) => {
			if (searchText) {
				setSearchQuery(
					`(|(mail=*${searchText}*)(cn=*${searchText}*)(sn=*${searchText}*)(gn=*${searchText}*)(displayName=*${searchText}*)(zimbraMailDeliveryAddress=*${searchText}*))`
				);
			} else {
				setSearchQuery('');
			}
		}, 700),
		[debounce]
	);

	useEffect(() => {
		searchAccountList(searchDelegateAccountName);
	}, [searchAccountList, searchDelegateAccountName]);

	const selectedDelegateAccount = (v: any): void => {
		console.log('selectedDelegateAccount =>', v);
		setIsDelegateSelect(true);
		setSearchDelegateAccountName(v.name);
	};

	useEffect(() => {
		console.log('delegateAccountList', delegateAccountList);
	}, [delegateAccountList]);

	const getAccountList = useCallback((): void => {
		const type = 'accounts';
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
		accountListDirectory(attrs, type, domainName, searchQuery, offset, limit).then((data) => {
			const accountListResponse: any = data?.account || [];

			if (accountListResponse && Array.isArray(accountListResponse)) {
				console.log('accountListResponse', accountListResponse);
				const accountListArr: any[] = [];
				data?.account.map((delegateAccount: any) =>
					accountListArr.push({
						id: delegateAccount.id,
						label: delegateAccount.name,
						customComponent: (
							<SelectItem
								top="9px"
								right="large"
								bottom="9px"
								left="large"
								style={{
									fontFamily: 'roboto',
									display: 'block',
									textAlign: 'left',
									height: 'inherit',
									padding: '3px',
									width: 'inherit'
								}}
								onClick={(): void => {
									selectedDelegateAccount(delegateAccount);
								}}
							>
								{delegateAccount?.name}
							</SelectItem>
						)
					})
				);
				setDelegateAccountList(accountListArr);
			}
		});
	}, [domainName, searchQuery, offset, limit]);

	useEffect(() => {
		getAccountList();
	}, [getAccountList, searchQuery]);

	const onWhoDelegateChange = (v: any): any => {
		setDeligateDetail((prev: any) => ({ ...prev, delegeteRights: v }));
	};

	const onWhereToStoreChange = (v: any): any => {
		setDeligateDetail((prev: any) => ({ ...prev, whereToStore: v }));
	};
	return (
		<>
			<Container
				mainAlignment="flex-start"
				padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{t('account_details.delegate_rights', `Delegate Rights`)}
						</Text>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<Select
							background="gray5"
							label={t('account_details.who_will_be_delegates', 'Who will be the delegates?')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={DELEGETES_RIGHTS_TYPE.find(
								(item: any) => item.value === deligateDetail?.delegeteRights
							)}
							onChange={onWhoDelegateChange}
							items={DELEGETES_RIGHTS_TYPE}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{t('account_details.sending_options', `Sending Options`)}
						</Text>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<RadioGroup
							value={sendingOption || deligateDetail?.right}
							onChange={(newValue: string): void => {
								setSendingOption(newValue);
								setDeligateDetail((prev: any) => ({ ...prev, right: newValue }));
							}}
						>
							<Radio
								label={t(
									'account_details.send_as_recepients',
									`Send as (recepients will see the sender)`
								)}
								value="sendAs"
							/>
							<Radio
								label={t(
									'account_details.send_as_behalf',
									`Send on Behalf of (recepients will see the sender)`
								)}
								value="sendOnBehalfOf"
							/>
						</RadioGroup>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{t('account_details.where_to_store_sent_emails', `Where to store sent emails?`)}
						</Text>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<Select
							background="gray5"
							label={t('account_details.where_to_store_sent_emails', 'Where to store sent emails?')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={DELEGETES_WHERE_TO_STORE.find(
								(item: any) => item.value === deligateDetail?.whereToStore
							)}
							onChange={onWhereToStoreChange}
							items={DELEGETES_WHERE_TO_STORE}
						/>
					</Row>
				</Row>
			</Container>
		</>
	);
};

export default DelegateSetRightsSection;
