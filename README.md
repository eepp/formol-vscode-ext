# Formol for VS Code

Reformat a whole plain text document or a block comment under the caret to follow [eepp's plain text format](https://0x3b.org/files/eepp-plain-text-format.html) using [Formol](https://github.com/eepp/formol).

Only applies whole document reformatting for plain text and Git commit message documents.

For comment reformatting, this extension supports most popular languages that use:

* C-style block comments:

  ```
  /*
   * ...
   */
  ```

* Python-style comments:

  ```
  # ...
  # ...
  # ...
  ```

**Disclaimer**: I don't use VS&nbsp;Code myself, therefore I vibe-coded this whole extension. Use at your own risk, although it defers the bulk of the work to Formol (Python).

## Usage

Run **Formol: Reformat** (default keybinding: <kbd>Meta</kbd>+<kbd>E</kbd>):

* In a plain text file: reformats the whole file.

* In a Git commit message: reformats the whole message, leaving the
  trailing `#` comment block that Git generates untouched.

* In any other supported language: place a single caret between `/*`
  and `*/` (C-style block comment) or on a `#`-prefixed comment line
  (Python-style comment), then run the command to reformat that
  comment.

## Configuration

| Setting                    | Default     | Description                                  |
| -------------------------- | ----------- | -------------------------------------------- |
| `formol.maxLineLength`     | `72`        | Max line length in visual columns.           |
| `formol.pythonBin`         | `"python3"` | Python interpreter that can `import formol`. |

## Requirements

The `formol` Python package must be importable by the configured interpreter.

To install globally:

```
$ sudo pip install formol --break-system-packages
```

## Build and try

```
$ npm install
$ npm run compile
```

Press <kbd>F5</kbd> in VS&nbsp;Code to launch an Extension Development Host.
