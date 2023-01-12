/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	FC,
	useMemo,
	useContext,
	useState,
	ReactElement,
	useEffect,
	useCallback
} from 'react';
import {
	Container,
	Padding,
	Row,
	Button,
	Text,
	useSnackbar,
	Table,
	Divider,
	Select,
	Dropdown,
	Input,
	Icon
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { find } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from '../account-context';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import logo from '../../../../../assets/gardian.svg';
import { Section } from '../../../../app/component/section';
import { fetchSoap } from '../../../../../services/fetch-soap';

import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';

import { delegateType } from '../../../../utility/utils';
import DelegateSelectModeSection from './add-delegate-section/delegate-selectmode-section';
import DelegateSetRightsSection from './add-delegate-section/delegate-setright-section';
import DelegateAddSection from './add-delegate-section/delegate-add-section';

const SelectItem = styled(Row)``;

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const StaticCodesContainer = styled(Row)`
	max-width: 350px;
`;
const StaticCodesWrapper = styled.div`
	position: relative;
	width: 100%;
	column-count: 2;
	padding: 16px;
`;
const StaticCode = styled.label`
	display: block;
	font-family: monospace;
	padding: 4.95px 0;
`;

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('account_details.add_user_on_delegates_list', 'Add user on Delegates List')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

const EditAccountDelegatesSection: FC = () => {
	const conext = useContext(AccountContext);
	const { identitiesList, accountDetail, getIdentitiesList, deligateDetail, setDeligateDetail } =
		conext;
	console.log('accountDetail===>', accountDetail);
	const domainName = useDomainStore((state) => state.domain?.name);
	const [showCreateIdentity, setShowCreateIdentity] = useState<boolean>(false);
	const [qrData, setQrData] = useState('');
	const [sendEmailTo, setSendEmailTo] = useState('');
	const [pinCodes, setPinCodes] = useState<any>([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const [identityListItem, setIdentityListItem] = useState<any>([]);

	useEffect(() => {
		const identitiesArr: any = [];
		console.log('identitiesList ==>', identitiesList);
		identitiesList.map((item: any): any => {
			identitiesArr.push({
				id: item?.granteeID,
				columns: [
					<Text size="medium" key={item?.granteeID} color="#414141">
						{item?.granteeName || ' '}
					</Text>,
					<Text size="medium" key={item?.granteeID} color="#414141">
						{item?.granteeType === 'usr' ? 'Single User' : 'Group'}
					</Text>,
					<Text size="medium" key={item?.granteeID} color="#414141">
						{item?.sendAs === 'true' ? 'Send As' : ''}
						{item?.sendOnBehalfOf === 'true' ? 'Send on Behalf Of' : ''}
					</Text>,
					<Text size="medium" key={item?.granteeID} color="#414141">
						{'Read, Send, Write'}
					</Text>,
					<Text size="medium" key={item?.granteeID} color="#414141">
						{'Save it on the Delegated Account'}
					</Text>
				],
				item,
				clickable: true
			});
			return '';
		});
		setIdentityListItem(identitiesArr);
	}, [identitiesList]);

	const headers: any = useMemo(
		() => [
			{
				id: 'description',
				label: t('label.Accounts', 'Accounts'),
				width: '20%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.Type', 'Type'),
				width: '20%',
				bold: true
			},
			{
				id: 'failed',
				label: t('label.Rights', 'Rights'),
				width: '20%',
				bold: true
			},
			{
				id: 'creation-date',
				label: t('label.sending_options', 'Sending Options'),
				width: '20%',
				bold: true
			},
			{
				id: 'save-mails-to',
				label: t('label.save_mails_to', 'Save Mails to'),
				width: '20%',
				bold: true
			}
		],
		[t]
	);

	const handleCreateDelegate = (): void => {
		setDeligateDetail({});
		setShowCreateIdentity(true);
	};

	const handleCreateDelegateAPI = useCallback((): void => {
		console.log('handleCreateDelegateAPI');
		console.log('deligateDetail', deligateDetail);
		// doAddAllowAddressForDelegatedSender
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'doAddAllowAddressForDelegatedSender',
			targetServers: 'localhost',
			targetID: accountDetail?.zimbraId,
			targetEmail: accountDetail?.zimbraMailDeliveryAddress,
			type: 'account',
			by: 'name',
			granteeEmail: deligateDetail?.granteeEmail,
			granteeType: deligateDetail?.granteeType,
			right: deligateDetail?.right
		}).then((res: any) => {
			console.log('addAllowAddressForDelegatedSender ==>', res?.Body);
			setShowCreateIdentity(false);
			getIdentitiesList(accountDetail?.zimbraId);
			createSnackbar({
				key: 'success',
				type: 'success',
				label: t('account_details.delegate_created_successfully', 'Delegate created successfully'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		});
	}, [deligateDetail, accountDetail, getIdentitiesList, createSnackbar, t]);

	const handleDeleteeDelegate = (): void => {
		console.log('handleDeleteeDelegate');
		console.log('selectedRows', selectedRows);
		const selectedDelegate = find(identitiesList, (o) => o.granteeID === selectedRows[0]);
		console.log('selectedDelegate', selectedDelegate);
		if (selectedDelegate) {
			fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxCore',
				action: 'doRemoveDelegatedSenderAddress',
				targetServers: 'localhost',
				targetID: accountDetail?.zimbraId,
				targetEmail: accountDetail?.zimbraMailDeliveryAddress,
				type: 'account',
				by: 'name',
				granteeEmail: selectedDelegate?.granteeName,
				granteeType: selectedDelegate?.granteeType,
				right: 'sendAs'
			}).then((res: any) => {
				console.log('doRemoveDelegatedSenderAddress ==>', res?.Body);
				setShowCreateIdentity(false);
				getIdentitiesList(accountDetail?.zimbraId);
			});
			fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxCore',
				action: 'doRemoveDelegatedSenderAddress',
				targetServers: 'localhost',
				targetID: accountDetail?.zimbraId,
				targetEmail: accountDetail?.zimbraMailDeliveryAddress,
				type: 'account',
				by: 'name',
				granteeEmail: selectedDelegate?.granteeName,
				granteeType: selectedDelegate?.granteeType,
				right: 'sendOnBehalfOf'
			}).then((res: any) => {
				console.log('doRemoveDelegatedSenderAddress ==>', res?.Body);
				setShowCreateIdentity(false);
				getIdentitiesList(accountDetail?.zimbraId);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t(
						'account_details.delegate_deleted_successfully',
						'Delegate deleted successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
		}
	};
	const wizardSteps = useMemo(
		() => [
			{
				name: 'select-mode',
				label: t('account_details.select_mode', 'SELECT MODE'),
				icon: 'PlusOutline',
				view: DelegateSelectModeSection,
				clickDisabled: true,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.volume_cancel_button', 'CANCEL')}
						icon={'CloseOutline'}
						iconPlacement="right"
						color="secondary"
						onClick={(): void => setShowCreateIdentity(false)}
					/>
				),
				PrevButton: (): ReactElement => <></>,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('account_details.NEXT', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
						// disabled={!deligateDetail?.granteeType || !deligateDetail?.granteeEmail}
						// onClick={(): void => setShowCreateIdentity(false)}
					/>
				)
			},
			{
				name: 'set-rights',
				label: t('account_details.set_rights', 'SET RIGHTS'),
				icon: 'OptionsOutline',
				view: DelegateSetRightsSection,
				clickDisabled: true,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.volume_cancel_button', 'CANCEL')}
						icon={'CloseOutline'}
						iconPlacement="right"
						color="secondary"
						onClick={(): void => setShowCreateIdentity(false)}
					/>
				),
				PrevButton: (props: any): any => (
					<Button
						{...props}
						label={t('label.volume_back_button', 'BACK')}
						icon={'ChevronLeftOutline'}
						iconPlacement="left"
						disable={props.completeLoading}
						color="secondary"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('account_details.NEXT', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
						// onClick={(): void => setShowCreateIdentity(false)}
					/>
				)
			},
			{
				name: 'add-delegate',
				label: t('account_details.ADD', 'ADD'),
				icon: 'KeyOutline',
				view: DelegateAddSection,
				clickDisabled: true,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.volume_cancel_button', 'CANCEL')}
						icon={'CloseOutline'}
						iconPlacement="right"
						color="secondary"
						onClick={(): void => setShowCreateIdentity(false)}
					/>
				),
				PrevButton: (props: any): any => (
					<Button
						{...props}
						label={t('label.volume_back_button', 'BACK')}
						icon={'ChevronLeftOutline'}
						iconPlacement="left"
						disable={props.completeLoading}
						color="secondary"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('account_details.NEXT', 'NEXT')}
						icon="PersonOutline"
						iconPlacement="right"
						onClick={(): void => handleCreateDelegateAPI()}
					/>
				)
			}
		],
		[handleCreateDelegateAPI, t]
	);
	return (
		<>
			{isAdvanced && (
				<Container
					mainAlignment="flex-start"
					padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
				>
					{!showCreateIdentity && (
						<>
							<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
								<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
									<Text size="small" color="gray0" weight="bold">
										{t('label.delegates', 'DELEGATES')}
									</Text>
								</Row>
								<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
									<Padding right="large">
										<Button
											type="outlined"
											label={t('label.ADD_NEW', 'ADD NEW')}
											icon="PlusOutline"
											iconPlacement="right"
											color="primary"
											height={44}
											onClick={(): void => handleCreateDelegate()}
										/>
									</Padding>
									<Padding right="large">
										<Button
											type="outlined"
											label={t('label.EDIT', 'EDIT')}
											icon="Edit2Outline"
											iconPlacement="right"
											color="secondary"
											height={44}
											onClick={(): void => handleCreateDelegateAPI()}
										/>
									</Padding>
									<Button
										type="outlined"
										label={t('label.REMOVE', 'REMOVE')}
										icon="CloseOutline"
										iconPlacement="right"
										color="error"
										height={44}
										disabled={!selectedRows?.length}
										onClick={(): void => handleDeleteeDelegate()}
									/>
								</Row>
								<Row
									padding={{ top: 'large', left: 'large' }}
									width="100%"
									mainAlignment="space-between"
								>
									<Row
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										width="fill"
										height="calc(100vh - 340px)"
									>
										{identityListItem.length !== 0 && (
											<Table
												rows={identityListItem}
												headers={headers}
												multiSelect={false}
												onSelectionChange={setSelectedRows}
												style={{ overflow: 'auto', height: '100%' }}
											/>
										)}
										{identityListItem.length === 0 && (
											<Container
												orientation="column"
												crossAlignment="center"
												mainAlignment="center"
											>
												<Row>
													<img src={logo} alt="logo" />
												</Row>
												<Row
													padding={{ top: 'extralarge' }}
													orientation="vertical"
													crossAlignment="center"
													style={{ textAlign: 'center' }}
												>
													<Text weight="light" color="#828282" size="large" overflow="break-word">
														{t('label.this_list_is_empty', 'This list is empty.')}
													</Text>
												</Row>
												<Row
													orientation="vertical"
													crossAlignment="center"
													style={{ textAlign: 'center' }}
													padding={{ top: 'small' }}
													width="53%"
												>
													<Text weight="light" color="#828282" size="large" overflow="break-word">
														<Trans
															i18nKey="label.create_otp_list_msg"
															defaults="You can create a new OTP by clicking on <bold>NEW OTP</bold> button up here"
															components={{ bold: <strong /> }}
														/>
													</Text>
												</Row>
											</Container>
										)}
										<Row
											orientation="horizontal"
											mainAlignment="space-between"
											crossAlignment="flex-start"
											width="fill"
											padding={{ top: 'medium' }}
										>
											<Divider />
										</Row>
									</Row>
								</Row>
							</Row>
						</>
					)}
					{showCreateIdentity && (
						<>
							<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
								<HorizontalWizard
									steps={wizardSteps}
									Wrapper={WizardInSection}
									setToggleWizardSection={setShowCreateIdentity}
								/>
							</Row>
						</>
					)}
				</Container>
			)}
		</>
	);
};

export default EditAccountDelegatesSection;
