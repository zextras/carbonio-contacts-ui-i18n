---
title: API
---

| 📫 | Event Name | Data | Notes |
|---|------------|------|-------|
|| `contacts:updated:contact` | `id`: string ||
|| `contacts:deleted:contact` | `id`: string ||
|| `contacts:updated:folder` | `id`: string ||
|| `contacts:deleted:folder` | `id`: string ||

## Operations
### Create
```typescript
type opData = {
  operation: 'create-contact';
  contactData: ContactData;
};
```
### Modify
```typescript
type opData = {
  operation: 'modify-contact';
  contactData: ContactData;
};
```
### Move
```typescript
type opData = {
  operation: 'move-contact';
  contactId: string;
  folderId: string;
};
```
### Delete
```typescript
type opData = {
  operation: 'delete-contact';
  contactId: string;
};
```


## SOAP
SOAP calls involved on contacts synchronisation will let the application to send and retrieve changes on contacts list.
Calls involved in synchronisation are:

- `Sync` without a previous token set on request’s parameters will be used to retrieve and save contacts lists that have to be synchronised.
- `Sync` with the previous `Sync`'s token set as request’s parameter will be used in order to check changes on contacts list. Different changes will be treated in different ways:
    - deleted contacts will be deleted
    - created and edited contact ids will be used to call `GetContacts` to retrieve all the information
- `GetContacts` will be used to retrieve all the information of a given contact in order to keep local data synchronised

Alongside the synchronization, other calls used are  
- `ModifyContact` will be used in order to push changes done to contact(s) on mobile devices to the cloud server
- `ContactAction` will be used to perform actions like `move` or `delete`.
- `CreateFolder` will be used to create a mail folder.
- `FolderAction` will be used to perform actions like `move` or `delete` on the folders.

### Sync
For the `Sync` management please refer to the Shell project.
The `Sync` is not performed directly by the Contact App.

### CreateContact
Request performed to create a contact into the user's contact list.
```typescript
type Request = {
  cn: {
  		l: '$PARENT_ID';
  		a: [ /* List of attrs */ ];
  	};
};
```

### ModifyContact
Request performed to modify a contact into the user's contact list.
```typescript
type Request = {
  replace: 0; /* Not documented */
  force: 1; /* Not documented */
  cn:  {
    l: '$PARENT_ID';
    a: [ /* List of attrs */ ];
  };
};
```

### ContactAction
Requests performed to move or delete a contact into the user's contact list.

**Notes:** To send a contact into the user's _Trash_, a move action is performed. 
The _Trash_ folder has id `3`.

#### Move to a folder
Request performed to move a contact into another folder.
```typescript
type Request = {
  action: {
      op: 'move',
      l: '$DESTINATION_FOLDER_ID',
      id:  '$CONTACT_ID'
    }
};
```
#### Delete
Request performed to delete a contact.
```typescript
type Request = {
  action: {
      op: 'delete',
      id:  '$CONTACT_ID'
  }
};
```
### CreateFolder
Request performed to create a contact folder (in zimbra is called 'Address book').
```typescript
type Request = {
  folder: {
  		view: 'contact',
  		l: '$PARENT_ID',
  		name: '$NAME'
  	}
};
```
### FolderAction
Requests performed to move, rename or move a contact folder.
#### Move
Request performed to move a contact folder.
```typescript
type Request = {
  action: {
    op: 'move',
    id: '$FOLDER_ID',
    l: '$PARENT_ID'
  }
};
```
#### Rename
Request performed to rename a contact folder.
```typescript
type Request = {
  action: {
    op: 'rename',
    id: '$FOLDER_ID',
    name: '$NAME'
  }
};
```
#### Delete
Request performed to delete a contact folder.
```typescript
type Request = {
  action: {
    op: 'delete',
    id: '$FOLDER_ID'
  }
};
```
#### Empty
Request performed to delete a contact folder.
```typescript
type Request = {
  action: {
    op: 'empty',
    id: '$FOLDER_ID',
    recursive: true
  }
};
```
