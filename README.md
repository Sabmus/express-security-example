# Example of Authentication using Google OAuth2 and Express.js

by using https protocol, we need tls certificates. It can be self-signed if you're in development, or signed by a thrusted source.

## Requirements

### self-signed cert (for development)

    openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days XXX

with XXX being the number of days the certificate is valid. this would generate "cert.pem" and "key.pem" files, and the last one is the private key.

### Google OAuth2 credentials (in google developer website)

npm uninstall passport
npm install passport@0.5
