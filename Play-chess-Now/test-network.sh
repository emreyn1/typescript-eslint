#!/bin/bash
echo "=== Network Test ==="
echo "Computer IP: $(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1)"
echo "Port 3000 status:"
lsof -i :3000 | grep LISTEN || echo "Port not listening"
echo ""
echo "Test from computer:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://192.168.7.97:3000 || echo "Cannot reach server"
