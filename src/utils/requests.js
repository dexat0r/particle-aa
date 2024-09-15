const axios = require("axios").default;
const uuid = require("uuid").v4;

class ParticleRequests {
    rpcClient;
    paymasterClient;
    chainId;

    constructor(chainId) {
        this.chainId = chainId;
        this.rpcClient = axios.create({
            baseURL: 'https://rpc.particle.network/evm-chain/',
            auth: {
                username: process.env.PARTICLE_PROJECT_ID,
                password: process.env.PARTICLE_SERVER_KEY
            }
        });

        this.paymasterClient = axios.create({
            baseURL: "https://paymaster.particle.network",
            params: {
                projectUuid: process.env.PARTICLE_PROJECT_ID,
                projectKey: process.env.PARTICLE_SERVER_KEY,
                chainId
            }
        });
    }

    makeRequest(method, params) {
        return {
            jsonrpc: "2.0",
            id: uuid(),
            chainId: this.chainId,
            method,
            params
        }
    }

    rpcRequests = {
        getWalletInfo: (acc) => this.wrapRequest(this.rpcClient.post('#particle_aa_getSmartAccount', this.makeRequest("particle_aa_getSmartAccount", [acc]))),
        createOperation: (acc, txs) => this.wrapRequest(this.rpcClient.post('#particle_aa_createUserOp', this.makeRequest("particle_aa_createUserOp", [acc, txs]))),
        getFeeQuotes: (acc, txs) => this.wrapRequest(this.rpcClient.post('#particle_aa_getFeeQuotes', this.makeRequest("particle_aa_getFeeQuotes", [acc, txs]))),
        sendOperation: (acc, op) => this.wrapRequest(this.rpcClient.post('#particle_aa_sendUserOp', this.makeRequest("particle_aa_sendUserOp", [acc, op])))
    }

    paymasterRequests = {
        getBalance: () => this.wrapRequest(this.paymasterClient.post('', this.makeRequest('pm_paymasterBalance', []))),
        sponsorUserOp: (op, entryPointAddress) => this.wrapRequest(this.paymasterClient.post('', this.makeRequest('pm_sponsorUserOperation', [op, entryPointAddress])))
    }

    wrapRequest = (request) => request.then(res => {
        if (res.data.result) { return res.data.result }
        console.log(res.data.error, res.config);
        throw res.data.error.message;
    })

    get requests() {
        return {
            rpc: this.rpcRequests,
            paymaster: this.paymasterRequests
        }
    }
}

module.exports = ParticleRequests;
