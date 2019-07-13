import { Channel } from "./channel.js"

export class Thread {
  constructor(ownFeed/*:FeedWriter*/, peerFeeds/*:Map<string, FeedReader>*/=new Map()) {
    this.ownFeed = ownFeed
    this.peerFeeds = peerFeeds
    this.channel = new Channel()
    this.joins = new Map()
    
    // this.join(ownFeed)
    for (const feed of peerFeeds.values()) {
      this.join(feed)
    }
  }
  write(message) {
    return this.ownFeed.write(message)
  }
  get messages() {
    return this.channel.receiver
  }
  follow(peerFeed) {
    if (!this.peerFeeds.has(peerFeed.id)) {
    	this.peerFeeds.set(peerFeed.id, peerFeed)
      this.join(peerFeed)
    }
  }
  async join(feed) {
    const end = new Promise(resolve => this.joins.set(feed.id, resolve))
    let done = false
    while (!done) {
      const next = await Promise.race([feed.messages.next(), end])
      done = next.done
      if (!done) {
        done = !await this.channel.sender.deliver({
          member: feed,
          message: next.value
        })
      }
    }
  }
  unfollow(id) {
		this.peerFeeds.delete(id)
    const membership = this.joins.get(id)
    if (membership) {
      membership({ done: true })
    }
  }
}