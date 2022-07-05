/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, useSnackbar } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useDomainStore } from '../../../../../store/domain/store';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import { Section } from '../../../../app/component/section';
import { AccountContext } from '../account-context';

const AccountDetailContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 43px;
	right: 12px;
	bottom: 0px;
	left: ${'max(calc(100% - 680px), 12px)'};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	overflow: hidden;
	box-shadow: -6px 4px 5px 0px rgba(0, 0, 0, 0.1);
	opacity: '10%;
`;

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('account.edit.edit_account_wizard', 'Edit Account Wizard')}
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

interface AccountDetailObj {
	name: string;
	givenName: string;
	initials: string;
	sn: string;
	zimbraPasswordMustChange: boolean;
	generateFirst2FAToken: boolean;
	enableActiveSyncRemoteAccess: boolean;
	defaultCOS: boolean;
	zimbraAccountStatus: string;
	zimbraPrefLocale: string;
	zimbraPrefTimeZoneId: string;
	description: string;
	password: string;
	repeatPassword: string;
}

// eslint-disable-next-line no-empty-pattern
const EditAccount: FC<{
	setShowEditAccountView: any;
	createAccountReq: any;
}> = ({ setShowEditAccountView, createAccountReq }) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const domainName = useDomainStore((state) => state.domain?.name);
	const [accountDetail, setAccountDetail] = useState<AccountDetailObj>({
		name: '',
		givenName: '',
		initials: '',
		sn: '',
		zimbraPasswordMustChange: true,
		generateFirst2FAToken: true,
		enableActiveSyncRemoteAccess: true,
		defaultCOS: true,
		zimbraAccountStatus: '',
		zimbraPrefLocale: '',
		zimbraPrefTimeZoneId: '',
		description: '',
		password: '',
		repeatPassword: ''
	});

	const [wizardData, setWizardData] = useState();

	const wizardSteps = useMemo(
		() => [
			{
				name: 'general',
				label: t('label.general', 'GENERAL'),
				icon: 'PersonOutline',
				view: (props: any): ReactElement => <></>,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => setShowEditAccountView(false)}
					/>
				),
				PrevButton: (props: any): ReactElement => <></>,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next_step', 'NEXT STEP')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'configration',
				label: t('label.configration', 'CONFIGRATION'),
				icon: 'InfoOutline',
				view: (props: any): ReactElement => <></>,
				CancelButton: (props: any): ReactElement => <></>,
				PrevButton: (props: any): ReactElement => <></>,
				NextButton: (props: any): ReactElement => <></>
			},
			{
				name: 'login',
				label: t('label.login', 'LOGIN'),
				icon: 'InfoOutline',
				view: (props: any): ReactElement => <></>,
				CancelButton: (props: any): ReactElement => <></>,
				PrevButton: (props: any): ReactElement => <></>,
				NextButton: (props: any): ReactElement => <></>
			},
			{
				name: 'feature',
				label: t('label.feature', 'FEATURE'),
				icon: 'InfoOutline',
				view: (props: any): ReactElement => <></>,
				CancelButton: (props: any): ReactElement => <></>,
				PrevButton: (props: any): ReactElement => <></>,
				NextButton: (props: any): ReactElement => <></>
			},
			{
				name: 'user_preferences',
				label: t('label.user_preferences', 'USER PREFERENCES'),
				icon: 'InfoOutline',
				view: (props: any): ReactElement => <></>,
				CancelButton: (props: any): ReactElement => <></>,
				PrevButton: (props: any): ReactElement => <></>,
				NextButton: (props: any): ReactElement => <></>
			}
		],
		[setShowEditAccountView, t]
	);

	const onComplete = useCallback(() => {
		setShowEditAccountView(false);
	}, [setShowEditAccountView]);

	return (
		<AccountDetailContainer background="gray5" mainAlignment="flex-start">
			<AccountContext.Provider value={{ accountDetail, setAccountDetail }}>
				<HorizontalWizard
					steps={wizardSteps}
					Wrapper={WizardInSection}
					onChange={setWizardData}
					onComplete={onComplete}
					setToggleWizardSection={setShowEditAccountView}
				/>
			</AccountContext.Provider>
		</AccountDetailContainer>
	);
};
export default EditAccount;
