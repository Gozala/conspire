// @noflow strict

/*::
import type { Text, MutableList } from "./automerge.js"
import type { Delta } from "./quill.js"

type Attributes = {string:mixed}
type RichTextBuffer = MutableList<string|Attributes>
*/

export class Format {
  static from(attributes /*:?{string:mixed}*/) /*:?Format*/ {
    if (attributes) {
      return new Format(attributes)
    } else {
      return null
    }
  }
  /*::
  attributes:Attributes
  */
  constructor(mark /*:Attributes*/) {
    this.attributes = this.attributes
  }
  get start() {
    return this.attributes
  }
  get end() /*:Attributes*/ {
    const marker = {}
    for (const name in this.attributes) {
      marker[name] = null
    }
    return marker
  }
}

/* Data Model

[
  {}, // normal format
  "some text",
  { bold: true },
  "more text",
  { bold: null, italic: true },
  "more text"
]
*/

export class RichTextDelta {
  /*::
  buffer:RichTextBuffer
  position:number
  attributes:Attributes
  */
  constructor(buffer /*:RichTextBuffer*/) {
    this.buffer = buffer
    this.position = 0
    this.attributes = {}
  }

  patch(delta /*:Delta*/) {
    let position = 0
    for (const op of delta.ops) {
      const attributes = op.attributes == null ? null : op.attributes
      if (op.insert != null) {
        const insert = op.insert
        const [markers, length] =
          typeof insert == "string"
            ? [this.insert(position, [...insert]), insert.length]
            : [this.embed(position, insert), 1]

        for (const name in attributes) {
          if (markers[name] != attributes[name]) {
            this.mark(position, position + length, name, attributes[name])
          }
        }

        for (const name in markers) {
          if (attributes == null || attributes[name] == null) {
            this.mark(position, position + length, name, null)
          }
        }

        position += length
      }
      if (op.delete != null) {
        this.delete(this.position, op.delete)
      }
      if (op.retain != null) {
        for (const name in attributes) {
          this.mark(position, position + op.retain, name, attributes[name])
        }
        position += op.retain
      }
    }
  }
  insert(position /*:number*/, items /*:Array<string|Attributes>*/) {
    let offset = 0
    const marker = {}
    let index = 0
    while (index < this.buffer.length) {
      if (position === offset) {
        break
      }

      const item = this.buffer.get(index)
      if (typeof item === "string") {
        offset++
      } else {
        for (const name in item) {
          const value = item[name]
          if (value === null) {
            delete marker[name]
          } else {
            marker[name] = value
          }
        }
      }
    }

    this.buffer.insertAt(index, ...items)

    return marker
  }
  embed(position /*:number*/, embed /*:{[string]:mixed}*/) {
    return this.insert(position, [embed])
  }
  delete(position /*:number*/, count /*:number*/) {
    let offset = 0
    const marker = {}
    const end = position + count
    if (count <= 0) {
      return null
    } else {
      let index = 0

      while (offset < position && index < this.buffer.length) {
        const item = this.buffer.get(index)
        if (typeof item === "string") {
          offset++
        } else {
          for (const name in item) {
            marker[name] = item[name]
          }
        }
        index++
      }

      const start = index
      while (offset < end && index < this.buffer.length) {
        const item = this.buffer.get(index)
        if (typeof item === "string") {
          offset++
        }
        index++
      }

      if (index === this.buffer.length) {
        this.buffer.deleteAt(start, index - start)
      } else {
        const item = this.buffer.get(index)
        if (typeof item === "string") {
          index--
        }
        const rightMark = {}
      }
    }
  }
  mark(from /*:number*/, to /*:number*/, name /*:string*/, value /*:mixed*/) {}

  // retain(count /*:number*/, attributes /*:?Attributes*/) {
  //   if (attributes != null) {
  //     this.format(count, attributes)
  //   } else {
  //     this.skip(count)
  //   }
  // }
  // skip(count /*:number*/ = 1) {
  //   let n = count
  //   while (n > 0) {
  //     let attributes = null
  //     while ((attributes = this.currentToken())) {
  //       this.attributes = attributes
  //       this.position++
  //     }
  //     this.position++
  //     n--
  //   }
  // }
  // format(count /*:number*/, attributes /*:Attributes*/) {
  //   if (this.currentToken()) {
  //     this.setAttributes(attributes)
  //   } else {
  //     this.buffer.insertAt(this.position, attributes)
  //   }
  //   this.position++
  //   this.skip(count)

  //   const token = this.currentToken()
  //   if (this.currentToken) {
  //     this.unsetAttributes()
  //   }

  //   this.buffer.insertAt(this.position, format.start)
  //   this.skip(count)
  //   this.buffer.insertAt(this.position, format.end)
  // }
  // setAttributes(attributes /*:Attributes*/) {
  //   const token = this.buffer.get(tokne)
  // }
  // insert(text /*:string*/, attributes /*:?Attributes*/) {
  //   const format = Format.from(attributes)
  //   if (format != null) {
  //     this.buffer.insertAt(this.position, format.start)
  //     this.position += 1
  //     this.buffer.insertAt(this.position, ...text)
  //     this.position += text.length
  //     this.buffer.insertAt(this.position, format.end)
  //   } else {
  //     this.buffer.insertAt(this.position, ...text)
  //   }
  // }
  // currentToken() {
  //   const token = this.buffer.get(this.position)
  //   return typeof token === "string" ? null : token
  // }
  // delete(count /*:number*/) {
  //   let n = count
  //   const start = this.position
  //   const startsWithMarker = this.isAtMarker()
  //   let position = this.position

  //   let segmentSize = 0
  //   while (n > 0) {
  //     typeof this.buffer.get(position) === "string"
  //     segmentSize += 1
  //   }
  // }
}
