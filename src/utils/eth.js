const ethers = require("ethers");

function getUserOpHash(op, entryPointAddress, chainId) {
    const encoder = new ethers.AbiCoder()
    const packedData = encoder.encode(
        [
            "address",
            "uint256",
            "bytes32",
            "bytes32",
            "uint256",
            "uint256",
            "uint256",
            "uint256",
            "uint256",
            "bytes32",
        ],
        [
            op.sender,
            op.nonce,
            ethers.keccak256(op.initCode),
            ethers.keccak256(op.callData),
            op.callGasLimit,
            op.verificationGasLimit,
            op.preVerificationGas,
            op.maxFeePerGas,
            op.maxPriorityFeePerGas,
            ethers.keccak256(op.paymasterAndData)
        ]
    );

    const encoded = encoder.encode(
        ["bytes32", "address", "uint256"],
        [
            ethers.keccak256(packedData),
            entryPointAddress,
            chainId
        ]
    );

    return ethers.keccak256(encoded);
}

function sign(msg) {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const signer = new ethers.Wallet(PRIVATE_KEY);
    return signer.signMessage(ethers.getBytes(msg));
}

module.exports = {
    getUserOpHash,
    sign
}
