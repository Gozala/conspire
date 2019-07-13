export class Collaboration {
  static new(name = `@{Date.now().toString(32)}`) {
    const feed = new FeedWriter(name)
    const thread = new Thread(feed)
    const document = Automerge.init()
    return new this(thread, document)
  }
  follow(feed) {
    this.thread.follow(feed)
  }
  constructor(thread, document) {
    this.document = document
    this.thread = thread
  }
  change(mutate, message) {
    const document = Automerge.change(this.document, message, mutate)
    const changes = Automerge.getChanges(this.document, document)
    for (const change of changes) {
      this.thread.write(change)
    }
    this.document = document
  }
  applyChanges(message) {
    this.document = Automerge.applyChanges(this.document, [message])
  }
}