# Formol for VS Code

Reformat the block comment under the caret to follow [eepp's plain text format](https://0x3b.org/files/eepp-plain-text-format.html) using [Formol](https://github.com/eepp/formol).

Supports most popular languages that use:

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

Place a single caret either:

- Between `/*` and `*/` (C-style block comment).
- On a `#`-prefixed comment line (Python-style comment).

Then run **Formol: Reformat block comment** (default keybinding: <kbd>Meta</kbd>+<kbd>E</kbd>).

The command reformats the whole comment following eepp's plain text format.

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
