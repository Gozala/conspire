import { Text } from "./automerge.js"

class Mutator {
  constructor(content) {
    this.content = content
    this.offset = 0
    this.index = 0
  }
  skip(n) {
    while (n > 0) {
      const fragment = this.content[this.index]
      const size = Fragment.size(fragment)
      const offset = this.offset + n
      if (offset < size) {
        this.offset = offset
      } else if (offset === size) {
        this.offset = 0
        this.index += 1
      } else {
        this.index += 1
        this.offset = 0
        n -= size - this.offset
      }
    }
  }
  retain(n, attributes = null) {
    if (attributes) {
      this.format(n, attributes)
    } else {
      this.skip(n)
    }
  }
  insert(fragment, attributes) {
    if (typeof fragment === "string") {
      this.insertText(fragment, attributes)
    } else {
      this.embed(fragment, attributes)
    }
  }
  insertText(text, attributes = null) {
    if (attributes == null) {
      this.insertPlainText(text)
    } else {
      this.insertFormattedText(text)
    }
  }
  insertPlainText(text) {
    const fragment = this.content[this.index]
    if (fragment.insert instanceof Text) {
      fragment.insert.insertAt(this.offset, ...text.split(""))
    } else {
      this.content.insertAt(this.index, {
        insert: new Text(),
        attributes
      })
      this.content[this.index].insert.insertAt(0, ...text.split(""))
    }
  }
  insertFormattedText(text, attributes) {
    if (this.offset) {
    }
  }
  embed(embedding, attributes = null) {}
}

class Fragment {
  static size(fragment) {
    if (fragment.insert instanceof Text) {
      return fragment.insert.length
    } else {
      return 1
    }
  }
}
