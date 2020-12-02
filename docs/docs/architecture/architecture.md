---
 title: Architecture
 ---
 
### General
Contacts App follows the approach of retrieving the data only when the user wants to see them.

The application stores as much data as possible using Redux store in order to minimize the network dependency.

The application receives the changes from the server performing a Sync request and applying the received changes to the local store.

###Store
The application saves the retrieved data using the state container provided by [Redux][1].

As suggested in the official documentation, the guideline is to split the state object into multiple “slices”, which are independent portions of the store, and provide a separate reducer function to manage each individual data slice.

Contacts' store have the fallowing slices: - sync handle the Sync - folders it's responsible for the list of folders in the secondary bar - contacts it contains the map of contacts, grouped by their folder ID.

###Functioning
At the start Mails App does a Sync Request to retrieve the folders (that are displayed in the Secondary Bar).

When the user clicks on a folder the App will download all the contacts in the folder (it has a limit of 500) dispatching the `fetchContactsByFolderId` (It triggers a `Search` Soap Request).

Each time a contact will be deleted, created, edited on the client, the changes will be synchronised on Zimbra’s contacts list and spread all over the clients, dispatching requests to the server.

Following an optimistic UI approach all the operations performed by the user are immediately sent to the server and applied locally. Then it will be performed a different action depending on the server answer.

###Contacts server requests
Contacts requests are managed by the contacts slice of the redux store.

Any request has 3 different states:
- `Pending` server is processing the request
- `Fulfilled` server accepted the request
- `Rejected` server refused the request

Every state is necessary in order to follow the best possible optimistic UI concept, applying changes directly before the server answer.

Users actions could trigger different server requests, depending on the action they perform. 

###New contact
When user try to add a new contact it will trigger the 'addContact' operation in the contacts slice which dispatch the Zimbra 'CreateContactRequest' to the server.

Analysing the states:
- `Pending` create and display the new contact in the contacts list with a temporary ID
- `Fulfilled` assign the proper ID provided by the server
- `Rejected` the new contact is deleted from the contact list

###Edit contact
When user try to edit an existing contact it will trigger the 'modifyContact' operation in the contacts slice which dispatch the Zimbra 'ModifyContactRequest' to the server.

Analysing the states:
- `Pending` edit and display the existing contact in the contacts list
- `Fulfilled` nothing to perform, changes are already locally applied
- `Rejected` all the changes to the contact reverts to the previous state

###Delete contact
When user try to delete a contact it will trigger the 'deleteContact' operation in the contacts slice which dispatch the Zimbra 'ContactActionRequest' to the server.

If user triggers the operation in the trash folder, the request sent to the server will be a permanent delete of the contact.

Analysing the states:
- `Pending` contact will be deleted from store
- `Fulfilled` nothing to perform, changes are already locally applied
- `Rejected` contact is added again to the store in its previous folder

If user triggers the operation in any other folder, the request sent to the server will be a move request from the original folder to the trash one.

Two different situations can happens in this case:
-Trash folder status is `known`
-Trash folder status is `unknown`

Analysing the states:
- `Pending` trash folder status `known`; contact will be moved inside the trash folder
- `Pending` trash folder status `unknown`; contact will be deleted from store 
- `Fulfilled` nothing to perform, changes are already locally applied
- `Rejected` contact is added again to the store in its previous folder

[1]: https://redux.js.org
