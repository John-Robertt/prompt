import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1] / "src"))

from inventory.report import missing_items


class ReportTest(unittest.TestCase):
    def test_returns_zero_quantity_items(self):
        rows = [{"sku": "A", "quantity": "0"}, {"sku": "B", "quantity": "2"}]
        self.assertEqual(missing_items(rows), [rows[0]])


if __name__ == "__main__":
    unittest.main()
