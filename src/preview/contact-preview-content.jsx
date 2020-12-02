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
import { map, reduce } from 'lodash';
import { CompactView } from '../commons/contact-compact-view';

function typeToIcon(type) {
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
}

function ContactPreviewRow({ children, width }) {
	return (
		<Row
			orientation="horizontal"
			mainAlignment="space-between"
			width={width || 'fill'}
			wrap="nowrap"
			padding={{ horizontal: 'small' }}
		>
			{children}
		</Row>
	);
}

function ContactField({
	field, label, width, icon, limit, items
}) {
	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'small' }}
			width={width || '48%'}
			style={{ minHeight: '48px', maxWidth: limit ? 'calc(100% - 48px)' : '100%' }}
		>
			<Text color="secondary">{label}</Text>
			<Row
				takeAvailableSpace
				wrap="nowrap"
				height="fit"
				width="fill"
				orientation="horizontal"
				mainAlignment="flex-start"
				padding={{ top: 'extrasmall' }}
			>
				{ icon && (
					<Padding right="extrasmall">
						<Icon icon={icon} />
					</Padding>
				)}
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="break-word">{ field }</Text>
				</Row>
				{ items && (
					<Padding left="extrasmall">
						<Dropdown items={items} placement="bottom-end">
							<IconButton size="small" icon="ArrowIosDownward" />
						</Dropdown>
					</Padding>
				)}
			</Row>
		</Container>
	);
}

function ContactMultiValueField({
	type, values, width, defaultType, showIcon
}) {
	const [ t ] = useTranslation();

	const [selected, setSelected] = useState(0);

	const [internalType, label] = useMemo(() => {
		switch (type) {
			case 'mail':
				return [
					'mail',
					t('section.title.mail', { count: values.length }),
				];
			case 'phone_number':
				return [
					'number',
					t('section.title.phone_number', { count: values.length }),
				];
			case 'url':
				return [
					'url',
					t('section.title.url', { count: values.length }),
				];
			case 'address':
				return [
					'address',
					t('section.title.address', { count: values.length }),
				];
			default:
				return [type, type];
		}
	}, [t, type, values.length]);

	const items = useMemo(
		() =>	reduce(
			values,
			(acc, item, id) => {
				let itemLabel = type;
				switch (type) {
					case 'mail':
						itemLabel = t('mail', { count: id+1 });
						break;
					case 'phone_number':
						itemLabel = t('number', { count: id+1 });
						break;
					case 'url':
						itemLabel = t('url', { count: id+1 });
						break;
					case 'address':
						itemLabel = t('address', { count: id+1 });
						break;
					default:
				}
				acc.push({
					id: id.toString(),
					label: itemLabel,
					icon: typeToIcon(item.type || defaultType || 'other'),
					click: () => setSelected(id)
				});
				return acc;
			},
			[]
		),
		[defaultType, values, type, t]
	);
	return (
		<Container
			orientation="horizontal"
			width={width || '48%'}
			crossAlignment="center"
			mainAlignment="space-between"
		>
			<ContactField
				label={label}
				field={values && values[selected] && values[selected][internalType]}
				icon={values && values[selected] && showIcon && typeToIcon(values[selected].type || defaultType || 'other')}
				width={width || 'fill'}
				items={values.length > 1 && items}
			/>
		</Container>
	);
}

function ContactPreviewContent({ contact, onEdit, onDelete }) {
	const [open, setOpen] = useState(true);
	const toggleOpen = useCallback(() => {
		setOpen(!open);
	}, [setOpen, open]);
	const [ t ] = useTranslation();
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
	const mailData = useMemo(() => Object.values(contact.email), [contact]);
	const urlData = useMemo(() => Object.values(contact.URL), [contact]);
	const phoneData = useMemo(() => Object.values(contact.phone), [contact]);
	return (
		<>
			<Container
				background="gray6"
				height="fit"
				padding={{ all: 'medium' }}
				data-testid='PreviewPanel'
			>
				<Row
					width="fill"
					height="fit"
					takeAvailableSpace
					mainAlignment="flex-end"
					padding={{ horizontal: 'small' }}
				>
					<Padding horizontal="small">
						<IconButton icon="Trash2Outline" onClick={onDelete} />
					</Padding>
					<Button
						icon="EditOutline"
						label={t('label.edit')}
						onClick={onEdit}
					/>
				</Row>
				<Container padding={{ all: 'small', top: 'extrasmall' }}>
					<CompactView contact={contact} open={open} toggleOpen={toggleOpen} />
				</Container>
			</Container>
			<Collapse
				orientation="vertical"
				open={open}
				crossSize="100%"
				disableTransition={true}
			>
				<Container
					background="gray6"
					width="fill"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					padding={{ vertical: 'large', horizontal: 'extralarge' }}
					style={{ overflowY: 'auto' }}
				>
					<ContactPreviewRow>
						<ContactField
							field={contact.namePrefix}
							label={t('name.prefix')}
						/>
						<ContactField
							field={contact.firstName}
							label={t('name.first_name')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.middleName}
							label={t('name.middle_name')}
						/>
						<ContactField
							field={contact.nickName}
							label={t('name.nickName')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.lastName}
							label={t('name.last_name')}
						/>
						<ContactField
							field={contact.nameSuffix}
							label={t('name.suffix')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactMultiValueField
							type="mail"
							values={mailData}
							defaultType="email"
							showIcon
						/>
						<ContactMultiValueField
							type="phone_number"
							values={phoneData}
							showIcon
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactMultiValueField
							type="url"
							values={urlData}
							showIcon
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.jobTitle}
							label={t('job.title')}
						/>
						<ContactField
							field={contact.department}
							label={t('job.department')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactField
							field={contact.company}
							label={t('job.company')}
						/>
					</ContactPreviewRow>
					<ContactPreviewRow>
						<ContactMultiValueField
							type="address"
							values={addressRowData}
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
}

export default ContactPreviewContent;
