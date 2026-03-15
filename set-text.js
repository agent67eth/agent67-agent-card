// Set ENS text records for Agent Discovery Protocol
// Usage: node set-text.js <agent-name> (e.g., agent66.eth)
//
// Requires: PRIVATE_KEY env var with the ENS owner wallet

const { ethers } = require("ethers");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.error("Set PRIVATE_KEY env var (ENS owner wallet)");
    process.exit(1);
}

const RPC = process.env.RPC || "https://ethereum-rpc.publicnode.com";
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const PUBLIC_RESOLVER = "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63";

// Standard EADP records for each agent
const AGENT_RECORDS = {
    "agent66.eth": {
        "agent.version": "1.0",
        "agent.runtime": "hermes",
        "agent.services": "ens:research, contract:analysis, research:onchain, ens:management, monitor:wallet",
        "agent.xmtp": "0xfD80074166CD372098fa82dD5D60fB3539C179B6",
        "agent.status": "active",
        "agent.chain": "base",
        "agent.pricing": "free",
        "agent.endpoint": "https://agent66.eth.limo/.well-known/agent.json",
        "agent.github": "https://github.com/agent67eth/agent67-agent-card",
        "agent.owner": "kjjk.eth",
    },
    "agent67.eth": {
        "agent.version": "1.0",
        "agent.runtime": "openclaw",
        "agent.services": "research:web, automation:bot, social:twitter, deploy:contract, browser:automation",
        "agent.xmtp": "0x751dCe2e9B067D3995f4aAE7150747D1777A64eA",
        "agent.status": "active",
        "agent.chain": "base",
        "agent.pricing": "free",
        "agent.endpoint": "https://agent67.eth.limo/.well-known/agent.json",
        "agent.github": "https://github.com/agent67eth/agent67-agent-card",
        "agent.owner": "kjjk.eth",
    },
};

const RESOLVER_ABI = [
    "function setText(bytes32 node, string key, string value) external",
    "function text(bytes32 node, string key) view returns (string)",
    "function setAddr(bytes32 node, address addr) external",
];

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const name = process.argv[2];

    if (!name || !AGENT_RECORDS[name]) {
        console.log("Usage: node set-text.js <agent-name.eth>");
        console.log("Available:", Object.keys(AGENT_RECORDS).join(", "));
        process.exit(1);
    }

    const records = AGENT_RECORDS[name];
    const node = ethers.namehash(name);

    console.log(`Setting text records for ${name}`);
    console.log(`Wallet: ${wallet.address}`);
    console.log(`Node: ${node}`);
    console.log();

    // Use PublicResolver
    const resolver = new ethers.Contract(PUBLIC_RESOLVER, RESOLVER_ABI, wallet);

    for (const [key, value] of Object.entries(records)) {
        try {
            // Check current value
            let current;
            try { current = await resolver.text(node, key); } catch { current = null; }

            if (current === value) {
                console.log(`  ✓ ${key}: "${value}" (already set)`);
                continue;
            }

            console.log(`  → ${key}: "${value}" (was: "${current || "unset"}")`);
            const tx = await resolver.setText(node, key, value);
            await tx.wait();
            console.log(`    ✅ TX: ${tx.hash}`);

        } catch (e) {
            console.log(`    ❌ ${e.message.slice(0, 100)}`);
        }
    }

    console.log(`\nDone. Verify at https://app.ens.domains/${name}`);
}

main().catch(e => console.error(e.message));
