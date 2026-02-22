# AGENTS.map

This file lists where nested AGENTS.md files live and what they're for.
The AGENTS.md files themselves are authoritative for their subtrees.

## Entries

- Path: /AGENTS.md
  - Purpose: Shell application rules: module federation config, shared dependency versioning, routing conventions between micro-frontends.
  - Applies to: /**
  - Owners: @platform-fe
  - Tags: global, frontend

- Path: /shell/AGENTS.md
  - Purpose: App shell: layout system, navigation chrome, authentication wrapper, module loading and error boundaries.
  - Applies to: /shell/**
  - Owners: @platform-fe

- Path: /mfe/dashboard/AGENTS.md
  - Purpose: Dashboard micro-frontend: widget system, data fetching patterns, real-time update conventions via WebSocket.
  - Applies to: /mfe/dashboard/**
  - Owners: @dashboard-team
  - Tags: mfe

- Path: /mfe/settings/AGENTS.md
  - Purpose: Settings micro-frontend: form validation rules, preference persistence, feature flag integration.
  - Applies to: /mfe/settings/**
  - Owners: @settings-team
  - Tags: mfe

- Path: /mfe/checkout/AGENTS.md
  - Purpose: Checkout micro-frontend: payment form PCI compliance, cart state management, order submission flow.
  - Applies to: /mfe/checkout/**
  - Owners: @commerce-team, @security-team
  - Tags: mfe, compliance

- Path: /shared/components/AGENTS.md
  - Purpose: Cross-MFE shared components: design system primitives, theming API, accessibility requirements.
  - Applies to: /shared/components/**
  - Owners: @design-systems
  - Tags: shared, a11y

- Path: /shared/state/AGENTS.md
  - Purpose: Cross-MFE state sharing: event bus conventions, shared store patterns, inter-MFE communication contracts.
  - Applies to: /shared/state/**
  - Owners: @platform-fe
  - Tags: shared
