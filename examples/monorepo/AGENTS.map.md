# AGENTS.map

This file lists where nested AGENTS.md files live and what they're for.
The AGENTS.md files themselves are authoritative for their subtrees.

## Entries

- Path: /AGENTS.md
  - Purpose: Global repo conventions: language standards, commit message format, CI/CD pipeline rules, and PR review expectations.
  - Applies to: /**
  - Priority: high
  - Last modified: 2026-02-15
  - Owners: @platform-team

- Path: /services/auth/AGENTS.md
  - Purpose: Authentication service rules: OAuth2 flows, token handling, session management. Security-sensitive — all changes require @security-team review.
  - Applies to: /services/auth/**
  - Priority: critical
  - Last modified: 2026-02-20
  - Owners: @identity-team, @security-team

- Path: /services/payments/AGENTS.md
  - Purpose: Payments domain rules, PCI-DSS constraints, Stripe integration patterns, test fixtures with sanitized card numbers.
  - Applies to: /services/payments/**
  - Priority: critical
  - Last modified: 2026-02-18
  - Owners: @payments-team

- Path: /services/notifications/AGENTS.md
  - Purpose: Notification service: email/SMS/push templates, rate limiting rules, provider abstraction layer.
  - Applies to: /services/notifications/**
  - Owners: @comms-team

- Path: /packages/ui/AGENTS.md
  - Purpose: Shared component library: design tokens, accessibility requirements (WCAG 2.1 AA), Storybook conventions, visual regression testing.
  - Applies to: /packages/ui/**
  - Owners: @design-systems

- Path: /packages/utils/AGENTS.md
  - Purpose: Shared utilities: date formatting, validation helpers, API client wrappers. Zero external dependencies policy.
  - Applies to: /packages/utils/**
  - Owners: @platform-team

- Path: /apps/web/AGENTS.md
  - Purpose: Main web application: Next.js conventions, SSR/ISR rules, route organization, state management patterns.
  - Applies to: /apps/web/**
  - Owners: @web-team

- Path: /apps/mobile/AGENTS.md
  - Purpose: React Native mobile app: platform-specific code conventions, native module bridging, app store submission checklist.
  - Applies to: /apps/mobile/**
  - Owners: @mobile-team

- Path: /infra/AGENTS.md
  - Purpose: Infrastructure-as-code: Terraform conventions, GitHub Actions workflows, environment promotion rules. Changes require @devops approval.
  - Applies to: /infra/**, /terraform/**, /.github/**
  - Owners: @devops
