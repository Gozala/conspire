// @flow strict

import * as Dictionary from "./Dictionary.js"

/*::
import type { MutableList } from "./MutableList.js"
import type { Text } from "./automerge.js"
import type { Delta } from "./quill.js"

export type Value = string|number|boolean|null
export type Resource = {[string]:Value} 
export type Attributes = Dictionary.Mutable<Value>
export type CharacterToken = string
export type MarkerToken = {|attributes:Attributes, length:0|}
export type EmbedToken = {|resource:Resource, attributes:?Attributes, length:1|}

export type Token =
  | CharacterToken
  | EmbedToken
  | MarkerToken

export type RichTextBuffer = MutableList<Token>
*/

class Block {
  static match(token /*:Token*/) {
    if (token === "\n") {
      return token
    } else {
      return null
    }
  }
}

class Embed {
  static new(
    resource /*:Resource*/,
    attributes /*:?Attributes*/
  ) /*:EmbedToken*/ {
    return { resource, attributes, length: 1 }
  }
  static match(token /*:Token*/) /*:?EmbedToken*/ {
    if (typeof token === "object" && token.length === 1) {
      return token
    } else {
      return null
    }
  }
}

export class Marker {
  static match(token /*:Token*/) /*:?MarkerToken*/ {
    if (typeof token === "object" && token.length === 0) {
      return token
    } else {
      return null
    }
  }
  static clear() /*:MarkerToken*/ {
    return Marker.from({})
  }
  static from(attributes /*:Attributes*/) /*:MarkerToken*/ {
    return { attributes, length: 0 }
  }
}

