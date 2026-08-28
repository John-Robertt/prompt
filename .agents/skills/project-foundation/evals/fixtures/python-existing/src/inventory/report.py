def missing_items(rows):
    return [row for row in rows if int(row["quantity"]) == 0]
