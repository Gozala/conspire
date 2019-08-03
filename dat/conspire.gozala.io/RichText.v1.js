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

class Marker {
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
  +content:RichTextBuffer
  position:number
  attributes:Dictionary.Immutable<Value>
  */
  constructor(content /*:RichTextBuffer*/) {
    this.content = content
    this.reset(0)
  }
  get length() {
    let length = 0
    for (const token of this.content) {
      length += token.length
    }
    return length
  }
  get size() {
    return this.content.length
  }
  insert(text /*:string*/, attributes /*::?:Attributes*/) {
    if (attributes == null) {
      return this.insertPlainText(text)
    } else {
      return this.insertFormattedText(text, attributes)
    }
  }
  insertPlainText(text /*:string*/) {
    this.content.insertAt(this.position, ...text)
    this.position += text.length
    return this
  }
  insertFormattedText(text /*:string*/, format /*:Attributes*/) {
    const marker = Marker.match(this.content.get(this.position))
    // Compute attributes for the text being inserted by applying provided
    // format to the attributes the current position. It maybe application
    // of the format is redundant, to prevent redundant markers we start with
    // `null` attributes and compute changed attributes only once difference
    // is encountered.
    const attributes = Dictionary.mutable(format)

    // If attributes at current position match the format then just insert the
    // plain text.
    if (Dictionary.equals(this.attributes, attributes)) {
      this.insertPlainText(text)
    }
    // If next token is a marker with matching format then insert the plain text
    // at next position.
    else if (marker && Dictionary.equals(marker.attributes, attributes)) {
      this.position++
      this.attributes = marker.attributes
      this.insertPlainText(text)
    }
    // If inserted text is formatted `\n` that is Quill.js's way to format
    // preceding line in a block. If that is the case just clear out all
    // attributes right after the inserted `\n`.
    // TODO: This seems really awkward & is artifact of Quill.js data model.
    // Ideally our data model would be free of such artifacts, but for the
    // time being & for the lack of better solution it's the way it is.
    else if (Block.match(text)) {
      const tokens =
        marker || Dictionary.isEmpty(attributes)
          ? [Marker.from(attributes), "\n"]
          : [Marker.from(attributes), "\n", Marker.from({ ...this.attributes })]

      this.content.insertAt(this.position, ...tokens)
      this.position += tokens.length
    }
    // Otherwise we insert:
    // 1. Marker for computed attributes
    // 2. Formatted text segment
    // 3. Marker to reset attributes (to the way they were prior to 1.)
    else {
      this.content.insertAt(this.position, Marker.from(attributes))
      this.position++
      this.attributes = attributes
      this.content.insertAt(this.position, ...text)
      this.position += text.length

      // If we reached end of the document resetting attributes seems redundant,
      // which is why we only reset attributes if we have not reached the end.
      if (this.position < this.content.length) {
        const token = this.content.get(this.position + 1)
        if (Marker.match(token) == null) {
          this.content.insertAt(
            this.position,
            Marker.from({ ...this.attributes })
          )
        }
      }
    }

    return this
  }
  embed(resource /*:Resource*/, attributes /*::?:Attributes*/) {}
  delete(count /*:number*/) {
    let n = count
    // Traverse the content to see how many marks delete spans across.
    // If 0 we can just delete, otherwise we need to retain last mark
    // so that formatting of content following delete segment will be
    // retained.
    let marks = 0
    let lastMarkPosition = -1
    let { position } = this
    while (n > 0) {
      const token = this.content.get(position)
      if (Marker.match(token)) {
        marks++
        lastMarkPosition = position
      }

      n -= token.length
      position++
    }

    // If no marks were found or current position is a marker itself
    // it is safe to delete.
    if (marks === 0 || this.content.get(position).attributes) {
      this.content.deleteAt(this.position, count + marks)
    }
    // If delete span across non 0 marks and is not followed by a mark
    // then we want to retain last mark. To do so we delete everything
    // prior to the last mark and then delete remaning characters past
    // mark.
    else {
      this.content.deleteAt(this.position, lastMarkPosition - this.position)
      const remaining = count - (lastMarkPosition - this.position)
      this.position++
      this.content.deleteAt(this.position, remaining)
    }
    return this
  }
  retain(count /*:number*/, attributes /*::?:Attributes*/) {
    if (attributes) {
      return this.format(count, attributes)
    } else {
      return this.skip(count)
    }
  }
  skip(count /*:number*/) {
    let n = count
    while (n > 0) {
      const token = this.content.get(this.position)
      n -= token.length
      const marker = Marker.match(token)
      if (marker) {
        this.attributes = marker.attributes
      }
      this.position++
    }

    // If inserted right after "\n" need to check if it is formatted block, because format
    // will be reset right after.
    const marker = Marker.match(this.content.get(this.position))
    if (marker && this.content.get(this.position - 1) === "\n") {
      this.position++
      this.attributes = marker.attributes
    }

    return this
  }
  static includeAttributes(
    attributes /*:Dictionary.Mutable<Value>*/,
    formatting /*:Dictionary.Immutable<Value>*/
  ) {
    let marks = null
    for (const name in formatting) {
      const before = attributes[name]
      const after = formatting[name]
      if (before !== after) {
        marks = marks || { ...attributes }
        if (after == null) {
          delete attributes[name]
        } else {
          attributes[name] = after
        }
      }
    }
    return marks
  }

  format(count /*:number*/, format /*:Attributes*/) {
    let n = count
    let formatAfter = null
    const { attributes } = this

    // If current position does not match a marker we need to split the section
    // at the current position & insert copy of the active attributes in order
    // to format following section with given `format`.
    const token = this.content.get(this.position)
    const marker = Marker.match(token)
    if (marker == null && attributes) {
      this.content.insertAt(this.position, Marker.from({ ...attributes }))
    }

    // Section tracks text that has being formatted.
    let section = ""

    while (n > 0) {
      const token = this.content.get(this.position)
      const marker = Marker.match(token)
      if (marker) {
        formatAfter = RichText.includeAttributes(marker.attributes, format)
        if (Dictionary.equals(this.attributes, marker.attributes)) {
          this.content.deleteAt(this.position, 1)
        } else {
          this.attributes = Dictionary.immutable(marker.attributes)
          this.position++
        }
      }

      const embed = Embed.match(token)
      if (embed) {
        if (embed.attributes) {
          RichText.includeAttributes(embed.attributes, format)
        } else {
          embed.attributes = { ...format }
        }
        this.position++
      }

      if (typeof token === "string") {
        section += token.toString()
        n--
        this.position++
      }
    }

    if (section === "\n") {
      this.content.insertAt(this.position, Marker.clear())
    } else if (formatAfter && this.position < this.content.length) {
      const token = this.content.get(this.position)
      if (!Marker.match(token)) {
        this.content.insertAt(this.position, Marker.from(formatAfter))
      }
    }

    return this
  }
  reset(position /*:number*/ = 0) /*:self*/ {
    this.position = 0
    const token = this.content.length > 0 ? this.content.get(0) : null
    const marker = token && Marker.match(token)
    this.attributes = marker
      ? Dictionary.immutable(marker.attributes)
      : Dictionary.immutable()

    this.skip(position)

    return this
  }

  inspect() {
    const result = []
    for (const token of this.content) {
      if (typeof token === "object") {
        result.push(JSON.stringify(token.attributes))
      } else {
        result.push(token)
      }
    }
    return `<RichText>${result.join("")}</RichText>`
  }
}
