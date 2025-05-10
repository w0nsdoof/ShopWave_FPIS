#!/bin/bash
# Script to generate self-signed certificates for local HTTPS testing

echo "Generating self-signed certificates for local HTTPS testing..."

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "OpenSSL not found. Please install OpenSSL to generate certificates."
    exit 1
fi

# Create openssl config file
cat > openssl.cnf << EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
EOF

# Generate key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -config openssl.cnf

if [ $? -ne 0 ]; then
    echo "Failed to generate certificates!"
    exit 1
fi

# Clean up config file
rm openssl.cnf

echo ""
echo "Self-signed certificates generated successfully!"
echo "  - localhost.key: Private key"
echo "  - localhost.crt: Certificate"
echo ""
echo "You can now run test-mixed-content.sh to test your app with HTTPS"
