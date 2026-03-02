with open(".github/workflows/automerge.yml", "r") as f:
    content = f.read()

content = content.replace("    steps:\n      - name: Force Merge PR", "    steps:\n      - uses: actions/checkout@v4\n      - name: Force Merge PR")

with open(".github/workflows/automerge.yml", "w") as f:
    f.write(content)
