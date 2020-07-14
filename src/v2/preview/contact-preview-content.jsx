import React, { useCallback, useState, useMemo } from 'react';
import {
	Container,
	IconButton,
	Row,
	Button,
	Padding,
	Text,
	Collapse,
	Dropdown,
	Icon
} from '@zextras/zapp-ui';
import { useTranslation } from 'react-i18next';
import { map } from 'lodash';
import { CompactView } from '../commons/contact-compact-view';

const typeToIcon = (type) => {
	switch (type) {
		case 'mail':
			return 'EmailOutline';
		case 'mobile':
			return 'SmartphoneOutline';
		case 'home':
			return 'HomeOutline';
		case 'work':
			return 'BriefcaseOutline';
		case 'other':
		default:
			return 'PersonOutline';
	}
};

const ContactPreviewContent = ({ contact, onEdit, onDelete }) => {
	const [open, setOpen] = useState(true);
	const toggleOpen = useCallback(() => {
		setOpen(!open);
	}, [setOpen, open]);
	const { t } = useTranslation();
	const addressRowData = useMemo(
		() => map(
			contact.address,
			(addr) => ({
				type: addr.type,
				address: `${addr.street} - ${addr.city} (${addr.postalCode}), ${addr.country}, ${addr.state}`
			})
		),
		[contact]
	);
	console.log(contact);
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
				<CompactView contact={contact} open={open} toggleOpen={toggleOpen} />
			</Container>
			<Collapse
				orientation="vertical"
				open={open}
				crossSize="100%"
			>
				<Container
					background="gray6"
					width="fill"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
				>
					<ContactPreviewRow>
						<ContactField
							field={contact.namePrefix}
							label={t('prefix')}
						/>
						<ContactField
							field={contact.firstName}
							label={t('firstName')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.middleName}
							label={t('middleName')}
						/>
						<ContactField
							field={contact.nickName}
							label={t('nickName')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.lastName}
							label={t('lastName')}
						/>
						<ContactField
							field={contact.nameSuffix}
							label={t('suffix')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactMultiValueField
							label={t('mail')}
							values={contact.mail}
							labelKey="mail"
							defaultType="mail"
							showIcon
						/>
						<ContactMultiValueField
							label={t('phone')}
							values={contact.phone}
							labelKey="number"
							showIcon
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactMultiValueField
							label={t('url')}
							values={contact.url}
							labelKey="url"
							showIcon
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.jobTitle}
							label={t('jobTitle')}
						/>
						<ContactField
							field={contact.department}
							label={t('department')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.company}
							label={t('company')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactMultiValueField
							label={t('address')}
							values={addressRowData}
							labelKey="address"
							width="fill"
							showIcon
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.notes}
							label={t('notes')}
							width="fill"
						/>
					</ContactPreviewRow>
				</Container>
			</Collapse>
		</>
	);
};

const ContactPreviewRow = ({ children, width }) => (
	<Row
		orientation="horizontal"
		mainAlignment="flex-start"
		width={width || 'fill'}
		wrap="nowrap"
	>
		{children}
	</Row>
);

const ContactMultiValueField = ({
	values, label, labelKey, width, defaultType, showIcon
}) => {
	const [selected, setSelected] = useState(0);
	const items = useMemo(
		() =>	map(
			values,
			(item, idx) => ({
				id: idx.toString(),
				label: item[labelKey],
				icon: typeToIcon(item.type || defaultType || 'other'),
				click: () => setSelected(idx)
			})
		),
		[defaultType, labelKey, values]
	);
	return (
		<Container
			orientation="horizontal"
			width={width || '50%'}
			crossAlignment="center"
			mainAlignment="space-between"
		>
			<ContactField
				label={label}
				field={values && values[selected] && values[selected][labelKey]}
				icon={values && values[selected] && showIcon && typeToIcon(values[selected].type || defaultType || 'other')}
				width={width || 'fill'}
				limit
			/>
			{ values.length > 1
				&& (
					<Dropdown items={items}>
						<IconButton icon="ChevronDown" />
					</Dropdown>
				)}
		</Container>
	);
};

const ContactField = ({
	field, label, width, icon, limit
}) => (
	<Container
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		padding={{ all: 'small' }}
		width={width || '50%'}
		style={{ minHeight: '48px', maxWidth : limit ? 'calc(100% - 48px)' : '100%' }}
	>
		<Text color="secondary">{label}</Text>
		<Row
			takeAvailableSpace
			wrap="nowrap"
			height="fit"
			width="fill"
			orientation="horizontal"
			mainAlignment="flex-start"
		>
			{ icon && (
				<Padding right="extrasmall">
					<Icon icon={icon} />
				</Padding>
			)}
			<Text size="large" overflow="break-word">{field}</Text>
		</Row>
	</Container>
);

export default ContactPreviewContent;
