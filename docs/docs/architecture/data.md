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
| firstName | string |||
| lastName | string |||
| image | string || url of the image |
| jobTitle | string |||
| department | string |||
| company | string |||
| address | [ContactAddress\[\]][1] |||
| notes | string |||
| email | [ContactMail\[\]][2] |||
| phone | [ContactPhone\[\]][3] |||
| _revision | number |||

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
| name | enum(other, home, work, mobile) ||

[1]: #contactaddress
[2]: #contactmail
[3]: #contactphone
