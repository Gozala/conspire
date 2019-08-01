import { RichText } from "../dat/conspire.gozala.io/RichText.js"
import { MutableList } from "../dat/conspire.gozala.io/MutableList.js"
import {
  patch,
  QuillRichText
} from "../dat/conspire.gozala.io/RichText/Quill.js"
import test from "./tape.js"

/*::
import type {Token} from "../dat/conspire.gozala.io/RichText.js"
*/

const create = (tokens /*:Token[]*/ = []) =>
  new RichText(new MutableList(...tokens))

const createQuillRichText = (tokens /*:Token[]*/ = []) =>
  new QuillRichText(new MutableList(...tokens))

export {
  RichText,
  MutableList,
  QuillRichText,
  patch,
  create,
  createQuillRichText,
  test
}
