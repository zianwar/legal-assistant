#!/usr/bin/env sh

git remote add legal-assistant dokku@dokku-4nz.westus.cloudapp.azure.com:legal-assistant

export DOKKU_HOST=dokku-4nz.westus.cloudapp.azure.com

dokku apps:create legal-assistant
dokku storage:ensure-directory legal-assistant --chown false
dokku storage:mount legal-assistant /var/lib/dokku/data/storage/legal-assistant:/app/storage

# set env vars
dokku config:export legal-assistant --envfile .env.prod

dokku config:set legal-assistant DATA_DIR=/app/storage OPENAI_API_KEY=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
flyctl secrets set DATA_DIR=/data OPENAI_API_KEY=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
