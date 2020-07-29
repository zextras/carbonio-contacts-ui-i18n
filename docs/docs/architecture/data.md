---
title: Data
---

This page descibes the data managed by the Contacts App.

- 🔑 - This filed is the primary key
- 🔖 - This filed is an index

## Contact

| Field | Type | 🔑 | Notes |
|-------|------|----|-------|
| parent | string | 🔖 ||
| id | string | 🔑 ||
| nameSuffix | string |||
| namePrefix | string |||
| firstName | string |||
| middleName | string |||
| nickname | string |||
| lastName | string |||
| image | string || URL of the image |
| jobTitle | string |||
| department | string |||
| company | string |||
| notes | string |||
| address | [ContactAddressMap][1] ||`{[id: string]: ContactAddress }`|
| email | [ContactMailMap][2] ||`{[id: string]: ContactMail }`|
| phone | [ContactPhoneMap][3] ||`{[id: string]: ContactPhone }`|
| URL | [ContactUrlMap][3] ||`{[id: string]: ContactUrl }`|
| _revision | number |||

## ContactAddressMap
`{[id: string]: ContactAddress }`

## ContactMailMap
`{[id: string]: ContactMail }`

## ContactPhoneMap
`{[id: string]: ContactPhone }`

## ContactUrlMap
`{[id: string]: ContactUrl }`

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
| email | string ||

## ContactPhone

| Field | Type | Notes |
|-------|------|-------|
| number | string ||
| type | enum(other, home, work, mobile) ||

## ContactUrl

| Field | Type | Notes |
|-------|------|-------|
| url | string ||
| type | enum(other, home, work) ||

[1]: #contactaddress
[2]: #contactmail
[3]: #contactphone
[4]: #contacturl
