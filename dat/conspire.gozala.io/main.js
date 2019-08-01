import { Thread } from "./thread.js"
import { FeedWriter } from "./feed.js"
import { Collaboration } from "./collaboration.js"
import * as Automerge from "./automerge.js"
import { Quill } from "./quill.js"
import { ColorHash } from "./package.js"
import { QuillRichText } from "./RichText/Quill.js"

class Tokens /*::<a>*/ {
  /*::
  items:a[]
  @@iterator: () => Iterator<a>
  */
  constructor(items /*:a[]*/) {
    this.items = items
  }
  // @noflow
  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item
    }
  }
  get length() {
    return this.items.length
  }
  get(n /*:number*/) /*:a*/ {
    return this.items[n]
  }
  insertAt(offset /*:number*/, ...items /*:a[]*/) {
    this.items.splice(offset, 0, ...items)
    return this
  }
  deleteAt(offset /*:number*/, count /*:number*/) {
    this.items.splice(offset, count)
  }
}

class Conspirator {
  constructor(name) {
    this.id = `${name}@${Date.now().toString(32)}`
    this.feed = new FeedWriter(name)
    this.thread = new Thread(this.feed)
    this.repo = new Collaboration(this.thread, Automerge.init())
  }
  get document() {
    return this.repo.document
  }
  follow(actor) {
    this.repo.follow(actor.feed)
  }
  init(node) {
    this.view(node)
    this.repo.change(doc => {
      doc.content = [] //new Automerge.Text()
      doc.cursors = {}

      new QuillRichText(new Tokens(doc.content)).patch(
        this.editor.getContents()
      )

      doc.cursors[this.id] = this.editor.getSelection()
    }, "init")
  }
  // sizeOf(fragment) {
  //   const size = fragment.insert instanceof Text ? fragment.insert.length : 1
  //   return size
  // }
  merge(patch) {
    this.repo.change(doc => {
      if (patch.delta) {
        const text = new QuillRichText(new Tokens(doc.content))
        text.patch(patch.delta)
      }

      if (patch.selection) {
        doc.cursors[this.id] = patch.selection
      }

      // const content = doc.content
      // let position = 0
      // let index = 0
      // let offset = 0

      // for (const op of patch.ops) {
      //   switch (op.type) {
      //     case "select": {
      //       if (op.select) {
      //         doc.cursors[this.id] = op.select
      //       }
      //       break
      //     }
      //     case "delete": {
      //       let length = op.delete
      //       while (length > 0) {
      //         const fragment = content[index]
      //         const size = this.sizeOf(fragment)

      //         if (offset + length < size) {
      //           fragment.insert.deleteAt(offset, length)
      //           length = 0
      //         } else {
      //           if (offset === 0) {
      //             content.deleteAt(index)
      //             length -= size
      //           } else {
      //             fragment.insert.deleteAt(offset, size - offset)
      //             length -= size - offset
      //             index += 1
      //             offset = 0
      //           }
      //         }
      //       }
      //       break
      //     }
      //     case "retain": {
      //       let length = op.retain
      //       while (length > 0) {
      //         const fragment = content[index]
      //         const size = this.sizeOf(fragment)

      //         if (offset + length < size) {
      //           if (fragment.attributes) {
      //           }
      //           fragment.insert.deleteAt(offset, length)
      //           length = 0
      //         } else {
      //           if (offset === 0) {
      //             content.deleteAt(index)
      //             length -= size
      //           } else {
      //             fragment.insert.deleteAt(offset, size - offset)
      //             length -= size - offset
      //             index += 1
      //             offset = 0
      //           }
      //         }
      //       }
      //     }
      //     case "insert": {
      //       const { insert, attributes } = op
      //       if (typeof insert === "string") {
      //         doc.content.insertAt(offset, {
      //           insert: new Automerge.Text(),
      //           attributes
      //         })
      //         doc.content[offset].insert.insertAt(0, ...insert.split(""))
      //       } else {
      //         doc.content.insertAt(offset, insert)
      //       }
      //       break
      //     }
      //   }
      // }
    })
  }
  async watch() {
    for await (const { member, message } of this.thread.messages) {
      if (member !== this.feed) {
        this.receive(message)
      }
    }
  }
  // toDelta(content) {
  //   const delta = { ops: [] }
  //   for (const op of ops) {
  //     if (op.retain) {
  //       delta.ops.push(op)
  //     } else if (op.delete) {
  //       delta.ops.push(op)
  //     } else if (op.insert instanceof Automerge.Text) {
  //       const insert = op.insert.join("")
  //       delta.ops.push({ insert, attributes: op.attributes })
  //     } else {
  //       delta.ops.push(op)
  //     }
  //   }
  //   return delta
  // }
  receive(message) {
    const cursors = this.document.cursors || {}
    this.repo.applyChanges(message)
    const delta = new QuillRichText(
      new Tokens(this.document.content)
    ).toContent()
    this.editor.setContents(delta)
    for (const name in this.document.cursors) {
      const cursor = this.document.cursors[name]
      if (cursor && !cursors[name]) {
        this.cursors.createCursor(name, name, new ColorHash().hex(name))
        this.cursors.moveCursor(name, cursor)
      } else if (!cursor && cursors[name]) {
        this.cursors.removeCursor(name)
      } else {
        this.cursors.moveCursor(name, cursor)
      }
    }
  }
  get cursors() {
    return this.editor.getModule("cursors")
  }
  view(node) {
    this.editor = new Quill(node, {
      modules: {
        cursors: true,
        conspire: this,
        toolbar: {
          container: [
            [{ header: 1 }, { header: 2 }],
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ color: [] }],
            [{ list: "bullet" }],
            ["link", "image"]
          ]
        }
      },
      theme: "bubble",
      placeholder: "Start writing.\n\nSelect the text for formatting options."
    })
    this.watch()
    return this
  }
}

const alice = new Conspirator("Alice")
const bob = new Conspirator("Bob")

alice.follow(bob)
bob.follow(alice)

window.alice = alice
window.bob = bob

alice.init(document.querySelector("#alice"))
bob.init(document.querySelector("#bob"))
