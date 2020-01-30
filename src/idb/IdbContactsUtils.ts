import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';
import { ISoapFolderObj } from '@zextras/zapp-shell/lib/network/ISoap';
import { ISoapContactObj } from '../ISoap';
import { Contact, ContactAddress, ContactEmail, ContactPhone } from './IContactsIdb';
import { ContactaddressType, ContactPhoneType } from './ContactEnums';
import { map, pickBy } from 'lodash';

const MAIL_REG = /^email(\d*)$/;
const PHONE_REG = /^(.*)Phone(\d*)$/;

export function normalizeFolder(soapFolderObj: ISoapFolderObj): IFolderSchmV1 {
	return {
		_revision: soapFolderObj.rev,
		itemsCount: soapFolderObj.n,
		name: soapFolderObj.name,
		id: soapFolderObj.id,
		path: soapFolderObj.absFolderPath,
		unreadCount: soapFolderObj.u || 0,
		size: soapFolderObj.s,
		parent: soapFolderObj.l
	};
}

export function contactPhoneTypeFromString(s: string): ContactPhoneType {
	if (!PHONE_REG.test(s)) return ContactPhoneType.OTHER;
	switch(s.match(PHONE_REG)[1]) {
		case 'mobile':
			return ContactPhoneType.MOBILE;
		case 'work':
			return ContactPhoneType.WORK;
		case 'home':
			return ContactPhoneType.HOME;
		default:
			return ContactPhoneType.OTHER;
	}
}

function normalizeContactAddresses(c: ISoapContactObj): ContactAddress[] {
	if (
		c._attrs.hasOwnProperty('otherStreet')
		|| c._attrs.hasOwnProperty('otherPostalCode')
		|| c._attrs.hasOwnProperty('otherCity')
		|| c._attrs.hasOwnProperty('otherState')
		|| c._attrs.hasOwnProperty('otherCountry')
	) {
		return [{
			type: ContactaddressType.OTHER,
			street: c._attrs.otherStreet || '',
			postalCode: c._attrs.otherPostalCode || '',
			city: c._attrs.otherCity || '',
			state: c._attrs.otherState || '',
			country: c._attrs.otherCountry || ''
		}];
	}
	else {
		return [];
	}
}

function normalizeContactMails(c: ISoapContactObj): ContactEmail[] {
	return map(
		pickBy(c._attrs, (v, k) => MAIL_REG.test(k)),
		(v, k) => ({
			mail: v
		})
	);
}

function normalizeContactPhones(c: ISoapContactObj): ContactPhone[] {
	return map(
		pickBy(c._attrs, (v, k) => PHONE_REG.test(k)),
		(v, k) => ({
			number: v,
			name: contactPhoneTypeFromString(k)
		})
	);
}

export function normalizeContact(c: ISoapContactObj): Contact {
	return {
		_revision: c.rev,
		parent: c.l,
		id: c.id,
		address: normalizeContactAddresses(c),
		company: c._attrs.company || '',
		department: c._attrs.department || '',
		mail: normalizeContactMails(c),
		firstName: c._attrs.firstName || '',
		lastName: c._attrs.lastName || '',
		image: (c._attrs.image) ?
			`/service/home/~/?auth=co&id=${c.id}&part=${c._attrs.image.part}&max_width=32&max_height=32`
			:
			'',
		jobTitle: c._attrs.jobTitle || '',
		notes: c._attrs.notes || '',
		phone: normalizeContactPhones(c),
		nameSuffix: c._attrs.nameSuffix || ''
	};
}
