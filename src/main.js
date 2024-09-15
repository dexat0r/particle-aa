const dotenv = require("dotenv");
dotenv.config();

const ParticleRequests = require("./utils/requests");
const { getUserOpHash, sign } = require("./utils/eth");
const { sepolia } = require("viem/chains")

async function main() {
    const chainId = sepolia.id // Chain id
    const publicKey = process.env.PUBLIC_KEY; // account owner (public key)

    const { rpc, paymaster } = new ParticleRequests(chainId).requests;

    const acc = {
        name: "SIMPLE", // SIMPLE, BICONOMY, CYBERCONNECT, LIGHT, XTERIO
        version: "1.0.0",
        ownerAddress: publicKey
    };

    const tx = { // simple tx to deploy wallet
        to: publicKey,
        value: "0x0",
    }

    const [wallet] = await rpc.getWalletInfo(acc);

    if (!wallet.isDeployed) {

        const { userOp } = await rpc.createOperation(acc, [tx]);
        const { paymasterAndData } = await paymaster.sponsorUserOp(userOp, wallet.entryPointAddress)

        const paymasteredOp = {
            ...userOp,
            paymasterAndData
        }

        const paymasteredOpHash = getUserOpHash(paymasteredOp, wallet.entryPointAddress, chainId);

        const signature = await sign(paymasteredOpHash);

        const signedPaymasteredOp = {
            ...paymasteredOp,
            signature
        }

        const txHash = await rpc.sendOperation(acc, signedPaymasteredOp);

        console.log(txHash)
        console.log(`Wallet deployed`);
    }

    console.log(wallet)
}


main().catch(err => console.log(err));
