# The Opal agent: `contentful`

A specialized Opal agent that uses the nine tools from the Contentful Sandbox registry. Call it with `@contentful` in Opal chat.

- **Definition:** [opal-agent.json](opal-agent.json) is the exact agent as created. It has the nine tools and nothing else (no web browsing, no email), so it can only reach the sandbox through the API.
- **Behavior:** it names the brand, reads the brand voice with `get_content_rules` before writing, shows a preview link after every change, and publishes or unpublishes only after you clearly approve. It cannot delete anything or change slugs, brands, page types, prices, or links between pages.
- **Sharing:** only the owner can use it. The Opal default shares a new agent with the whole organization as "view", so remove that in the agent's **Share**, **Permissions** tab (General access: Only invited users) after creating it.
- **Chat exposure of the tools:** the registry's **Enabled in Chat** is off, so the nine tools are only usable by agents that list them, such as this one.

## Create it again

```bash
opal-cli agent import -f docs/opal-agent.json --validate --json   # dry run, writes nothing
opal-cli agent create -f docs/opal-agent.json --json
```

Then remove the default organization share (above). `opal-cli agent run` takes the agent's GUID (from `opal-cli agent list --search contentful --json`), not the `@` handle.

## Change it

Edit `docs/opal-agent.json`, then `opal-cli agent update <GUID> -f <patch.json> --json` with just the fields you changed (for example `prompt_template`). Update is a partial change.

## Known quirk

In command line runs, Opal includes the model's "thought process" text before the answer. That is platform output and the instructions cannot remove it.
