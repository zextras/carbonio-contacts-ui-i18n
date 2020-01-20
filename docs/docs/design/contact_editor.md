---
title: ContactEditorPanel
---

The contact editor panel allow the user to edit or create contact entries for his contact list.

Once the user hit the `Save` button, a `modify` or `creation` action is dispatched.

## Components Involved
Some components may require a version specific for each screen size, that items are marked with the ⚠️ icon.

| n | Component | Notes | View |
|---|-----------|-------|------|
| 1 | Header | A Container | 🖥️ 📱 |
| 2 | Icon || 🖥️ 📱 |
| 3 | Typography || 🖥️ 📱 |
| 4 | IconButton || 🖥️ 📱 |
| 5 | Button || 🖥️ 📱 |
| 6 | Button || 🖥️ 📱 |
| 7 | Input | First Name | 🖥️ 📱 |
| 8 | Input | Last Name | 🖥️ 📱 |
| 9 | Select | Prefix | 🖥️ 📱 |
| 10 | Input | Job title | 🖥️ 📱 |
| 11 | Input | Department | 🖥️ 📱 |
| 12 | Input | Company | 🖥️ 📱 |
| 13 | Input | Mail address | 🖥️ 📱 |
| 14 | FormSection | Level 1 | 🖥️ 📱 |
| 15 | FormSection | Level 2 | 🖥️ 📱 |
| 16 | Input | Primary | 🖥️ 📱 |
| 17 | Select || 🖥️ 📱 |
| 18 | Input | Number | 🖥️ 📱 |
| 19 | IconButton | Visible only to delete the current row, not visible if the row is empty. | 🖥️⚠️ |
| 20 | Content | A Container | 🖥️ 📱 |
| 21 | Footer | A Container | 🖥️ 📱 |
| 22 | Select || 🖥️ 📱 |

### Options for "Prefix" field (9).
- Mr.
- Miss
- Mrs.
- Ms.
- Mx.
- Sir
- Dr.
- Lady
- Lord

### Validation of the "Mail" fields (13).
TODO: We need a regex.

## Wireframes
Wireframes are almost the same for both Mobile and Desktop.

⚠️ **Warning** ⚠️

The only difference is on the _element 19_ 
![wireframe](assets/design/contact_editor/desktop.png)
