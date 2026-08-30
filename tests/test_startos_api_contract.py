from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text()


class StartosApiContractTest(unittest.TestCase):
    def test_current_package_version_supersedes_bad_0181_release(self):
        current = read('startos/startos/versions/current.ts')
        self.assertIn("version: '0.18.1:1'", current)
        self.assertIn('separate StartOS API interface', current)

    def test_api_has_separate_startos_binding_for_cli_discovery(self):
        interfaces = read('startos/startos/interfaces.ts')
        self.assertIn("const apiMulti = sdk.MultiHost.of(effects, 'api-multi')", interfaces)
        self.assertIn('const apiMultiOrigin = await apiMulti.bindPort(apiPort', interfaces)
        self.assertIn("const apiReceipt = await apiMultiOrigin.export([api])", interfaces)
        self.assertRegex(interfaces, r'return \[uiReceipt, apiReceipt\]')

    def test_cli_api_interface_is_visible_and_root_path_on_own_port(self):
        interfaces = read('startos/startos/interfaces.ts')
        api_block = interfaces.split('const api = sdk.createInterface', 1)[1]
        self.assertIn("type: 'api'", api_block)
        self.assertIn('masked: false', api_block)
        self.assertIn("path: ''", api_block)
        self.assertNotIn("path: '/api'", api_block)

    def test_nginx_still_proxies_api_for_same_origin_browser_use(self):
        nginx = read('startos/api/nginx-default.conf')
        self.assertIn('location /api', nginx)
        self.assertIn('proxy_pass http://127.0.0.1:3040;', nginx)

    def test_api_server_listens_on_all_container_interfaces(self):
        server = read('startos/api/server.mjs')
        self.assertIn("server.listen(PORT, '0.0.0.0'", server)
        self.assertNotIn("server.listen(PORT, '127.0.0.1'", server)


if __name__ == '__main__':
    unittest.main()
