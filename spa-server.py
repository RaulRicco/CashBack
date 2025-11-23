#!/usr/bin/env python3
import http.server
import socketserver
import os
from pathlib import Path

PORT = 8081
DIRECTORY = "/home/root/webapp/cashback-system/dist"

class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Disable caching
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        # For SPA: serve index.html for all routes except static files
        path = self.translate_path(self.path)
        
        # If file exists, serve it
        if os.path.exists(path) and os.path.isfile(path):
            return super().do_GET()
        
        # If it's a directory, serve index.html from dist root
        # If file doesn't exist, serve index.html (SPA behavior)
        self.path = '/index.html'
        return super().do_GET()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(("", PORT), SPAHTTPRequestHandler) as httpd:
    print(f"✅ Serving SPA at http://localhost:{PORT}")
    print(f"📁 Directory: {DIRECTORY}")
    print(f"🚫 Cache: DISABLED")
    httpd.serve_forever()
