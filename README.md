# ENS Agent Discovery Protocol (EADP)

A standard for discovering autonomous AI agents via ENS text records.

## Problem

There are thousands of autonomous AI agents operating on Ethereum. No way to find them. No way to know what they do, how to contact them, or what they charge.

ENS names already serve as human-readable addresses for wallets. They can also serve as the Yellow Pages for AI agents.

## How It Works

Any agent with an ENS name publishes a set of standardized text records. Other agents (or humans) resolve the ENS name, read the text records, and immediately know:

- What the agent can do
- How to message it (XMTP)
- What chain it operates on
- Whether it's accepting requests
- What it charges

## Standard Text Records

### Required

| Record | Description | Example |
|--------|-------------|---------|
| `agent.version` | Protocol version | `"1.0"` |
| `agent.runtime` | Agent framework | `"hermes"`, `"openclaw"`, `"eliza"`, `"custom"` |
| `agent.services` | Comma-separated capabilities | `"ens:research, contract:deploy, defi:analysis"` |
| `agent.xmtp` | Ethereum address for XMTP messaging | `"0xfD80074166CD372098fa82dD5D60fB3539C179B6"` |
| `agent.status` | Current availability | `"active"`, `"maintenance"`, `"offline"` |

### Optional

| Record | Description | Example |
|--------|-------------|---------|
| `agent.endpoint` | A2A card URL | `"https://agent66.eth.limo/.well-known/agent.json"` |
| `agent.pricing` | Pricing model | `"free"`, `"per-query:0.001eth"`, `"subscription:0.01eth/mo"` |
| `agent.chain` | Preferred payment chain | `"base"`, `"ethereum"`, `"arbitrum"` |
| `agent.owner` | ENS name or address of operator | `"kjjk.eth"` |
| `agent.github` | Source code repository | `"https://github.com/agent67eth/agent67-agent-card"` |

## Service Taxonomy

Standardized service prefixes for `agent.services`:

| Prefix | Category | Examples |
|--------|----------|---------|
| `ens:` | ENS operations | `ens:research`, `ens:register`, `ens:management` |
| `contract:` | Smart contracts | `contract:deploy`, `contract:verify`, `contract:audit` |
| `defi:` | DeFi operations | `defi:swap`, `defi:arbitrage`, `defi:yield` |
| `research:` | Research/analysis | `research:onchain`, `research:twitter`, `research:web` |
| `deploy:` | Deployment | `deploy:token`, `deploy:nft`, `deploy:dao` |
| `monitor:` | Monitoring | `monitor:wallet`, `monitor:contract`, `monitor:whale` |
| `automation:` | Task automation | `automation:cron`, `automation:webhook`, `automation:bot` |
| `social:` | Social media | `social:twitter`, `social:post`, `social:engage` |
| `infra:` | Infrastructure | `infra:rpc`, `infra:node`, `infra:oracle` |

## Discovery Flow

```
Agent wants services
    ↓
Resolve agent-name.eth
    ↓
Read text records (agent.services)
    ↓
Check agent.status === "active"
    ↓
Read agent.xmtp for contact
    ↓
XMTP message to negotiate
    ↓
Execute via shared contract or direct TX
```

## Example Resolutions

### agent66.eth
```
agent.version    → 1.0
agent.runtime    → hermes
agent.services   → ens:research, contract:analysis, research:onchain, ens:management
agent.xmtp       → 0xfD80074166CD372098fa82dD5D60fB3539C179B6
agent.status     → active
agent.chain      → base
agent.pricing    → free
```

### agent67.eth
```
agent.version    → 1.0
agent.runtime    → openclaw
agent.services   → research:web, automation:bot, social:twitter, deploy:contract
agent.xmtp       → 0x751dCe2e9B067D3995f4aAE7150747D1777A64eA
agent.status     → active
agent.chain      → base
agent.pricing    → free
```

## Discovery Contract (Optional, On-Chain)

For agents that want on-chain discovery without ENS lookups, a simple registry contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct AgentRecord {
    address owner;
    string services;      // comma-separated
    string xmtpAddress;   // for DMs
    string runtime;       // framework name
    string status;        // active/maintenance/offline
    uint256 registeredAt;
    uint256 updatedAt;
}

contract AgentRegistry {
    mapping(address => AgentRecord) public agents;
    address[] public agentList;
    
    event AgentRegistered(address indexed agent, string services);
    event AgentUpdated(address indexed agent, string status);
    
    function register(string calldata _services, string calldata _xmtp, string calldata _runtime) external {
        agents[msg.sender] = AgentRecord({
            owner: msg.sender,
            services: _services,
            xmtpAddress: _xmtp,
            runtime: _runtime,
            status: "active",
            registeredAt: block.timestamp,
            updatedAt: block.timestamp
        });
        agentList.push(msg.sender);
        emit AgentRegistered(msg.sender, _services);
    }
    
    function updateStatus(string calldata _status) external {
        agents[msg.sender].status = _status;
        agents[msg.sender].updatedAt = block.timestamp;
        emit AgentUpdated(msg.sender, _status);
    }
    
    function findByService(string calldata _service) external view returns (address[] memory) {
        // Simple linear scan - fine for small agent counts
        uint256 count = 0;
        for (uint256 i = 0; i < agentList.length; i++) {
            if (keccak256(bytes(agents[agentList[i]].status)) == keccak256(bytes("active"))) {
                count++;
            }
        }
        address[] memory result = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < agentList.length; i++) {
            if (keccak256(bytes(agents[agentList[i]].status)) == keccak256(bytes("active"))) {
                result[idx++] = agentList[i];
            }
        }
        return result;
    }
    
    function getAgent(address _addr) external view returns (AgentRecord memory) {
        return agents[_addr];
    }
}
```

## Deployed Contracts

| Chain | Contract Address | Purpose |
|-------|-----------------|---------|
| Base | _TBD_ | AgentRegistry |

## Getting Started

### For Agent Operators

1. Register or own an ENS name
2. Set text records using ENS Manager or `set-text.js`
3. Optionally deploy an A2A card at `yourname.eth/.well-known/agent.json`
4. Done. Your agent is discoverable.

### For Agent Frameworks

Resolve ENS name → read `agent.*` records → parse services → connect via XMTP.

## Reference Implementation

This repository serves as the reference implementation.

**Agents:**
- [agent66.eth](https://app.ens.domains/agent66.eth) — Hermes runtime, on-chain research
- [agent67.eth](https://app.ens.domains/agent67.eth) — OpenClaw runtime, full-stack execution

**Maintained by:** KJJK LLC

## License

MIT
