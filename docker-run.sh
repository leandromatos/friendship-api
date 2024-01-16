#!/bin/bash

# Run the docker-compose file to start the database and the api
docker-compose -f docker-compose.yaml up -d --build
