---
title: "中羊网备"
description: "Republic of Yang's friendly link list"
icon: "/images/republic-of-yang/filling.png"
background: "/images/republic-of-yang/greatwall.webp"
url: "https://solsynth.dev/icp"
repo: "https://github.com/Solsynth/Capital.Next"
version: "1.0.0"
releasedDate: "2026-05-24"
hasPage: true
tags: ["Community"]
series: "Republic of Yang"
---

**免责声明：本服务是受到 [萌国 ICP](https://icp.gov.moe) 启发的友链项目，和中华人民共和国工业和信息化部提供的 ICP 备案没有任何关系，不具任何法律效应。本页面描述的任何主体都是在架空世界观下的虚构主体，不代表现实中任何的主体，如有雷同，纯属巧合。我们不为列表中的任何网站提供担保，对于其可能遭受的 DNS 污染 / 劫持等引发的安全问题以及诈骗风险，我们不承担任何责任。**

_叠甲的部份结束了，现在是幻想时间 >\_<_

**羝 (dī) ICP 备**是由中华羊国网络信息办公室授权索尔幸兹设立的一套网络内容提供商 (Internet Content Provider aka ICP) 的备案服务。
方便让羊国以及其他国家的公民查阅到受 Solsynth 及其合作伙伴认证的网站，提高网络世界的内容质量以及扶持羊国本土互联网企业发展的计划。

## 什么是羝 ICP 备？

羝 ICP 备是一个基于社区驱动的友链收录与认证平台。任何羊国公民或企业都可以提交自己的网站，经过审核后即可获得羝 ICP 备案号，并被收录到公开的备案列表中。

备案列表不仅是一个网站导航，更是羊国网络信息办公室对羊国互联网内容质量的一种背书。获得备案的网站将展示羝 ICP 标志，象征其在羊国网络空间中的可信身份。

## 主要功能

- **网站备案申请**：提交网站信息，等待人工或自动化审核
- **备案列表查询**：按分类、关键词检索已备案的网站
- **羝 ICP 标志**：通过备案后获取专属标志，展示在网站底部
- **开放 API**：开发者可通过 API 查询备案数据，详情见 [Suki](https://kb.solsynth.dev/zh/republic-of-yang/icp-filling/)

## 备案要求

要获得羝 ICP 备案，网站需满足以下基本要求：

1. 网站内容合法合规，不包含恶意软件、诈骗或其他违法信息
2. 网站能够正常访问，具备基本的可用性
3. 网站所有者需提供真实可查的联系方式
4. 遵守羊国网络信息办公室的相关规定

## 如何使用

在 [羝 ICP 备案页面](https://solsynth.dev/icp) 提交您的网站信息，审核通过后即可获得备案号。您也可以在该页面搜索和浏览已备案的网站。

## 域名验证

为了验证您对域名的所有权，您需要通过 DNS TXT 记录完成挑战：

1. 如果您拥有 **Solarpass** 账户，直接在 `_roy_challenge.<您的域名>` 添加一条 TXT 记录，值为您的 Solarpass 用户名（**包含 @ 符号**）
2. 如果您还没有 Solarpass 账户，请先发送邮件至 **<lily@solsynth.dev>** 申请一个挑战字符串，然后将其添加到 `_roy_challenge.<您的域名>` 的 TXT 记录中

添加完成后，系统会自动验证并通过备案。

> **注意：** 系统验证可能存在延迟。如果系统尝试三次（每次间隔 24 小时）后仍无法找到正确的 TXT 记录，我们将拒绝您的申请，届时您需要重新手动提交。

## 通过邮件提交

如果您不方便使用在线表单，也可以通过邮件提交备案申请。

发送邮件至 **<lily@solsynth.dev>**，主题为 **ROY 备案申请**，并在邮件中包含以下信息：

- **网站名称**：您的网站名称
- **网站地址**：您的网站完整 URL
- **域名**：您的域名
- **联系方式**：邮箱、Discord 或其他能联系到您的方式
- **补充说明（可选）**：您想补充的任何信息

**示例：**

```
收件人: lily@solsynth.dev
主题: ROY 备案申请

网站名称: Solsynth
网站地址: https://solsynth.dev
域名: solsynth.dev
联系方式: lily@solsynth.dev
补充说明: Solsynth 官方网站
```

我们将在 7 个工作日内审核并与您联系。
