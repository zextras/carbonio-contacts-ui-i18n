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
| address | ContactAddress[] |||
| notes | string |||
| email | ContactMail[] |||
| phone | ContactPhone[] |||
| _modifyDate | number |||

## ContactAddress
| Field | Type | Notes |
|-------|------|-------|
| type | enum(other, home, work) ||
| street | string ||
| city | string ||
| postalCode | string ||
| country | string ||
| state | string ||

## ContactMail

| Field | Type | Notes |
|-------|------|-------|
| mail | string ||

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
