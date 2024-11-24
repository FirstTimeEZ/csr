# CSR (Certificate Signing Request) Generator

A robust and secure JavaScript library for generating Certificate Signing Requests (CSRs) using existing key pairs. 

This library follows the `PKCS#10` specification and implements CSR generation with `ECDSA` keys and SHA-256 signing.

## Features

- Generate `CSRs` using existing `ECDSA` key pairs
- DER encoding with `base64url` output format
- `PKCS#10` compliant implementation
- Secure cryptographic operations using native `Web Crypto API`

## Usage

Here's a basic example of generating a CSR:

```javascript
import { generateCSRWithExistingKeys } from './csr.js';

async function generateCSR() {
    try {
        const commonName = 'example.com';
        
        const csr = await generateCSRWithExistingKeys(
            commonName,
            publicKeyObject,
            privateKeyObject
        );
        
        console.log('Generated CSR:', csr);
    } catch (error) {
        console.error('Failed to generate CSR:', error);
    }
}
```

-----------------------

## API Reference

### generateCSRWithExistingKeys(commonName, publicKey, privateKey)

Generates a Certificate Signing Request using existing public and private key pairs.

#### Parameters

- `commonName` (string): The common name (CN) for the CSR subject field
- `publicKey` (CryptoKey): `ECDSA` public key as a CryptoKey object
- `privateKey` (CryptoKey): `ECDSA` private key corresponding to the public key

#### Returns

- `Promise<string>`: Base64URL-encoded DER format CSR

#### Throws

- `Error`: If CSR generation fails, with detailed error message

-----------------------

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 

For major changes, please open an issue first to discuss what you would like to change.

## Acknowledgments

- [`RFC 2986`](https://tools.ietf.org/html/rfc2986) - `PKCS #10`: Certification Request Syntax Specification
- [`Web Crypto API`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

Made with ❤️ by `FirstTimeEZ`