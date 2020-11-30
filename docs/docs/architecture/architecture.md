---
title: Architecture
---

The Contacts App needs to keep Contacts data synchronized on the client.

Contacts data will be saved into the storage given to the app by the shell.
The data will be retained to improve the responsiveness during operations like the search and offline operations.

Each time a contact will be deleted, created, edited on the client, the changes will be synchronised on Zimbra’s contacts list and spread all over the clients.
This update is handled by the operation stack handled by the Shell.

Synchronisation will be implemented by using Zimbra SOAP API.

The Contact App relies on centralized data management with redux benefiting from huge advantages:
    - Manage and manipulate data easily
    - Minimize errors
    - Reduce server requests
