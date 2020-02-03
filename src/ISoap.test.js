import { normalizeContactMailsToSoapOp, normalizeContactPhonesToSoapOp, normalizeContactAddressesToSoapOp } from './ISoap';
import { ContactaddressType, ContactPhoneType } from './idb/ContactEnums';

test('Normalize Contact Mails for SOAP Operation', () => {
	expect(
		normalizeContactMailsToSoapOp([
			{ mail: 'mail@example.com' },
			{ mail: 'mail1@example.com' },
			{ mail: 'mail2@example.com' },
		])
	).toStrictEqual(
		{
			mail: 'mail@example.com',
			mail1: 'mail1@example.com',
			mail2: 'mail2@example.com',
		}
	);
});

test('Normalize Contact Phones for SOAP Operation', () => {
	expect(
		normalizeContactPhonesToSoapOp([
			{ number: 'o0', name: ContactPhoneType.OTHER },
			{ number: 'o1', name: ContactPhoneType.OTHER },
			{ number: 'o2', name: ContactPhoneType.OTHER },
			{ number: 'm', name: ContactPhoneType.MOBILE },
			{ number: 'h', name: ContactPhoneType.HOME },
			{ number: 'w', name: ContactPhoneType.WORK },
		])
	).toStrictEqual(
		{
			otherPhone: 'o0',
			otherPhone1: 'o1',
			otherPhone2: 'o2',
			mobilePhone: 'm',
			homePhone: 'h',
			workPhone: 'w',
		}
	);
});

test('Normalize Contact Addresses for SOAP Operation', () => {
	expect(
		normalizeContactAddressesToSoapOp([
			{
				street: 'os0',
				postalCode: 'op0',
				city: 'oc0',
				state: 'ost0',
				country: 'oco0',
				type: ContactaddressType.OTHER,
			},
			{
				street: 'os1',
				postalCode: 'op1',
				city: 'oc1',
				state: 'ost1',
				country: 'oco1',
				type: ContactaddressType.OTHER,
			},
			{
				street: 'hs',
				postalCode: 'hp',
				city: 'hc',
				state: 'hst',
				country: 'hco',
				type: ContactaddressType.HOME,
			},
			{
				street: 'ws',
				postalCode: 'wp',
				city: 'wc',
				state: 'wst',
				country: 'wco',
				type: ContactaddressType.WORK,
			}
		])
	).toStrictEqual(
		{
			otherStreet: 'os0',
			otherPostalCode: 'op0',
			otherCity: 'oc0',
			otherState: 'ost0',
			otherCountry: 'oco0',
			otherStreet1: 'os1',
			otherPostalCode1: 'op1',
			otherCity1: 'oc1',
			otherState1: 'ost1',
			otherCountry1: 'oco1',
			homeStreet: 'hs',
			homePostalCode: 'hp',
			homeCity: 'hc',
			homeState: 'hst',
			homeCountry: 'hco',
			workStreet: 'ws',
			workPostalCode: 'wp',
			workCity: 'wc',
			workState: 'wst',
			workCountry: 'wco',
		}
	);
});

