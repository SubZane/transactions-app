#!/bin/bash

# Environment Database Setup Script
# This script helps manage different database environments

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DATA_DIR="./data"
BACKEND_DIR="./backend/database"

echo -e "${BLUE}Environment Database Setup${NC}"
echo "================================"

# Ensure data directory exists
if [ ! -d "$DATA_DIR" ]; then
    echo -e "${YELLOW}Creating data directory...${NC}"
    mkdir -p "$DATA_DIR"
fi

# Check if main database exists
if [ ! -f "$DATA_DIR/database.sqlite" ]; then
    echo -e "${RED}Error: Main database not found at $DATA_DIR/database.sqlite${NC}"
    echo "Please ensure your main database exists first."
    exit 1
fi

echo -e "${GREEN}Main database found${NC}"

# Create server database if it doesn't exist
if [ ! -f "$DATA_DIR/database-server.sqlite" ]; then
    echo -e "${YELLOW}Creating server database...${NC}"
    cp "$DATA_DIR/database.sqlite" "$DATA_DIR/database-server.sqlite"
    echo -e "${GREEN}Server database created${NC}"
else
    echo -e "${BLUE}Server database already exists${NC}"
fi

# Create preview database if it doesn't exist
if [ ! -f "$DATA_DIR/database-preview.sqlite" ]; then
    echo -e "${YELLOW}Creating preview database...${NC}"
    cp "$DATA_DIR/database.sqlite" "$DATA_DIR/database-preview.sqlite"
    echo -e "${GREEN}Preview database created${NC}"
else
    echo -e "${BLUE}Preview database already exists${NC}"
fi

echo ""
echo -e "${GREEN}Database setup complete!${NC}"
echo ""
echo "Available databases:"
echo "• Development & Preview: $DATA_DIR/database-preview.sqlite"
echo "• Server: $DATA_DIR/database-server.sqlite"
echo "• Original: $DATA_DIR/database.sqlite (backup)"
echo ""
echo "Environment detection:"
echo "• Development: localhost:5173 (dev server) → uses preview database"
echo "• Preview: localhost:3000 or localhost:4173 → uses preview database"
echo "• Server: Production domains (non-localhost) → uses server database"
echo ""
echo -e "${YELLOW}Note: You can also set the environment manually by:${NC}"
echo "• Setting HTTP_X_APP_ENV header"
echo "• Adding ?env=server|preview|development to URL"
echo "• Setting APP_ENV environment variable"
