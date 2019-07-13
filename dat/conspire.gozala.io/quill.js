import { QuillConspire } from "./quill-conspire.js"

export const Quill = window.Quill
export const QuillCursors = window.QuillCursors
export { QuillConspire }
Quill.register("modules/cursors", QuillCursors)
Quill.register("modules/conspire", QuillConspire)
