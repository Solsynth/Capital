---
lang: en
title: Solar Network Developer Agreement
description: This agreement outlines the terms, rules, and guidelines that developers must understand and follow to ensure the safety, fairness, and sustainability of the Solar Network platform.
updatedDate: '2025-09-12'
---

# Solar Network Developer Agreement

Welcome to Solar Network’s developer services. Before you begin developing with Solar Network’s interfaces, APIs, or other features, please carefully read and agree to this Agreement. This Agreement constitutes a legally binding agreement between you and Solar Network. If you do not agree with any terms of this Agreement, please do not use Solar Network’s developer services.

## Definitions

- **Developer**: Refers to any individual or entity that accesses or uses Solar Network server resources through means other than the official client. This includes but is not limited to users registered in the developer program, users building content management systems using the Solar Network posts API, users of third-party clients, and other actions that directly call the API without using the official client.
- **Third-Party Client**: Refers to applications, tools, or services not developed by Solar Network, used to access Solar Network’s features.
- **Services**: Refers to Solar Network’s APIs, interfaces, data resources, and other developer tools.
- **User**: Refers to registered Solar Network users, including developers themselves.

## Scope of the Agreement

This Agreement applies to all actions performed as a Developer interacting with Solar Network services, including but not limited to API calls, data access, content creation, and use of third-party clients. Whether or not you are registered in the developer program, if your actions meet the definition of a Developer, you must comply with this Agreement.

If you are acting on behalf of an organization or entity, you represent and warrant that you have the authority to bind that organization or entity to this Agreement, and you ensure that the organization or entity complies with this Agreement.

## Service Availability and Guarantees

Solar Network does not provide any express or implied guarantees regarding the availability, continuity, or performance of its services. Services may be interrupted or unavailable due to maintenance, upgrades, network issues, or other reasons. You should design appropriate fault-tolerance mechanisms in your applications to handle service unavailability.

You can check the current status of Solar Network services via the [Service Status Page](https://status.solsynth.dev) to troubleshoot network or client issues.

Solar Network reserves the right to modify, suspend, or terminate services at any time without prior notice.

## Content Moderation and Risk Control Policies

To maintain the platform’s ecosystem and prevent spam, abuse, or malicious behavior, Solar Network implements risk control measures (rate limiting and restrictions) on content creation and access requests from non-official clients. The following behaviors may trigger risk controls:

1. **High-Frequency Operations**: Excessive posting, messaging, file uploads, or resource creation in a short period.
2. **Account Abuse**: Creating multiple user accounts (including unactivated accounts) from the same IP address in a short period.
3. **Data Scraping**: Repeatedly requesting large amounts of data (e.g., posts or user lists) in a short period, accompanied by suspicious parameter changes (e.g., continuous adjustments to offset values).

If risk controls are triggered, the server will return the following HTTP status codes:
- **429 Too Many Requests**: Request frequency is too high; please wait before retrying.
- **423 Locked**: The resource is temporarily locked. You may include a valid CAPTCHA verification token (`X-Captcha-Token`) in the request header to bypass the restriction.

For malicious or repeated violations, Solar Network administrators may permanently block the associated IP address, resulting in loss of access to services. Solar Network also reserves the right to pursue legal action.

Developers should ensure their applications adhere to reasonable rate limits and implement rate-limiting mechanisms to avoid triggering risk controls.

## Third-Party Client Development Guidelines

Solar Network encourages the development of third-party clients to promote ecosystem diversity. However, before releasing or distributing your client, you must ensure it meets the following standards. Violations may result in the banning of your Solar Network account and the accounts of users utilizing your client.

1. **Transparency Disclosure**:
   - Clearly indicate that the client is third-party developed and provide developer information (e.g., name, contact details) and links to relevant user agreements.
   - Do not mislead users into believing it is an official client.
   - Link to this Developer Agreement at key locations, such as registration or login pages, to ensure users understand and agree to the terms.

2. **Permissions and Feature Restrictions**:
   - Do not diminish the exclusive benefits of Solar Network Stellar Plan subscribers or extend permissions to regular users.
   - For example, do not provide Stellar Plan-exclusive features (e.g., translation) to regular users, including through BYOK (Bring Your Own Key) or third-party APIs to bypass Solar Network servers.

3. **Data Privacy and Security**:
   - Do not disclose user data or privacy, including but not limited to uploading chat logs, access tokens, or other sensitive information to third-party servers.
   - Telemetry data (e.g., usage statistics) must be anonymized and must not include user-identifying information (e.g., usernames, IDs, or IP addresses).
   - Comply with applicable data protection regulations (e.g., GDPR or CCPA) and implement appropriate security measures (e.g., encrypted transmission).

4. **User-Agent Requirements**:
   - Set a clear User-Agent string for all requests, e.g., `BetterThanSolian/1.0 (Android; Build/123)`, including the client name, version, and platform information.
   - Pure web-based clients (e.g., JavaScript-based) are exempt from setting User-Agent due to technical limitations.
   - Do not forge User-Agent strings, including those of the official client, other third-party clients, or standard browsers.

5. **Prohibited Features**:
   - Do not implement multi-account login functionality.
   - Do not record or store deleted messages, posts, or edit history versions.
   - Do not implement features that assist users in violating the Solar Network User Agreement, such as automated spamming, data scraping, or bypassing content moderation.

6. **Compliance Review**:
   - Before release, self-audit your client to ensure compliance with the above standards.
   - Solar Network may review third-party clients at any time and may request developers to provide source code or documentation to verify compliance.

## Intellectual Property

- Solar Network retains all intellectual property rights to its APIs, data, and services. You are granted a limited, non-exclusive license to develop and use the services in accordance with this Agreement.
- You must not copy, modify, reverse-engineer, or distribute Solar Network’s proprietary code, data, or content without written permission.
- Any content you create (e.g., posts) grants Solar Network a non-exclusive, worldwide license to store, distribute, and display upon upload to Solar Network.

## Termination and Changes

- Solar Network may terminate your access to services at any time without notice, particularly in cases of violations.
- This Agreement may be updated from time to time. Continued use of the services after updates constitutes acceptance of the new version. We will notify you of updates through appropriate means.
- If you violate this Agreement, Solar Network may suspend or permanently ban your account and notify affected users.

By using Solar Network developer services, you confirm that you have read, understood, and agree to this Agreement.
