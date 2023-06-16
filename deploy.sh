#!/usr/bin/env sh

git remote add legal-assistant.4nz.io dokku@dokku-4nz.westus.cloudapp.azure.com:legal-assistant.4nz.io

export DOKKU_HOST=dokku-4nz.westus.cloudapp.azure.com

dokku apps:create legal-assistant.4nz.io
dokku storage:ensure-directory legal-assistant --chown false
dokku storage:mount legal-assistant.4nz.io /var/lib/dokku/data/storage/legal-assistant:/app/storage

# set env vars
dokku config:export legal-assistant.4nz.io --envfile .env.prod

dokku config:set legal-assistant.4nz.io DATA_DIR=/app/storage OPENAI_API_KEY=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
flyctl secrets set DATA_DIR=/data OPENAI_API_KEY=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
