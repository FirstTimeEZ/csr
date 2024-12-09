# Simple Certificate Signing Request Generator (CSR)

A robust and secure JavaScript library for generating Certificate Signing Requests (CSRs)

This library follows the `PKCS#10` specification and implements CSR generation with `SHA-256` signing.

## Features

- `PKCS#10` compliant implementation
- `DNS` Subject Alternative Names (`SAN`)
- `DER` encoding with `base64url` output format

## Usage

```javascript
import { generateCSRWithExistingKeys } from 'simple-csr-generator';

async function generateCSR(publicKeyES256, privateKeyES256) {
    try {
        const commonName = 'www.ssl.boats';
        const dnsNames = ["www.ssl.boats", "ssl.boats"];

        const csr = await generateCSRWithExistingKeys(commonName, publicKeyES256, privateKeyES256, dnsNames);
                
        console.log('Generated CSR:', csr);
    } catch (error) {
        console.error('Failed to generate CSR:', error);
    }
}
```

-----------------------

## API Reference

### generateCSRWithExistingKeys(commonName, publicKey, privateKey, dnsNames)

Generates a `SHA-256` Certificate Signing Request (CSR) in `DER` format, encoded as `base64url` string, following the `PKCS#10` specification.

#### Parameters

- `commonName` (string): The common name (`CN`) to be included in the `CSR` subject field.
- `publicKey` (KeyObject): The public key to be included in the `CSR`.
- `privateKey` (KeyObject): The private key that corresponds to the provided public key.
- `dnsNames` (array): Array of DNS names to use for Subject Alternative Names (`SAN`)

#### Returns

- `Promise<string>`: Base64URL-encoded `DER` format `CSR`

-----------------------

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For major changes, please open an issue first to discuss what you would like to change.

## Acknowledgments

- [`RFC 2986`](https://tools.ietf.org/html/rfc2986) - `PKCS #10`: Certification Request Syntax Specification

---

Made with ❤️ by `FirstTimeEZ`