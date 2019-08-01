// @flow strict

import * as Automerge from "./automerge.js"
import { FeedWriter, FeedReader } from "./feed.js"
import { Thread } from "./thread.js"

export class Collaboration /*::<a>*/ {
  /*::
  thread:Thread<Automerge.Change<a>>
  document:Automerge.Document<a>
  */
  static new(name /*:string*/ = `@{Date.now().toString(32)}`) {
    const feed = new FeedWriter(name)
    const thread = new Thread(feed)
    const document = Automerge.init()
    return new this(thread, document)
  }
  follow(feed /*:FeedReader<Automerge.Change<a>>*/) {
    this.thread.follow(feed)
  }
  constructor(
    thread /*:Thread<Automerge.Change<a>>*/,
    document /*:Automerge.Document<a>*/
  ) {
    this.document = document
    this.thread = thread
  }
  change(mutate /*:Automerge.Mutate<a>*/, comment /*::?:string*/) {
    const document = Automerge.change(this.document, comment, mutate)
    const changes = Automerge.getChanges(this.document, document)
    for (const change of changes) {
      this.thread.write(change)
    }
    this.document = document
  }
  applyChanges(change /*:Automerge.Change<a>*/) {
    this.document = Automerge.applyChanges(this.document, [change])
  }
}
