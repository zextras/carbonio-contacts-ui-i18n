import React, { useCallback, useState, useMemo } from 'react';
import {
	Container,
	IconButton,
	Row,
	Button,
	Padding,
	Avatar,
	Text,
	Collapse,
	Dropdown
} from '@zextras/zapp-ui';
import { useTranslation } from 'react-i18next';
import { trim, map } from 'lodash';
import { useDisplayName } from '../commons/use-display-name';

const ContactPreviewContent = ({ contact, onEdit, onDelete }) => {
	const [open, setOpen] = useState(false);
	const toggleOpen = useCallback(() => {
		setOpen(!open);
	}, [setOpen, open]);
	const { t } = useTranslation();
	const displayName = useDisplayName(contact);
	return (
		<>
			<Container
				background="gray6"
				height="fit"
				padding={{ all: 'medium' }}
			>
				<Row
					width="fill"
					height="fit"
					takeAvailableSpace
					mainAlignment="flex-end"
				>
					<Padding horizontal="small">
						<IconButton icon="Trash2Outline" onClick={onDelete} />
					</Padding>
					<Button
						icon="EditOutline"
						label={t('edit')}
						onClick={onEdit}
					/>
				</Row>
				<Row
					width="fill"
					height="fit"
					mainAlignment="flex-start"
				>
					<Avatar
						label={`${contact.firstName} ${contact.lastName}`}
						picture={contact.image}
						size="large"
					/>
					<Row
						orientation="vertical"
						takeAvailableSpace
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ horizontal: 'medium', vertical: 'small' }}
						height="fill"
					>
						<Text
							size="large"
							weight="bold"
						>
							{displayName}
						</Text>
						<Text
							weight="bold"
							color="secondary"
						>
							{
								trim(`${
									contact.jobTitle && `${contact.jobTitle}, `
								} ${
									contact.department && `${contact.department}, `
								} ${
									contact.company && `${contact.company}, `
								}`, ', ')
							}
						</Text>
						<Text
							color="secondary"
						>
							{
								trim(`${
									contact.mail && contact.mail.length > 0 && contact.mail[0].mail && `${contact.mail[0].mail}, `
								} ${
									contact.phone && contact.phone.length > 0 && contact.phone[0].number && `${contact.phone[0].number} `
								}`, ', ')
							}
						</Text>
					</Row>
					<IconButton
						size="large"
						onClick={toggleOpen}
						icon={open ? 'ArrowIosDownward' : 'ArrowIosUpward'}
					/>
				</Row>
			</Container>
			<Collapse
				orientation="vertical"
				open={open}
				crossSize="100%"
			>
				<Container
					background="gray6"
					width="fill"
				>
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						width="fill"
						wrap="nowrap"
					>
						<ContactField
							field={contact.namePrefix}
							label={t('prefix')}
						/>
						<ContactField
							field={contact.firstName}
							label={t('firstName')}
						/>
						<ContactField
							field={contact.lastName}
							label={t('lastName')}
						/>
						<ContactField
							field={contact.nameSuffix}
							label={t('suffix')}
						/>
					</Row>
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						width="fill"
						wrap="nowrap"
					>
						<ContactMultipleField
							label={t('phone')}
							fields={contact.phone}
							fieldKey="number"
						/>
						<ContactMultipleField
							label={t('mail')}
							fields={contact.mail}
							fieldKey="mail"
						/>
					</Row>
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						width="fill"
						wrap="nowrap"
					>
						<ContactField
							field={contact.jobTitle}
							label={t('jobTitle')}
						/>
						<ContactField
							field={contact.department}
							label={t('department')}
						/>
						<ContactField
							field={contact.company}
							label={t('company')}
						/>
					</Row>
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						width="fill"
						wrap="nowrap"
					>
						<ContactField
							field={contact.notes}
							label={t('notes')}
						/>
					</Row>
				</Container>
			</Collapse>
		</>
	);
};

const ContactMultipleField = ({ fields, label, fieldKey }) => {
	const items = useMemo(
		() =>	map(
			fields,
			(item, idx) => ({
				id: `${idx}-${item[fieldKey]}`,
				label: item[fieldKey],
				click: () => {}
			})
		),
		[fields]
	);
	return (
		(fields && fields.length > 0 && label) ? (
			<Container
				orientation="horizontal"
			>
				<ContactField field={fields[0][fieldKey]} label={label} />
				{ fields.length > 1
				&& (
					<Dropdown items={items}>
						<IconButton icon="ArrowIosDownward" />
					</Dropdown>
				)}
			</Container>
		) : null);
};

const ContactField = ({ field, label }) => ((field && label) ? (
	<Container
		crossAlignment="flex-start"
		padding={{ all: 'medium' }}
		height="fit"
	>
		<Text color="secondary">{label}</Text>
		<Text size="large" overflow="break-word">{field}</Text>
	</Container>
) : null);

export default ContactPreviewContent;
