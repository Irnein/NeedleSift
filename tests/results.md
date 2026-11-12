# NeedleSift accuracy test results

Run: 2026-11-12 17:57 against `https://needlesift-297927793190.asia-southeast1.run.app`  
Dataset: 18 synthetic alerts modelled on real ATT&CK techniques; answer key written by the team and reviewed by a NOC intern.

| Measure | Correct | Accuracy |
| --- | --- | --- |
| Verdict (real threat vs false alarm) | 17/17 | 100% |
| Escalate decision | 15/17 | 88% |
| Severity, exact match | 11/17 | 65% |
| Severity, within one level | 17/17 | 100% |
| Average time per alert | | 5.7 s |

## Where Gemini disagreed with the answer key

| Alert | Event | Expected (severity / verdict / escalate) | Gemini | Gemini's reasoning |
| --- | --- | --- | --- | --- |
| ALT-002 | brute_force_success | critical / true_positive / True | high / true_positive / True |  An external IP address successfully logged into server SRV-FILE-01 as admin after 214 failed SSH password attempts, indicating a successful brute-force attack. |
| ALT-003 | malware_detected | critical / true_positive / True | high / true_positive / True | A trojan malware file was downloaded by student150 on host LAB-PC-12, and automatic antivirus quarantine failed. |
| ALT-004 | credential_access | high / true_positive / True | critical / true_positive / True | A suspicious file spawned by Microsoft Word accessed user staff017's saved Chrome passwords on host STAFF-PC-03. |
| ALT-005 | outbound_c2_beacon | high / true_positive / True | critical / true_positive / True | A student computer is repeatedly communicating with an unknown external server every 60 seconds over an unusual port, strongly indicating an active malware command-and-control connection. |
| ALT-007 | port_scan | medium / true_positive / False | medium / true_positive / True | A student computer on the lab network scanned 1,200 ports across the server subnet within two minutes. |
| ALT-008 | repeated_failed_vpn_login | medium / true_positive / False | medium / true_positive / True | The account student117 experienced 18 failed VPN login attempts within 10 minutes from an external IP address. |
| ALT-009 | admin_login_off_hours | medium / true_positive / True | high / true_positive / True | An IT administrator account logged into a key server via Remote Desktop at 3:12 AM from an unfamiliar computer without a registered change ticket. |
| ALT-011 | phishing_link_clicked | high / true_positive / True | critical / true_positive / True | User student201 clicked on a malicious phishing link in an email and submitted their credentials on an external fake login page. |

## Failed calls

- ALT-010: The read operation timed out
