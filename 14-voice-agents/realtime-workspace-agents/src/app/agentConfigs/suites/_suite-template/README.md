# Suite Template

Use this template to create new agent suites.

## Quick Start

1. Copy this directory: `cp -r _suite-template my-new-suite`
2. Edit `suite.config.ts` with your suite metadata
3. Create agents in `/agents` directory
4. Wire up handoffs in `index.ts`
5. Refresh app - your suite will be auto-discovered!

## File Structure

- `suite.config.ts` - Suite metadata (name, description, tags, etc.)
- `agents/` - Individual agent definitions
- `prompts.ts` - Agent system prompts
- `tools.ts` - Suite-specific tools (optional)
- `index.ts` - Suite export and handoff wiring

## Example

See `/suites/energy-focus` for a complete example.



