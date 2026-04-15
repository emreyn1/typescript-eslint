# Security

- **Never commit** `.env`, `*.session`, or `last_id.txt`. They identify your account and copy state.
- If you accidentally pushed secrets, rotate **API hash** at [my.telegram.org](https://my.telegram.org), revoke the old app if possible, and **delete** the leaked session file; treat the account as exposed until then.
- Report vulnerabilities via GitHub **Security advisories** (private) for this repository, not public issues.
