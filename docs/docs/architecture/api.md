---
title: API
---

| 📫 | Event Name | Data | Notes |
|---|------------|------|-------|
|| `contacts:updated:contact` | `id`: string ||
|| `contacts:deleted:contact` | `id`: string ||
|| `contacts:updated:folder` | `id`: string ||
|| `contacts:deleted:folder` | `id`: string ||

## SOAP
SOAP calls involved on contacts synchronisation will let the application to send and retrieve changes on contacts list.
Calls involved in synchronisation are:

- `SyncRequest` without a previous token set on request’s parameters will be used to retrieve and save contacts lists that have to be synchronised. Contacts list that will be saved locally are the standard contacts list and all the custom contact’s folders that user has created in his account. This call will be merged with the standard mail and conversation synchronisation because it’s the same request.
- `SyncRequest`  with the previous `SyncRequest`'s token set as request’s parameter will be used in order to check changes on contacts list. Different changes will be treated in different ways:
    - deleted contacts will be deleted
    - created and edited contact ids will be used to call `GetContactsRequest` to retrieve all the informations
- `GetContactsRequest` will be used to retrieve all the information of a given contact in order to keep local data synchronised
- `ModifyContactRequest` will be used in order to push changes done to contact(s) on mobile devices to the cloud server
