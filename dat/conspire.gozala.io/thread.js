// @flow strict

import { Channel } from "./channel.js"
/*::
import type { FeedReader, FeedWriter} from "./feed.js"
*/

export class Thread /*::<a>*/ {
  /*::
  ownFeed:FeedWriter<a>;
  peerFeeds:Map<string, FeedReader<a>>;
  channel:Channel<{ member: FeedReader<a>, message: a}>;
  joins:Map<string, ({done:true, +value?:void}|{+value:a, done:false}) => void>;
  */

  constructor(
    ownFeed /*:FeedWriter<a>*/,
    peerFeeds /*:Map<string, FeedReader<a>>*/ = new Map()
  ) {
    this.ownFeed = ownFeed
    this.peerFeeds = peerFeeds
    this.channel = new Channel()
    this.joins = new Map()

    // this.join(ownFeed)
    for (const feed of peerFeeds.values()) {
      this.join(feed)
    }
  }
  write(message /*:a*/) {
    return this.ownFeed.write(message)
  }
  get messages() {
    return this.channel.receiver
  }
  follow(peerFeed /*:FeedReader<a>*/) {
    if (!this.peerFeeds.has(peerFeed.id)) {
      this.peerFeeds.set(peerFeed.id, peerFeed)
      this.join(peerFeed)
    }
  }
  async join(feed /*:FeedReader<a>*/) {
    const end = new Promise(resolve => this.joins.set(feed.id, resolve))
    let done = false
    while (!done) {
      const next = await Promise.race([feed.messages.next(), end])
      done = next.done
      if (!next.done) {
        done = !(await this.channel.sender.deliver({
          member: feed,
          message: next.value
        }))
      }
    }
  }
  unfollow(id /*:string*/) {
    this.peerFeeds.delete(id)
    const membership = this.joins.get(id)
    if (membership) {
      membership({ done: true })
    }
  }
}
