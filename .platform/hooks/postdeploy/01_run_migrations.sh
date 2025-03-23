#!/bin/bash

echo "Running migrations..."
npm run migration:run || echo "Migrations failed, but continuing deployment"
