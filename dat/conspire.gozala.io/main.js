import { Thread } from "./thread.js"
import { FeedWriter } from "./feed.js"
import { Collaboration } from "./collaboration.js"
import { Automerge } from "./automerge.js"
import { Quill } from "./quill.js"
import { ColorHash } from "./package.js"

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
      doc.content = new Automerge.Text()
      doc.content.insertAt(0, ...this.editor.getText().split(""))
      doc.cursors = {}
      doc.cursors[this.id] = this.editor.getSelection()
    }, 'init')
  }
  merge(patch) {
    this.repo.change(doc => {
      for (const op of patch.ops) {
        switch (op.type) {
          case "select": {
            if (op.select) {
              doc.cursors[this.id] = op.select
            }
            break
          }
          case "delete": {
            doc.content.deleteAt(op.delete.offset, op.delete.length)
            break
          }
          case "insert": {
            doc.content.insertAt(op.insert.offset, ...op.insert.text.split(""))
            break
          }
        }
      }
    })
  }
  async watch() {
    for await (const {member, message} of this.thread.messages) {
      if (member !== this.feed) {
        this.receive(message)
      }
    }
  }
  receive(message) {
    const cursors = this.document.cursors || {}
    this.repo.applyChanges(message)
    this.editor.setText(this.document.content.join(""))
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
    return this.editor.getModule('cursors')
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

