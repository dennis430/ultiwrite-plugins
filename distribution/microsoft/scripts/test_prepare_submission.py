"""Local packaging fixtures only; no Microsoft provisioning, payments or host claims."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('prepare_submission', Path(__file__).with_name('prepare_submission.py'))
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


class PublisherPreparation(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.output = Path(self.temp.name) / 'submission'

    def test_missing_ids_generate_honest_portal_handoff_without_zip(self):
        result = helper.prepare(dict(helper.TEMPLATE), self.output)
        self.assertEqual(result['missingMicrosoftIds'], ['appId', 'authConfigId'])
        self.assertFalse(result['hostTested'])
        self.assertFalse(result['submitted'])
        self.assertFalse(list(self.output.glob('*.zip')))
        fields = json.loads((self.output / 'portal-fields.json').read_text())
        self.assertEqual(fields['restrictUsageByApp'], 'Any Teams app')
        self.assertEqual(fields['restrictUsageByOrg'], 'Any Microsoft 365 organization')
        self.assertIsNone(fields['clientId'])

    def test_build_refuses_missing_ids_before_creating_output(self):
        with self.assertRaises(ValueError):
            helper.prepare(dict(helper.TEMPLATE), self.output, True)
        self.assertFalse(self.output.exists())

    def test_rejects_secrets_and_arbitrary_fields_before_writing(self):
        for key in ('clientSecret', 'accessToken', 'password', 'unexpected'):
            with self.assertRaises(ValueError):
                helper.prepare({**helper.TEMPLATE, key: 'not-a-real-secret'}, self.output)
        self.assertFalse(self.output.exists())

    def test_preserves_existing_output(self):
        self.output.mkdir()
        original = self.output / 'preserve.txt'
        original.write_text('preserve')
        with self.assertRaises(FileExistsError):
            helper.prepare(dict(helper.TEMPLATE), self.output)
        self.assertEqual(original.read_text(), 'preserve')

    def test_configured_fixture_zip_contains_only_manifests_and_icons(self):
        config = {**helper.TEMPLATE, 'appId': 'b6f2b953-cb5c-47b8-964d-176fbd6c6a99', 'authConfigId': 'local-test-fixture-1234', 'audience': 'organization'}
        result = helper.prepare(config, self.output, True)
        with zipfile.ZipFile(self.output / result['archive']) as package:
            self.assertEqual(set(package.namelist()), {'manifest.json', 'declarativeAgent.json', 'ai-plugin.json', 'color.png', 'outline.png'})
            self.assertEqual(json.loads(package.read('manifest.json'))['id'], config['appId'])
            self.assertEqual(json.loads(package.read('ai-plugin.json'))['runtimes'][0]['auth']['reference_id'], config['authConfigId'])
        self.assertEqual(result['packageStatus'], 'structure_validated')
        self.assertFalse(result['published'])
        self.assertFalse(result['hostTested'])
        fields = json.loads((self.output / 'portal-fields.json').read_text())
        self.assertEqual(fields['restrictUsageByOrg'], 'My organization only')


if __name__ == '__main__':
    unittest.main()
