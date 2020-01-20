---
title: Data
---

## Contact

| Field | Type | 🔑 | Notes |
|-------|------|----|-------|
| id | string | 🔑 ||
| suffix | string |||
| firstName | string |||
| lastName | string |||
| image | string || url of the image |
| jobTitle | string |||
| department | string |||
| company | string |||
| address | string |||
| notes | string |||
| email | ContactMail[] |||
| phone | ContactPhone[] |||

## ContactMail

| Field | Type | Notes |
|-------|------|-------|
| mail | string ||
| name | string | See note 1 |

**Notes**
1. Possible values:
    - `Work`
    - `Home`

## ContactPhone

| Field | Type | Notes |
|-------|------|-------|
| number | string ||
| name | string | See note 1 |

**Notes**
1. Possible values:
    - `Mobile`
    - `Work`
    - `Home`
    - `Other`
