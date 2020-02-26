import { map } from 'lodash';
import { Contact } from '../idb/IContactsIdb';
import { ISoapContactObj } from '../ISoap';
import { normalizeContact } from '../idb/IdbContactsUtils';

/* eslint-disable class-methods-use-this */
export default class ContactsNetworkService {
	public fetchSoapContacts(ids: Array<string>): Promise<Contact[]> {
		return new Promise((resolve, reject) => {
			const searchReq: {} = {
				Body: {
					GetContactsRequest: {
						_jsns: 'urn:zimbraMail',
						sync: 1,
						cn: map(ids, (id) => ({ id }))
					}
				}
			};
			fetch('/service/soap/GetContactsRequest', {
				method: 'POST',
				body: JSON.stringify(searchReq)
			})
				.then((r) => r.json())
				.then((r) => {
					if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
					resolve(map(
						r.Body.GetContactsResponse.cn,
						(c: ISoapContactObj): Contact => normalizeContact(c)
					));
				})
				.catch((e) => reject(e));
		});
	}
}
