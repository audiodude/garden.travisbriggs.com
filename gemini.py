import os

from md2gemini import md2gemini

IGNORE = [
    'CONTRIBUTING.md', 'README.md', '.eleventy.js', '.eleventyignore',
    '.gitignore', 'LICENSE', 'netlify.toml', 'package-lock.json',
    'package.json', 'all.md', 'garden.11tydata.js'
]
DIR_IGNORE = [
    '__pycache__', '_data', '_site', '_gemini', '.git', '.github', 'assets',
    'includes', 'layouts', 'node_modules', 'venv'
]


def get_md_files():
  for root, dirs, files in os.walk('.'):
    for ignore in DIR_IGNORE:
      if ignore in dirs:
        dirs.remove(ignore)

    for ignore in IGNORE:
      if ignore in files:
        files.remove(ignore)

    yield root, files


def split_front_matter(data):
  if not data.startswith('---'):
    return None, data

  idx = data[3:].find('---')
  return data[3:idx], data[idx + 6:]


def to_gem_path(path):
  gem_path = path.replace('./', '_gemini/')
  idx = gem_path.find('.', -5)
  return gem_path[:idx] + '.gmi'


def main():
  for root, files in get_md_files():
    for file in files:
      path = os.path.join(root, file)
      out_path = to_gem_path(path)
      os.makedirs(os.path.dirname(out_path), exist_ok=True)
      with open(path, 'r') as f:
        data = f.read()

      front_matter, content = split_front_matter(data)
      gem_output = md2gemini(content, links="paragraph")

      with open(out_path, 'w') as f:
        f.write(gem_output)


if __name__ == '__main__':
  main()