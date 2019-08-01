// @flow strict

import { RichText } from "../RichText.js"
/*::
import type { Delta, Embed, Insert } from "../quill.js"
*/

export class QuillRichText extends RichText {
  patch(delta /*:Delta*/) {
    return patch(delta, this.reset())
  }
  toContent() {
    return toContent(this)
  }
}

export const patch = (delta /*:Delta*/, text /*:RichText*/) /*:RichText*/ => {
  let position = 0
  for (const op of delta.ops) {
    const attributes = op.attributes == null ? undefined : op.attributes
    if (op.insert != null) {
      const insert = op.insert
      typeof insert == "string"
        ? text.insert(insert, attributes)
        : text.embed(insert, attributes)
    }
    if (op.delete != null) {
      text.delete(op.delete)
    }
    if (op.retain != null) {
      text.retain(op.retain, attributes)
    }
  }

  return text
}

export const toContent = (text /*:RichText*/) /*:Delta*/ => {
  const ops = []
  let attributes = null
  let segment = ""
  for (const token of [...text.content, { length: 0, attributes: null }]) {
    if (typeof token === "string") {
      segment += token
    } else {
      if (segment != "") {
        const insert /*:Insert*/ = attributes
          ? { insert: segment, attributes: attributes }
          : { insert: segment }
        ops.push(insert)

        attributes = null
        segment = ""
      }

      if (token.length === 1) {
        const { resource, attributes } = token

        const embed /*:Embed*/ = attributes
          ? { insert: resource, attributes }
          : { insert: resource }
        ops.push(embed)
      } else {
        attributes = token.attributes
      }
    }
  }
  return { ops }
}
