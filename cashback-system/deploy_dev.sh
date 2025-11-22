#!/bin/bash
echo "🚀 Deploying to DEV environment (port 8080)..."

# Create tarball of dist folder
tar -czf dist.tar.gz -C dist .

echo "📦 Deploying files to server..."
# You'll need to run this command manually with password
echo "Please run this command manually:"
echo "scp dist.tar.gz root@31.97.167.88:/tmp/"
echo "ssh root@31.97.167.88 'cd /var/www/cashback_dev && rm -rf * && tar -xzf /tmp/dist.tar.gz && rm /tmp/dist.tar.gz && systemctl reload nginx'"
