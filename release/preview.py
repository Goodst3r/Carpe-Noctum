#!/usr/bin/env python3
"""Byte-preserving development server launched by the managed Sites preview."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse, os

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', '4173')))
parser.add_argument('--host', default='0.0.0.0')
parser.add_argument('--strictPort', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent / 'dist'
class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.webmanifest': 'application/manifest+json', '.js': 'text/javascript'}
    def translate_path(self, path):
        aliases={'/android':'/android.html','/iphone':'/iphone.html','/install':'/install.html','/guide':'/guide.html','/setup-guide':'/setup-guide.html','/math-audit':'/math-audit.html'}
        return super().translate_path(aliases.get(path,path))
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def list_directory(self, path):
        self.send_error(404)
        return None

server = ThreadingHTTPServer((args.host, args.port), partial(Handler, directory=str(root)))
print(f'Serving exact release bytes on port {args.port}', flush=True)
server.serve_forever()
