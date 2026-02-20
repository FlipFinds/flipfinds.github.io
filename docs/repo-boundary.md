# Repository Boundary

This repository (`flipfinds.github.io`) is the public Hugo site repository only.

## In Scope (Public)
- Hugo content and configuration
- Theme and layout files
- GitHub Pages build/deploy workflow (`.github/workflows/hugo.yml`)
- Public-safe data used by site pages

## Out of Scope (Private)
- Agent orchestration logic
- Growth automation workflows
- Approval routing logic
- Any operational strategy details

Use a separate private repository (for example, `flipfinds-growth-agent`) for autonomous agent workflows, then have that private repo open pull requests into this public site repo.
