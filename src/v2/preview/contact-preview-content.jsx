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
							labels={{
								number: t('phone')
							}}
							values={contact.phone}
							dropdownLabelKey="number"
							showIcon
							width="33.33%"
						/>
						<ContactMultiValueField
							labels={{
								mail: t('mail'),
							}}
							values={contact.mail}
							dropdownLabelKey="mail"
							defaultType="mail"
							showIcon
							width="33.33%"
						/>
						<ContactMultiValueField
							labels={{
								url: t('url')
							}}
							values={contact.url}
							dropdownLabelKey="url"
							showIcon
							width="33.33%"
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactMultiValueField
							labels={{
								type: t('type'),
								street: t('street'),
								city: t('city'),
								postalCode: t('postalCode'),
								country: t('country'),
								state: t('state'),
							}}
							values={contact.address}
							dropdownLabelKey="type"
							wrap
						/>
					</ContactPreviewRow>
					<ContactPreviewRow width="calc(100% - 40px)">
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
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.notes}
							label={t('notes')}
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
	values, labels, dropdownLabelKey, wrap, width, defaultType, showIcon
}) => {
	const [selected, setSelected] = useState(0);
	const items = useMemo(
		() =>	map(
			values,
			(item, idx) => ({
				id: idx.toString(),
				label: item[dropdownLabelKey],
				icon: typeToIcon(item.type || defaultType || 'other'),
				click: () => setSelected(idx)
			})
		),
		[defaultType, dropdownLabelKey, values]
	);
	return (
		(values && values.length > 0 && labels) ? (
			<Container
				orientation="horizontal"
				width={width}
				crossAlignment="flex-start"
			>
				<ContactMultipleField
					defaultType={defaultType}
					fields={values[selected]}
					labels={labels}
					wrap={wrap}
					showIcon={showIcon}
				/>
				{ values.length > 1
				&& (
					<Dropdown items={items}>
						<IconButton icon="ArrowIosDownward" />
					</Dropdown>
				)}
			</Container>
		) : null);
};

const ContactMultipleField = ({
	fields, labels, wrap, width, defaultType, showIcon
}) => (
	<Container
		crossAlignment="flex-start"
		height="fit"
		orientation="horizontal"
		style={wrap ? { flexWrap: 'wrap' } : {}}
		width={width}
	>
		{
			map(
				labels,
				(label, key) => (
					<ContactField
						key={key}
						label={label}
						field={fields[key]}
						wrap={wrap}
						icon={showIcon && typeToIcon(fields.type || defaultType || 'other')}
					/>
				)
			)
		}
	</Container>
);

const ContactField = ({
	field, label, wrap, icon
}) => ((field && label) ? (
	<Container
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		padding={{ all: 'small' }}
		height="fit"
		width={wrap ? '33.33%' : 'fill'}
	>
		<Text color="secondary">{label}</Text>
		<Container
			width="fill"
			height="fit"
			orientation="horizontal"
			mainAlignment="flex-start"
		>
			{ icon && (
				<Padding right="extrasmall">
					<Icon icon={icon} />
				</Padding>
			)}
			<Text size="large" overflow="break-word">{field}</Text>
		</Container>
	</Container>
) : null);

export default ContactPreviewContent;
