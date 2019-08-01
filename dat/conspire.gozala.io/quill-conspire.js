export class QuillConspire {
  constructor(quill /*:Quill*/, options /*:Options*/) {
    this.quill = quill
    this.options = options
    this.onTextChange = this.onTextChange.bind(this)
    this.onSelectionChange = this.onSelectionChange.bind(this)
    if (options) {
      this.listen()
    }
  }
  onTextChange(
    delta /*:QuillDelta*/,
    oldDelta /*:QuillDelta*/,
    source /*:QuillSource*/
  ) {
    setTimeout(() => {
      switch (source) {
        case "user": {
          this.onUserTextChange(delta, oldDelta)
        }
      }
    })
  }
  onSelectionChange(
    range /*:QuillRange*/,
    oldRange /*:QuillRange*/,
    source /*:QuillSource*/
  ) {
    setTimeout(() => {
      switch (source) {
        case "user": {
          this.onUserSelectionChange(range, oldRange)
        }
      }
    })
  }
  onUserTextChange(delta /*:QuillDelta*/, oldDelta /*:QuillDelta*/) {
    // let ops = []
    // let offset = 0
    // for (const op of delta.ops) {
    //   if (op.retain) {
    //     ops.push({
    //       type: "retain",
    //       offset,
    //       attributes: op.attributes || null,
    //       retain: op.retain
    //     })
    //     offset = op.retain
    //   } else if (op.insert) {
    //     // because for Quill when you replace selected text with other text
    //     // first you do insert and then delete :/
    //     ops.unshift({
    //       type: "insert",
    //       offset,
    //       attributes: op.attributes || null,
    //       insert: op.insert
    //     })
    //   } else if (op.delete) {
    //     // because for Quill when you replace selected text with other text
    //     // first you do insert and then delete :/
    //     ops.unshift({ type: "delete", offset, delete: op.delete })
    //   }
    // }

    const range = this.quill.getSelection()
    // if (range) {
    //   ops.push({ type: "select", select: range })
    // }

    this.emit({ delta, selection: range })
  }
  onUserSelectionChange(range /*:QuillRange*/, oldRange /*:QuillRange*/) {
    this.emit({ delta: null, selection: range })
  }
  emit(change) {
    if (this.options.merge) {
      this.options.merge(change)
    }
    this.quill.emitter.emit("automerge", change)
  }
  listen() {
    this.quill.on("text-change", this.onTextChange)
    this.quill.on("selection-change", this.onSelectionChange)
  }
}
