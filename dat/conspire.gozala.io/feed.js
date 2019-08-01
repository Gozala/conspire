// @flow strict

import { Channel, Receiver } from "./channel.js"

export class Feed {
  /*::
  +id:string
  */
  constructor(id /*:string*/) {
    this.id = id
  }
}

export class FeedReader /*::<a>*/ extends Feed {
  /*::
  +messages:Receiver<a>
  */
  constructor(id /*:string*/, receiver /*:Receiver<a>*/) {
    super(id)
    this.messages = receiver
  }
}

export class FeedWriter /*::<a>*/ extends FeedReader /*::<a>*/ {
  /*::
  channel:Channel<a>
  queue:a[]
  status:typeof IDLE | typeof ACTIVE
  reader:FeedReader<a>
  */
  constructor(id /*:string*/, channel /*:Channel<a>*/ = new Channel()) {
    super(id, channel.receiver)
    this.channel = channel
    this.queue = []
    this.status = IDLE
  }
  get reader() /*:FeedReader<a>*/ {
    const reader = new FeedReader(this.id, this.channel.receiver)
    Object.defineProperty(this, "reader", { value: reader })
    return reader
  }
  write(message /*:a*/) {
    this.queue.push(message)
    this.drain()
  }
  async drain() {
    if (this.status === IDLE) {
      this.status = ACTIVE
      while (this.status === ACTIVE) {
        const message = this.queue.shift()
        if (message) {
          await this.channel.sender.deliver(message)
        } else {
          this.status = IDLE
        }
      }
    }
  }
}

export const IDLE = 0
export const ACTIVE = 1
