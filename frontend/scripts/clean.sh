#!/bin/bash
echo "Cleaning up project artifacts..."

rm -rf node_modules
rm -rf .expo
rm -rf dist
rm -rf coverage

echo "Cleanup complete! Run 'npm install' to reinstall dependencies."
