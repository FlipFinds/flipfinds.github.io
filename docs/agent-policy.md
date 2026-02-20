# FlipFinds Agent Policy

## Objective
Operate a low-cost, mostly autonomous growth workflow for the FlipFinds blog and related content systems.

## Modes
- `observe`: read-only analysis and reporting; no repository writes.
- `propose`: creates draft content and status updates, then opens a pull request for human review.

## Autonomous Actions Allowed
- Generate draft blog content in `content/posts/`.
- Update operational status files in `data/`.
- Open pull requests with proposed changes.
- Update run summaries in GitHub Actions.

## Human Approval Required
- Any account creation on third-party services.
- Any paid action or ad spend.
- Any action requiring new credentials, billing, or legal acceptance.
- Any direct production change outside the repo workflow.

## Approval Labels
- `needs-approval`: action is blocked until reviewed.
- `approved-to-execute`: explicit approval to proceed.

## Safety Rules
- No direct pushes to `main` from autonomous flows.
- Proposed changes must be reviewable in PR form.
- Secrets must come from GitHub Actions secrets.
- Destructive operations are disallowed by default.
