#!/bin/bash
IP=$(hostname -I | awk '{print $1}')
echo "Frontend: http://${IP}:3001"
echo "Backend:  http://${IP}:8001"
