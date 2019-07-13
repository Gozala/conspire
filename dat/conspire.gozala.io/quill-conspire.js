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
    let ops = []
    let offset = 0
    for (const op of delta.ops) {
      if (op.retain) {
        offset = op.retain
      } else if (op.insert) {
        // because for Quill when you replace selected text with other text
        // first you do insert and then delete :/
        ops.unshift({ type: "insert", insert: { offset, text: op.insert } })
      } else if (op.delete) {
        // because for Quill when you replace selected text with other text
        // first you do insert and then delete :/
        ops.unshift({ type: "delete", delete: { offset, length: op.delete } })
      }
    }
    
    const range = this.quill.getSelection()
    if (range) {
      ops.push({type:"select", select:range })
    }

    this.emit(ops)
  }
  onUserSelectionChange(range /*:QuillRange*/, oldRange /*:QuillRange*/) {
    this.emit([{ type: "select", select: range }])
  }
  emit(ops) {
    if (this.options.merge) {
      this.options.merge({ ops })
    }
    this.quill.emitter.emit("automerge", { ops })
  }
  listen() {
    this.quill.on("text-change", this.onTextChange)
    this.quill.on("selection-change", this.onSelectionChange)
  }
}
