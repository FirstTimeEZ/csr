/**
 * Copyright © 2024 FirstTimeEZ
 * https://github.com/FirstTimeEZ
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as asn from 'simple-asn1';
import { TAGS } from 'simple-asn1';
import { extractECPoint } from './pki.js';
import { createPrivateKey, createPublicKey, sign, KeyObject } from 'crypto';

/**
 * Generates a SHA-256 Certificate Signing Request (CSR) in DER format, encoded as base64url string, following the PKCS#10 specification.
 * 
 * @param {string} commonName - The common name (CN) to be included in the CSR subject field. This typically represents the domain name or entity the certificate is for.
 * 
 * @param {KeyObject} publicKey - KeyObject of the public key to be included in the CSR.
 * 
 * @param {KeyObject} privateKey - KeyObject of the private key used to sign the CSR. Must correspond to the provided public key.
 * 
 * @param {string[]} dnsNames - Array of DNS names to use for Subject Alternative Names and Common Name                             
 * 
 * @returns {Promise<string>} A Promise that resolves to the base64url-encoded DER format CSR.
 * 
 * @throws {Error} If CSR generation fails, with the specific error message included.
 */
export async function generateCSRWithExistingKeys(commonName, publicKey, privateKey, dnsNames) {
    try {
        const publicKeySpki = publicKey.export({ format: 'pem', type: 'spki' });
        const privateKeyPkcs8 = privateKey.export({ format: 'pem', type: 'pkcs8' });

        const privKeyObj = createPrivateKey(privateKeyPkcs8);

        const subject = asn.encodeDERSequence([
            asn.encodeDERSet([
                asn.encodeDERAttribute('2.5.4.3', commonName)
            ])
        ]);

        const extensionRequest = createExtensionRequest(dnsNames);

        const certificationRequestInfo = asn.encodeDERSequence([
            Buffer.from([TAGS.INTEGER, TAGS.BOOLEAN, TAGS.ZERO]),// version
            subject,                                             // subject
            await encodeSubjectPublicKeyInfo(publicKeySpki),     // pki
            asn.encodeDERContextSpecific(0, extensionRequest)    // attributes with extension request
        ]);

        const signature = await signData(certificationRequestInfo, privKeyObj);
        const signatureAlgorithm = asn.encodeDERSequence([asn.encodeDERObjectIdentifier('1.2.840.10045.4.3.2')]);

        const csrDER = asn.encodeDERSequence([
            certificationRequestInfo,
            signatureAlgorithm,
            asn.encodeDERBitString(signature)
        ]);

        const csrString = csrDER.toString('base64url');

        console.log(csrString);

        return csrString;
    } catch (error) {
        throw new Error(`Failed to generate CSR: ${error.message}`);
    }
}

async function encodeSubjectPublicKeyInfo(publicKeyDER) {
    try {
        let derKey = publicKeyDER;
        if (typeof publicKeyDER === 'string' && publicKeyDER.includes('-----BEGIN PUBLIC KEY-----')) {
            const pemContent = publicKeyDER
                .replace('-----BEGIN PUBLIC KEY-----', '')
                .replace('-----END PUBLIC KEY-----', '')
                .replace(/\s+/g, '');
            derKey = Buffer.from(pemContent, 'base64');
        }

        const tempKey = createPublicKey({
            key: Buffer.from(derKey),
            format: 'der',
            type: 'spki'
        });

        const rawKey = tempKey.export({
            format: 'der',
            type: 'spki'
        });

        const ecPoint = extractECPoint(rawKey);

        return asn.encodeDERSequence([
            asn.encodeDERSequence([
                asn.encodeDERObjectIdentifier('1.2.840.10045.2.1'),
                asn.encodeDERObjectIdentifier('1.2.840.10045.3.1.7')
            ]),
            asn.encodeDERBitString(Buffer.concat([
                Buffer.from([TAGS.OCTET_STRING]),
                ecPoint
            ]))
        ]);
    } catch (error) {
        throw new Error(`Failed to encode SubjectPublicKeyInfo: ${error.message}`);
    }
}

function createExtensionRequest(dnsNames) {
    const extensions = [];

    if (dnsNames.length > 0) {
        extensions.push(createSANExtension(dnsNames));
    }

    return asn.encodeDERSequence([
        asn.encodeDERObjectIdentifier("1.2.840.113549.1.9.14"),
        asn.encodeDERSet([asn.encodeDERSequence(extensions)])
    ]);
}

function createSANExtension(dnsNames) {
    const generalNames = [];

    dnsNames.forEach(dns => {
        const dnsBytes = Buffer.from(dns, 'utf8');
        generalNames.push(Buffer.concat([
            Buffer.from([0x82]),
            asn.encodeDERLength(dnsBytes.length),
            dnsBytes
        ]));
    });

    const sanSequence = Buffer.concat([
        Buffer.from([TAGS.SEQUENCE]),
        asn.encodeDERLength(generalNames.reduce((sum, el) => sum + el.length, 0)),
        ...generalNames
    ]);

    return asn.encodeDERSequence([
        asn.encodeDERObjectIdentifier('2.5.29.17'),
        asn.encodeDEROctetString(sanSequence)
    ]);
}

function signData(data, privateKey) {
    return new Promise((resolve, reject) => {
        sign('sha256', data, privateKey, (err, sig) => {
            if (err) reject(new Error(`Signing failed: ${err.message}`));
            resolve(sig);
        });
    });
}