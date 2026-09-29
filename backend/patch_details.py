import sys

with open('app/routers/cases.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the hardcoded fake data
new_content = content.replace('"Extracted Document Entity"', '"Not specified"')
new_content = new_content.replace('"officer": "N/A"', '"officer": "Unknown"')

if new_content == content:
    print('Failed to replace.')
    sys.exit(1)
else:
    with open('app/routers/cases.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Successfully updated cases.py details fields')
