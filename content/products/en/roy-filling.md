---
title: "ROY ICP Filling"
description: "Republic of Yang's friendly link list"
icon: "/images/republic-of-yang/filling.png"
background: "/images/republic-of-yang/greatwall.webp"
url: "/icp"
repo: "https://github.com/Solsynth/Capital.Next"
version: "1.0.0"
releasedDate: "2026-05-24"
color: "#D07C2C"
hasPage: true
tags: ["Community"]
series: "Republic of Yang"
---

**Disclaimer: This service is a friendly link project inspired by [Moe ICP](https://icp.gov.moe). It has no affiliation with the ICP filing system provided by the Ministry of Industry and Information Technology of the People's Republic of China and carries no legal effect. Any entities described on this page are fictional constructs under a fictional world setting and do not represent any real-world entities. Any resemblance is purely coincidental. We do not provide any warranty for the websites listed, and we assume no responsibility for security issues such as DNS pollution/hijacking or fraud risks they may encounter.**

_The disclaimer is over — now it's fantasy time >\_<_

**羝 (dī) ICP Filing** is a content provider registration service run by Solsynth under the authorization of the Republic of Yang's Network Information Office. Citizens of the Republic of Yang and other countries can browse websites certified by Solsynth and its partners, and support local internet enterprises in the Republic of Yang.

## What is 羝 ICP Filing?

羝 ICP Filing is a community-run friendly link collection and certification platform. Any citizen or enterprise of the Republic of Yang can submit a website. After review, the website gets a 羝 ICP filing number and a place in the public filing directory.

The directory is more than web navigation. It's the Network Information Office's endorsement of content quality, and certified websites carry the 羝 ICP badge to show it.

## Key Features

- **Website Filing Application**: Submit your website information for manual or automated review
- **Filing Directory Search**: Browse registered websites by category or keyword
- **羝 ICP Badge**: Obtain an exclusive badge after approval to display on your website footer
- **Open API**: Developers can query filing data via API, see [Suki](https://kb.solsynth.dev/images//republic-of-yang/icp-filling/) for details

## Filing Requirements

Your website must meet these requirements:

1. The website content must be legal and compliant, free of malware, fraud, or other illegal information
2. The website must be accessible with reasonable availability
3. The website owner must provide verifiable contact information
4. Compliance with the regulations of the Republic of Yang's Network Information Office

## How it works

Submit your website on the [羝 ICP Filing page](https://solsynth.dev/icp). Once approved, you get a filing number. The same page searches the directory.

## Domain Challenge

We verify domain ownership with a DNS TXT record:

1. If you have a **Solarpass** account, add a TXT record at `_roy_challenge.<your domain>` with the value being your Solarpass username (**including the @ symbol**)
2. If you don't have a Solarpass account yet, email **<lily@solsynth.dev>** first to request a challenge string, then add it to the TXT record at `_roy_challenge.<your domain>`

Once added, the system verifies and approves the filing automatically.

> **Note:** The system verification may have a delay. If the system attempts three times (each with a 24-hour interval) and still cannot find the correct TXT record, we will reject your request, and you will need to manually submit again.

## Submitting via Email

You can also apply by email instead of the online form.

Email **<lily@solsynth.dev>** with the subject **ROY 备案申请** and this information:

- **Site Name**: The name of your website
- **Site URL**: The full URL of your website
- **Domain**: Your domain name
- **Contact**: Email, Discord, or other way we can reach you
- **Notes (optional)**: Any additional information you'd like to include

**Example:**

```
To: lily@solsynth.dev
Subject: ROY 备案申请

Site Name: Solsynth
Site URL: https://solsynth.dev
Domain: solsynth.dev
Contact: lily@solsynth.dev
Notes: Official website of Solsynth
```

We review applications and reply within 7 working days.
