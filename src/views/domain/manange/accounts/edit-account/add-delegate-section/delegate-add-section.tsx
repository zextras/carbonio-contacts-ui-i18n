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
import { Trans, useTranslation } from 'react-i18next';
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

const DelegateAddSection: FC = () => {
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
	const { accountDetail, deligateDetail, setDeligateDetail } = conext;

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

	return (
		<>
			<Container
				mainAlignment="flex-start"
				padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{t('account_details.abstract', `Abstract`)}
						</Text>
					</Row>
				</Row>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{
								<Trans
									i18nKey="account_details.deligate_abstract_text"
									defaults="The user {{granteeEmail}} will be able to send mails {{right}} {{targetEmail}}"
									components={{
										granteeEmail: deligateDetail?.granteeEmail,
										targetEmail: accountDetail?.zimbraMailDeliveryAddress,
										right:
											deligateDetail?.right === 'sendAs'
												? t('account_details.as', 'as')
												: t('account_details.on_behalf_of', 'on behalf of')
									}}
								/>
							}
						</Text>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Input
							label={t('account_details.delegate_rights', 'Delegate Rights')}
							backgroundColor="gray5"
							defaultValue={
								DELEGETES_RIGHTS_TYPE.find(
									(item: any) => item.value === deligateDetail?.delegeteRights
								)?.label
							}
							value={
								DELEGETES_RIGHTS_TYPE.find(
									(item: any) => item.value === deligateDetail?.delegeteRights
								)?.label
							}
							// onChange={changeAccDetail}
							inputName="displayName"
							name="descriptiveName"
						/>
					</Row>
				</Row>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Input
							label={t('account_details.sendin_options', 'Sending Options')}
							backgroundColor="gray5"
							defaultValue={t(
								'account_details.send_recepients_see_the_mail',
								'Send {{right}} (recepients will see the mail from {{targetEmail}})',
								{
									granteeEmail: deligateDetail?.granteeEmail,
									targetEmail: accountDetail?.zimbraMailDeliveryAddress,
									right:
										deligateDetail?.right === 'sendAs'
											? t('account_details.as', 'as')
											: t('account_details.on_behalf_of', 'on behalf of')
								}
							)}
							value={t(
								'account_details.send_recepients_see_the_mail',
								'Send {{right}} (recepients will see the mail from {{targetEmail}})',
								{
									granteeEmail: deligateDetail?.granteeEmail,
									targetEmail: accountDetail?.zimbraMailDeliveryAddress,
									right:
										deligateDetail?.right === 'sendAs'
											? t('account_details.as', 'as')
											: t('account_details.on_behalf_of', 'on behalf of')
								}
							)}
							// onChange={changeAccDetail}
							inputName="displayName"
							name="descriptiveName"
						/>
						{/* <Text size="small" color="gray0">
							<Trans
								i18nKey="account_details.send_recepients_see_the_mail"
								defaults="Send {{right}} (recepients will see the mail from {{targetEmail}})"
								components={{
									granteeEmail: deligateDetail?.granteeEmail,
									targetEmail: accountDetail?.zimbraMailDeliveryAddress,
									right:
										deligateDetail?.right === 'sendAs'
											? t('account_details.as', 'as')
											: t('account_details.on_behalf_of', 'on behalf of')
								}}
							/>
						</Text> */}
					</Row>
				</Row>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Input
							label={t('account_details.where_do_we_store_it', 'Where do we store it?')}
							backgroundColor="gray5"
							defaultValue={
								DELEGETES_WHERE_TO_STORE.find(
									(item: any) => item.value === deligateDetail?.whereToStore
								)?.label
							}
							value={
								DELEGETES_WHERE_TO_STORE.find(
									(item: any) => item.value === deligateDetail?.whereToStore
								)?.label
							}
							// onChange={changeAccDetail}
							inputName="displayName"
							name="descriptiveName"
						/>
					</Row>
				</Row>
			</Container>
		</>
	);
};

export default DelegateAddSection;
