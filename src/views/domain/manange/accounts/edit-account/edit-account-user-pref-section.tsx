/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useCallback, useMemo, useContext, useState } from 'react';
import {
	Container,
	Input,
	PasswordInput,
	Row,
	Select,
	Text,
	Icon,
	Switch,
	Divider
} from '@zextras/carbonio-design-system';
import { setDefaults, useTranslation } from 'react-i18next';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from '../account-context';
import { ACTIVE, CLOSED, LOCKED, MAINTENANCE, PENDING } from '../../../../../constants';
import { timeZoneList, localeList } from '../../../../utility/utils';

const EditAccountUserPrefrencesSection: FC = () => {
	const conext = useContext(AccountContext);
	const [t] = useTranslation();
	const { accountDetail, setAccountDetail, directMemberList, inDirectMemberList } = conext;
	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({
				...prev,
				[key]: accountDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[accountDetail, setAccountDetail]
	);
	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row mainAlignment="flex-start" width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.mailing_options', 'Mail Options')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMessageViewHtmlPreferred === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMessageViewHtmlPreferred')}
						label={t('account_details.view_mail_as_html', 'View mail as HTML')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefDisplayExternalImages === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefDisplayExternalImages')}
						label={t(
							'account_details.display_external_image_as_html',
							`Display external image as HTML`
						)}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.group_by', 'Group by')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.default_charset', 'Default Charset')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMessageIdDedupingEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMessageIdDedupingEnabled')}
						label={t(
							'account_details.auto_delete_duplicate_messages',
							'Auto-Delete duplicate messages'
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMailToasterEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMailToasterEnabled')}
						label={t('account_details.enable_toast_for_new_emails', `Enable toast for new emails`)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row mainAlignment="flex-start" width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.receiving_mails', 'Receiving Mails')}
					</Text>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.check_new_mail_every', 'Check new mail every')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMailLocalDeliveryDisabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMailLocalDeliveryDisabled')}
						label={t('account_details.cannot_check_for_less_than', `Cannot check for less than`)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.min_new_check_interval', 'Min new check interval')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefNewMailNotificationEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefNewMailNotificationEnabled')}
						label={t(
							'account_details.enable_address_for_new_email_notifications',
							`Enable address for new email notifications`
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.enabed_address', 'Enabed Address')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefOutOfOfficeReplyEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefOutOfOfficeReplyEnabled')}
						label={t(
							'account_details.can_send_auto_reply_messages',
							`Can send auto-reply messages`
						)}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.out_of_office_cache_lifetime', 'Out of office cache lifetime')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="100%" mainAlignment="flex-start">
					<Input
						label={t('label.out_of_office_message', 'Out of office message')}
						backgroundColor="gray5"
						defaultValue={accountDetail?.zimbraPrefOutOfOfficeReply}
						value={accountDetail?.zimbraPrefOutOfOfficeReply}
						// onChange={changeAccDetail}
						inputName="zimbraPrefOutOfOfficeReply"
						name="zimbraPrefOutOfOfficeReply"
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMailLocalDeliveryDisabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMailLocalDeliveryDisabled')}
						label={t('account_details.send_read_receipts', `Send read receipts`)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.reply_to_address_for_receipt', 'Reply-to address for receipt')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.sending_mails', 'Sending Mails')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefSaveToSent === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefSaveToSent')}
						label={t('account_details.save_to_sent', 'Save to sent')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraAllowAnyFromAddress === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraAllowAnyFromAddress')}
						label={t(
							'account_details.allow_sending_from_any_address',
							`Allow sending from any address`
						)}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="100%" mainAlignment="flex-start">
					<Input
						label={t('label.allowed_sending_addresses', 'Allowed sending Addresses')}
						backgroundColor="gray5"
						defaultValue={accountDetail?.displayName}
						value={accountDetail?.displayName}
						// onChange={changeAccDetail}
						inputName="displayName"
						name="descriptiveName"
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.composing_mails', 'Composing Mails')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMailSignatureEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMailSignatureEnabled')}
						label={t('account_details.mail_signature', 'Mail Signature')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.contact_options', 'Contact Options')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefAutoAddAddressEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefAutoAddAddressEnabled')}
						label={t('account_details.enable_auto_add_contacts', `Enable auto-add contacts`)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefGalAutoCompleteEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefGalAutoCompleteEnabled')}
						label={t('account_details.use_gal_to_auto_fill', 'Use GAL to auto-fill')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.calendar_options', 'Calendar Options')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="100%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.time_zone', 'Time Zone')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.remind_appointments_timer', 'Remind Appointments Timer')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.initial_calendar_view', 'Initial Calendar View')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.first_day_of_week', 'First Day of Week')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={[]}
							background="gray5"
							label={t('label.default_appointment_visibility', 'Default Appointment visibility')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="100%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefAppleIcalDelegationEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefAppleIcalDelegationEnabled')}
						label={t(
							'account_details.use_ical_delegation_model_for_shared_calendars',
							'Use iCal delegation model for shared calendars'
						)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarShowPastDueReminders === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarShowPastDueReminders')}
						label={t('account_details.enable_past_due_reminders', 'Enable past-due reminders')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarToasterEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarToasterEnabled')}
						label={t('account_details.enable_toast_notifications', `Enable toast notifications`)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAllowCancelEmailToSelf === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAllowCancelEmailToSelf')}
						label={t(
							'account_details.allow_sending_cancellation_mail',
							'Allow sending cancellation mail'
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAllowPublishMethodInvite === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAllowPublishMethodInvite')}
						label={t(
							'account_details.add_invites_with_publish_method',
							`Add invites with PUBLISH method`
						)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAllowForwardedInvite === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAllowForwardedInvite')}
						label={t(
							'account_details.add_forwarded_invites_to_calendar',
							'Add forwarded invites to calendar'
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarReminderFlashTitle === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarReminderFlashTitle')}
						label={t(
							'account_details.browser_title_for_appointments',
							`Browser title for appointments`
						)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarReminderSoundsEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarReminderSoundsEnabled')}
						label={t(
							'account_details.audible_reminder_notification',
							'Audible reminder notification'
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarSendInviteDeniedAutoReply === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarSendInviteDeniedAutoReply')}
						label={t(
							'account_details.auto_decline_if_inviter_is_blacklisted',
							`Auto-decline if inviter is blacklisted`
						)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAutoAddInvites === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAutoAddInvites')}
						label={t(
							'account_details.add_appointments_when_invited',
							'Add appointments when invited'
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarNotifyDelegatedChanges === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarNotifyDelegatedChanges')}
						label={t(
							'account_details.notify_changes_by_delegated_access',
							`Notify changes by delegated access`
						)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAlwaysShowMiniCal === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAlwaysShowMiniCal')}
						label={t('account_details.always_show_mini_calendar', 'Always show mini calendar')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarUseQuickAdd === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarUseQuickAdd')}
						label={t(
							'account_details.use_quickadd_dialog_in_creation',
							`Use QuickAdd dialog in creation`
						)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="100%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefUseTimeZoneListInCalendar === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefUseTimeZoneListInCalendar')}
						label={t(
							'account_details.show_time_zone_lists_in_view',
							'Show time zone lists in view'
						)}
					/>
				</Row>
			</Row>
		</Container>
	);
};

export default EditAccountUserPrefrencesSection;