export class RichText {
  /*::
  +tokens:RichTextBuffer
  offset:number
  position:number
  attributes:Dictionary.Immutable<Value>
  */
  constructor(tokens /*:RichTextBuffer*/) {
    this.tokens = tokens
    this.attributes = Dictionary.immutable()
    this.offset = 0
    this.position = 0
  }
  toString() {
    let text = ""
    for (const token of this.tokens) {
      if (typeof token === "string") {
        text += token
      }
    }
    return text
  }
  get length() {
    return this.toString().length
  }
  get size() {
    return this.tokens.length
  }
  get(index /*:number*/) {
    let { offset, size } = this.reset(index)
    // Note we use <= so that get will do whatever it does with
    // `Automerge.Text` when index is off bounds
    while (offset <= size) {
      const token = this.tokens.get(this.offset)
      if (typeof token === "string") {
        return token
      } else {
        offset++
      }
    }
  }
  _reset(index /*:number*/ = 0) {
    if (this.position === index) {
      return this
    }
    console.log("RESET", { index, position: this.position })

    this.position = 0
    this.offset = 0
    this.attributes = Dictionary.immutable()
    let n = index
    while (n > 0) {
      const token = this.tokens.get(this.offset)
      const marker = Marker.match(token)
      if (marker) {
        this.attributes = marker.attributes
      } else {
        this.position += 1
        n -= 1
      }
      this.offset += 1
    }

    return this
  }
  reset(index /*:number*/ = 0) {
    let { position, offset } = this
    if (position <= index) {
      let n = index - position
      while (n > 0) {
        const token = this.tokens.get(offset)
        const marker = Marker.match(token)
        if (marker) {
          this.attributes = marker.attributes
        } else {
          position += 1
          n -= 1
        }
        offset += 1
      }
      // } else if (index <= position - index) {
    } else {
      let n = index
      position = 0
      offset = 0
      this.attributes = Dictionary.immutable()
      while (n > 0) {
        const token = this.tokens.get(offset)
        const marker = Marker.match(token)
        if (marker) {
          this.attributes = marker.attributes
        } else {
          position += 1
          n -= 1
        }
        offset += 1
      }
    }
    // else {
    //   let n = position - index
    //   while (n > 0) {
    //     const token = this.tokens.get(offset)
    //     const marker = Marker.match(token)
    //     if (marker) {
    //       this.attributes = marker.attributes
    //     } else {
    //       position -= 1
    //       n -= 1
    //     }
    //     offset -= 1
    //   }
    // }
    this.offset = offset
    this.position = position

    return this
  }
  insert(
    index /*:number*/,
    text /*:string*/,
    attributes /*:?Attributes*/ = null
  ) {
    this.reset(index)
    this.tokens.insertAt(this.offset, ...text)
    if (attributes != null) {
      this.format(index, text.length, attributes)
    }
    this.reset(index + text.length)
    return this
  }
  embed(index /*:number*/, resource /*:Resource*/, attributes /*:Attributes*/) {
    this.reset(index)
    this.tokens.insertAt(this.offset, Embed.new(resource, attributes))
    this.position++
    this.offset++
  }
  delete(index /*:number*/, size /*:number*/) {
    let n = size
    // Traverse the content to see how many marks delete spans across.
    // If 0 we can just delete, otherwise we need to retain last mark
    // so that formatting of content following delete segment will be
    // retained.
    let marks = 0
    let lastMarkOffset = -1
    let { offset, position } = this.reset(index)
    while (n > 0) {
      const token = this.tokens.get(offset)
      if (Marker.match(token)) {
        marks++
        lastMarkOffset = offset
      }

      n -= token.length
      offset++
    }

    // If no marks were found or current offset is a marker itself
    // it is safe to delete.
    if (marks === 0 || Marker.match(this.tokens.get(offset))) {
      this.tokens.deleteAt(this.offset, size + marks)
    }
    // If delete span across non 0 marks and is not followed by a mark
    // then we want to retain last mark. To do so we delete everything
    // prior to the last mark and then delete remaning characters past
    // mark.
    else {
      this.tokens.deleteAt(this.offset, lastMarkOffset - this.offset)
      const remaining = size - (lastMarkOffset - this.offset)
      this.tokens.deleteAt(this.offset + 1, remaining)
    }
    return this
  }
  format(index /*:number*/, size /*:number*/, format /*:Attributes*/) {
    let n = size
    let { attributes, offset, position } = this.reset(index)

    if (!Dictionary.equals(attributes, format)) {
      this.tokens.insertAt(offset, Marker.from(format))
      offset++
    }

    while (n > 0) {
      const token = this.tokens.get(offset)
      const marker = Marker.match(token)

      if (marker) {
        attributes = marker.attributes
        this.tokens.deleteAt(offset, 1)
      } else {
        n--
        offset++
      }
    }

    // We have reached the end so no need to insert anything here
    if (this.size <= offset) {
      return this
    }

    const marker = Marker.match(this.tokens.get(offset))
    if (marker) {
      // If next token is a marker that matches this format
      // remove it as it's redundunt
      if (Dictionary.equals(marker.attributes, format)) {
        this.tokens.deleteAt(offset, 1)
      }
    }
    // If attributes do not match the format then insert attributes to reset
    // the format
    else if (!Dictionary.equals(attributes, format)) {
      return this.tokens.insertAt(offset, Marker.from({ ...attributes }))
    }
  }

  *entries() /*:Iterator<Token>*/ {
    let node = null
    for (const token of this.tokens) {
      if (typeof token === "string") {
        node = node == null ? token : node + token
      } else {
        if (node != null) {
          yield node
          node = null
        }
        yield token
      }
    }
    if (node != null) {
      yield node
    }
  }
  toJSON() {
    const nodes = []
    let node = null

    for (const token of this.tokens) {
      if (typeof token == "string") {
        if (node != null) {
          node.text += token
        } else {
          node = { text: token, attributes: {} }
        }
      } else {
        const marker = Marker.match(token)
        if (marker) {
          if (node != null) {
            nodes.push(node)
          }
          node = { attributes: marker.attributes, text: "" }
        }

        const embed = Embed.match(token)
        if (embed != null) {
          const { resource, attributes } = embed
          if (node != null) {
            nodes.push(node)
            node = null
          }
          nodes.push({ resource, attributes })
        }
      }
    }

    if (node != null) {
      nodes.push(node)
    }

    return nodes
  }
}
